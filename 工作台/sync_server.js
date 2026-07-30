/**
 * MelBeacon 一体化服务器
 * 同时提供工作台网页托管 + 飞书云文档同步功能
 *
 * 网页端点：
 *   GET /                 - 工作台首页 (index.html)
 *   GET /css/...          - 样式文件
 *   GET /js/...           - 脚本文件
 *
 * API 端点：
 *   GET /api/sync          - 触发飞书同步
 *   GET /api/sync-status   - 获取同步状态
 *   GET /api/feishu-files  - 获取飞书文件夹中的文件列表
 *
 * 运行：node sync_server.js
 */

const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// ============================================================
// 配置区
// ============================================================

const PORT = 3001;
const FEISHU_ROOT_TOKEN = 'GtvYfz1Meli6ZEdesYZcY0FunYc';
const FEISHU_CHAT_ID = 'oc_1adc1a69e4f425353678a58b7dd03807';
const WORKSPACE_DIR = 'g:\\MelB\\工作台';
const STATUS_FILE = path.join(WORKSPACE_DIR, 'sync_status.json');

// 命令超时（毫秒）：单文件导出可能较慢
const CMD_TIMEOUT = 120000;

// ============================================================
// PATH 修补：确保能找到 lark-cli（TRAE 插件路径）
// ============================================================
const LARK_CLI_CANDIDATES = [
  'C:\\Users\\Administrator\\.trae-cn\\plugins\\trae-remote-official\\lark\\1.0.3\\bin',
  path.join(process.env.USERPROFILE || '', '.trae-cn\\plugins\\trae-remote-official\\lark\\1.0.3\\bin')
];
const extraPaths = LARK_CLI_CANDIDATES.filter(p => p && fs.existsSync(p));
if (extraPaths.length > 0) {
  process.env.Path = (process.env.Path || '') + ';' + extraPaths.join(';');
  console.log('[PATH] 已添加 lark-cli 路径：' + extraPaths.join(';'));
}

// 平台配置：飞书文件夹 token + 本地目录映射
const PLATFORMS = [
  {
    name: '小红书',
    folderToken: 'EOdvfd9dzlssFKdyye4cdSInnGh',
    localDirs: [
      'g:\\MelB\\L1_公域获客\\爆款内容库\\小红书',
      'g:\\MelB\\L1_公域获客\\赛道热度\\小红书',
      'g:\\MelB\\L1_公域获客\\对标分析\\小红书',
      'g:\\MelB\\L1_公域获客\\选题库\\小红书'
    ]
  },
  {
    name: '抖音',
    folderToken: 'Io40fLUgjlgak7drIyTcLpK8nEf',
    localDirs: [
      'g:\\MelB\\L1_公域获客\\爆款内容库\\抖音',
      'g:\\MelB\\L1_公域获客\\赛道热度\\抖音',
      'g:\\MelB\\L1_公域获客\\对标分析\\抖音',
      'g:\\MelB\\L1_公域获客\\选题库\\抖音'
    ]
  },
  {
    name: 'B站',
    folderToken: 'TxP6fab29lQZgpdVmTdc5OsqnSd',
    localDirs: [
      'g:\\MelB\\L1_公域获客\\爆款内容库\\B站',
      'g:\\MelB\\L1_公域获客\\赛道热度\\B站',
      'g:\\MelB\\L1_公域获客\\对标分析\\B站',
      'g:\\MelB\\L1_公域获客\\选题库\\B站'
    ]
  }
];

// 关键词 → 目录映射，用于根据文件名自动路由到正确的本地目录
const DIR_KEYWORDS = [
  { dir: '爆款内容库', keywords: ['爆款', '热门', '内容库'] },
  { dir: '赛道热度', keywords: ['赛道', '热度', '趋势', '排行', '榜单', '热榜'] },
  { dir: '对标分析', keywords: ['对标', '分析', '竞品', '拆解'] },
  { dir: '选题库', keywords: ['选题', '灵感', '创意', '话题'] }
];

// ============================================================
// 工具函数
// ============================================================

// MIME 类型映射
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8'
};

/**
 * 提供静态文件服务
 * @param {string} filePath - 文件绝对路径
 * @param {object} res - HTTP 响应对象
 */
function serveStaticFile(filePath, res) {
  try {
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      // 文件不存在，返回 404 页面提示
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404 - 文件未找到</h1><p>' + path.basename(filePath) + '</p>');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const stat = fs.statSync(filePath);

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>500 - 服务器错误</h1><p>' + e.message + '</p>');
  }
}

/**
 * 确保目录存在，不存在则递归创建
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 执行 lark-cli 命令，捕获 stdout 和 stderr（PowerShell 下输出可能走 stderr）
 * @param {string} cmd - 要执行的命令（不含 2>&1，函数内部自动追加）
 * @param {string} [cwd] - 工作目录（可选，用于 lark-cli +export 需要相对路径的场景）
 * @returns {{ success: boolean, output: string, error: string|null }}
 */
function runLarkCli(cmd, cwd) {
  // 追加 2>&1 将 stderr 合并到 stdout，解决 PowerShell 行为
  const fullCmd = cmd + ' 2>&1';
  try {
    const execOpts = {
      encoding: 'utf-8',
      timeout: CMD_TIMEOUT,
      maxBuffer: 20 * 1024 * 1024,
      windowsHide: true
    };
    if (cwd) execOpts.cwd = cwd;
    const output = execSync(fullCmd, execOpts);
    return { success: true, output: output || '', error: null };
  } catch (e) {
    // execSync 抛错时，stdout/stderr 附在异常对象上
    const stdout = e.stdout ? (typeof e.stdout === 'string' ? e.stdout : e.stdout.toString('utf-8')) : '';
    const stderr = e.stderr ? (typeof e.stderr === 'string' ? e.stderr : e.stderr.toString('utf-8')) : '';
    return {
      success: false,
      output: stdout || stderr || '',
      error: e.message
    };
  }
}

/**
 * 从 lark-cli 输出中解析 JSON 文件列表
 * 兼容多种格式：纯数组、{ files: [] }、{ data: { files: [] } } 等
 * 同时处理输出中混入日志文本的情况
 * @param {string} output - lark-cli 原始输出
 * @returns {Array} 文件对象数组
 */
function parseFileList(output) {
  if (!output || typeof output !== 'string') return [];

  let trimmed = output.trim();

  // 去除可能的 BOM
  if (trimmed.charCodeAt(0) === 0xFEFF) {
    trimmed = trimmed.slice(1);
  }

  // 尝试直接解析
  let parsed = tryParseJson(trimmed);
  if (parsed !== null) {
    return extractFilesArray(parsed);
  }

  // 输出中可能混有日志行，尝试提取 JSON 数组
  const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    parsed = tryParseJson(arrayMatch[0]);
    if (parsed !== null) return extractFilesArray(parsed);
  }

  // 尝试提取 JSON 对象
  const objMatch = trimmed.match(/\{[\s\S]*\}/);
  if (objMatch) {
    parsed = tryParseJson(objMatch[0]);
    if (parsed !== null) return extractFilesArray(parsed);
  }

  console.warn('  警告: 无法从输出中解析 JSON，返回空数组');
  return [];
}

/**
 * 安全解析 JSON，失败返回 null
 */
function tryParseJson(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

/**
 * 从解析后的对象中提取文件数组
 */
function extractFilesArray(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === 'object') {
    if (Array.isArray(parsed.files)) return parsed.files;
    if (Array.isArray(parsed.items)) return parsed.items;
    if (parsed.data) {
      if (Array.isArray(parsed.data)) return parsed.data;
      if (Array.isArray(parsed.data.files)) return parsed.data.files;
      if (Array.isArray(parsed.data.items)) return parsed.data.items;
    }
  }
  return [];
}

/**
 * 从文件对象中提取 token
 */
function getFileToken(file) {
  return file.token || file.file_token || file.fileToken || file.id || null;
}

/**
 * 从文件对象中提取名称
 */
function getFileName(file) {
  return file.name || file.title || file.file_name || '未知文件';
}

/**
 * 从文件对象中提取类型
 */
function getFileType(file) {
  return file.type || file.file_type || file.objType || file.doc_type || 'unknown';
}

/**
 * 从文件对象中提取创建时间
 */
function getCreatedTime(file) {
  return file.created_time || file.create_time || file.createdTime || file.ctime || null;
}

/**
 * 检查本地是否已存在同名 .md 文件
 * 在平台的所有本地目录中查找
 * @param {string} fileName - 飞书文件名
 * @param {string[]} localDirs - 该平台的本地目录列表
 * @returns {string|null} 已存在文件的路径，不存在则返回 null
 */
function findExistingFile(fileName, localDirs) {
  // 去除原有扩展名，统一检查 .md
  const baseName = fileName.replace(/\.[^.]+$/, '');

  for (const dir of localDirs) {
    // 检查 name.md
    const mdPath = path.join(dir, baseName + '.md');
    if (fs.existsSync(mdPath)) return mdPath;

    // 检查原始文件名（可能已经带 .md）
    const origPath = path.join(dir, fileName);
    if (fs.existsSync(origPath)) return origPath;
  }

  return null;
}

/**
 * 根据文件名关键词确定目标本地目录
 * 匹配失败时回退到第一个目录（爆款内容库）
 * @param {string} fileName - 文件名
 * @param {string[]} localDirs - 该平台的本地目录列表
 * @returns {string} 目标目录路径
 */
function determineTargetDir(fileName, localDirs) {
  for (const mapping of DIR_KEYWORDS) {
    for (const keyword of mapping.keywords) {
      if (fileName.includes(keyword)) {
        const target = localDirs.find(d => d.includes(mapping.dir));
        if (target) return target;
      }
    }
  }
  // 默认回退到第一个目录
  return localDirs[0];
}

/**
 * 获取当前 ISO 时间戳（带时区）
 */
function getTimestamp() {
  return new Date().toISOString();
}

// ============================================================
// 同步状态文件读写
// ============================================================

/**
 * 读取同步状态文件
 * @returns {object} 状态对象
 */
function readSyncStatus() {
  try {
    if (fs.existsSync(STATUS_FILE)) {
      const content = fs.readFileSync(STATUS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('读取同步状态失败:', e.message);
  }
  return {
    lastSync: null,
    totalFiles: 0,
    platforms: {},
    syncedFiles: [],
    errors: []
  };
}

/**
 * 写入同步状态文件
 * @param {object} status - 状态对象
 */
function writeSyncStatus(status) {
  try {
    ensureDir(WORKSPACE_DIR);
    fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2), 'utf-8');
  } catch (e) {
    console.error('写入同步状态失败:', e.message);
  }
}

// ============================================================
// 核心同步逻辑
// ============================================================

/**
 * 同步单个平台
 * @param {object} platform - 平台配置对象
 * @param {Array} syncedFiles - 同步成功记录数组（会被填充）
 * @param {Array} errors - 错误记录数组（会被填充）
 * @returns {{ files: number, lastSync: string }} 平台同步统计
 */
function syncPlatform(platform, syncedFiles, errors) {
  // 确保所有本地目录存在
  for (const dir of platform.localDirs) {
    ensureDir(dir);
  }

  console.log(`\n正在同步 [${platform.name}] ...`);

  // 步骤 1：获取文件列表
  const listCmd = `lark-cli drive files list --folder-token ${platform.folderToken} --format json`;
  const listResult = runLarkCli(listCmd);

  if (!listResult.success) {
    const errMsg = listResult.error || listResult.output || '未知错误';
    errors.push({
      platform: platform.name,
      stage: 'list',
      error: errMsg
    });
    console.error(`  [${platform.name}] 获取文件列表失败: ${errMsg}`);
    return { files: 0, lastSync: getTimestamp(), error: '文件列表获取失败' };
  }

  // 步骤 2：解析文件列表
  const files = parseFileList(listResult.output);
  console.log(`  [${platform.name}] 发现 ${files.length} 个文件`);

  let platformSynced = 0;

  // 步骤 3 & 4：逐个文件检查并导出
  for (const file of files) {
    const fileToken = getFileToken(file);
    const fileName = getFileName(file);

    if (!fileToken) {
      errors.push({
        platform: platform.name,
        file: fileName,
        error: '无法获取文件 token'
      });
      console.warn(`  跳过(无token): ${fileName}`);
      continue;
    }

    // 检查本地是否已存在
    const existingPath = findExistingFile(fileName, platform.localDirs);
    if (existingPath) {
      console.log(`  跳过(已存在): ${fileName}`);
      continue;
    }

    // 确定目标目录
    const targetDir = determineTargetDir(fileName, platform.localDirs);
    ensureDir(targetDir);

    // 执行导出（lark-cli +export 要求 output-dir 为相对路径，因此通过 cwd 切换工作目录）
    const exportCmd = `lark-cli drive +export --token ${fileToken} --doc-type docx --file-extension markdown --output-dir . --overwrite`;
    const exportResult = runLarkCli(exportCmd, targetDir);

    if (exportResult.success) {
      syncedFiles.push({
        platform: platform.name,
        fileName: fileName,
        fileToken: fileToken,
        targetDir: targetDir,
        syncedAt: getTimestamp()
      });
      platformSynced++;
      console.log(`  同步成功: ${fileName} -> ${path.basename(targetDir)}`);
    } else {
      const errMsg = exportResult.error || exportResult.output || '导出失败';
      errors.push({
        platform: platform.name,
        file: fileName,
        fileToken: fileToken,
        error: errMsg
      });
      console.error(`  同步失败: ${fileName} - ${errMsg}`);
    }
  }

  console.log(`  [${platform.name}] 完成: 新增同步 ${platformSynced} 个文件`);
  return { files: platformSynced, lastSync: getTimestamp() };
}

/**
 * 执行全量同步（所有平台）
 * @returns {{ success: boolean, synced: Array, errors: Array, totalSynced: number, totalErrors: number }}
 */
function syncAll() {
  const syncedFiles = [];
  const errors = [];
  const platformStatus = {};

  for (const platform of PLATFORMS) {
    const result = syncPlatform(platform, syncedFiles, errors);
    platformStatus[platform.name] = {
      files: result.files,
      lastSync: result.lastSync
    };
    if (result.error) {
      platformStatus[platform.name].error = result.error;
    }
  }

  // 写入同步状态
  const status = {
    lastSync: getTimestamp(),
    totalFiles: syncedFiles.length,
    platforms: platformStatus,
    syncedFiles: syncedFiles,
    errors: errors
  };
  writeSyncStatus(status);

  return {
    success: true,
    synced: syncedFiles,
    errors: errors,
    totalSynced: syncedFiles.length,
    totalErrors: errors.length
  };
}

/**
 * 获取飞书各平台文件夹中的文件列表（仅查询，不同步）
 * @returns {object} 各平台文件列表
 */
function getFeishuFiles() {
  const result = {};

  for (const platform of PLATFORMS) {
    console.log(`查询 [${platform.name}] 文件列表 ...`);

    const listCmd = `lark-cli drive files list --folder-token ${platform.folderToken} --format json`;
    const listResult = runLarkCli(listCmd);

    if (!listResult.success) {
      result[platform.name] = {
        success: false,
        error: listResult.error || listResult.output || '获取失败',
        files: []
      };
      continue;
    }

    const files = parseFileList(listResult.output);
    result[platform.name] = {
      success: true,
      totalFiles: files.length,
      files: files.map(f => ({
        name: getFileName(f),
        token: getFileToken(f),
        type: getFileType(f),
        createdTime: getCreatedTime(f)
      }))
    };
  }

  return result;
}

// ============================================================
// HTTP 服务器
// ============================================================

const server = http.createServer((req, res) => {
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 解析 URL
  let urlObj;
  try {
    urlObj = new URL(req.url, `http://localhost:${PORT}`);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: '无效的 URL' }));
    return;
  }

  const pathname = urlObj.pathname;

  /**
   * 发送 JSON 响应
   */
  function sendJson(statusCode, data) {
    const body = JSON.stringify(data, null, 2);
    res.writeHead(statusCode, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(body, 'utf-8')
    });
    res.end(body);
  }

  // ============================================================
  // 路由
  // ============================================================

  if (pathname === '/api/sync') {
    // --- 触发飞书同步 ---
    console.log('\n========== 开始同步 ==========');
    const startTime = Date.now();

    try {
      const result = syncAll();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`\n========== 同步完成 (${elapsed}s) ==========`);
      console.log(`  成功: ${result.totalSynced} 个文件`);
      console.log(`  失败: ${result.totalErrors} 个错误\n`);
      sendJson(200, result);
    } catch (e) {
      console.error('同步过程出错:', e);
      sendJson(500, {
        success: false,
        error: e.message,
        synced: [],
        errors: [{ error: e.message }],
        totalSynced: 0,
        totalErrors: 1
      });
    }

  } else if (pathname === '/api/sync-status') {
    // --- 获取同步状态 ---
    const status = readSyncStatus();
    sendJson(200, status);

  } else if (pathname === '/api/feishu-files') {
    // --- 获取飞书文件列表 ---
    try {
      const files = getFeishuFiles();
      sendJson(200, files);
    } catch (e) {
      console.error('获取飞书文件列表出错:', e);
      sendJson(500, { error: e.message });
    }

  } else if (pathname === '/' || pathname === '/index.html') {
    // --- 工作台首页 ---
    serveStaticFile(path.join(WORKSPACE_DIR, 'index.html'), res);

  } else if (pathname.startsWith('/api')) {
    // --- 未知 API 端点 ---
    sendJson(404, {
      error: '未找到该 API 端点',
      availableEndpoints: ['/api/sync', '/api/sync-status', '/api/feishu-files']
    });

  } else {
    // --- 静态文件服务（css/js/图片等） ---
    // 安全检查：防止路径穿越
    const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(WORKSPACE_DIR, safePath);
    
    // 确保文件路径在工作台目录内
    if (!filePath.startsWith(WORKSPACE_DIR)) {
      sendJson(403, { error: '禁止访问' });
      return;
    }
    serveStaticFile(filePath, res);
  }
});

// ============================================================
// 启动服务器
// ============================================================

server.listen(PORT, () => {
  console.log('============================================================');
  console.log('  MelBeacon 一体化服务器启动成功');
  console.log('============================================================');
  console.log('');
  console.log('  工作台地址:  http://localhost:' + PORT);
  console.log('');
  console.log('  API 端点:');
  console.log('    /api/sync          - 触发飞书同步');
  console.log('    /api/sync-status   - 获取同步状态');
  console.log('    /api/feishu-files  - 获取飞书文件列表');
  console.log('');
  console.log('  已配置平台:');
  for (const p of PLATFORMS) {
    console.log('    ' + p.name + ' -> ' + p.localDirs.length + ' 个本地目录');
  }
  console.log('');
  console.log('------------------------------------------------------------');
  console.log('  浏览器已自动打开工作台，关闭此窗口将停止服务');
  console.log('------------------------------------------------------------');
  console.log('');

  // 自动打开浏览器
  const url = 'http://localhost:' + PORT + '/';
  const plat = process.platform;
  if (plat === 'win32') {
    exec('start "" "' + url + '"');
  } else if (plat === 'darwin') {
    exec('open "' + url + '"');
  } else {
    exec('xdg-open "' + url + '"');
  }
});
