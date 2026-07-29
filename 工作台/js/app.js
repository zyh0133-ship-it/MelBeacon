/**
 * MelBeacon 灯塔系统工作台 - 主应用逻辑
 * 负责主标签切换、子标签切换、卡片渲染、交互等
 */

const App = {
  // 应用状态
  state: {
    activeTab: 'tab-social',
    activeSubTab: {
      'tab-social': 'social-overview',
      'tab-community': 'comm-calendar',
      'tab-courseware': 'cw-library',
      'tab-offline': 'offline-calendar',
      'tab-training': 'training-mine',
      'tab-hub': 'hub-dashboard',
      'tab-team': 'team-overview',
      'tab-tasks': 'tasks-today',
      'tab-skills': 'skills-list',
      'tab-brand': 'brand-kol',
      'tab-admin': 'admin-users'
    },
    selectedPlatform: 'all',
    selectedDate: '2026-07-28'
  },

  /**
   * 初始化应用
   */
  init() {
    // V4.5：优先初始化视图模式（auto / desktop / mobile），必须在渲染前
    this.initViewMode();
    this.bindViewSwitcher();
    this.bindViewModeGesture();

    this.renderSidebar();
    this.bindSidebar();
    this.bindSubTabs();
    this.bindPlatformBar();
    this.bindQuickActions();
    this.bindCalendar();
    this.bindSyncBtn();
    this.bindMobileSidebar(); // V4.2 第三阶段：移动端侧边栏切换

    // 默认激活第一个标签页
    this.switchTab('tab-social');
    Filters.init();
  },

  /* ========== V4.5 视图模式切换（论坛风格：自适应 / 网页版 / 手机版） ========== */
  initViewMode() {
    let mode = 'auto';
    try {
      const saved = localStorage.getItem('melbeacon_view_mode');
      if (saved === 'desktop' || saved === 'mobile' || saved === 'auto') {
        mode = saved;
      }
    } catch (e) { /* localStorage 不可用时默认 auto */ }
    this.applyViewMode(mode);
  },

  applyViewMode(mode) {
    const body = document.body;
    body.classList.remove('force-desktop', 'force-mobile');

    if (mode === 'desktop') {
      body.classList.add('force-desktop');
      // 桌面版：移除 sidebar open 状态不强制（桌面端不受影响
    } else if (mode === 'mobile') {
      body.classList.add('force-mobile');
      // V4.5：切到手机版时，强制关闭侧边栏（移除 .open、移除遮罩
      const sidebar = document.getElementById('sidebar') || document.querySelector('.sidebar');
      if (sidebar) sidebar.classList.remove('open');
      const overlay = document.querySelector('.sidebar-overlay');
      if (overlay) overlay.style.display = 'none';
    }
    // auto 模式不加 class，使用媒体查询

    // 同步按钮高亮
    document.querySelectorAll('.view-switch-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.viewmode === mode);
    });

    // 持久化
    try { localStorage.setItem('melbeacon_view_mode', mode); } catch (e) {}
  },

  bindViewSwitcher() {
    const switcher = document.getElementById('view-switcher');
    const closeBtn = document.getElementById('view-switcher-close');

    // 首次加载时显示切换条 3.5 秒后隐藏，用户可随时通过手势唤出
    if (switcher) {
      switcher.classList.add('show');
      setTimeout(() => switcher.classList.remove('show'), 3500);
    }

    // 绑定三个按钮
    document.querySelectorAll('.view-switch-btn').forEach(btn => {
      const handler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const mode = btn.dataset.viewmode;
        this.applyViewMode(mode);
        this.showToast('已切换为「' + btn.textContent.replace(/^[^\s]+\s*/, '') + '」');
      };
      btn.addEventListener('click', handler);
      btn.addEventListener('touchend', handler, { passive: false });
    });

    // 关闭按钮
    if (closeBtn) {
      const closeHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (switcher) switcher.classList.remove('show');
      };
      closeBtn.addEventListener('click', closeHandler);
      closeBtn.addEventListener('touchend', closeHandler, { passive: false });
    }
  },

  /**
   * 手势唤出切换条：双击顶部 / 三指双击页面，显示视图切换条
   */
  bindViewModeGesture() {
    let lastTap = 0;
    const switcher = document.getElementById('view-switcher');
    if (!switcher) return;

    document.addEventListener('touchend', (e) => {
      // 三指点击
      if (e.touches && e.touches.length >= 3) {
        switcher.classList.toggle('show');
        return;
      }
      // 双击顶部 60px 范围
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      const y = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : 0;
      if (tapLength < 350 && tapLength > 0 && y < 80) {
        switcher.classList.toggle('show');
      }
      lastTap = currentTime;
    });

    // 桌面端：双击页面最顶部也可唤出
    document.addEventListener('dblclick', (e) => {
      if (e.clientY < 60) {
        switcher.classList.toggle('show');
      }
    });
  },

  /**
   * 移动端侧边栏切换（V4.2 第三阶段新增，V4.5 加入触摸事件和强制模式支持）
   * 通过汉堡按钮唤出抽屉式侧边栏，点击遮罩或导航项后自动收起
   */
  bindMobileSidebar() {
    const toggle = document.getElementById('menu-toggle');
    const overlay = document.getElementById('sidebar-overlay');
    const sidebar = document.getElementById('sidebar');
    if (!toggle || !overlay || !sidebar) return;

    const openSidebar = () => {
      sidebar.classList.add('open');
      overlay.classList.add('show');
      toggle.textContent = '✕';
    };
    const closeSidebar = () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
      toggle.textContent = '☰';
    };
    this._closeMobileSidebar = closeSidebar;

    const toggleHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (sidebar.classList.contains('open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    };
    toggle.addEventListener('click', toggleHandler);
    toggle.addEventListener('touchend', toggleHandler, { passive: false });

    const overlayHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeSidebar();
    };
    overlay.addEventListener('click', overlayHandler);
    overlay.addEventListener('touchend', overlayHandler, { passive: false });

    // 点击导航项后自动收起（事件委托 + 支持强制手机模式）
    sidebar.addEventListener('click', (e) => {
      const navItem = e.target.closest('.nav-item');
      const isMobileMode = document.body.classList.contains('force-mobile') || window.innerWidth <= 1024;
      if (navItem && isMobileMode) {
        closeSidebar();
      }
    });

    // 屏幕尺寸放大到桌面端时，重置抽屉状态（仅 auto 模式下生效）
    window.addEventListener('resize', () => {
      const forceDesktop = document.body.classList.contains('force-desktop');
      const forceMobile = document.body.classList.contains('force-mobile');
      if (!forceDesktop && !forceMobile && window.innerWidth > 1024) {
        closeSidebar();
      }
    });
  },

  /* ========== 侧边栏渲染 ========== */
  renderSidebar() {
    const devGroup = document.getElementById('nav-dev');
    const opsGroup = document.getElementById('nav-ops');

    // 权限过滤函数：检查当前用户是否有权限访问该标签页
    const hasAccess = (tabId) => {
      if (typeof Auth !== 'undefined' && Auth.currentUser && Auth.hasTabAccess) {
        return Auth.hasTabAccess(tabId);
      }
      return true; // 未登录或Auth未初始化时默认显示所有
    };

    devGroup.innerHTML = sidebarMenuDev
      .filter(item => hasAccess(item.id))
      .map(item => `
        <div class="nav-item ${item.admin ? 'admin' : ''}" data-tab="${item.id}">
          <span>${item.icon}</span>
          <span>${item.name}</span>
          ${item.badge > 0 ? `<span class="nav-badge">${item.badge}</span>` : ''}
          ${item.admin ? '<span class="nav-badge">ADMIN</span>' : ''}
        </div>
      `).join('');

    opsGroup.innerHTML = sidebarMenuOps
      .filter(item => hasAccess(item.id))
      .map(item => `
        <div class="nav-item" data-tab="${item.id}">
          <span>${item.icon}</span>
          <span>${item.name}</span>
        </div>
      `).join('');

    // 如果开发管理分组为空，隐藏分组标题
    const devGroupContainer = devGroup.closest('.nav-group');
    if (devGroupContainer && devGroup.innerHTML.trim() === '') {
      devGroupContainer.style.display = 'none';
    }
  },

  bindSidebar() {
    // 使用事件委托 + touchend 双通道（兼容动态渲染的 nav-item）
    const handle = (e) => {
      const item = e.target.closest('.nav-item');
      if (!item) return;
      if (e.type === 'touchend') e.preventDefault();
      const tabId = item.dataset.tab;
      if (tabId === 'tab-all') {
        this.switchTab('tab-all');
      } else {
        this.switchTab(tabId);
      }
    };
    document.addEventListener('click', handle);
    document.addEventListener('touchend', handle, { passive: false });
  },

  /**
   * 切换主标签页（V4.5 移动端增强：关闭侧边栏 + 滚回顶部）
   */
  switchTab(tabId) {
    this.state.activeTab = tabId;

    // 更新侧边栏激活态
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tabId);
    });

    // 隐藏所有标签内容
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });

    // 显示目标标签内容
    const targetContent = document.getElementById('content-' + tabId);
    if (targetContent) {
      targetContent.classList.add('active');
    } else {
      // 无对应内容区的标签页（如"全部入口"），不做处理
      return;
    }

    // 移动端 / 强制手机模式：切换后关闭侧边栏，滚到顶部
    const isMobileMode = document.body.classList.contains('force-mobile') || window.innerWidth <= 1024;
    if (isMobileMode && typeof this._closeMobileSidebar === 'function') {
      this._closeMobileSidebar();
    }
    // 内容区滚回顶部
    const scrollContainers = targetContent.querySelectorAll('.scroll-container');
    scrollContainers.forEach(sc => { if (sc.scrollTo) sc.scrollTo({ top: 0 }); });
    // 页面根滚回顶部（用于高度自适应的布局）
    if (window.scrollTo) window.scrollTo({ top: 0, behavior: 'auto' });
    if (targetContent.scrollTo) targetContent.scrollTo({ top: 0 });

    // 渲染对应标签页内容
    this.renderTabContent(tabId);
  },

  /**
   * 渲染标签页内容
   */
  renderTabContent(tabId) {
    switch (tabId) {
      case 'tab-social':
        this.renderSocialTab();
        break;
      case 'tab-community':
        this.renderCommunityTab();
        break;
      case 'tab-courseware':
        this.renderCoursewareTab();
        break;
      case 'tab-offline':
        this.renderOfflineTab();
        break;
      case 'tab-training':
        this.renderTrainingTab();
        break;
      case 'tab-hub':
        this.renderHubTab();
        break;
      case 'tab-tasks':
        this.renderTasksTab();
        break;
      case 'tab-skills':
        this.renderSkillsTab();
        break;
      case 'tab-brand':
        this.renderBrandTab();
        break;
      case 'tab-admin':
        this.renderAdminTab();
        break;
      case 'tab-team':
        this.renderTeamTab();
        break;
      case 'tab-all':
        this.renderAllTab();
        break;
    }
  },

  /* ========== 子标签切换（V4.5 增加 touchend 双通道） ========== */
  bindSubTabs() {
    const handleSubTab = (e) => {
      const subTabEl = e.target.closest('.sub-tab');
      if (!subTabEl) return;
      if (e.type === 'touchend') e.preventDefault();

      const subTabId = subTabEl.dataset.subtab;
      const container = subTabEl.closest('.sub-tabs');
      if (!container) return;
      const tabId = container.dataset.tab;

      // 更新激活态
      container.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
      subTabEl.classList.add('active');

      // 更新状态
      this.state.activeSubTab[tabId] = subTabId;

      // 隐藏所有子内容
      const tabContent = document.getElementById('content-' + tabId);
      if (!tabContent) return;
      tabContent.querySelectorAll('.sub-content').forEach(c => c.classList.remove('active'));

      // 显示目标子内容
      const targetSubContent = document.getElementById(subTabId);
      if (targetSubContent) {
        targetSubContent.classList.add('active');
      }

      // 移动端：切换子标签后，内容区滚动到顶部
      const scrollContainers = tabContent.querySelectorAll('.scroll-container');
      scrollContainers.forEach(sc => { if (sc.scrollTo) sc.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' }); });

      // 渲染子内容
      this.renderSubContent(tabId, subTabId);
    };
    document.addEventListener('click', handleSubTab);
    document.addEventListener('touchend', handleSubTab, { passive: false });
  },

  /**
   * 平台选择栏绑定（V4.5 增加 touchend 双通道）
   */
  bindPlatformBar() {
    const handlePlatform = (e) => {
      const btn = e.target.closest('.platform-btn');
      if (!btn) return;
      if (e.type === 'touchend') e.preventDefault();

      const platformBar = btn.closest('.platform-bar');
      if (!platformBar) return;
      platformBar.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const platform = btn.dataset.platform;
      this.state.selectedPlatform = platform;
      Filters.state.social.platform = platform;

      // 重新渲染当前子标签内容
      const subTab = this.state.activeSubTab['tab-social'];
      this.renderSubContent('tab-social', subTab);
    };
    document.addEventListener('click', handlePlatform);
    document.addEventListener('touchend', handlePlatform, { passive: false });
  },

  /**
   * 渲染子内容
   */
  renderSubContent(tabId, subTabId) {
    if (tabId === 'tab-social') {
      this.renderSocialSubTab(subTabId);
    } else if (tabId === 'tab-community') {
      this.renderCommunitySubTab(subTabId);
    } else if (tabId === 'tab-courseware') {
      this.renderCoursewareSubTab(subTabId);
    } else if (tabId === 'tab-offline') {
      this.renderOfflineSubTab(subTabId);
    } else if (tabId === 'tab-training') {
      this.renderTrainingSubTab(subTabId);
    } else if (tabId === 'tab-hub') {
      this.renderHubSubTab(subTabId);
    } else if (tabId === 'tab-tasks') {
      this.renderTasksSubTab(subTabId);
    } else if (tabId === 'tab-skills') {
      this.renderSkillsSubTab(subTabId);
    } else if (tabId === 'tab-brand') {
      this.renderBrandSubTab(subTabId);
    } else if (tabId === 'tab-admin') {
      this.renderAdminSubTab(subTabId);
    }
  },

  /* ========== 自媒体运营标签页 ========== */
  renderSocialTab() {
    // 渲染平台选择栏
    const platformBar = document.getElementById('social-platform-bar');
    platformBar.innerHTML = socialMediaPlatforms.map(p => `
      <button class="platform-btn ${p.id === this.state.selectedPlatform ? 'active' : ''}" data-platform="${p.id}">
        ${p.icon} ${p.name}
      </button>
    `).join('');

    // 默认渲染第一个子标签
    const activeSub = this.state.activeSubTab['tab-social'];
    this.renderSocialSubTab(activeSub);
  },

  renderSocialSubTab(subTabId) {
    switch (subTabId) {
      case 'social-overview':
        this.renderAccountOverview();
        break;
      case 'social-content':
        this.renderSocialContent();
        break;
      case 'social-viral':
        this.renderViralContent();
        break;
      case 'social-topics':
        this.renderTopicIdeas();
        break;
      case 'social-benchmark':
        this.renderBenchmarkAccounts();
        break;
      case 'social-diagnostic':
        this.renderDiagnostic();
        break;
      case 'social-heat':
        this.renderSocialHeat();
        break;
      case 'social-rules':
        this.renderPlatformRules();
        break;
    }
  },

  /**
   * 账号概览
   */
  renderAccountOverview() {
    const container = document.getElementById('social-overview');
    const platform = this.state.selectedPlatform;

    let accounts = [];
    if (platform === 'all') {
      accounts = Object.entries(accountOverview).map(([key, val]) => ({ platform: key, ...val }));
    } else {
      accounts = [{ platform, ...accountOverview[platform] }];
    }

    const platformNames = {
      xiaohongshu: '小红书 📕', douyin: '抖音 🎵', bilibili: 'B站 📺',
      xiaoyuzhou: '小宇宙 🎙️', shipinhao: '视频号 📱'
    };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div class="account-overview-cards">
          ${accounts.map(a => `
            <div class="account-card">
              <h3>${a.name}</h3>
              <div class="account-platform">${platformNames[a.platform]}</div>
              <div class="account-stats">
                <div class="account-stat">
                  <div class="stat-value">${a.followers.toLocaleString()}</div>
                  <div class="stat-label">粉丝数</div>
                </div>
                <div class="account-stat">
                  <div class="stat-value">${a.postsCount}</div>
                  <div class="stat-label">已发布</div>
                </div>
                <div class="account-stat">
                  <div class="stat-value">${a.totalViews.toLocaleString()}</div>
                  <div class="stat-label">总播放</div>
                </div>
                <div class="account-stat">
                  <div class="stat-value">${a.avgEngagement}</div>
                  <div class="stat-label">平均互动率</div>
                </div>
                <div class="account-stat">
                  <div class="stat-value" style="color: var(--color-success)">${a.followerGrowthWeek}</div>
                  <div class="stat-label">周涨粉</div>
                </div>
                <div class="account-stat">
                  <div class="stat-value" style="color: var(--color-success)">${a.followerGrowthMonth}</div>
                  <div class="stat-label">月涨粉</div>
                </div>
              </div>
              <div style="margin-top: 12px; padding: 10px; background: var(--color-bg); border-radius: 6px; font-size: 12px;">
                <div style="color: var(--color-text-secondary); margin-bottom: 4px;">最高表现内容</div>
                <div style="font-weight: 500;">${a.topPost.title}</div>
                <div style="color: var(--color-text-secondary); margin-top: 2px;">播放 ${a.topPost.views.toLocaleString()}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * 内容库
   */
  renderSocialContent() {
    // 渲染筛选区
    this.renderSocialFilters();

    // 渲染快捷操作
    this.renderSocialQuickActions();

    // 应用筛选并渲染卡片
    Filters.filterSocialCards();
  },

  /**
   * 渲染自媒体筛选区
   */
  renderSocialFilters() {
    const filterArea = document.getElementById('social-filters');
    if (!filterArea) return;

    filterArea.innerHTML = `
      <div class="filter-row" data-dimension="domain">
        <span class="filter-label">领域</span>
        <div class="filter-tags">
          ${filterDimensions.domains.map(d => `
            <span class="filter-tag ${d === Filters.state.social.domain ? 'active' : ''}" data-value="${d}">${d}</span>
          `).join('')}
        </div>
      </div>
      <div class="filter-row" data-dimension="track">
        <span class="filter-label">赛道</span>
        <div class="filter-tags">
          ${filterDimensions.tracks.map(t => `
            <span class="filter-tag ${t === Filters.state.social.track ? 'active' : ''}" data-value="${t}">${t}</span>
          `).join('')}
          <span class="filter-tag add-custom">+ 自定义赛道</span>
          <span class="custom-track-input" id="custom-track-input">
            <input type="text" id="custom-track-name" placeholder="赛道名称">
            <button id="add-track-btn">添加</button>
          </span>
        </div>
      </div>
      <div class="filter-row" data-dimension="format">
        <span class="filter-label">形式</span>
        <div class="filter-tags">
          ${filterDimensions.formats.map(f => `
            <span class="filter-tag ${f === Filters.state.social.format ? 'active' : ''}" data-value="${f}">${f}</span>
          `).join('')}
        </div>
      </div>
      <div class="filter-row" data-dimension="timeRange">
        <span class="filter-label">时间</span>
        <div class="filter-tags">
          ${filterDimensions.timeRanges.map(t => `
            <span class="filter-tag ${t === Filters.state.social.timeRange ? 'active' : ''}" data-value="${t}">${t}</span>
          `).join('')}
        </div>
      </div>
      <div class="filter-row" data-dimension="status">
        <span class="filter-label">状态</span>
        <div class="filter-tags">
          ${filterDimensions.statuses.map(s => `
            <span class="filter-tag ${s === Filters.state.social.status ? 'active' : ''}" data-value="${s}">${s}</span>
          `).join('')}
        </div>
      </div>
      <div class="filter-row" data-dimension="sortBy">
        <span class="filter-label">排序</span>
        <div class="filter-tags">
          ${filterDimensions.sortOptions.map(s => `
            <span class="filter-tag ${s === Filters.state.social.sortBy ? 'active' : ''}" data-value="${s}">${s}</span>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * 渲染自媒体快捷操作区
   */
  renderSocialQuickActions() {
    const actionArea = document.getElementById('social-actions');
    if (!actionArea) return;

    actionArea.innerHTML = `
      <div class="primary-action">
        <div class="primary-action-info">
          <h4>✍️ 生成今日文案</h4>
          <p>选择平台 → 赛道 → AI生成完整文案</p>
        </div>
        <div class="primary-action-platforms">
          <button class="active">小红书</button>
          <button>抖音</button>
          <button>B站</button>
          <button>小宇宙</button>
          <button>视频号</button>
        </div>
        <button class="primary-action-go" onclick="App.showToast('已复制提示词到剪贴板')">开始生成 →</button>
      </div>
      <div class="secondary-actions">
        <button class="secondary-action-btn" onclick="App.showToast('已复制提示词到剪贴板')">🔍 找低粉爆款</button>
        <button class="secondary-action-btn" onclick="App.showToast('已复制提示词到剪贴板')">📊 分析我的账号</button>
        <button class="secondary-action-btn" onclick="App.showToast('已复制提示词到剪贴板')">🎯 添加对标账号</button>
        <button class="secondary-action-btn" onclick="App.showToast('已复制提示词到剪贴板')">📅 策划月度选题</button>
        <button class="secondary-action-btn" onclick="App.showToast('已复制提示词到剪贴板')">📋 复制同步指令</button>
        <button class="secondary-action-btn" onclick="App.showToast('已复制提示词到剪贴板')">🏷️ 管理赛道</button>
      </div>
    `;

    // 绑定平台选择
    const platformBtns = actionArea.querySelectorAll('.primary-action-platforms button');
    platformBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        platformBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  },

  /**
   * 渲染自媒体内容卡片
   */
  renderSocialCards(cards) {
    const container = document.getElementById('social-content-cards');
    if (!container) return;

    if (cards.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>暂无内容</h3>
          <p>当前筛选条件下没有内容，试试调整筛选</p>
        </div>
      `;
      return;
    }

    const statusMap = {
      published: { text: '已发布', class: 'published' },
      pending: { text: '待发布', class: 'pending' },
      monitoring: { text: '监测中', class: 'monitoring' },
      need_optimize: { text: '需优化', class: 'need_optimize' }
    };

    const platformNames = {
      xiaohongshu: '小红书', douyin: '抖音', bilibili: 'B站',
      xiaoyuzhou: '小宇宙', shipinhao: '视频号'
    };

    container.innerHTML = `
      <div class="card-grid">
        ${cards.map(c => {
          const status = statusMap[c.status];
          const isPositive = c.followerGrowth && c.followerGrowth.startsWith('+');
          return `
            <div class="content-card">
              <div class="card-header">
                <div class="card-title">${c.title}</div>
                <span class="status-badge ${status.class}">${status.text}</span>
              </div>
              <div class="card-tags">
                ${c.tags.map(t => `<span class="card-tag">${t}</span>`).join('')}
              </div>
              <div class="card-metrics">
                <span class="metric-item"><span class="metric-icon">👁</span><strong>${c.views.toLocaleString()}</strong></span>
                <span class="metric-item"><span class="metric-icon">❤</span><strong>${c.likes.toLocaleString()}</strong></span>
                <span class="metric-item"><span class="metric-icon">💬</span><strong>${c.comments}</strong></span>
                <span class="metric-item"><span class="metric-icon">⭐</span><strong>${c.favorites}</strong></span>
              </div>
              <div class="card-trend ${isPositive ? '' : 'negative'}">
                📈 涨粉率 ${c.followerGrowth} · 平台: ${platformNames[c.platform]}
              </div>
              <div class="card-actions">
                <button class="card-action-btn" onclick="App.showToast('正在查看数据详情')">查看数据</button>
                <button class="card-action-btn primary" onclick="App.showToast('已复制AI优化指令到剪贴板')">🤖派AI优化</button>
                <button class="card-action-btn" onclick="App.copyToClipboard('${c.title}')">复制</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  /**
   * 爆款内容库
   */
  renderViralContent() {
    const container = document.getElementById('social-viral');
    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div style="margin-bottom: 16px; padding: 12px 16px; background: var(--color-accent-light); border-radius: 8px; font-size: 13px; color: var(--color-text);">
          💡 主动发现低粉账号的爆款内容，学习其选题和创作技巧
        </div>
        ${viralContentCards.map(v => `
          <div class="viral-card">
            <h4>${v.title}</h4>
            <div class="viral-meta">
              <span>👤 ${v.originalAuthor}</span>
              <span>📍 ${v.originalPlatform}</span>
              <span>👥 粉丝 ${v.authorFollowers}</span>
              <span>👁 播放 ${v.views.toLocaleString()}</span>
              <span>❤ 点赞 ${v.likes.toLocaleString()}</span>
              <span>📅 ${v.discoveryDate}</span>
              <span style="color: var(--color-text-secondary)">#${v.domain} #${v.track} #${v.format}</span>
            </div>
            <div class="viral-insight">💡 ${v.keyInsight}</div>
            <div style="margin-top: 10px;">
              <button class="card-action-btn primary" onclick="App.showToast('已复制爆款分析提示词到剪贴板')">📋 复制分析提示词</button>
              <button class="card-action-btn" onclick="App.showToast('已加入选题库')">➕ 加入选题库</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  /**
   * 选题库
   */
  renderTopicIdeas() {
    const container = document.getElementById('social-topics');
    const statusMap = {
      planned: { text: '已排期', class: 'planned' },
      idea: { text: '构思中', class: 'idea' }
    };
    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div class="card-grid">
          ${topicIdeas.map(t => `
            <div class="content-card">
              <div class="card-header">
                <div class="card-title">${t.title}</div>
                <span class="status-badge ${statusMap[t.status].class}">${statusMap[t.status].text}</span>
              </div>
              <div class="card-tags">
                <span class="card-tag">#${t.domain}</span>
                <span class="card-tag">#${t.track}</span>
                <span class="card-tag">#${t.format}</span>
              </div>
              <div class="card-metrics">
                <span class="metric-item">来源: <strong>${t.source}</strong></span>
                <span class="metric-item">平台: <strong>${t.sourcePlatform}</strong></span>
              </div>
              <div class="card-trend">⭐ 预估推荐度: ${t.estimatedScore}</div>
              ${t.plannedDate ? `<div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 8px;">📅 计划发布: ${t.plannedDate}</div>` : ''}
              <div class="card-actions">
                <button class="card-action-btn primary" onclick="App.showToast('已复制选题提示词')">📋 生成文案</button>
                <button class="card-action-btn" onclick="App.showToast('已排期')">📅 排期</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * 对标账号
   */
  renderBenchmarkAccounts() {
    const container = document.getElementById('social-benchmark');
    const statusMap = {
      tracking: { text: '追踪中', class: 'tracking' },
      paused: { text: '已暂停', class: 'paused' }
    };
    const platformNames = {
      xiaohongshu: '小红书', douyin: '抖音', bilibili: 'B站',
      xiaoyuzhou: '小宇宙', shipinhao: '视频号'
    };

    // 按平台筛选
    let accounts = benchmarkAccounts;
    if (this.state.selectedPlatform !== 'all') {
      accounts = accounts.filter(a => a.platform === this.state.selectedPlatform);
    }

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        ${accounts.map(a => `
          <div class="benchmark-card">
            <div class="benchmark-card-header">
              <h4>${a.name}</h4>
              <span class="status-badge ${statusMap[a.status].class}">${statusMap[a.status].text}</span>
            </div>
            <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 10px;">
              平台: ${platformNames[a.platform]} · 领域: ${a.domain} · 赛道: ${a.track}
            </div>
            <div class="benchmark-stats">
              <div class="benchmark-stat">
                <div class="b-value">${a.followers.toLocaleString()}</div>
                <div class="b-label">粉丝数</div>
              </div>
              <div class="benchmark-stat">
                <div class="b-value">${a.avgViews.toLocaleString()}</div>
                <div class="b-label">平均播放</div>
              </div>
              <div class="benchmark-stat">
                <div class="b-value">${a.avgLikes.toLocaleString()}</div>
                <div class="b-label">平均点赞</div>
              </div>
              <div class="benchmark-stat">
                <div class="b-value" style="color: var(--color-success)">${a.recentGrowth}</div>
                <div class="b-label">月涨粉</div>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--color-text-secondary);">
              <span>📅 ${a.postFrequency}</span>
              <span>添加于 ${a.addedDate}</span>
            </div>
            <div style="margin-top: 10px;">
              <button class="card-action-btn primary" onclick="App.showToast('已复制账号分析提示词')">📋 分析</button>
              <button class="card-action-btn" onclick="App.showToast('已查看最新动态')">🔄 查看动态</button>
              <button class="card-action-btn" onclick="App.showToast('已暂停追踪')">⏸ 暂停</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  /**
   * 数据诊断
   */
  renderDiagnostic() {
    const container = document.getElementById('social-diagnostic');
    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div style="margin-bottom: 16px;">
          <h3 style="font-size: 16px; margin-bottom: 4px;">本周数据复盘</h3>
          <p style="font-size: 13px; color: var(--color-text-secondary);">${diagnosticData.weekRange}</p>
        </div>
        <div class="diagnostic-summary">
          <div class="diag-card">
            <div class="diag-value">${diagnosticData.summary.totalViews.toLocaleString()}</div>
            <div class="diag-label">总播放量</div>
          </div>
          <div class="diag-card">
            <div class="diag-value">${diagnosticData.summary.totalLikes.toLocaleString()}</div>
            <div class="diag-label">总点赞数</div>
          </div>
          <div class="diag-card">
            <div class="diag-value">${diagnosticData.summary.totalComments}</div>
            <div class="diag-label">总评论数</div>
          </div>
          <div class="diag-card">
            <div class="diag-value" style="color: var(--color-success)">+${diagnosticData.summary.totalNewFollowers}</div>
            <div class="diag-label">本周新增粉丝</div>
          </div>
          <div class="diag-card">
            <div class="diag-value">${diagnosticData.summary.avgEngagement}</div>
            <div class="diag-label">平均互动率</div>
          </div>
          <div class="diag-card">
            <div class="diag-value" style="font-size: 16px;">${diagnosticData.summary.bestPerformingPlatform}</div>
            <div class="diag-label">最佳平台</div>
          </div>
        </div>

        <h3 style="font-size: 15px; margin: 20px 0 12px;">平台数据对比</h3>
        <table class="follow-table" style="margin-bottom: 24px;">
          <thead>
            <tr>
              <th>平台</th>
              <th>播放量</th>
              <th>点赞数</th>
              <th>新增粉丝</th>
            </tr>
          </thead>
          <tbody>
            ${diagnosticData.platformBreakdown.map(p => `
              <tr>
                <td><strong>${p.platform}</strong></td>
                <td>${p.views.toLocaleString()}</td>
                <td>${p.likes.toLocaleString()}</td>
                <td style="color: var(--color-success)">${p.followers}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3 style="font-size: 15px; margin: 20px 0 12px;">优化建议</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          ${diagnosticData.recommendations.map((r, i) => `
            <div style="padding: 12px 16px; background: var(--color-card); border: 1px solid var(--color-border); border-radius: 8px; border-left: 3px solid var(--color-accent);">
              <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 4px;">建议 ${i+1}</div>
              <div style="font-size: 13px;">${r}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * 赛道热度（V4.2 第三阶段新增）
   * 展示各内容赛道的活跃度、竞争度、机会指数、爆款率
   */
  renderSocialHeat() {
    const container = document.getElementById('social-heat');
    if (!container) return;

    const data = (typeof SOCIAL_TRACK_HEAT !== 'undefined') ? SOCIAL_TRACK_HEAT : null;
    if (!data) {
      container.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--color-text-secondary);">赛道热度数据加载失败</div>';
      return;
    }

    const ov = data.overview;
    const tracks = data.tracks;
    const trendData = data.trendData;
    const platformHeat = data.platformHeat;
    const monthLabels = ['2月', '3月', '4月', '5月', '6月', '7月'];

    // 机会指数分级
    const getOpportunityLevel = (score) => {
      if (score >= 85) return { label: '🔥 热门机会', color: '#F44336' };
      if (score >= 70) return { label: '✨ 值得关注', color: '#FF9800' };
      if (score >= 50) return { label: '📊 稳健发展', color: '#2196F3' };
      return { label: '⚠️ 饱和赛道', color: '#9E9E9E' };
    };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <!-- 标题 -->
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
          <span style="font-size: 22px;">🔥</span>
          <div>
            <div style="font-size: 16px; font-weight: 700; color: var(--color-primary);">赛道热度</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">内容赛道机会分析 · ${new Date().toISOString().slice(0, 7)} 月</div>
          </div>
        </div>

        <!-- 总览统计 -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
          <div style="background: linear-gradient(135deg, var(--color-primary) 0%, #1a4d2e 100%); color: white; padding: 14px 16px; border-radius: 10px;">
            <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">📊 赛道总数</div>
            <div style="font-size: 22px; font-weight: 700;">${ov.totalTracks}</div>
            <div style="font-size: 10px; opacity: 0.8;">个内容赛道</div>
          </div>
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; padding: 14px 16px; border-left: 4px solid #F44336;">
            <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px;">🔥 热门赛道</div>
            <div style="font-size: 22px; font-weight: 700; color: #F44336;">${ov.hotTracks}</div>
            <div style="font-size: 10px; color: var(--color-text-secondary);">机会指数 ≥ 80</div>
          </div>
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; padding: 14px 16px; border-left: 4px solid #FF9800;">
            <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px;">✨ 新兴赛道</div>
            <div style="font-size: 22px; font-weight: 700; color: #FF9800;">${ov.emergingTracks}</div>
            <div style="font-size: 10px; color: var(--color-text-secondary);">上升趋势明显</div>
          </div>
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; padding: 14px 16px; border-left: 4px solid #9E9E9E;">
            <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px;">⚠️ 饱和赛道</div>
            <div style="font-size: 22px; font-weight: 700; color: #9E9E9E;">${ov.saturatedTracks}</div>
            <div style="font-size: 10px; color: var(--color-text-secondary);">竞争激烈</div>
          </div>
        </div>

        <!-- 赛道详情卡片 -->
        <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <div style="font-size: 14px; font-weight: 600; color: var(--color-primary); margin-bottom: 14px;">📋 各赛道热度详情</div>
          <div style="overflow-x: auto;">
            <table class="follow-table" style="width: 100%; font-size: 12px;">
              <thead>
                <tr>
                  <th style="text-align: left; padding: 8px;">赛道</th>
                  <th style="text-align: center; padding: 8px;">热度</th>
                  <th style="text-align: center; padding: 8px;">竞争度</th>
                  <th style="text-align: center; padding: 8px;">机会指数</th>
                  <th style="text-align: center; padding: 8px;">爆款率</th>
                  <th style="text-align: center; padding: 8px;">均赞</th>
                  <th style="text-align: center; padding: 8px;">内容数</th>
                  <th style="text-align: center; padding: 8px;">趋势</th>
                  <th style="text-align: center; padding: 8px;">建议</th>
                </tr>
              </thead>
              <tbody>
                ${tracks.map(t => {
                  const opp = getOpportunityLevel(t.opportunity);
                  const trendIcons = { up: '📈', stable: '➡️', down: '📉' };
                  const changeColor = t.change.startsWith('+') ? '#4CAF50' : (t.change.startsWith('-') ? '#F44336' : '#757575');
                  return `
                    <tr style="border-bottom: 1px solid var(--color-border);">
                      <td style="padding: 10px 8px;"><strong>${t.icon} ${t.name}</strong></td>
                      <td style="padding: 8px; text-align: center;">
                        <div style="display: flex; align-items: center; gap: 4px; justify-content: center;">
                          <div style="width: 36px; height: 5px; background: var(--color-bg); border-radius: 3px; overflow: hidden;">
                            <div style="height: 100%; width: ${t.heat}%; background: ${t.heat >= 85 ? '#F44336' : (t.heat >= 70 ? '#FF9800' : '#2196F3')}; border-radius: 3px;"></div>
                          </div>
                          <span style="font-size: 10px; font-weight: 600; color: var(--color-primary);">${t.heat}</span>
                        </div>
                      </td>
                      <td style="padding: 8px; text-align: center; color: ${t.competition >= 75 ? '#F44336' : (t.competition >= 50 ? '#FF9800' : '#4CAF50')};">${t.competition}</td>
                      <td style="padding: 8px; text-align: center;">
                        <span style="padding: 2px 8px; border-radius: 4px; background: ${opp.color}15; color: ${opp.color}; font-weight: 600; font-size: 11px;">${t.opportunity}</span>
                      </td>
                      <td style="padding: 8px; text-align: center; font-weight: 600; color: ${t.viralRate >= 10 ? '#4CAF50' : (t.viralRate >= 7 ? '#FF9800' : '#9E9E9E')};">${t.viralRate}%</td>
                      <td style="padding: 8px; text-align: center;">${t.avgLikes.toLocaleString()}</td>
                      <td style="padding: 8px; text-align: center;">${t.contentCount}</td>
                      <td style="padding: 8px; text-align: center; color: ${changeColor}; font-weight: 600;">${trendIcons[t.trend]} ${t.change}</td>
                      <td style="padding: 8px; text-align: center; font-size: 10px; color: ${opp.color};">${opp.label}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 趋势 + 平台分布 -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 20px;">
          <!-- 热门赛道趋势 -->
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 18px;">
            <div style="font-size: 14px; font-weight: 600; color: var(--color-primary); margin-bottom: 14px;">📈 热门赛道热度趋势（近 6 个月）</div>
            ${(() => {
              const colors = { '营养科普': '#4CAF50', '精油芳疗': '#9C27B0', '护肤美妆': '#E91E63', '居家清洁': '#FF9800' };
              const allValues = Object.values(trendData).flat();
              const maxVal = Math.max(...allValues);
              const minVal = Math.min(...allValues);
              const range = maxVal - minVal || 1;
              return Object.entries(trendData).map(([name, months]) => `
                <div style="margin-bottom: 14px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-size: 12px; font-weight: 600; color: ${colors[name]};">${name}</span>
                    <span style="font-size: 11px; color: var(--color-text-secondary);">最新 ${months[months.length - 1]}</span>
                  </div>
                  <div style="display: flex; align-items: flex-end; gap: 6px; height: 60px;">
                    ${months.map((v, i) => {
                      const heightPercent = ((v - minVal) / range) * 100;
                      return `
                        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;">
                          <span style="font-size: 10px; color: var(--color-text-secondary);">${v}</span>
                          <div style="width: 100%; height: ${Math.max(heightPercent, 8)}%; background: ${colors[name]}; border-radius: 3px 3px 0 0; opacity: 0.85; min-height: 4px;"></div>
                          <span style="font-size: 9px; color: var(--color-text-secondary);">${monthLabels[i]}</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `).join('');
            })()}
          </div>

          <!-- 平台热度分布 -->
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 18px;">
            <div style="font-size: 14px; font-weight: 600; color: var(--color-primary); margin-bottom: 14px;">📱 各平台热度分布</div>
            ${platformHeat.map(p => `
              <div style="margin-bottom: 14px; padding: 10px; background: var(--color-bg); border-radius: 8px; border-left: 3px solid var(--color-primary);">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                  <span style="font-size: 18px;">${p.icon}</span>
                  <strong style="font-size: 12px; color: var(--color-primary);">${p.platform}</strong>
                  <span style="font-size: 10px; color: var(--color-text-secondary); margin-left: auto;">${p.tracks} 赛道</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--color-text-secondary); margin-bottom: 4px;">
                  <span>平均热度: <strong style="color: var(--color-primary);">${p.avgHeat}</strong></span>
                  <span>爆款率: <strong style="color: var(--color-accent);">${p.viralRate}%</strong></span>
                </div>
                <div style="font-size: 10px; color: var(--color-text-secondary);">🏆 头部赛道: <strong style="color: var(--color-primary);">${p.topPerformer}</strong></div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 策略建议 -->
        <div style="background: var(--color-accent-light); border-left: 4px solid var(--color-accent); padding: 14px 18px; border-radius: 0 8px 8px 0;">
          <div style="font-size: 14px; font-weight: 600; color: var(--color-primary); margin-bottom: 8px;">💡 策略建议</div>
          <div style="font-size: 12px; color: var(--color-text-secondary); line-height: 1.8;">
            <div>• <strong style="color: var(--color-primary);">重点投入</strong>：精油芳疗（机会指数 90，爆款率 15.2%，竞争度低）—— 建议加大内容产出</div>
            <div>• <strong style="color: var(--color-primary);">稳定产出</strong>：营养科普（热度 92，机会指数 88）—— 头部赛道，持续输出</div>
            <div>• <strong style="color: var(--color-primary);">谨慎投入</strong>：生活分享（机会指数 35，竞争度 80）—— 饱和赛道，避免重投入</div>
            <div>• <strong style="color: var(--color-primary);">新兴布局</strong>：居家清洁（机会指数 82，上升 +18%）—— 蓝海赛道，提前布局</div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * 平台规则
   */
  renderPlatformRules() {
    const container = document.getElementById('social-rules');
    container.innerHTML = `
      <div style="padding: 20px 28px;">
        ${platformRules.map(r => `
          <div class="rule-card impact-${r.impact === '高' ? 'high' : r.impact === '低' ? 'low' : 'mid'}">
            <div class="rule-card-header">
              <h4>${r.title}</h4>
              <span class="status-badge ${r.impact === '高' ? 'need_optimize' : r.impact === '低' ? 'completed' : 'monitoring'}">影响: ${r.impact}</span>
            </div>
            <div class="rule-platform">平台: ${r.platform} · 发布日期: ${r.publishDate}</div>
            <div class="rule-summary">${r.summary}</div>
            <div class="rule-action">⚡ 行动: ${r.action}</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  /* ========== 社群运营标签页 ========== */
  renderCommunityTab() {
    const activeSub = this.state.activeSubTab['tab-community'];
    this.renderCommunitySubTab(activeSub);
  },

  renderCommunitySubTab(subTabId) {
    switch (subTabId) {
      case 'comm-calendar':
        this.renderPushCalendar();
        break;
      case 'comm-manage':
        this.renderCommunityManage();
        break;
      case 'comm-onboarding':
        this.renderOnboarding();
        break;
      case 'comm-follow':
        this.renderConsumptionFollow();
        break;
      case 'comm-funnel':
        this.renderFunnel();
        break;
      case 'comm-arch':
        this.renderArchitecture();
        break;
    }
  },

  /**
   * 推送日历（V3.0 第三阶段重构：完整时间线 + 指标展示）
   */
  renderPushCalendar() {
    const container = document.getElementById('comm-calendar');
    if (!container) return;

    // 渲染日历头部
    const dates = ['2026-07-27', '2026-07-28', '2026-07-29'];
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    // V3.0 第三阶段：计算当日指标
    const todayTasks = pushCalendarData[this.state.selectedDate] || [];
    const totalToday = todayTasks.length;
    const pushedToday = todayTasks.filter(t => t.status === 'pushed').length;
    const pendingToday = todayTasks.filter(t => t.status === 'pending').length;
    const completionRate = totalToday > 0 ? Math.round((pushedToday / totalToday) * 100) : 0;
    // 涉及社群数（去重）
    const communitySet = new Set(todayTasks.map(t => t.communityName));
    const communityCount = communitySet.size;
    // 内容类型分布
    const typeCount = {};
    todayTasks.forEach(t => { typeCount[t.contentType] = (typeCount[t.contentType] || 0) + 1; });
    // 自动 vs 手动
    const autoCount = todayTasks.filter(t => t.operator === '系统自动').length;
    const manualCount = todayTasks.filter(t => t.operator === '手动推送').length;

    container.innerHTML = `
      <!-- V3.0 第三阶段：当日指标展示卡片 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
        <div style="background: linear-gradient(135deg, var(--color-primary) 0%, #1a4d2e 100%); color: white; padding: 14px 16px; border-radius: 10px;">
          <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">📅 今日推送</div>
          <div style="font-size: 22px; font-weight: 700;">${totalToday}</div>
          <div style="font-size: 10px; opacity: 0.8;">条任务 · ${communityCount} 个社群</div>
        </div>
        <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; padding: 14px 16px; border-left: 4px solid #4CAF50;">
          <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px;">✅ 已推送</div>
          <div style="font-size: 22px; font-weight: 700; color: #4CAF50;">${pushedToday}</div>
          <div style="font-size: 10px; color: var(--color-text-secondary);">完成率 ${completionRate}%</div>
        </div>
        <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; padding: 14px 16px; border-left: 4px solid #FF9800;">
          <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px;">⏳ 待推送</div>
          <div style="font-size: 22px; font-weight: 700; color: #FF9800;">${pendingToday}</div>
          <div style="font-size: 10px; color: var(--color-text-secondary);">待执行任务</div>
        </div>
        <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; padding: 14px 16px; border-left: 4px solid #2196F3;">
          <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px;">🤖 自动化率</div>
          <div style="font-size: 22px; font-weight: 700; color: #2196F3;">${totalToday > 0 ? Math.round((autoCount / totalToday) * 100) : 0}%</div>
          <div style="font-size: 10px; color: var(--color-text-secondary);">自动 ${autoCount} · 手动 ${manualCount}</div>
        </div>
      </div>

      <!-- 内容类型分布 -->
      ${totalToday > 0 ? `
        <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; padding: 10px 14px; margin-bottom: 16px;">
          <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 6px; font-weight: 600;">📊 内容类型分布</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${Object.entries(typeCount).map(([type, count]) => {
              const typeIcons = { '知识卡片': '📚', '互动话题': '💬', '话术': '🗣️', '打卡提醒': '⏰' };
              const percent = Math.round((count / totalToday) * 100);
              return `<span style="font-size: 11px; padding: 3px 8px; border-radius: 4px; background: var(--color-accent-light); color: var(--color-primary);">${typeIcons[type] || '📎'} ${type} × ${count}（${percent}%）</span>`;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <div class="calendar-header">
        <button class="calendar-nav-btn" onclick="App.changeCalendarDate(-1)">←</button>
        <div class="calendar-dates">
          ${dates.map(d => {
            const date = new Date(d);
            const wd = weekdays[date.getDay()];
            const day = date.getDate();
            const dayTasks = pushCalendarData[d] || [];
            const dayPushed = dayTasks.filter(t => t.status === 'pushed').length;
            return `
              <div class="calendar-date-item ${d === this.state.selectedDate ? 'active' : ''}" data-date="${d}" onclick="App.selectDate('${d}')">
                <div class="date-weekday">${wd}</div>
                <div class="date-day">${day}</div>
                <div style="font-size: 9px; color: var(--color-text-secondary); margin-top: 2px;">${dayTasks.length}条 · ${dayPushed}已完成</div>
              </div>
            `;
          }).join('')}
        </div>
        <button class="calendar-nav-btn" onclick="App.changeCalendarDate(1)">→</button>
      </div>
      <div class="push-timeline" id="push-timeline-content"></div>
    `;

    this.renderPushTimeline();
  },

  /**
   * 渲染推送时间线内容
   */
  renderPushTimeline() {
    const container = document.getElementById('push-timeline-content');
    if (!container) return;

    const tasks = pushCalendarData[this.state.selectedDate] || [];

    if (tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📅</div>
          <h3>暂无推送任务</h3>
          <p>该日期暂无推送计划，点击"生成今日推送日历"创建</p>
        </div>
      `;
      return;
    }

    const statusMap = {
      pushed: { text: '✅ 已推送', class: 'completed' },
      pending: { text: '⏳ 待推送', class: 'pending' }
    };

    container.innerHTML = tasks.map(t => `
      <div class="timeline-item">
        <div class="timeline-time">${t.time}</div>
        <div class="timeline-dot"></div>
        <div class="timeline-card">
          <div class="timeline-card-header">
            <div class="timeline-card-title">${t.communityName}</div>
            <span class="status-badge ${statusMap[t.status].class}">${statusMap[t.status].text}</span>
          </div>
          <div class="timeline-card-meta">
            <span>📌 类型: ${t.contentType}</span>
            <span>👥 ${t.targetGroup}</span>
            <span>🤖 ${t.operator}</span>
          </div>
          <div class="timeline-card-content">${t.content}</div>
          <div class="timeline-card-actions">
            <button onclick="App.showToast('查看推送详情')">查看详情</button>
            <button onclick="App.showToast('进入编辑模式')">编辑</button>
            ${t.status === 'pending' ? `<button class="push-now" onclick="App.showToast('已立即推送')">立即推送</button>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  },

  /**
   * 切换日历日期
   */
  selectDate(date) {
    this.state.selectedDate = date;
    // 更新激活态
    document.querySelectorAll('.calendar-date-item').forEach(item => {
      item.classList.toggle('active', item.dataset.date === date);
    });
    this.renderPushTimeline();
  },

  changeCalendarDate(delta) {
    const dates = ['2026-07-27', '2026-07-28', '2026-07-29'];
    const idx = dates.indexOf(this.state.selectedDate);
    const newIdx = Math.max(0, Math.min(dates.length - 1, idx + delta));
    this.selectDate(dates[newIdx]);
  },

  bindCalendar() {
    // 日历事件在渲染时已绑定
  },

  /**
   * 社群管理 - 放大版卡片
   */
  renderCommunityManage() {
    const container = document.getElementById('comm-manage');
    if (!container) return;

    const statusMap = {
      active: { text: '运行中', class: 'active' },
      paused: { text: '已暂停', class: 'paused' }
    };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        ${communityCards.map(c => `
          <div class="community-card-large">
            <div class="community-card-header">
              <h3>${c.name}</h3>
              <div style="display: flex; align-items: center; gap: 12px;">
                <span class="status-badge ${statusMap[c.status].class}">${statusMap[c.status].text}</span>
                <span class="day-badge">${c.dayProgress}</span>
              </div>
            </div>
            <div class="community-metrics-row">
              <div class="community-metric">
                <div class="metric-value">${c.checkinRate}</div>
                <div class="metric-label">打卡率</div>
              </div>
              <div class="community-metric">
                <div class="metric-value">${c.conversionRate}</div>
                <div class="metric-label">转化率</div>
              </div>
              <div class="community-metric">
                <div class="metric-value">${c.activityRate}</div>
                <div class="metric-label">活跃度</div>
              </div>
              <div class="community-metric">
                <div class="metric-value" style="color: var(--color-success)">${c.newMembers}</div>
                <div class="metric-label">新增人数</div>
              </div>
            </div>
            <div class="community-push-timeline">
              <div class="push-slot">
                <div class="slot-label">上午推送</div>
                <div>${c.morningPush}</div>
              </div>
              <div class="push-slot">
                <div class="slot-label">下午推送</div>
                <div>${c.afternoonPush}</div>
              </div>
            </div>
            <div style="margin-bottom: 12px;">
              <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 4px;">近7天活跃度趋势</div>
              <div style="display: flex; gap: 4px; align-items: flex-end; height: 40px;">
                ${c.weekTrend.map(v => `
                  <div style="flex: 1; height: ${v}%; background: linear-gradient(to top, var(--color-primary), var(--color-primary-light)); border-radius: 2px; min-height: 4px;" title="${v}%"></div>
                `).join('')}
              </div>
            </div>
            <div style="margin-bottom: 12px; font-size: 12px; color: var(--color-text-secondary);">
              分组: ${c.groups.join(' · ')}
            </div>
            <div class="community-card-actions">
              <button onclick="App.showToast('查看社群详情')">📊 详情</button>
              <button onclick="App.showToast('进入推送管理')">📅 推送</button>
              <button onclick="App.showToast('查看成员列表')">👥 成员</button>
              <button onclick="App.showToast('查看数据报表')">📈 数据</button>
              <button onclick="App.showToast('进入设置')">⚙️ 设置</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  /**
   * 新人引导
   */
  renderOnboarding() {
    const container = document.getElementById('comm-onboarding');
    if (!container) return;

    const statusMap = {
      completed: { text: '已完成', class: 'completed' },
      in_progress: { text: '进行中', class: 'in_progress' },
      pending: { text: '待开始', class: 'pending' }
    };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div class="onboarding-timeline">
          ${onboardingData.map(o => `
            <div class="onboarding-item">
              <div class="onboarding-day">${o.day}</div>
              <div class="onboarding-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <h4>${o.title}</h4>
                  <span class="status-badge ${statusMap[o.status].class}">${statusMap[o.status].text}</span>
                </div>
                <div class="completion">完成率: ${o.completionRate}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * 消费跟进
   */
  renderConsumptionFollow() {
    const container = document.getElementById('comm-follow');
    if (!container) return;

    const statusClass = {
      '正常消费': 'completed', '即将到期': 'pending', '可能流失': 'need_optimize', '新会员': 'monitoring'
    };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <table class="follow-table">
          <thead>
            <tr>
              <th>会员</th>
              <th>状态</th>
              <th>最近下单</th>
              <th>本月点数</th>
              <th>提醒</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${consumptionFollowData.map(c => `
              <tr>
                <td><strong>${c.member}</strong></td>
                <td><span class="status-badge ${statusClass[c.status]}">${c.status}</span></td>
                <td>${c.lastOrder}</td>
                <td>${c.monthlyPoints} 点</td>
                <td>${c.alert ? `<span class="alert-tag ${c.alert.includes('流失') ? 'danger' : c.alert.includes('提醒') ? 'warn' : 'info'}">${c.alert}</span>` : '<span style="color: #999">--</span>'}</td>
                <td>
                  <button class="card-action-btn" onclick="App.showToast('已发送提醒')">提醒</button>
                  <button class="card-action-btn" onclick="App.showToast('查看消费记录')">记录</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  /**
   * 转化漏斗
   */
  renderFunnel() {
    const container = document.getElementById('comm-funnel');
    if (!container) return;

    container.innerHTML = `
      <div class="funnel-section">
        <h3 style="font-size: 16px; margin-bottom: 16px; text-align: center;">转化漏斗（L1 → L3 全链路）</h3>
        <div class="funnel-container">
          ${funnelData.map(f => `
            <div class="funnel-stage">
              <span class="stage-name">${f.stage}</span>
              <span>
                <span class="stage-count">${f.count.toLocaleString()}</span>
                <span class="stage-pct">${f.percentage}</span>
              </span>
            </div>
          `).join('')}
        </div>
        <div style="margin-top: 32px; text-align: center; padding: 16px; background: var(--color-card); border-radius: 8px; max-width: 600px; margin-left: auto; margin-right: auto;">
          <div style="font-size: 13px; color: var(--color-text-secondary);">整体转化率（公域关注 → 会员）</div>
          <div style="font-size: 28px; font-weight: 700; color: var(--color-accent); margin: 8px 0;">4.03%</div>
          <div style="font-size: 12px; color: var(--color-text-secondary);">高于行业平均水平（2.5%）</div>
        </div>
      </div>
    `;
  },

  /**
   * 架构设计
   */
  renderArchitecture() {
    const container = document.getElementById('comm-arch');
    if (!container) return;

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        ${architectureData.map(a => `
          <div class="arch-card">
            <div class="arch-card-header">
              <h3>${a.name}</h3>
              <span class="status-badge ${a.status === '运行中' ? 'active' : 'pending'}">${a.status}</span>
            </div>
            <div class="arch-meta">
              <span>📦 类型: ${a.type}</span>
              <span>⏱ 时长: ${a.duration}</span>
              <span>👥 目标: ${a.targetAudience}</span>
              <span>🔄 漏斗: ${a.funnelStage}</span>
              <span>📋 版本: ${a.version}</span>
            </div>
            <div style="margin-top: 10px;">
              <button class="card-action-btn primary" onclick="App.showToast('已复制架构SOP到剪贴板')">📋 查看SOP</button>
              <button class="card-action-btn" onclick="App.showToast('进入编辑模式')">✏️ 编辑</button>
              <button class="card-action-btn" onclick="App.showToast('已复制架构')">🔄 复制</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  /* ========== 课件制作标签页 ========== */
  renderCoursewareTab() {
    const activeSub = this.state.activeSubTab['tab-courseware'];
    this.renderCoursewareSubTab(activeSub);
  },

  renderCoursewareSubTab(subTabId) {
    switch (subTabId) {
      case 'cw-library':
        this.renderCoursewareFilters();
        Filters.filterCoursewareCards();
        break;
      case 'cw-framework':
        this.renderCwFramework();
        break;
      case 'cw-script':
        this.renderCwScript();
        break;
      case 'cw-outline':
        this.renderCwOutline();
        break;
      case 'cw-fulltext':
        this.renderCwFulltext();
        break;
      case 'cw-materials':
        this.renderCwMaterials();
        break;
    }
  },

  renderCoursewareFilters() {
    const filterArea = document.getElementById('cw-filters');
    if (!filterArea) return;

    const levels = ['全部', 'L1', 'L2', 'L3'];
    const categories = ['全部', '营养辅助食品', '精油与身体护理', '美妆护肤', '居家清洁', '综合'];
    const formats = ['全部', 'PPT', '短视频脚本', '逐字稿'];
    const statuses = ['全部', '已完成', '进行中', '草稿'];
    const priorities = ['全部', '高', '中', '低'];

    filterArea.innerHTML = `
      <div class="filter-row" data-dimension="level">
        <span class="filter-label">层级</span>
        <div class="filter-tags">
          ${levels.map(l => `<span class="filter-tag ${l === Filters.state.courseware.level ? 'active' : ''}" data-value="${l}">${l}</span>`).join('')}
        </div>
      </div>
      <div class="filter-row" data-dimension="category">
        <span class="filter-label">品类</span>
        <div class="filter-tags">
          ${categories.map(c => `<span class="filter-tag ${c === Filters.state.courseware.category ? 'active' : ''}" data-value="${c}">${c}</span>`).join('')}
        </div>
      </div>
      <div class="filter-row" data-dimension="format">
        <span class="filter-label">形式</span>
        <div class="filter-tags">
          ${formats.map(f => `<span class="filter-tag ${f === Filters.state.courseware.format ? 'active' : ''}" data-value="${f}">${f}</span>`).join('')}
        </div>
      </div>
      <div class="filter-row" data-dimension="status">
        <span class="filter-label">状态</span>
        <div class="filter-tags">
          ${statuses.map(s => `<span class="filter-tag ${s === Filters.state.courseware.status ? 'active' : ''}" data-value="${s}">${s}</span>`).join('')}
        </div>
      </div>
      <div class="filter-row" data-dimension="priority">
        <span class="filter-label">优先级</span>
        <div class="filter-tags">
          ${priorities.map(p => `<span class="filter-tag ${p === Filters.state.courseware.priority ? 'active' : ''}" data-value="${p}">${p}</span>`).join('')}
        </div>
      </div>
    `;
  },

  renderCoursewareCards(cards) {
    const container = document.getElementById('cw-library-cards');
    if (!container) return;

    const statusMap = {
      completed: { text: '已完成', class: 'completed' },
      in_progress: { text: '进行中', class: 'in_progress' },
      draft: { text: '草稿', class: 'draft' }
    };

    if (cards.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><h3>暂无课件</h3></div>`;
      return;
    }

    container.innerHTML = `
      <div class="card-grid">
        ${cards.map(c => {
          // V4.2 第二阶段：展示关联文件信息
          const files = c.files || [];
          const fileCount = files.length;
          // 提取文件类型徽章（去重，最多展示3个）
          const fileTypes = [...new Set(files.map(f => f.type))].slice(0, 3);
          // 计算总大小（粗略，仅展示文件数）
          const lastUpdate = c.lastUpdate || '—';
          const author = c.author || '—';
          return `
            <div class="content-card" style="cursor: pointer;" onclick="App.showCoursewareDetail('${c.id}')">
              <div class="card-header">
                <div class="card-title">${c.title}</div>
                <span class="status-badge ${statusMap[c.status].class}">${statusMap[c.status].text}</span>
              </div>
              <div class="card-tags">
                <span class="card-tag">#${c.level}</span>
                <span class="card-tag">#${c.category}</span>
                <span class="card-tag">#${c.format}</span>
              </div>
              <div class="card-metrics">
                <span class="metric-item">优先级: <strong>${c.priority}</strong></span>
                <span class="metric-item">版本: <strong>${c.version}</strong></span>
                <span class="metric-item">作者: <strong>${author}</strong></span>
              </div>
              <!-- V4.2 第二阶段：文件系统关联展示 -->
              <div style="margin: 8px 0; padding: 8px 10px; background: var(--color-bg); border-radius: 6px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                  <span style="font-size: 11px; color: var(--color-text-secondary); font-weight: 600;">📁 关联文件</span>
                  <span style="font-size: 11px; color: var(--color-primary); font-weight: 600;">${fileCount} 个文件</span>
                </div>
                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                  ${fileTypes.length > 0 ? fileTypes.map(ft => {
                    const meta = (typeof getCoursewareFileType === 'function') ? getCoursewareFileType(ft) : { icon: '📎', label: ft, color: '#757575' };
                    return `<span style="font-size: 10px; padding: 2px 6px; border-radius: 3px; background: ${meta.color}15; color: ${meta.color}; font-weight: 500;">${meta.icon} ${meta.label}</span>`;
                  }).join('') : '<span style="font-size: 10px; color: var(--color-text-secondary);">暂无文件</span>'}
                </div>
                <div style="font-size: 10px; color: var(--color-text-secondary); margin-top: 4px;">最近更新: ${lastUpdate}</div>
              </div>
              <div class="card-actions">
                <button class="card-action-btn primary" onclick="event.stopPropagation(); App.showCoursewareDetail('${c.id}')">查看详情</button>
                <button class="card-action-btn" onclick="event.stopPropagation(); App.showToast('已复制优化提示词')">优化</button>
                <button class="card-action-btn" onclick="event.stopPropagation(); App.copyToClipboard('${c.title}')">复制</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  /**
   * 显示课件详情 Modal（V4.2 第二阶段新增）
   * 展示课件完整信息 + 文件清单 + 上传按钮（受 canDesignCourse 权限控制）
   */
  showCoursewareDetail(coursewareId) {
    const courseware = coursewareCards.find(c => c.id === coursewareId);
    if (!courseware) return;

    const statusMap = {
      completed: { text: '已完成', class: 'completed' },
      in_progress: { text: '进行中', class: 'in_progress' },
      draft: { text: '草稿', class: 'draft' }
    };
    const statusInfo = statusMap[courseware.status] || statusMap.draft;
    const files = courseware.files || [];
    const canManage = (typeof Auth !== 'undefined') && Auth.currentUser && 
      (Auth.isAdmin() || (Auth.getPermission() && Auth.getPermission().specialAbilities && Auth.getPermission().specialAbilities.canDesignCourse));

    const modal = this._ensureModalOverlay();
    modal.innerHTML = `
      <div class="modal" style="max-width: 720px; max-height: 85vh; overflow-y: auto;">
        <div class="modal-header">
          <h3>📚 ${courseware.title}</h3>
          <button class="modal-close" onclick="App.hideModal()">×</button>
        </div>
        <div class="modal-body" style="padding: 20px 24px;">
          <!-- 基础信息 -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; padding: 14px; background: var(--color-bg); border-radius: 8px;">
            <div><span style="color: var(--color-text-secondary); font-size: 12px;">层级：</span><strong>${courseware.level}</strong></div>
            <div><span style="color: var(--color-text-secondary); font-size: 12px;">品类：</span><strong>${courseware.category}</strong></div>
            <div><span style="color: var(--color-text-secondary); font-size: 12px;">形式：</span><strong>${courseware.format}</strong></div>
            <div><span style="color: var(--color-text-secondary); font-size: 12px;">状态：</span><span class="status-badge ${statusInfo.class}">${statusInfo.text}</span></div>
            <div><span style="color: var(--color-text-secondary); font-size: 12px;">优先级：</span><strong>${courseware.priority}</strong></div>
            <div><span style="color: var(--color-text-secondary); font-size: 12px;">当前版本：</span><strong>${courseware.version}</strong></div>
            <div><span style="color: var(--color-text-secondary); font-size: 12px;">作者：</span><strong>${courseware.author || '—'}</strong></div>
            <div><span style="color: var(--color-text-secondary); font-size: 12px;">最近更新：</span><strong>${courseware.lastUpdate || '—'}</strong></div>
          </div>

          <!-- 课件描述 -->
          ${courseware.description ? `
            <div style="margin-bottom: 20px;">
              <div style="font-size: 13px; font-weight: 600; color: var(--color-primary); margin-bottom: 8px;">📝 课件简介</div>
              <div style="padding: 12px; background: var(--color-bg); border-radius: 8px; font-size: 12px; line-height: 1.6; color: var(--color-primary);">${courseware.description}</div>
            </div>
          ` : ''}

          <!-- 文件清单 -->
          <div style="margin-bottom: 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <div style="font-size: 13px; font-weight: 600; color: var(--color-primary);">📁 关联文件（${files.length}）</div>
              ${canManage ? `<button class="card-action-btn primary" style="font-size: 11px; padding: 4px 10px;" onclick="App.uploadCoursewareFile('${courseware.id}')">＋ 上传文件</button>` : ''}
            </div>
            ${files.length === 0 ? `
              <div style="padding: 20px; text-align: center; background: var(--color-bg); border-radius: 8px; color: var(--color-text-secondary); font-size: 12px;">
                <div style="font-size: 28px; margin-bottom: 6px;">📂</div>
                <div>该课件暂无关联文件</div>
                ${canManage ? '<div style="margin-top: 6px; font-size: 11px;">点击右上角「上传文件」添加</div>' : ''}
              </div>
            ` : `
              <div style="padding: 8px; background: var(--color-bg); border-radius: 8px;">
                ${files.map(f => {
                  const meta = (typeof getCoursewareFileType === 'function') ? getCoursewareFileType(f.type) : { icon: '📎', label: f.type, color: '#757575', desc: '文件' };
                  return `
                    <div style="display: flex; align-items: center; gap: 12px; padding: 10px; background: var(--color-surface); border-radius: 6px; margin-bottom: 6px; border-left: 3px solid ${meta.color};">
                      <span style="font-size: 24px;">${meta.icon}</span>
                      <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 12px; font-weight: 500; color: var(--color-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${f.name}</div>
                        <div style="font-size: 10px; color: var(--color-text-secondary); margin-top: 2px;">
                          <span style="color: ${meta.color}; font-weight: 500;">${meta.label}</span> · 
                          ${f.size} · v${f.version} · ${f.lastModified} · 上传: ${f.uploadedBy}
                        </div>
                      </div>
                      <div style="display: flex; gap: 4px; flex-shrink: 0;">
                        <button class="card-action-btn" style="font-size: 10px; padding: 3px 8px;" onclick="App.downloadCoursewareFile('${f.id}', '${courseware.id}')">⬇️ 下载</button>
                        ${canManage ? `<button class="card-action-btn" style="font-size: 10px; padding: 3px 8px; color: var(--danger);" onclick="App.deleteCoursewareFile('${f.id}', '${courseware.id}')">删除</button>` : ''}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>

          <!-- 文件类型统计 -->
          ${files.length > 0 ? `
            <div>
              <div style="font-size: 13px; font-weight: 600; color: var(--color-primary); margin-bottom: 10px;">📊 文件类型分布</div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                ${(() => {
                  const typeCount = {};
                  files.forEach(f => { typeCount[f.type] = (typeCount[f.type] || 0) + 1; });
                  return Object.entries(typeCount).map(([type, count]) => {
                    const meta = (typeof getCoursewareFileType === 'function') ? getCoursewareFileType(type) : { icon: '📎', label: type, color: '#757575' };
                    return `<span style="padding: 4px 10px; border-radius: 4px; background: ${meta.color}15; color: ${meta.color}; font-size: 11px; font-weight: 500;">${meta.icon} ${meta.label} × ${count}</span>`;
                  }).join('');
                })()}
              </div>
            </div>
          ` : ''}
        </div>
        <div class="modal-footer">
          <button class="card-action-btn" onclick="App.hideModal()">关闭</button>
          <button class="card-action-btn primary" onclick="App.showToast('已复制课件信息：${courseware.title}'); App.hideModal();">📋 复制信息</button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
  },

  /**
   * 上传课件文件（V4.2 第二阶段新增）
   * 模拟上传行为：实际前端无法真正上传到文件系统，此处为演示
   * 受 canDesignCourse 权限控制
   */
  uploadCoursewareFile(coursewareId) {
    // 权限校验
    if (typeof Auth === 'undefined' || !Auth.currentUser) {
      this.showToast('请先登录');
      return;
    }
    const perm = Auth.getPermission();
    if (!Auth.isAdmin() && !(perm && perm.specialAbilities && perm.specialAbilities.canDesignCourse)) {
      this.showToast('⚠️ 权限不足：需要「课件设计」能力');
      return;
    }

    const courseware = coursewareCards.find(c => c.id === coursewareId);
    if (!courseware) return;

    // 模拟文件选择（前端静态项目无法真正上传，用 prompt 演示）
    const fileName = prompt(`为「${courseware.title}」上传文件\n\n请输入文件名（含扩展名，如 课件_V2.1.pptx）：`);
    if (!fileName) return;

    // 解析扩展名
    const ext = fileName.split('.').pop().toLowerCase();
    const meta = (typeof getCoursewareFileType === 'function') ? getCoursewareFileType(ext) : null;

    // 构造新文件对象
    const newFile = {
      id: 'f_new_' + Date.now(),
      name: fileName,
      type: ext,
      size: (Math.random() * 5 + 0.1).toFixed(1) + 'MB',
      lastModified: new Date().toISOString().slice(0, 10),
      version: 'V' + (Math.random() * 2 + 0.1).toFixed(1),
      uploadedBy: Auth.currentUser.name || Auth.currentUser.username
    };

    // 添加到课件文件列表
    if (!courseware.files) courseware.files = [];
    courseware.files.push(newFile);

    this.showToast(`✅ 已上传文件：${fileName}${meta ? '（' + meta.label + '）' : ''}`);
    // 重新渲染 modal
    this.showCoursewareDetail(coursewareId);
  },

  /**
   * 下载课件文件（V4.2 第二阶段新增）
   * 前端静态项目无法真正下载服务器文件，此处为演示
   */
  downloadCoursewareFile(fileId, coursewareId) {
    const courseware = coursewareCards.find(c => c.id === coursewareId);
    if (!courseware) return;
    const file = (courseware.files || []).find(f => f.id === fileId);
    if (!file) return;

    const meta = (typeof getCoursewareFileType === 'function') ? getCoursewareFileType(file.type) : null;
    this.showToast(`⬇️ 正在下载：${file.name}${meta ? '（' + meta.desc + '）' : ''}`);

    // 模拟下载（实际项目中这里应该是一个真实的下载链接）
    setTimeout(() => {
      this.showToast(`✅ 下载完成：${file.name}（${file.size}）`);
    }, 800);
  },

  /**
   * 删除课件文件（V4.2 第二阶段新增）
   * 受 canDesignCourse 权限控制
   */
  deleteCoursewareFile(fileId, coursewareId) {
    if (typeof Auth === 'undefined' || !Auth.currentUser) return;
    const perm = Auth.getPermission();
    if (!Auth.isAdmin() && !(perm && perm.specialAbilities && perm.specialAbilities.canDesignCourse)) {
      this.showToast('⚠️ 权限不足：需要「课件设计」能力');
      return;
    }

    const courseware = coursewareCards.find(c => c.id === coursewareId);
    if (!courseware || !courseware.files) return;

    const file = courseware.files.find(f => f.id === fileId);
    if (!file) return;

    if (!confirm(`确认删除文件：${file.name}？`)) return;

    courseware.files = courseware.files.filter(f => f.id !== fileId);
    this.showToast(`🗑️ 已删除文件：${file.name}`);
    this.showCoursewareDetail(coursewareId);
  },

  /* ========== 线下活动标签页 ========== */
  renderOfflineTab() {
    const activeSub = this.state.activeSubTab['tab-offline'];
    this.renderOfflineSubTab(activeSub);
  },

  renderOfflineSubTab(subTabId) {
    switch (subTabId) {
      case 'offline-calendar':
        this.renderOfflineFilters();
        Filters.filterOfflineCards();
        break;
      case 'offline-salon':
        this.renderSalonActivities();
        break;
      case 'offline-exp':
        this.renderExpCenter();
        break;
      case 'offline-community':
        this.renderCommunityActivities();
        break;
      case 'offline-materials':
        this.renderMaterialsChecklist();
        break;
      case 'offline-review':
        this.renderReviewRecords();
        break;
    }
  },

  renderOfflineFilters() {
    const filterArea = document.getElementById('offline-filters');
    if (!filterArea) return;

    const types = ['全部', '沙龙讲座', '社区公益', '体验馆运营', '内训'];
    const statuses = ['全部', '即将开始', '已完成', '策划中'];

    filterArea.innerHTML = `
      <div class="filter-row" data-dimension="type">
        <span class="filter-label">类型</span>
        <div class="filter-tags">
          ${types.map(t => `<span class="filter-tag ${t === Filters.state.offline.type ? 'active' : ''}" data-value="${t}">${t}</span>`).join('')}
        </div>
      </div>
      <div class="filter-row" data-dimension="status">
        <span class="filter-label">状态</span>
        <div class="filter-tags">
          ${statuses.map(s => `<span class="filter-tag ${s === Filters.state.offline.status ? 'active' : ''}" data-value="${s}">${s}</span>`).join('')}
        </div>
      </div>
    `;
  },

  renderActivityCards(cards) {
    const container = document.getElementById('offline-calendar-cards');
    if (!container) return;

    const statusMap = {
      upcoming: { text: '即将开始', class: 'upcoming' },
      completed: { text: '已完成', class: 'completed' },
      planning: { text: '策划中', class: 'planning' }
    };

    if (cards.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><h3>暂无活动</h3></div>`;
      return;
    }

    container.innerHTML = `
      <div class="card-grid">
        ${cards.map(a => `
          <div class="content-card">
            <div class="card-header">
              <div class="card-title">${a.title}</div>
              <span class="status-badge ${statusMap[a.status].class}">${statusMap[a.status].text}</span>
            </div>
            <div class="card-tags">
              <span class="card-tag">#${a.type}</span>
              <span class="card-tag">#${a.venue}</span>
            </div>
            <div class="card-metrics">
              <span class="metric-item">📅 <strong>${a.date}</strong></span>
              <span class="metric-item">📍 <strong>${a.venue}</strong></span>
            </div>
            <div class="card-trend">
              👥 报名: ${a.registered}/${a.capacity} (${Math.round(a.registered/a.capacity*100)}%)
            </div>
            <div class="card-actions">
              <button class="card-action-btn primary" onclick="App.showToast('查看活动详情')">详情</button>
              <button class="card-action-btn" onclick="App.showToast('已复制执行SOP')">📋 SOP</button>
              <button class="card-action-btn" onclick="App.showToast('已复制主持稿')">🎤 主持稿</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  /* ========== 经营者培训标签页 ========== */
  renderTrainingTab() {
    const activeSub = this.state.activeSubTab['tab-training'];
    this.renderTrainingSubTab(activeSub);
  },

  renderTrainingSubTab(subTabId) {
    switch (subTabId) {
      case 'training-mine':
        this.renderTrainingMine();
        break;
      case 'training-exam':
        this.renderExamData();
        break;
      case 'training-calendar':
        this.renderTrainingCalendar();
        break;
      case 'training-activity':
        this.renderTeamActivity();
        break;
      case 'training-courseware':
        this.renderCoursewareDesign();
        break;
    }
  },

  /**
   * 我的培训：课程列表 + 个人学习进度
   */
  renderTrainingMine() {
    const container = document.getElementById('training-mine');
    if (!container) return;

    const statusMap = {
      active: { text: '进行中', class: 'active' },
      completed: { text: '已完结', class: 'completed' },
      planned: { text: '筹备中', class: 'pending' }
    };

    // 根据当前用户角色生成"正在学的课"
    const userRole = (typeof Auth !== 'undefined' && Auth.currentUser) ? Auth.currentUser.role : 'blogger';
    // V4.2 审计修复：SD+ 阶衔用户自动追加阶衔专属必修课程
    const isSDPlus = !!(typeof Auth !== 'undefined' && Auth.currentUser && Auth.currentUser.isSDPlus);
    const myCourses = this._getMyCourses(userRole, isSDPlus);

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <!-- 我正在学的课 -->
        ${myCourses.length > 0 ? `
          <div style="margin-bottom: 28px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
              <span style="font-size: 20px;">📖</span>
              <div>
                <div style="font-size: 15px; font-weight: 700; color: var(--color-primary);">我正在学的课</div>
                <div style="font-size: 12px; color: var(--color-text-secondary);">个人学习进度追踪</div>
              </div>
            </div>
            <div class="card-grid">
              ${myCourses.map(c => `
                <div class="content-card" style="border-left: 4px solid var(--color-accent);">
                  <div class="card-header">
                    <div class="card-title">${c.title}</div>
                    <span class="status-badge ${statusMap[c.status].class}">${statusMap[c.status].text}</span>
                  </div>
                  <div class="card-tags">
                    <span class="card-tag">#${c.level}</span>
                  </div>
                  <div class="card-metrics">
                    <span class="metric-item">⏱ 时长: <strong>${c.duration}</strong></span>
                    <span class="metric-item">📊 进度: <strong>${c.progress}%</strong></span>
                  </div>
                  <div style="height: 6px; background: var(--color-bg); border-radius: 3px; margin: 10px 0; overflow: hidden;">
                    <div style="height: 100%; width: ${c.progress}%; background: linear-gradient(to right, var(--color-accent), var(--color-accent-light)); border-radius: 3px;"></div>
                  </div>
                  <div class="card-actions">
                    <button class="card-action-btn primary" onclick="App.showToast('继续学习：${c.title}')">▶ 继续学习</button>
                    <button class="card-action-btn" onclick="App.showToast('查看课程大纲')">📋 大纲</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 全部课程 -->
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
          <span style="font-size: 20px;">📚</span>
          <div>
            <div style="font-size: 15px; font-weight: 700; color: var(--color-primary);">全部课程</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">系统培训课程库 · 可按级别/状态筛选</div>
          </div>
        </div>

        <!-- 课程筛选器 -->
        <div class="filter-area" id="train-filters"></div>

        <!-- 课程列表 -->
        <div id="training-mine-cards">
          <div class="card-grid">
            ${trainingCourses.map(c => `
              <div class="content-card">
                <div class="card-header">
                  <div class="card-title">${c.title}</div>
                  <span class="status-badge ${statusMap[c.status].class}">${statusMap[c.status].text}</span>
                </div>
                <div class="card-tags">
                  <span class="card-tag">#${c.level}</span>
                </div>
                <div class="card-metrics">
                  <span class="metric-item">⏱ 时长: <strong>${c.duration}</strong></span>
                  <span class="metric-item">👥 学员: <strong>${c.students}</strong></span>
                </div>
                <div class="card-actions">
                  <button class="card-action-btn primary" onclick="App.showToast('查看课程详情')">详情</button>
                  <button class="card-action-btn" onclick="App.showToast('已复制课程大纲')">大纲</button>
                  ${c.status === 'active' ? `<button class="card-action-btn" onclick="App.showToast('加入学习')">📝 加入学习</button>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // 渲染筛选器
    this.renderTrainingCourseFilters();
  },

  /**
   * 获取当前用户正在学习的课程（模拟数据）
   * V4.2 审计修复：
   *   1. 增加 isSDPlus 参数，SD+ 阶衔用户自动追加「团队领导力/数据复盘/市场战略」等阶衔专属课程
   *   2. 补齐 blogger_planner / comm_interact / offline_executor 等之前缺失的角色映射
   *      （此前会 fallback 到 blogger，导致 sdleader 演示账号看不到正确课程）
   */
  _getMyCourses(userRole, isSDPlus) {
    const roleCourseMap = {
      blogger: [
        { title: '自媒体运营实战', level: 'D-D8', status: 'active', duration: '8小时', progress: 45 },
        { title: '企业认知与品牌故事', level: 'D-D3', status: 'active', duration: '2小时', progress: 80 }
      ],
      blogger_lead: [
        { title: '团队领导力进阶', level: 'D8+', status: 'planned', duration: '4小时', progress: 0 },
        { title: '自媒体运营实战', level: 'D-D8', status: 'active', duration: '8小时', progress: 60 }
      ],
      blogger_planner: [
        { title: '自媒体运营实战', level: 'D-D8', status: 'active', duration: '8小时', progress: 40 },
        { title: '企业认知与品牌故事', level: 'D-D3', status: 'active', duration: '2小时', progress: 65 }
      ],
      community: [
        { title: '社群运营全流程SOP', level: 'D3+', status: 'active', duration: '6小时', progress: 30 },
        { title: '企业认知与品牌故事', level: 'D-D3', status: 'completed', duration: '2小时', progress: 100 }
      ],
      community_lead: [
        { title: '社群运营全流程SOP', level: 'D3+', status: 'active', duration: '6小时', progress: 75 },
        { title: '奖金制度与财务规划', level: 'D5+', status: 'completed', duration: '3小时', progress: 100 }
      ],
      comm_interact: [
        { title: '社群运营全流程SOP', level: 'D3+', status: 'active', duration: '6小时', progress: 25 },
        { title: '企业认知与品牌故事', level: 'D-D3', status: 'active', duration: '2小时', progress: 50 }
      ],
      offline: [
        { title: '企业认知与品牌故事', level: 'D-D3', status: 'active', duration: '2小时', progress: 50 }
      ],
      offline_lead: [
        { title: '团队领导力进阶', level: 'D8+', status: 'planned', duration: '4小时', progress: 10 }
      ],
      offline_executor: [
        { title: '社群运营全流程SOP', level: 'D3+', status: 'active', duration: '6小时', progress: 35 },
        { title: '企业认知与品牌故事', level: 'D-D3', status: 'completed', duration: '2小时', progress: 100 }
      ],
      course_admin: [
        { title: '产品经理初级课程·精油', level: 'D3-D5', status: 'active', duration: '4小时', progress: 90 },
        { title: '奖金制度与财务规划', level: 'D5+', status: 'completed', duration: '3小时', progress: 100 }
      ],
      hub: [
        { title: '社群运营全流程SOP', level: 'D3+', status: 'active', duration: '6小时', progress: 40 }
      ],
      sd_plus: [
        { title: '团队领导力进阶', level: 'D8+', status: 'active', duration: '4小时', progress: 55 },
        { title: '高级培训·市场战略规划', level: 'SD+', status: 'planned', duration: '6小时', progress: 0 }
      ],
      admin: [
        { title: '团队领导力进阶', level: 'D8+', status: 'active', duration: '4小时', progress: 70 }
      ]
    };

    // 1. 取角色对应课程（缺失则 fallback 到 blogger）
    let courses = roleCourseMap[userRole] || roleCourseMap.blogger;

    // 2. SD+ 阶衔专属必修课：不论领域角色，晋升 SD+ 后自动追加
    //    （去重：避免与角色课程标题重复）
    if (isSDPlus && typeof SDPLUS_REQUIRED_COURSES !== 'undefined') {
      const existingTitles = new Set(courses.map(c => c.title));
      const sdPlusExtras = SDPLUS_REQUIRED_COURSES.filter(c => !existingTitles.has(c.title));
      if (sdPlusExtras.length > 0) {
        courses = courses.concat(sdPlusExtras);
      }
    }

    return courses;
  },

  /**
   * 课程筛选器渲染
   */
  renderTrainingCourseFilters() {
    const filterArea = document.getElementById('train-filters');
    if (!filterArea) return;

    const levels = ['全部', 'D-D3', 'D3-D5', 'D5+', 'D8+', 'SD+'];
    const statuses = ['全部', '进行中', '已完结', '筹备中'];

    filterArea.innerHTML = `
      <div class="filter-row" data-dimension="level">
        <span class="filter-label">级别</span>
        <div class="filter-tags">
          ${levels.map(l => `<span class="filter-tag ${l === Filters.state.training.level ? 'active' : ''}" data-value="${l}">${l}</span>`).join('')}
        </div>
      </div>
      <div class="filter-row" data-dimension="status">
        <span class="filter-label">状态</span>
        <div class="filter-tags">
          ${statuses.map(s => `<span class="filter-tag ${s === Filters.state.training.status ? 'active' : ''}" data-value="${s}">${s}</span>`).join('')}
        </div>
      </div>
    `;
  },

  renderTraineeCards(cards) {
    // 保留原函数供其他可能调用的地方使用
    const container = document.getElementById('training-mine-cards');
    if (!container) return;
    container.innerHTML = `<div style="padding:20px;color:var(--color-text-secondary);text-align:center;">学员管理已移至「团队管理」标签页</div>`;
  },

  renderTrainingCourses() {
    const container = document.getElementById('training-progress');
    if (!container) return;

    const statusMap = {
      active: { text: '进行中', class: 'active' },
      completed: { text: '已完结', class: 'completed' },
      planned: { text: '筹备中', class: 'pending' }
    };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div class="card-grid">
          ${trainingCourses.map(c => `
            <div class="content-card">
              <div class="card-header">
                <div class="card-title">${c.title}</div>
                <span class="status-badge ${statusMap[c.status].class}">${statusMap[c.status].text}</span>
              </div>
              <div class="card-tags">
                <span class="card-tag">#${c.level}</span>
              </div>
              <div class="card-metrics">
                <span class="metric-item">👥 学员: <strong>${c.students}</strong></span>
                <span class="metric-item">⏱ 时长: <strong>${c.duration}</strong></span>
              </div>
              <div class="card-actions">
                <button class="card-action-btn primary" onclick="App.showToast('查看课程详情')">详情</button>
                <button class="card-action-btn" onclick="App.showToast('已复制课程大纲')">大纲</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /* ========== 运营中枢标签页 ========== */
  renderHubTab() {
    const activeSub = this.state.activeSubTab['tab-hub'];
    this.renderHubSubTab(activeSub);
  },

  renderHubSubTab(subTabId) {
    switch (subTabId) {
      case 'hub-dashboard':
        this.renderDashboard();
        break;
      case 'hub-automation':
        this.renderAutomation();
        break;
      case 'hub-traffic':
        this.renderTrafficDistribution();
        break;
      case 'hub-promotion':
        this.renderHubPromotion();
        break;
      case 'hub-reviews':
        this.renderReviews();
        break;
      case 'hub-delegation':
        this.renderHubDelegation();
        break;
      case 'hub-compliance':
        this.renderCompliance();
        break;
      case 'hub-knowledge':
        this.renderKnowledge();
        break;
      case 'hub-settings':
        this.renderHubSettings();
        break;
    }
  },

  /**
   * 运营中枢看板分发器：根据角色渲染不同的看板内容
   */
  renderDashboard() {
    const container = document.getElementById('hub-dashboard');
    if (!container) return;

    const dType = (typeof Auth !== 'undefined' && Auth.getDashboardType)
      ? Auth.getDashboardType()
      : 'admin';

    // 更新看板标题
    const subtitle = document.getElementById('hub-dashboard-subtitle');
    const titleMap = {
      admin: '全局指挥中心 · 全系统数据 · 跨团队管理',
      sd_plus: '市场全局看板 · 团队树 · 晋升追踪',
      blogger_lead: '自媒体团队看板 · 全域IP · 无痕迹转化',
      community_lead: '社群运营团队看板 · 推送日历 · 转化漏斗',
      offline_lead: '线下活动团队看板 · 沙龙讲座 · 体验馆',
      exp_lead: '体验馆团队看板 · 到访数据 · 体验转化',
      hub_lead: '运营中枢看板 · 自动化任务 · 流量分配',
      course_admin: '课件管理看板 · 课件库 · 培训交付',
      blogger: '自媒体博主看板 · 我的内容 · 我的数据',
      community: '社群运营看板 · 我的社群 · 我的互动',
      offline: '线下活动看板 · 我的活动 · 我的服务',
      exp: '体验馆看板 · 接待数据 · 体验引导',
      hub: '运营中枢看板 · 我的任务 · 系统状态'
    };
    if (subtitle) subtitle.textContent = titleMap[dType] || '角色专属看板 · 自动化任务 · 月度复盘 · 合规中心';

    switch (dType) {
      case 'admin':
        this.renderAdminDashboard(container);
        break;
      case 'sd_plus':
        this.renderSDPlusDashboard(container);
        break;
      case 'blogger_lead':
        this.renderBloggerLeadDashboard(container);
        break;
      case 'community_lead':
        this.renderCommunityLeadDashboard(container);
        break;
      case 'offline_lead':
        this.renderOfflineLeadDashboard(container);
        break;
      case 'exp_lead':
        this.renderExpLeadDashboard(container);
        break;
      case 'hub_lead':
        this.renderHubLeadDashboard(container);
        break;
      case 'course_admin':
        this.renderCourseAdminDashboard(container);
        break;
      case 'blogger':
        this.renderBloggerDashboard(container);
        break;
      case 'community':
        this.renderCommunityDashboard(container);
        break;
      case 'offline':
        this.renderOfflineDashboard(container);
        break;
      case 'exp':
        this.renderExpDashboard(container);
        break;
      case 'hub':
        this.renderHubStaffDashboard(container);
        break;
      default:
        this.renderAdminDashboard(container);
    }
  },

  /* --- 管理员·全局看板 --- */
  renderAdminDashboard(container) {
    const metrics = (typeof dashboardMetricsByRole !== 'undefined' && dashboardMetricsByRole.admin)
      ? dashboardMetricsByRole.admin
      : dashboardMetrics;
    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
          <span style="font-size: 22px;">🏛️</span>
          <div>
            <div style="font-size: 16px; font-weight: 700; color: var(--color-primary);">全局指挥中心</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">全系统数据 · 跨团队管理 · 最高权限</div>
          </div>
        </div>
        <div class="dashboard-grid">
          ${metrics.map(m => `
            <div class="dashboard-metric-card">
              <div class="metric-icon">${m.icon}</div>
              <div class="metric-info">
                <div class="value">${m.value}</div>
                <div class="label">${m.title}</div>
                <div class="change ${m.changeType}">${m.change}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="task-list-section">
          <h3>⚙️ 自动化任务状态</h3>
          ${automationTasks.map(t => `
            <div class="task-list-item">
              <div class="task-status-dot ${t.status}"></div>
              <div class="task-info">
                <div class="task-name">${t.name}</div>
                <div class="task-schedule">${t.schedule}</div>
              </div>
              <div class="task-meta">
                <div class="task-target">${t.target}</div>
                <div class="task-next">下次: ${t.nextRun}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /* --- 自媒体博主看板 --- */
  renderBloggerDashboard(container) {
    const metrics = [
      { icon: '📱', value: '12.8K', title: '小红书粉丝', change: '+320↑', changeType: 'up' },
      { icon: '🎵', value: '8.5K', title: '抖音粉丝', change: '+180↑', changeType: 'up' },
      { icon: '📺', value: '5.2K', title: 'B站粉丝', change: '+95↑', changeType: 'up' },
      { icon: '📊', value: '186', title: '本月内容发布', change: '+23↑', changeType: 'up' },
      { icon: '👥', value: '48', title: '本月引流到社群', change: '+12↑', changeType: 'up' },
      { icon: '🔥', value: '3', title: '爆款内容数', change: '持平', changeType: 'neutral' }
    ];
    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
          <span style="font-size: 22px;">📱</span>
          <div>
            <div style="font-size: 16px; font-weight: 700; color: var(--color-primary);">自媒体博主看板</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">线上·获客端 · 组织线源头 · 贡献系数 3.0</div>
          </div>
        </div>
        <div class="dashboard-grid">
          ${metrics.map(m => `
            <div class="dashboard-metric-card">
              <div class="metric-icon">${m.icon}</div>
              <div class="metric-info">
                <div class="value">${m.value}</div>
                <div class="label">${m.title}</div>
                <div class="change ${m.changeType}">${m.change}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="task-list-section">
          <h3>📝 待完成任务</h3>
          <div class="task-list-item"><div class="task-status-dot pending"></div><div class="task-info"><div class="task-name">小红书发布今日文案（绿茶片话题）</div></div><div class="task-meta"><div class="task-target">截止 10:00</div></div></div>
          <div class="task-list-item"><div class="task-status-dot pending"></div><div class="task-info"><div class="task-name">更新爆款内容库（抖音+小红书）</div></div><div class="task-meta"><div class="task-target">截止 14:00</div></div></div>
          <div class="task-list-item"><div class="task-status-dot in_progress"></div><div class="task-info"><div class="task-name">抖音短视频剪辑（护肤成分党）</div></div><div class="task-meta"><div class="task-target">截止 15:00</div></div></div>
        </div>
        <div class="task-list-section">
          <h3>🌱 成长贡献评估</h3>
          <div style="padding: 12px; background: var(--color-accent-light); border-radius: 8px; border-left: 3px solid var(--color-accent);">
            <div style="font-size: 14px; font-weight: 600; color: var(--color-primary);">本月评定：✅ 踏实前行</div>
            <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px;">完成内容发布186条，引流48人，按时完成岗位基本职责</div>
            <div style="font-size: 12px; color: var(--color-accent); margin-top: 6px; font-weight: 500;">A类分配权重 ×1.0 · 预估下月获分配 2-3名新会员</div>
          </div>
        </div>
      </div>
    `;
  },

  /* --- 社群运营专员看板 --- */
  renderCommunityDashboard(container) {
    const metrics = [
      { icon: '💬', value: '6', title: '运营中社群', change: '持平', changeType: 'neutral' },
      { icon: '👥', value: '342', title: '社群总成员', change: '+28↑', changeType: 'up' },
      { icon: '📈', value: '94.2%', title: '会员留存率', change: '+1.2%↑', changeType: 'up' },
      { icon: '🔄', value: '18%', title: '付费→会员转化', change: '+3%↑', changeType: 'up' },
      { icon: '📅', value: '21/30', title: '本月推送完成', change: '进行中', changeType: 'neutral' },
      { icon: '⭐', value: '4.8', title: '社群满意度', change: '+0.1↑', changeType: 'up' }
    ];
    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
          <span style="font-size: 22px;">💬</span>
          <div>
            <div style="font-size: 16px; font-weight: 700; color: var(--color-primary);">社群运营看板</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">线上·转化留存端 · 组织线源头 · 贡献系数 2.5</div>
          </div>
        </div>
        <div class="dashboard-grid">
          ${metrics.map(m => `
            <div class="dashboard-metric-card">
              <div class="metric-icon">${m.icon}</div>
              <div class="metric-info">
                <div class="value">${m.value}</div>
                <div class="label">${m.title}</div>
                <div class="change ${m.changeType}">${m.change}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="task-list-section">
          <h3>📅 今日社群推送</h3>
          <div class="task-list-item"><div class="task-status-dot running"></div><div class="task-info"><div class="task-name">营养训练营Day15内容推送</div></div><div class="task-meta"><div class="task-target">08:00 已推送</div></div></div>
          <div class="task-list-item"><div class="task-status-dot pending"></div><div class="task-info"><div class="task-name">会员社群午间互动话题</div></div><div class="task-meta"><div class="task-target">12:00 待推送</div></div></div>
          <div class="task-list-item"><div class="task-status-dot pending"></div><div class="task-info"><div class="task-name">经营者培训群打卡提醒</div></div><div class="task-meta"><div class="task-target">20:00 待推送</div></div></div>
        </div>
        <div class="task-list-section">
          <h3>🌱 成长贡献评估</h3>
          <div style="padding: 12px; background: var(--color-accent-light); border-radius: 8px; border-left: 3px solid var(--color-accent);">
            <div style="font-size: 14px; font-weight: 600; color: var(--color-primary);">本月评定：🔥 持续精进</div>
            <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px;">留存率94.2%超出目标，转化漏斗优化3%，主动设计新会员 onboarding 流程</div>
            <div style="font-size: 12px; color: var(--color-accent); margin-top: 6px; font-weight: 500;">A类分配权重 ×1.5 · 预估下月获分配 4-5名新会员</div>
          </div>
        </div>
      </div>
    `;
  },

  /* --- 线下活动专员看板 --- */
  renderOfflineDashboard(container) {
    const metrics = [
      { icon: '🎪', value: '4', title: '本月活动数', change: '+1↑', changeType: 'up' },
      { icon: '👥', value: '86', title: '本月活动参与', change: '+22↑', changeType: 'up' },
      { icon: '📊', value: '92%', title: '平均出席率', change: '+2%↑', changeType: 'up' },
      { icon: '🔄', value: '24%', title: '活动→会员转化', change: '+4%↑', changeType: 'up' },
      { icon: '🏠', value: '1', title: '运营中体验馆', change: '持平', changeType: 'neutral' },
      { icon: '⭐', value: '4.7', title: '活动满意度', change: '+0.2↑', changeType: 'up' }
    ];
    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
          <span style="font-size: 22px;">🎪</span>
          <div>
            <div style="font-size: 16px; font-weight: 700; color: var(--color-primary);">线下活动看板</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">线下·经营筛选端 · 组织线源头 · 贡献系数 2.0</div>
          </div>
        </div>
        <div class="dashboard-grid">
          ${metrics.map(m => `
            <div class="dashboard-metric-card">
              <div class="metric-icon">${m.icon}</div>
              <div class="metric-info">
                <div class="value">${m.value}</div>
                <div class="label">${m.title}</div>
                <div class="change ${m.changeType}">${m.change}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="task-list-section">
          <h3>📅 近期活动排期</h3>
          <div class="task-list-item"><div class="task-status-dot running"></div><div class="task-info"><div class="task-name">精油体验沙龙·夏日特辑</div></div><div class="task-meta"><div class="task-target">08-03 体验馆A区</div></div></div>
          <div class="task-list-item"><div class="task-status-dot pending"></div><div class="task-info"><div class="task-name">护肤体验课·成分党专场</div></div><div class="task-meta"><div class="task-target">08-06 体验馆B区</div></div></div>
          <div class="task-list-item"><div class="task-status-dot pending"></div><div class="task-info"><div class="task-name">社区公益讲座·吃出健康来</div></div><div class="task-meta"><div class="task-target">08-10 社区中心</div></div></div>
        </div>
        <div class="task-list-section">
          <h3>🌱 成长贡献评估</h3>
          <div style="padding: 12px; background: var(--color-accent-light); border-radius: 8px; border-left: 3px solid var(--color-accent);">
            <div style="font-size: 14px; font-weight: 600; color: var(--color-primary);">本月评定：✅ 踏实前行</div>
            <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px;">4场活动执行到位，出席率92%，转化效果稳定</div>
            <div style="font-size: 12px; color: var(--color-accent); margin-top: 6px; font-weight: 500;">A类分配权重 ×1.0 · 预估下月获分配 2名新会员</div>
          </div>
        </div>
      </div>
    `;
  },

  /* --- 运营中枢专员看板 --- */
  renderHubStaffDashboard(container) {
    const metrics = [
      { icon: '🏠', value: '21', title: '运行中自动化任务', change: '持平', changeType: 'neutral' },
      { icon: '📊', value: '300', title: '本月总流量池', change: '+15↑', changeType: 'up' },
      { icon: '👥', value: '6', title: '在岗经营者数', change: '+1↑', changeType: 'up' },
      { icon: '📈', value: '94.5%', title: '系统分配完成率', change: '+0.5%↑', changeType: 'up' },
      { icon: '⭐', value: '4.9', title: '团队满意度', change: '持平', changeType: 'neutral' },
      { icon: '💰', value: '¥8.2K', title: '本月社群收入', change: '+¥1.2K↑', changeType: 'up' }
    ];
    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
          <span style="font-size: 22px;">🏠</span>
          <div>
            <div style="font-size: 16px; font-weight: 700; color: var(--color-primary);">运营中枢看板</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">中枢·综合支撑 · 贡献系数 1.0</div>
          </div>
        </div>
        <div class="dashboard-grid">
          ${metrics.map(m => `
            <div class="dashboard-metric-card">
              <div class="metric-icon">${m.icon}</div>
              <div class="metric-info">
                <div class="value">${m.value}</div>
                <div class="label">${m.title}</div>
                <div class="change ${m.changeType}">${m.change}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="task-list-section">
          <h3>⚙️ 待处理中枢事务</h3>
          <div class="task-list-item"><div class="task-status-dot pending"></div><div class="task-info"><div class="task-name">月度流量分配统计与公示</div></div><div class="task-meta"><div class="task-target">截止 08-05</div></div></div>
          <div class="task-list-item"><div class="task-status-dot pending"></div><div class="task-info"><div class="task-name">成长贡献评定复核（6人）</div></div><div class="task-meta"><div class="task-target">截止 08-03</div></div></div>
          <div class="task-list-item"><div class="task-status-dot in_progress"></div><div class="task-info"><div class="task-name">合规审查（月度）</div></div><div class="task-meta"><div class="task-target">进行中</div></div></div>
        </div>
        <div class="task-list-section">
          <h3>🌱 成长贡献评估</h3>
          <div style="padding: 12px; background: var(--color-accent-light); border-radius: 8px; border-left: 3px solid var(--color-accent);">
            <div style="font-size: 14px; font-weight: 600; color: var(--color-primary);">本月评定：🔥 持续精进</div>
            <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px;">自动化任务零故障运行，流量分配100%按时完成，主动优化分配算法</div>
            <div style="font-size: 12px; color: var(--color-accent); margin-top: 6px; font-weight: 500;">A类分配权重 ×1.5 · 预估下月获分配 3-4名新会员</div>
          </div>
        </div>
      </div>
    `;
  },

  /* --- SD+阶衔看板（任何领域角色达到SD+后显示） --- */
  renderSDPlusDashboard(container) {
    const metrics = (typeof dashboardMetricsByRole !== 'undefined' && dashboardMetricsByRole.sd_plus)
      ? dashboardMetricsByRole.sd_plus
      : [{ icon: '👥', value: '4', title: '市场总团队', change: '+1', changeType: 'positive' },
         { icon: '👤', value: '18', title: '市场总成员', change: '+3', changeType: 'positive' },
         { icon: '📈', value: '12%', title: '市场月增长', change: '+2%', changeType: 'positive' },
         { icon: '🌱', value: '3', title: '新经营者', change: '+1', changeType: 'positive' }];
    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
          <span style="font-size: 22px;">📊</span>
          <div>
            <div style="font-size: 16px; font-weight: 700; color: var(--color-primary);">市场全局看板</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">SD+阶衔 · 查看自己培育的市场团队（与领域角色独立）</div>
          </div>
        </div>
        <div class="dashboard-grid">
          ${metrics.map(m => `
            <div class="dashboard-metric-card">
              <div class="metric-icon">${m.icon}</div>
              <div class="metric-info">
                <div class="value">${m.value}</div>
                <div class="label">${m.title}</div>
                <div class="change ${m.changeType}">${m.change}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="task-list-section">
          <h3>🌳 我的市场团队树</h3>
          ${(typeof teamData !== 'undefined' ? teamData.slice(0, 4) : []).map(t => `
            <div class="task-list-item">
              <div class="task-status-dot running"></div>
              <div class="task-info">
                <div class="task-name">${t.name}</div>
                <div class="task-schedule">源头: ${t.leadName} · ${t.memberCount}人</div>
              </div>
              <div class="task-meta">
                <div class="task-target">${t.contributionLevel}类 · ${t.growthTrend === 'up' ? '📈' : '📉'}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="task-list-section">
          <h3>🌱 晋升追踪</h3>
          <div class="task-list-item"><div class="task-status-dot in_progress"></div><div class="task-info"><div class="task-name">张三 · D5 → D8</div></div><div class="task-meta"><div class="task-target">预计 08-15</div></div></div>
          <div class="task-list-item"><div class="task-status-dot pending"></div><div class="task-info"><div class="task-name">李四 · D3 → D5</div></div><div class="task-meta"><div class="task-target">预计 09-01</div></div></div>
        </div>
      </div>
    `;
  },

  /* --- 自媒体团队源头看板 --- */
  renderBloggerLeadDashboard(container) {
    const metrics = (typeof dashboardMetricsByRole !== 'undefined' && dashboardMetricsByRole.blogger_lead)
      ? dashboardMetricsByRole.blogger_lead
      : dashboardMetricsByRole.blogger || [];
    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
          <span style="font-size: 22px;">📱</span>
          <div>
            <div style="font-size: 16px; font-weight: 700; color: var(--color-primary);">自媒体团队看板</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">团队源头 · 全域IP · 无痕迹转化</div>
          </div>
        </div>
        <div class="dashboard-grid">
          ${metrics.map(m => `
            <div class="dashboard-metric-card">
              <div class="metric-icon">${m.icon}</div>
              <div class="metric-info">
                <div class="value">${m.value}</div>
                <div class="label">${m.title}</div>
                <div class="change ${m.changeType}">${m.change}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="task-list-section">
          <h3>👥 团队成员贡献</h3>
          <div class="task-list-item"><div class="task-status-dot running"></div><div class="task-info"><div class="task-name">内容策划 · 小王</div></div><div class="task-meta"><div class="task-target">本月产出 12篇 · A类</div></div></div>
          <div class="task-list-item"><div class="task-status-dot running"></div><div class="task-info"><div class="task-name">视频剪辑 · 小李</div></div><div class="task-meta"><div class="task-target">本月产出 8条 · B类</div></div></div>
          <div class="task-list-item"><div class="task-status-dot pending"></div><div class="task-info"><div class="task-name">流量运营 · 小张</div></div><div class="task-meta"><div class="task-target">本月产出 6篇 · C类</div></div></div>
        </div>
      </div>
    `;
  },

  /* --- 社群运营团队源头看板 --- */
  renderCommunityLeadDashboard(container) {
    const metrics = (typeof dashboardMetricsByRole !== 'undefined' && dashboardMetricsByRole.community_lead)
      ? dashboardMetricsByRole.community_lead
      : dashboardMetricsByRole.community || [];
    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
          <span style="font-size: 22px;">💬</span>
          <div>
            <div style="font-size: 16px; font-weight: 700; color: var(--color-primary);">社群运营团队看板</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">团队源头 · 推送日历 · 转化漏斗</div>
          </div>
        </div>
        <div class="dashboard-grid">
          ${metrics.map(m => `
            <div class="dashboard-metric-card">
              <div class="metric-icon">${m.icon}</div>
              <div class="metric-info">
                <div class="value">${m.value}</div>
                <div class="label">${m.title}</div>
                <div class="change ${m.changeType}">${m.change}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="task-list-section">
          <h3>👥 团队成员贡献</h3>
          <div class="task-list-item"><div class="task-status-dot running"></div><div class="task-info"><div class="task-name">内容运营 · 小赵</div></div><div class="task-meta"><div class="task-target">推送完成率 95% · A类</div></div></div>
          <div class="task-list-item"><div class="task-status-dot running"></div><div class="task-info"><div class="task-name">互动引导 · 小钱</div></div><div class="task-meta"><div class="task-target">互动率 72% · B类</div></div></div>
        </div>
      </div>
    `;
  },

  /* --- 线下活动团队源头看板 --- */
  renderOfflineLeadDashboard(container) {
    const metrics = (typeof dashboardMetricsByRole !== 'undefined' && dashboardMetricsByRole.offline_lead)
      ? dashboardMetricsByRole.offline_lead
      : dashboardMetricsByRole.offline || [];
    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
          <span style="font-size: 22px;">🎪</span>
          <div>
            <div style="font-size: 16px; font-weight: 700; color: var(--color-primary);">线下活动团队看板</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">团队源头 · 沙龙讲座 · 体验馆</div>
          </div>
        </div>
        <div class="dashboard-grid">
          ${metrics.map(m => `
            <div class="dashboard-metric-card">
              <div class="metric-icon">${m.icon}</div>
              <div class="metric-info">
                <div class="value">${m.value}</div>
                <div class="label">${m.title}</div>
                <div class="change ${m.changeType}">${m.change}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="task-list-section">
          <h3>👥 团队成员贡献</h3>
          <div class="task-list-item"><div class="task-status-dot running"></div><div class="task-info"><div class="task-name">活动策划 · 小孙</div></div><div class="task-meta"><div class="task-target">策划 3场 · A类</div></div></div>
          <div class="task-list-item"><div class="task-status-dot running"></div><div class="task-info"><div class="task-name">执行统筹 · 小周</div></div><div class="task-meta"><div class="task-target">执行 4场 · B类</div></div></div>
        </div>
      </div>
    `;
  },

  /* --- 体验馆团队源头看板 --- */
  renderExpLeadDashboard(container) {
    const metrics = (typeof dashboardMetricsByRole !== 'undefined' && dashboardMetricsByRole.exp)
      ? dashboardMetricsByRole.exp
      : [{ icon: '👥', value: '280', title: '到访人数', change: '+35', changeType: 'positive' },
         { icon: '🎯', value: '45', title: '体验场次', change: '+5', changeType: 'positive' },
         { icon: '📈', value: '35%', title: '购买转化', change: '+2%', changeType: 'positive' }];
    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
          <span style="font-size: 22px;">🏠</span>
          <div>
            <div style="font-size: 16px; font-weight: 700; color: var(--color-primary);">体验馆团队看板</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">团队源头 · 到访数据 · 体验转化</div>
          </div>
        </div>
        <div class="dashboard-grid">
          ${metrics.map(m => `
            <div class="dashboard-metric-card">
              <div class="metric-icon">${m.icon}</div>
              <div class="metric-info">
                <div class="value">${m.value}</div>
                <div class="label">${m.title}</div>
                <div class="change ${m.changeType}">${m.change}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="task-list-section">
          <h3>👥 团队成员</h3>
          <div class="task-list-item"><div class="task-status-dot running"></div><div class="task-info"><div class="task-name">体验引导师 · 小吴</div></div><div class="task-meta"><div class="task-target">引导 45场 · A类</div></div></div>
          <div class="task-list-item"><div class="task-status-dot running"></div><div class="task-info"><div class="task-name">接待客服 · 小郑</div></div><div class="task-meta"><div class="task-target">接待 280人 · B类</div></div></div>
        </div>
      </div>
    `;
  },

  /* --- 运营中枢负责人看板 --- */
  renderHubLeadDashboard(container) {
    const metrics = (typeof dashboardMetricsByRole !== 'undefined' && dashboardMetricsByRole.hub)
      ? dashboardMetricsByRole.hub
      : [{ icon: '📋', value: '8', title: '我的任务', change: '+2', changeType: 'positive' },
         { icon: '✅', value: '92%', title: '完成率', change: '+3%', changeType: 'positive' },
         { icon: '⭐', value: 'B', title: '贡献评级', change: '→B', changeType: 'stable' }];
    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
          <span style="font-size: 22px;">🏠</span>
          <div>
            <div style="font-size: 16px; font-weight: 700; color: var(--color-primary);">运营中枢管理看板</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">中枢负责人 · 自动化任务 · 流量分配</div>
          </div>
        </div>
        <div class="dashboard-grid">
          ${metrics.map(m => `
            <div class="dashboard-metric-card">
              <div class="metric-icon">${m.icon}</div>
              <div class="metric-info">
                <div class="value">${m.value}</div>
                <div class="label">${m.title}</div>
                <div class="change ${m.changeType}">${m.change}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="task-list-section">
          <h3>👥 中枢团队成员</h3>
          <div class="task-list-item"><div class="task-status-dot running"></div><div class="task-info"><div class="task-name">课件管理员 · 小冯</div></div><div class="task-meta"><div class="task-target">课件 23份 · A类</div></div></div>
          <div class="task-list-item"><div class="task-status-dot running"></div><div class="task-info"><div class="task-name">会议协调员 · 小陈</div></div><div class="task-meta"><div class="task-target">协调 12场 · B类</div></div></div>
          <div class="task-list-item"><div class="task-status-dot pending"></div><div class="task-info"><div class="task-name">行政支持 · 小褚</div></div><div class="task-meta"><div class="task-target">完成率 90% · B类</div></div></div>
        </div>
      </div>
    `;
  },

  /* --- 课件管理员看板 --- */
  renderCourseAdminDashboard(container) {
    const metrics = (typeof dashboardMetricsByRole !== 'undefined' && dashboardMetricsByRole.course_admin)
      ? dashboardMetricsByRole.course_admin
      : [{ icon: '📚', value: '23', title: '课件总数', change: '+3', changeType: 'positive' },
         { icon: '➕', value: '3', title: '本月新增', change: '+1', changeType: 'positive' },
         { icon: '📊', value: '85%', title: '培训覆盖率', change: '+5%', changeType: 'positive' }];
    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
          <span style="font-size: 22px;">📚</span>
          <div>
            <div style="font-size: 16px; font-weight: 700; color: var(--color-primary);">课件管理看板</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">运营中枢 · 课件设计与管理</div>
          </div>
        </div>
        <div class="dashboard-grid">
          ${metrics.map(m => `
            <div class="dashboard-metric-card">
              <div class="metric-icon">${m.icon}</div>
              <div class="metric-info">
                <div class="value">${m.value}</div>
                <div class="label">${m.title}</div>
                <div class="change ${m.changeType}">${m.change}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="task-list-section">
          <h3>📝 待处理课件任务</h3>
          <div class="task-list-item"><div class="task-status-dot in_progress"></div><div class="task-info"><div class="task-name">D5经营者进阶课程设计</div></div><div class="task-meta"><div class="task-target">截止 08-10</div></div></div>
          <div class="task-list-item"><div class="task-status-dot pending"></div><div class="task-info"><div class="task-name">精油产品经理初级考核试卷</div></div><div class="task-meta"><div class="task-target">截止 08-15</div></div></div>
          <div class="task-list-item"><div class="task-status-dot pending"></div><div class="task-info"><div class="task-name">社群运营培训讲稿</div></div><div class="task-meta"><div class="task-target">截止 08-20</div></div></div>
        </div>
      </div>
    `;
  },

  /* --- 体验馆普通成员看板 --- */
  renderExpDashboard(container) {
    const metrics = (typeof dashboardMetricsByRole !== 'undefined' && dashboardMetricsByRole.exp)
      ? dashboardMetricsByRole.exp
      : [{ icon: '👥', value: '280', title: '到访人数', change: '+35', changeType: 'positive' },
         { icon: '🎯', value: '45', title: '体验场次', change: '+5', changeType: 'positive' },
         { icon: '📈', value: '35%', title: '购买转化', change: '+2%', changeType: 'positive' }];
    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
          <span style="font-size: 22px;">🏠</span>
          <div>
            <div style="font-size: 16px; font-weight: 700; color: var(--color-primary);">体验馆看板</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">体验馆 · 接待数据 · 体验引导</div>
          </div>
        </div>
        <div class="dashboard-grid">
          ${metrics.map(m => `
            <div class="dashboard-metric-card">
              <div class="metric-icon">${m.icon}</div>
              <div class="metric-info">
                <div class="value">${m.value}</div>
                <div class="label">${m.title}</div>
                <div class="change ${m.changeType}">${m.change}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="task-list-section">
          <h3>📋 今日体验任务</h3>
          <div class="task-list-item"><div class="task-status-dot pending"></div><div class="task-info"><div class="task-name">精油体验引导（10:00场）</div></div><div class="task-meta"><div class="task-target">体验馆A区</div></div></div>
          <div class="task-list-item"><div class="task-status-dot pending"></div><div class="task-info"><div class="task-name">护肤体验引导（14:00场）</div></div><div class="task-meta"><div class="task-target">体验馆B区</div></div></div>
        </div>
      </div>
    `;
  },

  /**
   * 自动化任务
   */
  renderAutomation() {
    const container = document.getElementById('hub-automation');
    if (!container) return;

    // V4.5：修复缺失 status → 加入 active，并提供兜底避免 undefined 访问 .class
    const statusMap = {
      running: { text: '运行中', class: 'running' },
      paused:  { text: '已暂停', class: 'paused' },
      error:   { text: '错误',   class: 'error'  },
      active:  { text: '运行中', class: 'running' },
      pending: { text: '待启动', class: 'pending' },
      completed: { text: '已完成', class: 'completed' }
    };
    const FALLBACK = { text: '未知', class: 'pending' };

    // 按角色过滤自动化任务
    const userDomain = (typeof Auth !== 'undefined' && Auth.getDomain) ? Auth.getDomain() : null;
    const isAdmin = (typeof Auth !== 'undefined' && Auth.isAdmin) ? Auth.isAdmin() : false;
    const isHubStaff = (typeof Auth !== 'undefined' && Auth.currentUser && Auth.currentUser.domain === 'hub');

    let filteredTasks = automationTasks;
    if (!isAdmin && !isHubStaff && userDomain) {
      filteredTasks = automationTasks.filter(task => {
        if (task.targetRoles && task.targetRoles.includes('all')) return true;
        if (task.targetRoles && task.targetRoles.includes(userDomain)) return true;
        return false;
      });
    }

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        ${filteredTasks.length === 0 ? '<div style="text-align:center; padding:40px; color:var(--color-text-secondary);">暂无相关自动化任务</div>' : ''}
        ${filteredTasks.map(t => {
          const s = statusMap[t.status] || FALLBACK;
          return `
          <div class="arch-card">
            <div class="arch-card-header">
              <h3>${t.name}</h3>
              <span class="status-badge ${s.class}">${s.text}</span>
            </div>
            <div class="arch-meta">
              <span>⏰ ${t.schedule}</span>
              <span>🎯 ${t.target}</span>
              <span>📋 上次: ${t.lastRun}</span>
              <span>🔄 下次: ${t.nextRun}</span>
            </div>
            <div style="margin-top: 10px;">
              ${t.status === 'running' || t.status === 'active' ? `<button class="card-action-btn" onclick="App.showToast('已暂停任务')">⏸ 暂停</button>` : ''}
              ${t.status === 'paused' || t.status === 'pending' ? `<button class="card-action-btn primary" onclick="App.showToast('已启动任务')">▶ 启动</button>` : ''}
              ${t.status === 'error' ? `<button class="card-action-btn primary" onclick="App.showToast('已重试任务')">🔄 重试</button>` : ''}
              <button class="card-action-btn" onclick="App.showToast('查看运行日志')">📋 日志</button>
              <button class="card-action-btn" onclick="App.showToast('已复制任务配置')">⚙️ 配置</button>
            </div>
          </div>
        `;}).join('')}
      </div>
    `;
  },

  /**
   * 流量分配（ABCD体系）—— 支持个人视图与全局视图切换
   * V4.2 第二阶段：admin/SD+/hub 可切换至全局视图
   */
  renderTrafficDistribution() {
    const container = document.getElementById('hub-traffic');
    if (!container) return;

    const isAdmin = (typeof Auth !== 'undefined' && Auth.isAdmin) ? Auth.isAdmin() : false;
    const isHubStaff = (typeof Auth !== 'undefined' && Auth.currentUser && Auth.currentUser.domain === 'hub');
    const isSDPlus = (typeof Auth !== 'undefined' && Auth.isSDPlus) ? Auth.isSDPlus() : false;
    // 是否可查看全局视图
    const canViewGlobal = isAdmin || isHubStaff || isSDPlus;

    // 视图状态：默认 personal，可切换至 global
    if (!this.state.trafficView) this.state.trafficView = 'personal';
    // 非授权用户强制 personal
    if (!canViewGlobal) this.state.trafficView = 'personal';
    const view = this.state.trafficView;

    // 如果是全局视图，调用专门的渲染函数
    if (view === 'global') {
      this.renderTrafficGlobalView();
      return;
    }

    // === 个人视图（原有逻辑） ===

    const gradeColors = {
      A: { bg: '#E8F5E9', border: '#4CAF50', text: '#2E7D32', label: 'A类 · 持续精进' },
      B: { bg: '#E3F2FD', border: '#2196F3', text: '#1565C0', label: 'B类 · 踏实前行' },
      C: { bg: '#FFF3E0', border: '#FF9800', text: '#E65100', label: 'C类 · 起步探索' },
      D: { bg: '#FFEBEE', border: '#F44336', text: '#C62828', label: 'D类 · 暂停观察' }
    };

    // 个人流量数据（根据角色动态，SD+阶衔自动使用更高权重）
    const userRole = (typeof Auth !== 'undefined' && Auth.currentUser) ? Auth.currentUser.role : 'blogger';
    // 注：isSDPlus 已在函数开头声明，此处不再重复
    const personalTraffic = {
      blogger: { name: '我的流量', grade: 'B', weight: 1.0, allocated: 3, performance: '踏实前行', coefficient: 3.0, history: [2, 3, 2, 4, 3] },
      blogger_lead: { name: '我的流量', grade: 'A', weight: 1.5, allocated: 8, performance: '持续精进', coefficient: 3.0, history: [5, 6, 7, 8, 8] },
      community: { name: '我的流量', grade: 'B', weight: 1.0, allocated: 2, performance: '踏实前行', coefficient: 2.5, history: [1, 2, 2, 3, 2] },
      community_lead: { name: '我的流量', grade: 'A', weight: 1.5, allocated: 6, performance: '持续精进', coefficient: 2.5, history: [4, 5, 5, 6, 6] },
      offline: { name: '我的流量', grade: 'C', weight: 0.7, allocated: 1, performance: '起步探索', coefficient: 2.0, history: [0, 1, 1, 1, 1] },
      offline_lead: { name: '我的流量', grade: 'B', weight: 1.0, allocated: 4, performance: '踏实前行', coefficient: 2.0, history: [2, 3, 3, 4, 4] },
      hub: { name: '我的流量', grade: 'A', weight: 1.5, allocated: 5, performance: '持续精进', coefficient: 1.0, history: [3, 4, 4, 5, 5] },
      course_admin: { name: '我的流量', grade: 'B', weight: 1.0, allocated: 3, performance: '踏实前行', coefficient: 1.0, history: [2, 2, 3, 3, 3] },
      sd_plus: { name: '我的流量', grade: 'A', weight: 1.5, allocated: 10, performance: '持续精进', coefficient: 3.0, history: [6, 7, 8, 9, 10] }
    };

    // SD+ 阶衔优先使用 sd_plus 流量数据，否则按角色匹配
    const myTraffic = isSDPlus ? personalTraffic.sd_plus : (personalTraffic[userRole] || personalTraffic.blogger);
    const c = gradeColors[myTraffic.grade];

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <!-- V4.2 第二阶段：视图切换器（仅 admin/SD+/hub 可见） -->
        ${canViewGlobal ? `
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding: 8px 12px; background: var(--color-surface); border-radius: 8px; border: 1px solid var(--color-border);">
            <span style="font-size: 12px; font-weight: 600; color: var(--color-text-secondary);">视图：</span>
            <button onclick="App.switchTrafficView('personal')" style="padding: 5px 14px; border-radius: 5px; border: 1px solid ${view === 'personal' ? 'var(--color-primary)' : 'var(--color-border)'}; background: ${view === 'personal' ? 'var(--color-primary)' : 'var(--color-surface)'}; color: ${view === 'personal' ? 'white' : 'var(--color-primary)'}; font-size: 12px; font-weight: 600; cursor: pointer;">👤 个人视图</button>
            <button onclick="App.switchTrafficView('global')" style="padding: 5px 14px; border-radius: 5px; border: 1px solid ${view === 'global' ? 'var(--color-primary)' : 'var(--color-border)'}; background: ${view === 'global' ? 'var(--color-primary)' : 'var(--color-surface)'}; color: ${view === 'global' ? 'white' : 'var(--color-primary)'}; font-size: 12px; font-weight: 600; cursor: pointer;">🌐 全局视图</button>
          </div>
        ` : ''}

        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
          <span style="font-size: 22px;">📊</span>
          <div>
            <div style="font-size: 16px; font-weight: 700; color: var(--color-primary);">我的流量分配</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">个人流量追踪 · 本月分配明细</div>
          </div>
        </div>

        <!-- 个人分配卡片 -->
        <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 24px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 56px; height: 56px; border-radius: 50%; background: ${c.bg}; border: 3px solid ${c.border}; display: flex; align-items: center; justify-content: center; font-weight: 700; color: ${c.text}; font-size: 18px;">${myTraffic.grade}</div>
              <div>
                <div style="font-size: 18px; font-weight: 700; color: var(--color-primary);">${myTraffic.performance}</div>
                <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 2px;">${c.label} · 贡献系数 ${myTraffic.coefficient}</div>
              </div>
            </div>
            <div style="display: flex; gap: 32px; text-align: center;">
              <div>
                <div style="font-size: 28px; font-weight: 700; color: var(--color-primary);">${myTraffic.allocated}</div>
                <div style="font-size: 12px; color: var(--color-text-secondary);">本月分配</div>
              </div>
              <div>
                <div style="font-size: 28px; font-weight: 700; color: var(--color-accent);">×${myTraffic.weight}</div>
                <div style="font-size: 12px; color: var(--color-text-secondary);">分配权重</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 近5个月分配趋势 -->
        <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <div style="font-size: 14px; font-weight: 600; color: var(--color-primary); margin-bottom: 12px;">📈 近5个月分配趋势</div>
          <div style="display: flex; align-items: flex-end; gap: 12px; height: 100px; padding: 10px 0;">
            ${myTraffic.history.map((v, i) => `
              <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                <div style="font-size: 12px; font-weight: 600; color: var(--color-primary);">${v}</div>
                <div style="width: 100%; height: ${Math.max(v * 12, 4)}px; background: linear-gradient(to top, var(--color-primary), var(--color-accent)); border-radius: 4px 4px 0 0; min-height: 4px;"></div>
                <div style="font-size: 11px; color: var(--color-text-secondary);">${['3月','4月','5月','6月','7月'][i]}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 分配规则说明 -->
        <div style="background: var(--color-accent-light); border-left: 4px solid var(--color-accent); padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
          <div style="font-size: 14px; font-weight: 600; color: var(--color-primary); margin-bottom: 6px;">📋 ABCD 流量分配规则</div>
          <div style="font-size: 12px; color: var(--color-text-secondary); line-height: 1.8;">
            <span style="display: inline-block; margin-right: 16px;"><strong style="color: #4CAF50;">A类</strong> 权重×1.5 · 优先分配</span>
            <span style="display: inline-block; margin-right: 16px;"><strong style="color: #2196F3;">B类</strong> 权重×1.0 · 标准分配</span>
            <span style="display: inline-block; margin-right: 16px;"><strong style="color: #FF9800;">C类</strong> 权重×0.7 · 保底分配</span>
            <span style="display: inline-block;"><strong style="color: #F44336;">D类</strong> 权重×0 · 暂停分配</span>
          </div>
        </div>

        <div style="font-size: 12px; color: var(--color-text-secondary); text-align: center; padding: 12px; background: var(--color-bg); border-radius: 8px;">
          💡 系统每月1日自动计算流量分配，结果通过自动化任务发送到飞书群组公示。如需查看团队全局流量，请切换至「🌐 全局视图」。
        </div>
      </div>
    `;
  },

  /**
   * 切换流量视图（V4.2 第二阶段新增）
   */
  switchTrafficView(view) {
    this.state.trafficView = view;
    this.renderTrafficDistribution();
  },

  /**
   * 流量池全局视图（V4.2 第二阶段新增）
   * admin/SD+/hub 可见：总览 + 团队对比 + ABCD 分布 + 领域趋势 + 异常预警
   */
  renderTrafficGlobalView() {
    const container = document.getElementById('hub-traffic');
    if (!container) return;

    const data = (typeof TRAFFIC_POOL_GLOBAL !== 'undefined') ? TRAFFIC_POOL_GLOBAL : null;
    if (!data) {
      container.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--color-text-secondary);">全局视图数据加载失败</div>';
      return;
    }

    const ov = data.overview;
    const teams = data.teams;
    const gradeDist = data.gradeDistribution;
    const domainTrends = data.domainTrends;
    const alerts = data.alerts;
    const view = this.state.trafficView || 'global';
    const monthLabels = ['2月', '3月', '4月', '5月', '6月', '7月'];

    // 计算环比变化
    const momChange = ov.total - ov.lastMonthTotal;
    const momPercent = ov.lastMonthTotal > 0 ? ((momChange / ov.lastMonthTotal) * 100).toFixed(1) : 0;

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <!-- 视图切换器 -->
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding: 8px 12px; background: var(--color-surface); border-radius: 8px; border: 1px solid var(--color-border);">
          <span style="font-size: 12px; font-weight: 600; color: var(--color-text-secondary);">视图：</span>
          <button onclick="App.switchTrafficView('personal')" style="padding: 5px 14px; border-radius: 5px; border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-primary); font-size: 12px; font-weight: 600; cursor: pointer;">👤 个人视图</button>
          <button onclick="App.switchTrafficView('global')" style="padding: 5px 14px; border-radius: 5px; border: 1px solid var(--color-primary); background: var(--color-primary); color: white; font-size: 12px; font-weight: 600; cursor: pointer;">🌐 全局视图</button>
        </div>

        <!-- 标题 -->
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
          <span style="font-size: 22px;">🌐</span>
          <div>
            <div style="font-size: 16px; font-weight: 700; color: var(--color-primary);">流量池全局视图</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">跨团队流量分配总览 · ${new Date().toISOString().slice(0, 7)} 月</div>
          </div>
        </div>

        <!-- 1. 总览统计卡片 -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
          <div style="background: linear-gradient(135deg, var(--color-primary) 0%, #1a4d2e 100%); color: white; padding: 16px; border-radius: 10px;">
            <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">📊 本月总流量池</div>
            <div style="font-size: 26px; font-weight: 700;">${ov.total}</div>
            <div style="font-size: 10px; opacity: 0.8;">环比 ${momChange >= 0 ? '+' : ''}${momChange}（${momPercent}%）</div>
          </div>
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; padding: 16px; border-left: 4px solid #4CAF50;">
            <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px;">✅ 已分配</div>
            <div style="font-size: 26px; font-weight: 700; color: var(--color-primary);">${ov.allocated}</div>
            <div style="font-size: 10px; color: var(--color-text-secondary);">利用率 ${ov.utilizationRate}%</div>
          </div>
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; padding: 16px; border-left: 4px solid #FF9800;">
            <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px;">⏳ 待分配</div>
            <div style="font-size: 26px; font-weight: 700; color: #FF9800;">${ov.pending}</div>
            <div style="font-size: 10px; color: var(--color-text-secondary);">可调整分配</div>
          </div>
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; padding: 16px; border-left: 4px solid #2196F3;">
            <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px;">📈 本月新增</div>
            <div style="font-size: 26px; font-weight: 700; color: #2196F3;">+${ov.thisMonthNew}</div>
            <div style="font-size: 10px; color: var(--color-text-secondary);">较上月新增流量</div>
          </div>
        </div>

        <!-- 2. ABCD 评级分布 + 各领域趋势 -->
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 16px; margin-bottom: 20px;">
          <!-- ABCD 分布 -->
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 18px;">
            <div style="font-size: 14px; font-weight: 600; color: var(--color-primary); margin-bottom: 14px;">🏷️ ABCD 评级分布</div>
            ${[
              { grade: 'A', color: '#4CAF50', label: '持续精进' },
              { grade: 'B', color: '#2196F3', label: '踏实前行' },
              { grade: 'C', color: '#FF9800', label: '起步探索' },
              { grade: 'D', color: '#F44336', label: '暂停观察' }
            ].map(g => {
              const d = gradeDist[g.grade];
              return `
                <div style="margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-size: 12px; font-weight: 600;">
                      <span style="display: inline-block; width: 20px; height: 20px; line-height: 20px; text-align: center; border-radius: 50%; background: ${g.color}20; color: ${g.color}; font-weight: 700; margin-right: 6px;">${g.grade}</span>
                      ${g.label} · ${d.count} 个团队
                    </span>
                    <span style="font-size: 11px; color: var(--color-text-secondary);">${d.totalAllocated} 流量（${d.percentage}%）</span>
                  </div>
                  <div style="height: 6px; background: var(--color-bg); border-radius: 3px; overflow: hidden;">
                    <div style="height: 100%; width: ${d.percentage}%; background: ${g.color}; border-radius: 3px;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- 各领域趋势 -->
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 18px;">
            <div style="font-size: 14px; font-weight: 600; color: var(--color-primary); margin-bottom: 14px;">📈 各领域流量趋势（近 6 个月）</div>
            <div style="position: relative; height: 140px; padding: 10px 0;">
              ${(() => {
                const allValues = Object.values(domainTrends).flatMap(d => d.months);
                const maxVal = Math.max(...allValues);
                const minVal = Math.min(...allValues);
                const range = maxVal - minVal || 1;
                return Object.entries(domainTrends).map(([key, d]) => `
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 11px; color: ${d.color}; font-weight: 600; width: 48px; flex-shrink: 0;">${d.label}</span>
                    <div style="flex: 1; display: flex; align-items: flex-end; gap: 3px; height: 20px;">
                      ${d.months.map(v => {
                        const heightPercent = ((v - minVal) / range) * 100;
                        return `<div style="flex: 1; height: ${Math.max(heightPercent, 10)}%; background: ${d.color}; border-radius: 2px 2px 0 0; opacity: 0.85; min-height: 4px;" title="${v}"></div>`;
                      }).join('')}
                    </div>
                    <span style="font-size: 10px; color: var(--color-text-secondary); width: 36px; text-align: right; flex-shrink: 0;">${d.months[d.months.length - 1]}</span>
                  </div>
                `).join('');
              })()}
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--color-text-secondary); margin-top: 8px; padding: 0 56px 0 56px;">
              ${monthLabels.map(m => `<span>${m}</span>`).join('')}
            </div>
          </div>
        </div>

        <!-- 3. 各团队流量分配对比表 -->
        <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <div style="font-size: 14px; font-weight: 600; color: var(--color-primary); margin-bottom: 14px;">📋 各团队流量分配对比</div>
          <table class="follow-table" style="width: 100%; font-size: 12px;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 8px;">团队</th>
                <th style="text-align: left; padding: 8px;">领域</th>
                <th style="text-align: center; padding: 8px;">负责人</th>
                <th style="text-align: center; padding: 8px;">评级</th>
                <th style="text-align: center; padding: 8px;">权重</th>
                <th style="text-align: center; padding: 8px;">已分配</th>
                <th style="text-align: center; padding: 8px;">成员数</th>
                <th style="text-align: center; padding: 8px;">人均</th>
                <th style="text-align: center; padding: 8px;">环比</th>
                <th style="text-align: center; padding: 8px;">利用率</th>
              </tr>
            </thead>
            <tbody>
              ${teams.map(t => {
                const domainLabels = { social: '自媒体', community: '社群', offline: '线下', hub: '中枢' };
                const gradeColors = { A: '#4CAF50', B: '#2196F3', C: '#FF9800', D: '#F44336' };
                const trendIcons = { up: '📈', stable: '➡️', down: '📉' };
                const changeColor = t.change.startsWith('+') ? '#4CAF50' : (t.change.startsWith('-') ? '#F44336' : '#757575');
                return `
                  <tr style="border-bottom: 1px solid var(--color-border);">
                    <td style="padding: 8px;"><strong>${t.name}</strong></td>
                    <td style="padding: 8px;"><span class="card-tag">#${domainLabels[t.domain] || t.domain}</span></td>
                    <td style="padding: 8px; text-align: center;">${t.lead}</td>
                    <td style="padding: 8px; text-align: center;">
                      <span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;border-radius:50%;background:${gradeColors[t.grade]}20;color:${gradeColors[t.grade]};font-weight:700;">${t.grade}</span>
                    </td>
                    <td style="padding: 8px; text-align: center;">×${t.weight}</td>
                    <td style="padding: 8px; text-align: center;"><strong style="color: var(--color-primary);">${t.allocated}</strong></td>
                    <td style="padding: 8px; text-align: center;">${t.members}</td>
                    <td style="padding: 8px; text-align: center;">${t.avgPerMember}</td>
                    <td style="padding: 8px; text-align: center; color: ${changeColor}; font-weight: 600;">${trendIcons[t.trend]} ${t.change}</td>
                    <td style="padding: 8px; text-align: center;">
                      <div style="display: flex; align-items: center; gap: 4px; justify-content: center;">
                        <div style="width: 40px; height: 5px; background: var(--color-bg); border-radius: 3px; overflow: hidden;">
                          <div style="height: 100%; width: ${t.utilization}%; background: ${t.utilization >= 95 ? '#4CAF50' : (t.utilization >= 85 ? '#FF9800' : '#F44336')}; border-radius: 3px;"></div>
                        </div>
                        <span style="font-size: 10px; color: var(--color-text-secondary);">${t.utilization}%</span>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
            <tfoot>
              <tr style="background: var(--color-bg); font-weight: 700;">
                <td style="padding: 8px;" colspan="5">合计</td>
                <td style="padding: 8px; text-align: center; color: var(--color-primary);">${teams.reduce((s, t) => s + t.allocated, 0)}</td>
                <td style="padding: 8px; text-align: center;">${teams.reduce((s, t) => s + t.members, 0)}</td>
                <td style="padding: 8px; text-align: center;" colspan="3">平均利用率 ${(teams.reduce((s, t) => s + t.utilization, 0) / teams.length).toFixed(1)}%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- 4. 异常预警 -->
        <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 18px;">
          <div style="font-size: 14px; font-weight: 600; color: var(--color-primary); margin-bottom: 14px;">🔔 异常预警与建议（${alerts.length}）</div>
          ${alerts.map(a => {
            const meta = (typeof getTrafficAlertMeta === 'function') ? getTrafficAlertMeta(a.level) : { icon: 'ℹ️', color: '#2196F3', label: a.level };
            return `
              <div style="display: flex; align-items: flex-start; gap: 12px; padding: 12px; background: var(--color-bg); border-radius: 8px; margin-bottom: 8px; border-left: 4px solid ${meta.color};">
                <span style="font-size: 20px; flex-shrink: 0;">${meta.icon}</span>
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <span style="font-size: 12px; font-weight: 600; color: var(--color-primary);">${a.team}</span>
                    <span style="font-size: 10px; padding: 2px 6px; border-radius: 3px; background: ${meta.color}15; color: ${meta.color}; font-weight: 500;">${meta.label}</span>
                    <span style="font-size: 10px; color: var(--color-text-secondary); margin-left: auto;">${a.date}</span>
                  </div>
                  <div style="font-size: 11px; color: var(--color-primary); margin-bottom: 4px;">${a.issue}</div>
                  <div style="font-size: 11px; color: var(--color-text-secondary);">💡 ${a.suggestion}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  /**
   * 月度复盘
   */
  renderReviews() {
    const container = document.getElementById('hub-reviews');
    if (!container) return;

    const statusMap = {
      completed: { text: '已完成', class: 'completed' },
      in_progress: { text: '进行中', class: 'in_progress' }
    };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div class="card-grid">
          ${monthlyReviews.map(r => `
            <div class="content-card">
              <div class="card-header">
                <div class="card-title">${r.title}</div>
                <span class="status-badge ${statusMap[r.status].class}">${statusMap[r.status].text}</span>
              </div>
              <div class="card-tags">
                <span class="card-tag">#${r.period}</span>
              </div>
              <div class="card-metrics">
                <span class="metric-item">创建: <strong>${r.createdAt}</strong></span>
              </div>
              <div class="card-actions">
                <button class="card-action-btn primary" onclick="App.showToast('查看复盘报告')">查看</button>
                <button class="card-action-btn" onclick="App.showToast('已复制复盘模板')">📋 模板</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * 合规中心
   */
  renderCompliance() {
    const container = document.getElementById('hub-compliance');
    if (!container) return;

    const statusMap = {
      passed: { text: '通过', class: 'completed' },
      warning: { text: '有警告', class: 'need_optimize' }
    };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        ${complianceItems.map(c => `
          <div class="arch-card">
            <div class="arch-card-header">
              <h3>${c.title}</h3>
              <span class="status-badge ${statusMap[c.status].class}">${statusMap[c.status].text}</span>
            </div>
            <div class="arch-meta">
              <span>📅 最后检查: ${c.lastCheck}</span>
              <span>📊 检查项: ${c.items}</span>
              <span style="color: ${c.issues > 0 ? 'var(--color-danger)' : 'var(--color-success)'}">⚠️ 问题: ${c.issues}</span>
            </div>
            <div style="margin-top: 10px;">
              <button class="card-action-btn primary" onclick="App.showToast('开始合规检查')">🔍 检查</button>
              <button class="card-action-btn" onclick="App.showToast('查看检查报告')">📋 报告</button>
            </div>
          </div>
        `).join('')}

        <div style="margin-top: 24px; padding: 16px; background: var(--color-accent-light); border-radius: 8px;">
          <h4 style="font-size: 14px; margin-bottom: 8px;">📌 合规红线提醒</h4>
          <ul style="font-size: 13px; color: var(--color-text); line-height: 1.8; padding-left: 20px;">
            <li>L1公域内容绝对不得出现"美乐家"品牌名、产品名</li>
            <li>所有涉及产品功效描述必须以"根据美乐家官方描述"开头</li>
            <li>涉及收入表述必须附带声明：美乐家不保证收入，实际结果取决于个人努力和市场状况</li>
            <li>禁止暗示产品具有疾病预防、诊断、治疗功效</li>
            <li>公域内容不得引导"私聊了解副业""加入我们"等事业邀约话术</li>
          </ul>
        </div>
      </div>
    `;
  },

  /**
   * 知识库
   */
  renderKnowledge() {
    const container = document.getElementById('hub-knowledge');
    if (!container) return;

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 12px;">📚 知识库分类（共 ${knowledgeBase.totalItems} 条）</h3>
          <div class="kb-categories">
            ${knowledgeBase.categories.map(c => `
              <div class="kb-category-card" onclick="App.showToast('进入${c.name}分类')">
                <span class="cat-name">${c.name}</span>
                <span class="cat-count">${c.count}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <h3 style="font-size: 16px; margin-bottom: 12px;">🔄 最近更新</h3>
        <div class="card-grid">
          ${knowledgeBase.recentlyUpdated.map((k, i) => `
            <div class="content-card">
              <div class="card-header">
                <div class="card-title">${k.title}</div>
                <span class="status-badge completed">${k.category}</span>
              </div>
              <div class="card-metrics">
                <span class="metric-item">📅 更新: <strong>${k.updatedDate}</strong></span>
              </div>
              <div class="card-actions">
                <button class="card-action-btn primary" onclick="App.showToast('查看知识条目')">查看</button>
                <button class="card-action-btn" onclick="App.copyToClipboard('${k.title}')">复制</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /* ========== 课件制作 - 补充渲染函数 ========== */

  /**
   * 培训框架
   */
  renderCwFramework() {
    const container = document.getElementById('cw-framework');
    if (!container) return;

    const statusMap = {
      active: { text: '使用中', class: 'active' },
      planned: { text: '规划中', class: 'pending' },
      completed: { text: '已完成', class: 'completed' }
    };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div class="card-grid">
          ${cwFrameworkData.map(f => {
            const progress = Math.round(f.completedCourses / f.totalCourses * 100);
            return `
              <div class="content-card">
                <div class="card-header">
                  <div class="card-title">${f.name}</div>
                  <span class="status-badge ${statusMap[f.status].class}">${statusMap[f.status].text}</span>
                </div>
                <div class="card-tags">
                  <span class="card-tag">#${f.level}</span>
                </div>
                <div style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 8px;">${f.description}</div>
                <div class="card-metrics">
                  <span class="metric-item">课程: <strong>${f.completedCourses}/${f.totalCourses}</strong></span>
                  <span class="metric-item">更新: <strong>${f.lastUpdate}</strong></span>
                </div>
                <div class="card-trend">📚 完成进度: ${progress}%</div>
                <div style="height: 6px; background: var(--color-bg); border-radius: 3px; margin-bottom: 8px; overflow: hidden;">
                  <div style="height: 100%; width: ${progress}%; background: linear-gradient(to right, var(--color-primary), var(--color-primary-light)); border-radius: 3px;"></div>
                </div>
                <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 8px;">
                  ${f.courses.map(c => `<span style="display: inline-block; background: var(--color-bg); padding: 2px 8px; border-radius: 4px; margin: 2px;">${c}</span>`).join('')}
                </div>
                <div class="card-actions">
                  <button class="card-action-btn primary" onclick="App.showToast('查看框架详情')">详情</button>
                  <button class="card-action-btn" onclick="App.showToast('已复制框架SOP')">📋 SOP</button>
                  <button class="card-action-btn" onclick="App.showToast('进入编辑')">编辑</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  /**
   * 短视频脚本库
   */
  renderCwScript() {
    const container = document.getElementById('cw-script');
    if (!container) return;

    const statusMap = {
      completed: { text: '已完成', class: 'completed' },
      in_progress: { text: '进行中', class: 'in_progress' },
      draft: { text: '草稿', class: 'draft' }
    };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div class="card-grid">
          ${cwScriptData.map(s => `
            <div class="content-card">
              <div class="card-header">
                <div class="card-title">${s.title}</div>
                <span class="status-badge ${statusMap[s.status].class}">${statusMap[s.status].text}</span>
              </div>
              <div class="card-tags">
                ${s.tags.map(t => `<span class="card-tag">${t}</span>`).join('')}
                <span class="card-tag">#${s.category}</span>
              </div>
              <div class="card-metrics">
                <span class="metric-item">时长: <strong>${s.duration}</strong></span>
                <span class="metric-item">更新: <strong>${s.lastUpdate}</strong></span>
              </div>
              <div class="card-actions">
                <button class="card-action-btn primary" onclick="App.showToast('查看脚本详情')">查看</button>
                <button class="card-action-btn" onclick="App.copyToClipboard('${s.title}')">复制</button>
                <button class="card-action-btn" onclick="App.showToast('已复制优化提示词')">优化</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * PPT大纲库
   */
  renderCwOutline() {
    const container = document.getElementById('cw-outline');
    if (!container) return;

    const statusMap = {
      completed: { text: '已完成', class: 'completed' },
      in_progress: { text: '进行中', class: 'in_progress' },
      draft: { text: '草稿', class: 'draft' }
    };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div class="card-grid">
          ${cwOutlineData.map(o => `
            <div class="content-card">
              <div class="card-header">
                <div class="card-title">${o.title}</div>
                <span class="status-badge ${statusMap[o.status].class}">${statusMap[o.status].text}</span>
              </div>
              <div class="card-tags">
                <span class="card-tag">#${o.level}</span>
                <span class="card-tag">#${o.category}</span>
              </div>
              <div class="card-metrics">
                <span class="metric-item">页数: <strong>${o.slides}页</strong></span>
                <span class="metric-item">更新: <strong>${o.lastUpdate}</strong></span>
              </div>
              <div class="card-actions">
                <button class="card-action-btn primary" onclick="App.showToast('查看大纲')">查看</button>
                <button class="card-action-btn" onclick="App.showToast('已复制大纲')">复制</button>
                <button class="card-action-btn" onclick="App.showToast('已复制PPT生成提示词')">生成PPT</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * 逐字稿库
   */
  renderCwFulltext() {
    const container = document.getElementById('cw-fulltext');
    if (!container) return;

    const statusMap = {
      completed: { text: '已完成', class: 'completed' },
      in_progress: { text: '进行中', class: 'in_progress' },
      draft: { text: '草稿', class: 'draft' }
    };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div class="card-grid">
          ${cwFulltextData.map(f => `
            <div class="content-card">
              <div class="card-header">
                <div class="card-title">${f.title}</div>
                <span class="status-badge ${statusMap[f.status].class}">${statusMap[f.status].text}</span>
              </div>
              <div class="card-tags">
                <span class="card-tag">#${f.level}</span>
                <span class="card-tag">#${f.category}</span>
              </div>
              <div class="card-metrics">
                <span class="metric-item">字数: <strong>${f.wordCount.toLocaleString()}</strong></span>
                <span class="metric-item">时长: <strong>${f.duration}</strong></span>
                <span class="metric-item">更新: <strong>${f.lastUpdate}</strong></span>
              </div>
              <div class="card-actions">
                <button class="card-action-btn primary" onclick="App.showToast('查看逐字稿')">查看</button>
                <button class="card-action-btn" onclick="App.copyToClipboard('${f.title}')">复制</button>
                <button class="card-action-btn" onclick="App.showToast('已复制讲稿优化提示词')">优化</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * 素材库
   */
  renderCwMaterials() {
    const container = document.getElementById('cw-materials');
    if (!container) return;

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 12px;">📦 素材分类（共 ${cwMaterialsData.totalItems} 项）</h3>
          <div class="kb-categories">
            ${cwMaterialsData.categories.map(c => `
              <div class="kb-category-card" onclick="App.showToast('进入${c.name}分类')">
                <span class="cat-name">${c.name}</span>
                <span class="cat-count">${c.count}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <h3 style="font-size: 16px; margin-bottom: 12px;">🆕 最近添加</h3>
        <div class="card-grid">
          ${cwMaterialsData.recentlyAdded.map(m => `
            <div class="content-card">
              <div class="card-header">
                <div class="card-title">${m.title}</div>
                <span class="status-badge completed">${m.format}</span>
              </div>
              <div class="card-tags">
                <span class="card-tag">#${m.type}</span>
              </div>
              <div class="card-metrics">
                <span class="metric-item">添加: <strong>${m.addedDate}</strong></span>
              </div>
              <div class="card-actions">
                <button class="card-action-btn primary" onclick="App.showToast('预览素材')">预览</button>
                <button class="card-action-btn" onclick="App.showToast('已复制素材路径')">复制路径</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /* ========== 线下活动 - 补充渲染函数 ========== */

  /**
   * 沙龙讲座
   */
  renderSalonActivities() {
    const container = document.getElementById('offline-salon');
    if (!container) return;

    const statusMap = {
      upcoming: { text: '即将开始', class: 'upcoming' },
      completed: { text: '已完成', class: 'completed' },
      planning: { text: '策划中', class: 'planning' }
    };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div class="card-grid">
          ${salonActivities.map(s => `
            <div class="content-card">
              <div class="card-header">
                <div class="card-title">${s.title}</div>
                <span class="status-badge ${statusMap[s.status].class}">${statusMap[s.status].text}</span>
              </div>
              <div class="card-tags">
                <span class="card-tag">#${s.type}</span>
                <span class="card-tag">#${s.venue}</span>
              </div>
              <div class="card-metrics">
                <span class="metric-item">📅 <strong>${s.date}</strong></span>
                <span class="metric-item">👤 <strong>${s.host}</strong></span>
                <span class="metric-item">💰 <strong>${s.fee}</strong></span>
              </div>
              <div class="card-trend">
                👥 报名: ${s.registered}/${s.capacity} (${Math.round(s.registered/s.capacity*100)}%)
              </div>
              <div class="card-actions">
                <button class="card-action-btn primary" onclick="App.showToast('查看活动详情')">详情</button>
                <button class="card-action-btn" onclick="App.showToast('已复制执行SOP')">📋 SOP</button>
                <button class="card-action-btn" onclick="App.showToast('已复制主持稿')">🎤 主持稿</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * 体验馆运营
   */
  renderExpCenter() {
    const container = document.getElementById('offline-exp');
    if (!container) return;

    const info = expCenterData.info;
    const m = expCenterData.metrics;

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div class="arch-card" style="margin-bottom: 20px;">
          <div class="arch-card-header">
            <h3>${info.name}</h3>
            <span class="status-badge active">运营中</span>
          </div>
          <div class="arch-meta">
            <span>📍 ${info.location}</span>
            <span>📐 ${info.area}</span>
            <span>🕒 ${info.openDays} ${info.openHours}</span>
          </div>
          <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
            <div style="text-align: center; padding: 12px; background: var(--color-bg); border-radius: 8px;">
              <div style="font-size: 22px; font-weight: 700; color: var(--color-primary);">${info.monthlyVisitors}</div>
              <div style="font-size: 12px; color: var(--color-text-secondary);">月访客</div>
            </div>
            <div style="text-align: center; padding: 12px; background: var(--color-bg); border-radius: 8px;">
              <div style="font-size: 22px; font-weight: 700; color: var(--color-primary);">${info.monthlyEvents}</div>
              <div style="font-size: 12px; color: var(--color-text-secondary);">月活动</div>
            </div>
            <div style="text-align: center; padding: 12px; background: var(--color-bg); border-radius: 8px;">
              <div style="font-size: 22px; font-weight: 700; color: var(--color-accent);">${info.conversionRate}</div>
              <div style="font-size: 12px; color: var(--color-text-secondary);">转化率</div>
            </div>
            <div style="text-align: center; padding: 12px; background: var(--color-bg); border-radius: 8px;">
              <div style="font-size: 22px; font-weight: 700; color: var(--color-success);">${m.satisfaction}</div>
              <div style="font-size: 12px; color: var(--color-text-secondary);">满意度</div>
            </div>
          </div>
          <div style="margin-top: 12px; font-size: 12px; color: var(--color-text-secondary);">
            功能区域: ${info.zones.join(' · ')}
          </div>
        </div>

        <h3 style="font-size: 15px; margin-bottom: 12px;">📅 近期活动安排</h3>
        <table class="follow-table">
          <thead>
            <tr><th>日期</th><th>活动</th><th>区域</th><th>时间</th><th>状态</th></tr>
          </thead>
          <tbody>
            ${expCenterData.schedule.map(s => `
              <tr>
                <td><strong>${s.date}</strong></td>
                <td>${s.event}</td>
                <td>${s.zone}</td>
                <td>${s.time}</td>
                <td><span class="status-badge upcoming">即将开始</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  /**
   * 社区公益
   */
  renderCommunityActivities() {
    const container = document.getElementById('offline-community');
    if (!container) return;

    const statusMap = {
      completed: { text: '已完成', class: 'completed' },
      planning: { text: '策划中', class: 'planning' },
      upcoming: { text: '即将开始', class: 'upcoming' }
    };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div class="card-grid">
          ${communityActivities.map(c => `
            <div class="content-card">
              <div class="card-header">
                <div class="card-title">${c.title}</div>
                <span class="status-badge ${statusMap[c.status].class}">${statusMap[c.status].text}</span>
              </div>
              <div class="card-tags">
                <span class="card-tag">#${c.topic}</span>
              </div>
              <div class="card-metrics">
                <span class="metric-item">📅 <strong>${c.date}</strong></span>
                <span class="metric-item">📍 <strong>${c.venue}</strong></span>
              </div>
              <div class="card-trend">
                👥 报名: ${c.registered}/${c.capacity}${c.attendees > 0 ? ` · 实到: ${c.attendees}` : ''}
              </div>
              <div class="card-actions">
                <button class="card-action-btn primary" onclick="App.showToast('查看活动详情')">详情</button>
                <button class="card-action-btn" onclick="App.showToast('已复制执行SOP')">📋 SOP</button>
                <button class="card-action-btn" onclick="App.showToast('已复制讲稿')">🎤 讲稿</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * 物料清单
   */
  renderMaterialsChecklist() {
    const container = document.getElementById('offline-materials');
    if (!container) return;

    const statusMap = {
      complete: { text: '齐备', class: 'completed' },
      preparing: { text: '准备中', class: 'pending' }
    };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        ${materialsChecklist.map(m => `
          <div class="arch-card">
            <div class="arch-card-header">
              <h3>${m.name}</h3>
              <span class="status-badge ${statusMap[m.status].class}">${statusMap[m.status].text}</span>
            </div>
            <div class="arch-meta">
              <span>类型: ${m.type}</span>
              <span>上次使用: ${m.lastUsed}</span>
              <span>物料数: ${m.items.length}项</span>
            </div>
            <div style="margin-top: 10px; font-size: 13px;">
              ${m.items.map(item => `<span style="display: inline-block; background: var(--color-bg); padding: 3px 10px; border-radius: 4px; margin: 2px;">${item}</span>`).join('')}
            </div>
            <div style="margin-top: 10px;">
              <button class="card-action-btn primary" onclick="App.showToast('查看物料详情')">详情</button>
              <button class="card-action-btn" onclick="App.copyToClipboard('${m.name}')">复制清单</button>
              <button class="card-action-btn" onclick="App.showToast('已复制采购提示词')">采购提示</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  /**
   * 活动复盘
   */
  renderReviewRecords() {
    const container = document.getElementById('offline-review');
    if (!container) return;

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        ${reviewRecords.map(r => `
          <div class="arch-card">
            <div class="arch-card-header">
              <h3>${r.title}</h3>
              <span class="status-badge completed">已复盘</span>
            </div>
            <div class="arch-meta">
              <span>📅 活动日期: ${r.activityDate}</span>
              <span>📋 复盘日期: ${r.reviewDate}</span>
              <span>👥 参加人数: ${r.attendees}</span>
              <span>🔄 转化: ${r.converted}人 (${r.conversionRate})</span>
              <span>😊 满意度: ${r.satisfaction}</span>
            </div>
            <div style="margin-top: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div style="padding: 12px; background: rgba(76,175,80,0.08); border-radius: 8px; border-left: 3px solid var(--color-success);">
                <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 4px;">✨ 亮点</div>
                <div style="font-size: 13px;">${r.highlights}</div>
              </div>
              <div style="padding: 12px; background: rgba(249,168,37,0.08); border-radius: 8px; border-left: 3px solid var(--color-accent);">
                <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 4px;">📈 改进建议</div>
                <div style="font-size: 13px;">${r.improvements}</div>
              </div>
            </div>
            <div style="margin-top: 10px;">
              <button class="card-action-btn primary" onclick="App.showToast('查看复盘报告')">查看报告</button>
              <button class="card-action-btn" onclick="App.showToast('已复制复盘模板')">📋 模板</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  /* ========== 经营者培训 - 补充渲染函数 ========== */

  /**
   * 考核管理
   */
  renderExamData() {
    const container = document.getElementById('training-exam');
    if (!container) return;

    const statusMap = {
      completed: { text: '已完成', class: 'completed' },
      upcoming: { text: '即将进行', class: 'upcoming' }
    };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <table class="follow-table">
          <thead>
            <tr>
              <th>考核名称</th>
              <th>级别</th>
              <th>题数</th>
              <th>及格分</th>
              <th>参考人数</th>
              <th>通过人数</th>
              <th>通过率</th>
              <th>最近考试</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${examData.map(e => `
              <tr>
                <td><strong>${e.title}</strong></td>
                <td>${e.level}</td>
                <td>${e.totalQuestions}题</td>
                <td>${e.passingScore}分</td>
                <td>${e.examinees}</td>
                <td style="color: var(--color-success)">${e.passed}</td>
                <td><strong style="color: ${parseInt(e.passRate) >= 80 ? 'var(--color-success)' : 'var(--color-warning)'}">${e.passRate}</strong></td>
                <td>${e.lastDate}</td>
                <td><span class="status-badge ${statusMap[e.status].class}">${statusMap[e.status].text}</span></td>
                <td>
                  <button class="card-action-btn" onclick="App.showToast('查看考核详情')">详情</button>
                  ${e.status === 'upcoming' ? `<button class="card-action-btn primary" onclick="App.showToast('已复制试卷生成提示词')">出试卷</button>` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  /**
   * 晋升追踪
   * V4.2 第二阶段重构：使用 PROMOTION_TRACKING 完整数据模型
   *   - 顶部统计概览（在途/at_risk/本月预计/已培养SD+）
   *   - 筛选器（领域/阶衔/状态）
   *   - 升级版卡片（多维评分 + 里程碑进度 + 进度条）
   *   - 详情 modal（点击卡片展开完整晋升路径）
   */
  renderHubPromotion() {
    const container = document.getElementById('hub-promotion');
    if (!container) return;

    // 兼容旧数据：若 PROMOTION_TRACKING 未定义则回退
    const trackingData = (typeof PROMOTION_TRACKING !== 'undefined') ? PROMOTION_TRACKING : [];

    // 状态映射
    const statusMap = {
      on_track: { text: '进度正常', class: 'active', color: '#4CAF50' },
      at_risk: { text: '需关注', class: 'need_optimize', color: '#FF9800' },
      completed: { text: '已晋升', class: 'completed', color: '#2196F3' }
    };

    // 领域标签
    const domainLabels = { social: '自媒体', community: '社群', offline: '线下', exp_center: '体验馆', null: '跨领域' };

    // 计算统计数据
    const totalInTrack = trackingData.length;
    const atRiskCount = trackingData.filter(p => p.status === 'at_risk').length;
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentMonthExpected = trackingData.filter(p => p.estimatedDate && p.estimatedDate.startsWith(currentMonth)).length;
    const sdPlusCount = trackingData.filter(p => p.currentRank === 'SD+' || p.targetRank === 'SD+').length;

    // 筛选状态（默认无筛选）
    if (!this.state.promotionFilter) {
      this.state.promotionFilter = { domain: 'all', rank: 'all', status: 'all' };
    }
    const filter = this.state.promotionFilter;

    // 应用筛选
    const filteredData = trackingData.filter(p => {
      if (filter.domain !== 'all' && p.domain !== filter.domain && !(filter.domain === 'null' && p.domain === null)) return false;
      if (filter.rank !== 'all' && p.currentRank !== filter.rank) return false;
      if (filter.status !== 'all' && p.status !== filter.status) return false;
      return true;
    });

    // 获取阶衔定义中的图标
    const getRankIcon = (code) => {
      const def = (typeof getRankDefinition === 'function') ? getRankDefinition(code) : null;
      return def ? def.icon : '';
    };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <!-- 顶部统计概览 -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; padding: 14px 16px; border-left: 4px solid var(--color-primary);">
            <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px;">📈 在途晋升</div>
            <div style="font-size: 22px; font-weight: 700; color: var(--color-primary);">${totalInTrack}</div>
            <div style="font-size: 10px; color: var(--color-text-secondary);">人正在进行中</div>
          </div>
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; padding: 14px 16px; border-left: 4px solid #FF9800;">
            <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px;">⚠️ 需关注</div>
            <div style="font-size: 22px; font-weight: 700; color: #FF9800;">${atRiskCount}</div>
            <div style="font-size: 10px; color: var(--color-text-secondary);">人进度有风险</div>
          </div>
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; padding: 14px 16px; border-left: 4px solid #2196F3;">
            <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px;">🗓️ 本月预计</div>
            <div style="font-size: 22px; font-weight: 700; color: #2196F3;">${currentMonthExpected}</div>
            <div style="font-size: 10px; color: var(--color-text-secondary);">人预计本月达成</div>
          </div>
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; padding: 14px 16px; border-left: 4px solid #9C27B0;">
            <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px;">👑 SD+梯队</div>
            <div style="font-size: 22px; font-weight: 700; color: #9C27B0;">${sdPlusCount}</div>
            <div style="font-size: 10px; color: var(--color-text-secondary);">人涉及SD+阶衔</div>
          </div>
        </div>

        <!-- 筛选器 -->
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding: 12px 16px; background: var(--color-surface); border-radius: 8px; border: 1px solid var(--color-border); flex-wrap: wrap;">
          <span style="font-size: 13px; font-weight: 600; color: var(--color-primary);">🔍 筛选：</span>
          <select onchange="App.filterPromotion('domain', this.value)" style="padding: 5px 10px; border-radius: 5px; border: 1px solid var(--color-border); background: var(--color-surface); font-size: 12px; color: var(--color-primary); cursor: pointer;">
            <option value="all" ${filter.domain === 'all' ? 'selected' : ''}>全部领域</option>
            <option value="social" ${filter.domain === 'social' ? 'selected' : ''}>自媒体</option>
            <option value="community" ${filter.domain === 'community' ? 'selected' : ''}>社群</option>
            <option value="offline" ${filter.domain === 'offline' ? 'selected' : ''}>线下</option>
            <option value="exp_center" ${filter.domain === 'exp_center' ? 'selected' : ''}>体验馆</option>
            <option value="null" ${filter.domain === 'null' ? 'selected' : ''}>跨领域</option>
          </select>
          <select onchange="App.filterPromotion('rank', this.value)" style="padding: 5px 10px; border-radius: 5px; border: 1px solid var(--color-border); background: var(--color-surface); font-size: 12px; color: var(--color-primary); cursor: pointer;">
            <option value="all" ${filter.rank === 'all' ? 'selected' : ''}>全部阶衔</option>
            <option value="D" ${filter.rank === 'D' ? 'selected' : ''}>D 顾客</option>
            <option value="D3" ${filter.rank === 'D3' ? 'selected' : ''}>D3 活跃会员</option>
            <option value="D5" ${filter.rank === 'D5' ? 'selected' : ''}>D5 初级经营者</option>
            <option value="D8" ${filter.rank === 'D8' ? 'selected' : ''}>D8 中级经营者</option>
            <option value="SD" ${filter.rank === 'SD' ? 'selected' : ''}>SD 高级经营者</option>
            <option value="ED" ${filter.rank === 'ED' ? 'selected' : ''}>ED 执行总监</option>
          </select>
          <select onchange="App.filterPromotion('status', this.value)" style="padding: 5px 10px; border-radius: 5px; border: 1px solid var(--color-border); background: var(--color-surface); font-size: 12px; color: var(--color-primary); cursor: pointer;">
            <option value="all" ${filter.status === 'all' ? 'selected' : ''}>全部状态</option>
            <option value="on_track" ${filter.status === 'on_track' ? 'selected' : ''}>进度正常</option>
            <option value="at_risk" ${filter.status === 'at_risk' ? 'selected' : ''}>需关注</option>
          </select>
          <span style="margin-left: auto; font-size: 11px; color: var(--color-text-secondary);">显示 ${filteredData.length} / ${totalInTrack} 条</span>
        </div>

        <!-- 晋升卡片网格 -->
        ${filteredData.length === 0 ? `
          <div style="padding: 40px; text-align: center; color: var(--color-text-secondary); font-size: 13px;">
            <div style="font-size: 36px; margin-bottom: 8px;">📭</div>
            <div>无符合条件的晋升记录</div>
          </div>
        ` : `
          <div class="card-grid">
            ${filteredData.map(p => {
              const progress = (typeof calcPromotionProgress === 'function') ? calcPromotionProgress(p.score) : 0;
              const milestoneCompletion = (typeof calcMilestoneCompletion === 'function') ? calcMilestoneCompletion(p.milestones) : 0;
              const nextMilestone = p.milestones ? p.milestones.find(m => !m.completed) : null;
              const statusInfo = statusMap[p.status] || statusMap.on_track;
              const currentIcon = getRankIcon(p.currentRank);
              const targetIcon = getRankIcon(p.targetRank);
              return `
                <div class="content-card" style="cursor: pointer;" onclick="App.showPromotionDetail('${p.id}')">
                  <div class="card-header">
                    <div class="card-title">${p.avatar} ${p.name} · ${currentIcon} ${p.currentRank} → ${targetIcon} ${p.targetRank}</div>
                    <span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>
                  </div>
                  <div class="card-tags">
                    <span class="card-tag">#${p.currentRank}</span>
                    <span class="card-tag">#目标${p.targetRank}</span>
                    ${p.domain ? `<span class="card-tag">#${domainLabels[p.domain] || p.domain}</span>` : '<span class="card-tag">#跨领域</span>'}
                  </div>
                  <div class="card-metrics">
                    <span class="metric-item">导师: <strong>${p.mentor}</strong></span>
                    <span class="metric-item">预计: <strong>${p.estimatedDate}</strong></span>
                  </div>
                  <!-- 多维评分条 -->
                  <div style="margin: 8px 0; padding: 8px 10px; background: var(--color-bg); border-radius: 6px;">
                    <div style="font-size: 10px; color: var(--color-text-secondary); margin-bottom: 6px; font-weight: 600;">📊 多维评分</div>
                    ${[
                      { label: '业绩', value: p.score.performance, color: '#4CAF50' },
                      { label: '团队', value: p.score.teamSize, color: '#2196F3' },
                      { label: '培训', value: p.score.training, color: '#FF9800' },
                      { label: '活跃', value: p.score.activity, color: '#9C27B0' }
                    ].map(s => `
                      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
                        <span style="font-size: 10px; color: var(--color-text-secondary); width: 28px;">${s.label}</span>
                        <div style="flex: 1; height: 4px; background: var(--color-border); border-radius: 2px; overflow: hidden;">
                          <div style="height: 100%; width: ${s.value}%; background: ${s.color}; border-radius: 2px;"></div>
                        </div>
                        <span style="font-size: 10px; color: var(--color-primary); width: 24px; text-align: right; font-weight: 600;">${s.value}</span>
                      </div>
                    `).join('')}
                  </div>
                  <!-- 整体进度条 -->
                  <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px; display: flex; justify-content: space-between;">
                    <span>📈 整体进度</span>
                    <span style="font-weight: 600; color: var(--color-primary);">${progress}%</span>
                  </div>
                  <div style="height: 6px; background: var(--color-bg); border-radius: 3px; margin-bottom: 8px; overflow: hidden;">
                    <div style="height: 100%; width: ${progress}%; background: linear-gradient(to right, ${statusInfo.color}, ${statusInfo.color}aa); border-radius: 3px;"></div>
                  </div>
                  <!-- 里程碑完成率 -->
                  <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px; display: flex; justify-content: space-between;">
                    <span>🎯 里程碑</span>
                    <span style="font-weight: 600; color: var(--color-primary);">${milestoneCompletion}%</span>
                  </div>
                  <div style="height: 4px; background: var(--color-bg); border-radius: 2px; margin-bottom: 8px; overflow: hidden;">
                    <div style="height: 100%; width: ${milestoneCompletion}%; background: var(--color-accent); border-radius: 2px;"></div>
                  </div>
                  ${nextMilestone ? `<div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 8px;">📌 下一里程碑: <strong style="color: var(--color-primary);">${nextMilestone.title}</strong>（${nextMilestone.current}/${nextMilestone.target}，截止 ${nextMilestone.dueDate}）</div>` : '<div style="font-size: 11px; color: var(--success); margin-bottom: 8px;">✅ 全部里程碑已完成</div>'}
                  <div class="card-actions">
                    <button class="card-action-btn primary" onclick="event.stopPropagation(); App.showPromotionDetail('${p.id}')">详情</button>
                    <button class="card-action-btn" onclick="event.stopPropagation(); App.showToast('已复制晋升计划：${p.name}')">📋 计划</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  },

  /**
   * 晋升追踪筛选（V4.2 第二阶段新增）
   */
  filterPromotion(field, value) {
    if (!this.state.promotionFilter) this.state.promotionFilter = { domain: 'all', rank: 'all', status: 'all' };
    this.state.promotionFilter[field] = value;
    this.renderHubPromotion();
  },

  /**
   * 显示晋升详情 Modal（V4.2 第二阶段新增）
   * 展示完整晋升路径、里程碑清单、历史记录
   */
  showPromotionDetail(promotionId) {
    const trackingData = (typeof PROMOTION_TRACKING !== 'undefined') ? PROMOTION_TRACKING : [];
    const p = trackingData.find(item => item.id === promotionId);
    if (!p) return;

    const progress = (typeof calcPromotionProgress === 'function') ? calcPromotionProgress(p.score) : 0;
    const milestoneCompletion = (typeof calcMilestoneCompletion === 'function') ? calcMilestoneCompletion(p.milestones) : 0;
    const currentDef = (typeof getRankDefinition === 'function') ? getRankDefinition(p.currentRank) : null;
    const targetDef = (typeof getRankDefinition === 'function') ? getRankDefinition(p.targetRank) : null;
    const statusMap = {
      on_track: { text: '进度正常', class: 'active' },
      at_risk: { text: '需关注', class: 'need_optimize' }
    };
    const statusInfo = statusMap[p.status] || statusMap.on_track;

    // 构建晋升路径（从 D 到 targetRank 的所有阶衔）
    const allRanks = (typeof RANK_DEFINITIONS !== 'undefined') ? RANK_DEFINITIONS : [];
    const currentLevel = currentDef ? currentDef.level : 1;
    const targetLevel = targetDef ? targetDef.level : 1;
    const pathRanks = allRanks.filter(r => r.level >= currentLevel && r.level <= targetLevel);

    const modal = document.getElementById('modal-overlay') || this._ensureModalOverlay();
    modal.innerHTML = `
      <div class="modal" style="max-width: 720px; max-height: 85vh; overflow-y: auto;">
        <div class="modal-header">
          <h3>${p.avatar} ${p.name} 的晋升详情</h3>
          <button class="modal-close" onclick="App.hideModal()">×</button>
        </div>
        <div class="modal-body" style="padding: 20px 24px;">
          <!-- 基础信息 -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; padding: 14px; background: var(--color-bg); border-radius: 8px;">
            <div><span style="color: var(--color-text-secondary); font-size: 12px;">当前阶衔：</span><strong>${currentDef ? currentDef.icon + ' ' + currentDef.label : p.currentRank} (${p.currentRank})</strong></div>
            <div><span style="color: var(--color-text-secondary); font-size: 12px;">目标阶衔：</span><strong>${targetDef ? targetDef.icon + ' ' + targetDef.label : p.targetRank} (${p.targetRank})</strong></div>
            <div><span style="color: var(--color-text-secondary); font-size: 12px;">导师：</span><strong>${p.mentor}</strong></div>
            <div><span style="color: var(--color-text-secondary); font-size: 12px;">开始日期：</span><strong>${p.startedAt}</strong></div>
            <div><span style="color: var(--color-text-secondary); font-size: 12px;">预计达成：</span><strong>${p.estimatedDate}</strong></div>
            <div><span style="color: var(--color-text-secondary); font-size: 12px;">状态：</span><span class="status-badge ${statusInfo.class}">${statusInfo.text}</span></div>
          </div>

          <!-- 晋升路径可视化 -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 13px; font-weight: 600; color: var(--color-primary); margin-bottom: 10px;">🛤️ 晋升路径</div>
            <div style="display: flex; align-items: center; gap: 4px; padding: 12px; background: var(--color-bg); border-radius: 8px; overflow-x: auto;">
              ${pathRanks.map((r, idx) => {
                const isCurrent = r.code === p.currentRank;
                const isTarget = r.code === p.targetRank;
                const isPassed = r.level < currentLevel;
                return `
                  <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                    <div style="text-align: center; padding: 8px 12px; border-radius: 8px; background: ${isCurrent ? 'var(--color-primary)' : (isTarget ? 'rgba(76,175,80,0.15)' : (isPassed ? 'var(--color-border)' : 'var(--color-surface)'))}; color: ${isCurrent ? 'white' : 'var(--color-primary)'}; border: 2px solid ${isTarget ? 'var(--success)' : 'transparent'}; min-width: 70px;">
                      <div style="font-size: 20px;">${r.icon}</div>
                      <div style="font-size: 11px; font-weight: 600;">${r.code}</div>
                      <div style="font-size: 9px; opacity: 0.8;">${r.label}</div>
                    </div>
                    ${idx < pathRanks.length - 1 ? '<div style="color: var(--color-text-secondary); font-size: 16px;">→</div>' : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 多维评分 -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 13px; font-weight: 600; color: var(--color-primary); margin-bottom: 10px;">📊 多维评分（整体进度 ${progress}%）</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
              ${[
                { label: '业绩表现', value: p.score.performance, color: '#4CAF50', icon: '💰' },
                { label: '团队规模', value: p.score.teamSize, color: '#2196F3', icon: '👥' },
                { label: '培训完成', value: p.score.training, color: '#FF9800', icon: '🎓' },
                { label: '活跃程度', value: p.score.activity, color: '#9C27B0', icon: '⚡' }
              ].map(s => `
                <div style="padding: 10px 12px; background: var(--color-bg); border-radius: 6px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-size: 12px; color: var(--color-primary);">${s.icon} ${s.label}</span>
                    <span style="font-size: 14px; font-weight: 700; color: ${s.color};">${s.value}</span>
                  </div>
                  <div style="height: 5px; background: var(--color-border); border-radius: 3px; overflow: hidden;">
                    <div style="height: 100%; width: ${s.value}%; background: ${s.color}; border-radius: 3px;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 里程碑清单 -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 13px; font-weight: 600; color: var(--color-primary); margin-bottom: 10px;">🎯 里程碑清单（完成率 ${milestoneCompletion}%）</div>
            <div style="padding: 12px; background: var(--color-bg); border-radius: 8px;">
              ${p.milestones.map(m => `
                <div style="display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--color-border);">
                  <span style="font-size: 16px;">${m.completed ? '✅' : '⭕'}</span>
                  <div style="flex: 1;">
                    <div style="font-size: 12px; font-weight: 500; color: ${m.completed ? 'var(--color-text-secondary)' : 'var(--color-primary)'}; ${m.completed ? 'text-decoration: line-through;' : ''}">${m.title}</div>
                    <div style="font-size: 10px; color: var(--color-text-secondary);">进度：${m.current}/${m.target} · 截止 ${m.dueDate}</div>
                  </div>
                  ${m.completed ? '<span style="font-size: 10px; padding: 2px 6px; border-radius: 3px; background: rgba(76,175,80,0.15); color: var(--success);">已完成</span>' : `<span style="font-size: 10px; padding: 2px 6px; border-radius: 3px; background: rgba(255,152,0,0.15); color: #FF9800;">${Math.round((m.current/m.target)*100)}%</span>`}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 历史记录 -->
          ${p.history && p.history.length > 0 ? `
            <div style="margin-bottom: 12px;">
              <div style="font-size: 13px; font-weight: 600; color: var(--color-primary); margin-bottom: 10px;">📜 晋升历史</div>
              <div style="padding: 12px; background: var(--color-bg); border-radius: 8px;">
                ${p.history.map(h => `
                  <div style="display: flex; gap: 10px; padding: 6px 0; border-bottom: 1px dashed var(--color-border);">
                    <span style="font-size: 11px; color: var(--color-text-secondary); width: 100px; flex-shrink: 0;">${h.date}</span>
                    <span style="font-size: 12px; color: var(--color-primary);"><strong>${h.fromRank}</strong> → <strong>${h.toRank}</strong></span>
                    <span style="font-size: 11px; color: var(--color-text-secondary); flex: 1;">${h.note}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : '<div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 12px;">（暂无历史晋升记录，这是首次进入阶衔体系）</div>'}

          <!-- 目标阶衔晋升条件 -->
          ${targetDef && targetDef.promotionCriteria ? `
            <div>
              <div style="font-size: 13px; font-weight: 600; color: var(--color-primary); margin-bottom: 10px;">📌 ${targetDef.label}（${targetDef.code}）晋升条件参考</div>
              <div style="padding: 12px; background: var(--color-bg); border-radius: 8px; font-size: 12px; line-height: 1.8;">
                ${Object.entries(targetDef.promotionCriteria).map(([k, v]) => {
                  const labelMap = { consumption: '消费', teamSize: '团队', performance: '业绩', training: '培训', activity: '活跃' };
                  return `<div><span style="color: var(--color-text-secondary);">${labelMap[k] || k}：</span><strong>${v}</strong></div>`;
                }).join('')}
              </div>
            </div>
          ` : ''}
        </div>
        <div class="modal-footer">
          <button class="card-action-btn" onclick="App.hideModal()">关闭</button>
          <button class="card-action-btn primary" onclick="App.showToast('已复制 ${p.name} 的晋升计划'); App.hideModal();">📋 复制晋升计划</button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
  },

  /**
   * 确保 modal overlay 存在（V4.2 第二阶段新增）
   */
  _ensureModalOverlay() {
    let modal = document.getElementById('modal-overlay');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-overlay';
      modal.className = 'modal-overlay';
      modal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; padding: 20px;';
      modal.onclick = (e) => { if (e.target === modal) this.hideModal(); };
      document.body.appendChild(modal);
    }
    return modal;
  },

  /**
   * 隐藏 modal（V4.2 第二阶段新增）
   */
  hideModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) modal.style.display = 'none';
  },

  /* ========== V4.2 第二阶段：委托管理 ========== */

  /**
   * 委托管理主渲染函数
   * 包含：统计概览 + 筛选器 + 委托卡片列表 + 创建委托按钮
   */
  renderHubDelegation() {
    const container = document.getElementById('hub-delegation');
    if (!container) return;

    const delegations = (typeof DELEGATION_DATA !== 'undefined') ? DELEGATION_DATA : [];

    // 统计
    const total = delegations.length;
    const activeCount = delegations.filter(d => d.status === 'active').length;
    const pendingCount = delegations.filter(d => d.status === 'pending').length;
    const completedCount = delegations.filter(d => d.status === 'completed').length;
    const totalTasks = delegations.reduce((sum, d) => sum + (d.tasksTotal || 0), 0);
    const completedTasks = delegations.reduce((sum, d) => sum + (d.tasksCompleted || 0), 0);
    const taskCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 筛选状态
    if (!this.state.delegationFilter) this.state.delegationFilter = { status: 'all', type: 'all' };
    const filter = this.state.delegationFilter;
    const filtered = delegations.filter(d => {
      if (filter.status !== 'all' && d.status !== filter.status) return false;
      if (filter.type !== 'all' && d.type !== filter.type) return false;
      return true;
    });

    // 是否可创建委托（源头/SD+/管理员）
    const canCreate = (typeof Auth !== 'undefined') && Auth.currentUser &&
      (Auth.isAdmin() || Auth.currentUser.isLead || Auth.currentUser.isSDPlus);

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <!-- 顶部统计概览 -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; padding: 14px 16px; border-left: 4px solid var(--color-primary);">
            <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px;">📋 委托总数</div>
            <div style="font-size: 22px; font-weight: 700; color: var(--color-primary);">${total}</div>
            <div style="font-size: 10px; color: var(--color-text-secondary);">进行中 ${activeCount} · 待接受 ${pendingCount}</div>
          </div>
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; padding: 14px 16px; border-left: 4px solid #4CAF50;">
            <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px;">✅ 进行中</div>
            <div style="font-size: 22px; font-weight: 700; color: #4CAF50;">${activeCount}</div>
            <div style="font-size: 10px; color: var(--color-text-secondary);">已接受并执行中</div>
          </div>
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; padding: 14px 16px; border-left: 4px solid #FF9800;">
            <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px;">⏳ 待接受</div>
            <div style="font-size: 22px; font-weight: 700; color: #FF9800;">${pendingCount}</div>
            <div style="font-size: 10px; color: var(--color-text-secondary);">等待被委托人确认</div>
          </div>
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; padding: 14px 16px; border-left: 4px solid #2196F3;">
            <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px;">📊 任务完成率</div>
            <div style="font-size: 22px; font-weight: 700; color: #2196F3;">${taskCompletion}%</div>
            <div style="font-size: 10px; color: var(--color-text-secondary);">${completedTasks} / ${totalTasks} 个任务</div>
          </div>
        </div>

        <!-- 操作栏 -->
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding: 12px 16px; background: var(--color-surface); border-radius: 8px; border: 1px solid var(--color-border); flex-wrap: wrap;">
          <span style="font-size: 13px; font-weight: 600; color: var(--color-primary);">🔍 筛选：</span>
          <select onchange="App.filterDelegation('status', this.value)" style="padding: 5px 10px; border-radius: 5px; border: 1px solid var(--color-border); background: var(--color-surface); font-size: 12px; color: var(--color-primary); cursor: pointer;">
            <option value="all" ${filter.status === 'all' ? 'selected' : ''}>全部状态</option>
            <option value="active" ${filter.status === 'active' ? 'selected' : ''}>进行中</option>
            <option value="pending" ${filter.status === 'pending' ? 'selected' : ''}>待接受</option>
            <option value="completed" ${filter.status === 'completed' ? 'selected' : ''}>已完成</option>
          </select>
          <select onchange="App.filterDelegation('type', this.value)" style="padding: 5px 10px; border-radius: 5px; border: 1px solid var(--color-border); background: var(--color-surface); font-size: 12px; color: var(--color-primary); cursor: pointer;">
            <option value="all" ${filter.type === 'all' ? 'selected' : ''}>全部类型</option>
            ${(typeof DELEGATION_TYPES !== 'undefined' ? DELEGATION_TYPES : []).map(t => `<option value="${t.code}" ${filter.type === t.code ? 'selected' : ''}>${t.icon} ${t.label}</option>`).join('')}
          </select>
          <span style="margin-left: auto; font-size: 11px; color: var(--color-text-secondary);">显示 ${filtered.length} / ${total} 条</span>
          ${canCreate ? `<button class="card-action-btn primary" style="font-size: 12px; padding: 6px 14px;" onclick="App.showCreateDelegationForm()">＋ 创建委托</button>` : ''}
        </div>

        <!-- 委托卡片列表 -->
        ${filtered.length === 0 ? `
          <div style="padding: 40px; text-align: center; color: var(--color-text-secondary); font-size: 13px;">
            <div style="font-size: 36px; margin-bottom: 8px;">📭</div>
            <div>暂无符合条件的委托记录</div>
          </div>
        ` : `
          <div class="card-grid">
            ${filtered.map(d => {
              const typeMeta = (typeof getDelegationType === 'function') ? getDelegationType(d.type) : { icon: '📎', label: d.type };
              const statusMeta = (typeof getDelegationStatus === 'function') ? getDelegationStatus(d.status) : { text: d.status, class: 'draft', color: '#757575' };
              return `
                <div class="content-card" style="cursor: pointer;" onclick="App.showDelegationDetail('${d.id}')">
                  <div class="card-header">
                    <div class="card-title">${typeMeta.icon} ${d.title}</div>
                    <span class="status-badge ${statusMeta.class}">${statusMeta.text}</span>
                  </div>
                  <div class="card-tags">
                    <span class="card-tag">#${typeMeta.label}</span>
                    <span class="card-tag">#${d.delegatorRank}→${d.delegateeRank}</span>
                  </div>
                  <div class="card-metrics">
                    <span class="metric-item">委托人: <strong>${d.delegator}</strong></span>
                    <span class="metric-item">被委托: <strong>${d.delegatee}</strong></span>
                  </div>
                  <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 8px; line-height: 1.5;">📌 ${d.description}</div>
                  <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px; display: flex; justify-content: space-between;">
                    <span>🎯 任务进度</span>
                    <span style="font-weight: 600; color: var(--color-primary);">${d.tasksCompleted}/${d.tasksTotal}（${d.progress}%）</span>
                  </div>
                  <div style="height: 6px; background: var(--color-bg); border-radius: 3px; margin-bottom: 8px; overflow: hidden;">
                    <div style="height: 100%; width: ${d.progress}%; background: ${statusMeta.color}; border-radius: 3px;"></div>
                  </div>
                  <div style="font-size: 10px; color: var(--color-text-secondary); margin-bottom: 8px;">⏰ ${d.startDate} ~ ${d.endDate}</div>
                  <div class="card-actions">
                    <button class="card-action-btn primary" onclick="event.stopPropagation(); App.showDelegationDetail('${d.id}')">详情</button>
                    ${d.status === 'pending' ? `<button class="card-action-btn" onclick="event.stopPropagation(); App.acceptDelegation('${d.id}')">接受</button>` : ''}
                    ${d.status === 'active' ? `<button class="card-action-btn" onclick="event.stopPropagation(); App.updateDelegationProgress('${d.id}')">更新进度</button>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  },

  /**
   * 委托筛选
   */
  filterDelegation(field, value) {
    if (!this.state.delegationFilter) this.state.delegationFilter = { status: 'all', type: 'all' };
    this.state.delegationFilter[field] = value;
    this.renderHubDelegation();
  },

  /**
   * 委托详情 Modal
   */
  showDelegationDetail(delegationId) {
    const delegations = (typeof DELEGATION_DATA !== 'undefined') ? DELEGATION_DATA : [];
    const d = delegations.find(item => item.id === delegationId);
    if (!d) return;

    const typeMeta = (typeof getDelegationType === 'function') ? getDelegationType(d.type) : { icon: '📎', label: d.type, desc: '' };
    const statusMeta = (typeof getDelegationStatus === 'function') ? getDelegationStatus(d.status) : { text: d.status, color: '#757575' };

    const modal = this._ensureModalOverlay();
    modal.innerHTML = `
      <div class="modal" style="max-width: 680px; max-height: 85vh; overflow-y: auto;">
        <div class="modal-header">
          <h3>${typeMeta.icon} ${d.title}</h3>
          <button class="modal-close" onclick="App.hideModal()">×</button>
        </div>
        <div class="modal-body" style="padding: 20px 24px;">
          <!-- 基础信息 -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; padding: 14px; background: var(--color-bg); border-radius: 8px;">
            <div><span style="color: var(--color-text-secondary); font-size: 12px;">委托类型：</span><strong>${typeMeta.icon} ${typeMeta.label}</strong></div>
            <div><span style="color: var(--color-text-secondary); font-size: 12px;">状态：</span><span class="status-badge ${statusMeta.class}">${statusMeta.text}</span></div>
            <div><span style="color: var(--color-text-secondary); font-size: 12px;">委托人：</span><strong>${d.delegator}（${d.delegatorRank}）</strong></div>
            <div><span style="color: var(--color-text-secondary); font-size: 12px;">被委托人：</span><strong>${d.delegatee}（${d.delegateeRank}）</strong></div>
            <div><span style="color: var(--color-text-secondary); font-size: 12px;">开始日期：</span><strong>${d.startDate}</strong></div>
            <div><span style="color: var(--color-text-secondary); font-size: 12px;">结束日期：</span><strong>${d.endDate}</strong></div>
            <div style="grid-column: span 2;"><span style="color: var(--color-text-secondary); font-size: 12px;">委托范围：</span><strong>${d.scope}</strong></div>
            <div style="grid-column: span 2;"><span style="color: var(--color-text-secondary); font-size: 12px;">创建时间：</span><strong>${d.createdAt}</strong></div>
          </div>

          <!-- 委托描述 -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 13px; font-weight: 600; color: var(--color-primary); margin-bottom: 8px;">📝 委托说明</div>
            <div style="padding: 12px; background: var(--color-bg); border-radius: 8px; font-size: 12px; line-height: 1.6; color: var(--color-primary);">${d.description}</div>
          </div>

          <!-- 任务进度 -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 13px; font-weight: 600; color: var(--color-primary); margin-bottom: 10px;">🎯 任务进度（${d.progress}%）</div>
            <div style="padding: 12px; background: var(--color-bg); border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-size: 12px; color: var(--color-primary);">已完成 ${d.tasksCompleted} / ${d.tasksTotal} 个任务</span>
                <span style="font-size: 12px; font-weight: 700; color: ${statusMeta.color};">${d.progress}%</span>
              </div>
              <div style="height: 8px; background: var(--color-surface); border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: ${d.progress}%; background: ${statusMeta.color}; border-radius: 4px;"></div>
              </div>
            </div>
          </div>

          <!-- 备注 -->
          ${d.notes ? `
            <div style="margin-bottom: 12px;">
              <div style="font-size: 13px; font-weight: 600; color: var(--color-primary); margin-bottom: 8px;">💡 委托备注</div>
              <div style="padding: 12px; background: var(--color-bg); border-radius: 8px; font-size: 12px; line-height: 1.6; color: var(--color-text-secondary); border-left: 3px solid var(--color-accent);">${d.notes}</div>
            </div>
          ` : ''}

          <!-- 委托类型说明 -->
          <div>
            <div style="font-size: 13px; font-weight: 600; color: var(--color-primary); margin-bottom: 8px;">📋 委托类型说明</div>
            <div style="padding: 12px; background: var(--color-bg); border-radius: 8px; font-size: 12px; color: var(--color-text-secondary);">${typeMeta.desc || '—'}</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="card-action-btn" onclick="App.hideModal()">关闭</button>
          ${d.status === 'pending' ? `<button class="card-action-btn primary" onclick="App.acceptDelegation('${d.id}'); App.hideModal();">✅ 接受委托</button>` : ''}
          ${d.status === 'active' ? `<button class="card-action-btn primary" onclick="App.updateDelegationProgress('${d.id}'); App.hideModal();">📊 更新进度</button>` : ''}
          <button class="card-action-btn" onclick="App.showToast('已复制委托信息：${d.title}'); App.hideModal();">📋 复制</button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
  },

  /**
   * 接受委托（将 pending 状态改为 active）
   */
  acceptDelegation(delegationId) {
    const delegations = (typeof DELEGATION_DATA !== 'undefined') ? DELEGATION_DATA : [];
    const d = delegations.find(item => item.id === delegationId);
    if (!d || d.status !== 'pending') return;

    d.status = 'active';
    this.showToast(`✅ 已接受委托：${d.title}`);
    this.renderHubDelegation();
  },

  /**
   * 更新委托进度（演示用：每次调用推进 10%）
   */
  updateDelegationProgress(delegationId) {
    const delegations = (typeof DELEGATION_DATA !== 'undefined') ? DELEGATION_DATA : [];
    const d = delegations.find(item => item.id === delegationId);
    if (!d || d.status !== 'active') return;

    // 演示：进度+10%，对应任务数+1（不超过总数）
    d.progress = Math.min(100, d.progress + 10);
    d.tasksCompleted = Math.min(d.tasksTotal, d.tasksCompleted + 1);
    if (d.progress >= 100) {
      d.status = 'completed';
      this.showToast(`🎉 委托已完成：${d.title}`);
    } else {
      this.showToast(`📊 进度已更新：${d.title} → ${d.progress}%`);
    }
    this.renderHubDelegation();
  },

  /**
   * 显示创建委托表单 Modal
   */
  showCreateDelegationForm() {
    // 权限校验
    if (typeof Auth === 'undefined' || !Auth.currentUser) {
      this.showToast('请先登录');
      return;
    }
    if (!Auth.isAdmin() && !Auth.currentUser.isLead && !Auth.currentUser.isSDPlus) {
      this.showToast('⚠️ 权限不足：仅团队源头/SD+/管理员可创建委托');
      return;
    }

    const types = (typeof DELEGATION_TYPES !== 'undefined') ? DELEGATION_TYPES : [];
    const currentUser = Auth.currentUser.name || Auth.currentUser.username;

    const modal = this._ensureModalOverlay();
    modal.innerHTML = `
      <div class="modal" style="max-width: 560px; max-height: 85vh; overflow-y: auto;">
        <div class="modal-header">
          <h3>＋ 创建新委托</h3>
          <button class="modal-close" onclick="App.hideModal()">×</button>
        </div>
        <div class="modal-body" style="padding: 20px 24px;">
          <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 16px; padding: 10px 12px; background: var(--color-bg); border-radius: 6px; border-left: 3px solid var(--color-accent);">
            💡 委托人默认为当前用户：<strong>${currentUser}</strong>。被委托人需为你的下属（阶衔低于你）。
          </div>

          <div style="display: grid; gap: 14px;">
            <div>
              <label style="display: block; font-size: 12px; font-weight: 600; color: var(--color-primary); margin-bottom: 6px;">委托标题 *</label>
              <input type="text" id="dlg-form-title" placeholder="如：社群内容审核委托" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-surface); font-size: 13px; color: var(--color-primary);">
            </div>

            <div>
              <label style="display: block; font-size: 12px; font-weight: 600; color: var(--color-primary); margin-bottom: 6px;">委托类型 *</label>
              <select id="dlg-form-type" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-surface); font-size: 13px; color: var(--color-primary);">
                ${types.map(t => `<option value="${t.code}">${t.icon} ${t.label} — ${t.desc}</option>`).join('')}
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: var(--color-primary); margin-bottom: 6px;">被委托人 *</label>
                <input type="text" id="dlg-form-delegatee" placeholder="如：李**" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-surface); font-size: 13px; color: var(--color-primary);">
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: var(--color-primary); margin-bottom: 6px;">被委托人阶衔</label>
                <select id="dlg-form-delegatee-rank" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-surface); font-size: 13px; color: var(--color-primary);">
                  <option value="D">D 顾客</option>
                  <option value="D3">D3 活跃会员</option>
                  <option value="D5" selected>D5 初级经营者</option>
                  <option value="D8">D8 中级经营者</option>
                  <option value="SD">SD 高级经营者</option>
                </select>
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 12px; font-weight: 600; color: var(--color-primary); margin-bottom: 6px;">委托范围 *</label>
              <input type="text" id="dlg-form-scope" placeholder="如：社群运营团队（12人）" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-surface); font-size: 13px; color: var(--color-primary);">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: var(--color-primary); margin-bottom: 6px;">开始日期 *</label>
                <input type="date" id="dlg-form-start" value="${new Date().toISOString().slice(0, 10)}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-surface); font-size: 13px; color: var(--color-primary);">
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: var(--color-primary); margin-bottom: 6px;">结束日期 *</label>
                <input type="date" id="dlg-form-end" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-surface); font-size: 13px; color: var(--color-primary);">
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 12px; font-weight: 600; color: var(--color-primary); margin-bottom: 6px;">委托说明</label>
              <textarea id="dlg-form-desc" rows="3" placeholder="详细说明委托内容、注意事项..." style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-surface); font-size: 13px; color: var(--color-primary); resize: vertical;"></textarea>
            </div>

            <div>
              <label style="display: block; font-size: 12px; font-weight: 600; color: var(--color-primary); margin-bottom: 6px;">备注（审核标准/紧急联系方式等）</label>
              <textarea id="dlg-form-notes" rows="2" placeholder="如：审核标准参照SOP，紧急事项请电话联系" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-surface); font-size: 13px; color: var(--color-primary); resize: vertical;"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="card-action-btn" onclick="App.hideModal()">取消</button>
          <button class="card-action-btn primary" onclick="App.submitCreateDelegation()">✅ 创建委托</button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
  },

  /**
   * 提交创建委托
   */
  submitCreateDelegation() {
    const title = document.getElementById('dlg-form-title').value.trim();
    const type = document.getElementById('dlg-form-type').value;
    const delegatee = document.getElementById('dlg-form-delegatee').value.trim();
    const delegateeRank = document.getElementById('dlg-form-delegatee-rank').value;
    const scope = document.getElementById('dlg-form-scope').value.trim();
    const startDate = document.getElementById('dlg-form-start').value;
    const endDate = document.getElementById('dlg-form-end').value;
    const description = document.getElementById('dlg-form-desc').value.trim();
    const notes = document.getElementById('dlg-form-notes').value.trim();

    // 校验必填项
    if (!title) { this.showToast('⚠️ 请填写委托标题'); return; }
    if (!delegatee) { this.showToast('⚠️ 请填写被委托人'); return; }
    if (!scope) { this.showToast('⚠️ 请填写委托范围'); return; }
    if (!startDate || !endDate) { this.showToast('⚠️ 请选择开始和结束日期'); return; }
    if (new Date(endDate) < new Date(startDate)) { this.showToast('⚠️ 结束日期不能早于开始日期'); return; }

    // 构造新委托记录
    const currentUser = (typeof Auth !== 'undefined' && Auth.currentUser) ? (Auth.currentUser.name || Auth.currentUser.username) : '未知';
    const currentRank = (typeof Auth !== 'undefined' && Auth.currentUser) ? (Auth.currentUser.rank || 'D5') : 'D5';

    const newDelegation = {
      id: 'dlg_new_' + Date.now(),
      title,
      type,
      delegator: currentUser,
      delegatorRank: currentRank,
      delegatee,
      delegateeRank,
      scope,
      description: description || '—',
      startDate,
      endDate,
      status: 'pending',
      progress: 0,
      tasksTotal: 1,
      tasksCompleted: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      notes: notes || ''
    };

    if (typeof DELEGATION_DATA !== 'undefined') {
      DELEGATION_DATA.unshift(newDelegation);
    }

    this.hideModal();
    this.showToast(`✅ 委托已创建：${title}（待${delegatee}接受）`);
    this.renderHubDelegation();
  },

  /**
   * 团队活动（原团队建设，改为参与式展示）
   */
  renderTeamActivity() {
    const container = document.getElementById('training-activity');
    if (!container) return;

    const statusMap = {
      completed: { text: '已完成', class: 'completed' },
      upcoming: { text: '即将进行', class: 'upcoming' }
    };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div class="card-grid">
          ${teamBuildingData.map(t => `
            <div class="content-card">
              <div class="card-header">
                <div class="card-title">${t.title}</div>
                <span class="status-badge ${statusMap[t.status].class}">${statusMap[t.status].text}</span>
              </div>
              <div class="card-tags">
                <span class="card-tag">#${t.type}</span>
              </div>
              <div class="card-metrics">
                <span class="metric-item">📅 <strong>${t.date}</strong></span>
                <span class="metric-item">👥 参与人数: <strong>${t.participants}</strong></span>
              </div>
              <div class="card-trend">📌 主题: ${t.theme}</div>
              ${t.feedback !== '--' ? `<div style="font-size: 12px; color: var(--color-success); margin-bottom: 8px;">⭐ 反馈评分: ${t.feedback}</div>` : ''}
              <div class="card-actions">
                <button class="card-action-btn primary" onclick="App.showToast('查看活动详情')">详情</button>
                <button class="card-action-btn" onclick="App.showToast('已复制活动方案')">📋 方案</button>
                ${t.status === 'upcoming' ? `<button class="card-action-btn" onclick="App.showToast('已复制活动提示词')">策划</button>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * 课件设计（仅课件管理员/管理员可见）
   */
  renderCoursewareDesign() {
    const container = document.getElementById('training-courseware');
    if (!container) return;

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div class="quick-actions">
          <div class="primary-action">
            <div class="primary-action-info">
              <h4>🎓 设计分级课程</h4>
              <p>为不同阶衔的经营者设计专属培训课程与考核体系</p>
            </div>
            <button class="primary-action-go" onclick="App.showToast('已复制课程设计提示词到剪贴板')">开始设计 →</button>
          </div>
          <div class="secondary-actions">
            <button class="secondary-action-btn" onclick="App.showToast('已复制提示词到剪贴板')">📝 出考核试卷</button>
            <button class="secondary-action-btn" onclick="App.showToast('已复制提示词到剪贴板')">🎤 写培训讲稿</button>
            <button class="secondary-action-btn" onclick="App.showToast('已复制提示词到剪贴板')">📐 管理培训框架</button>
          </div>
        </div>
        <div class="card-grid" style="margin-top: 20px;">
          ${(typeof coursewareData !== 'undefined' ? coursewareData : []).map(c => `
            <div class="content-card">
              <div class="card-header">
                <div class="card-title">${c.title || '课件'}</div>
                <span class="status-badge completed">已发布</span>
              </div>
              <div class="card-tags">
                <span class="card-tag">#${c.type || '通用'}</span>
                <span class="card-tag">#${c.level || '初级'}</span>
              </div>
              <div class="card-metrics">
                <span class="metric-item">📅 更新: <strong>${c.updatedAt || '2026-07-28'}</strong></span>
                <span class="metric-item">👥 学习人数: <strong>${c.students || '0'}</strong></span>
              </div>
              <div class="card-actions">
                <button class="card-action-btn primary" onclick="App.showToast('查看课件详情')">详情</button>
                <button class="card-action-btn" onclick="App.showToast('编辑课件')">✏️ 编辑</button>
                <button class="card-action-btn" onclick="App.showToast('已复制课件链接')">🔗 分享</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * 培训日历
   */
  renderTrainingCalendar() {
    const container = document.getElementById('training-calendar');
    if (!container) return;

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <table class="follow-table">
          <thead>
            <tr>
              <th>课程名称</th>
              <th>日期</th>
              <th>时间</th>
              <th>级别</th>
              <th>地点</th>
              <th>讲师</th>
              <th>报名人数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${trainingCalendarData.map(t => `
              <tr>
                <td><strong>${t.title}</strong></td>
                <td>${t.date}</td>
                <td>${t.time}</td>
                <td><span class="card-tag">#${t.level}</span></td>
                <td>${t.location}</td>
                <td>${t.instructor}</td>
                <td>${t.attendees}</td>
                <td>
                  <button class="card-action-btn primary" onclick="App.showToast('查看课程详情')">详情</button>
                  <button class="card-action-btn" onclick="App.showToast('已复制课程大纲')">大纲</button>
                  <button class="card-action-btn" onclick="App.showToast('已复制报名链接')">报名</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  /* ========== 运营中枢 - 系统设置 ========== */

  renderHubSettings() {
    const container = document.getElementById('hub-settings');
    if (!container) return;

    const s = systemSettings;

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div class="arch-card" style="margin-bottom: 16px;">
          <div class="arch-card-header">
            <h3>⚙️ 通用设置</h3>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px;">
            <div style="padding: 10px 14px; background: var(--color-bg); border-radius: 6px;">
              <div style="font-size: 12px; color: var(--color-text-secondary);">系统名称</div>
              <div style="font-weight: 600;">${s.general.systemName}</div>
            </div>
            <div style="padding: 10px 14px; background: var(--color-bg); border-radius: 6px;">
              <div style="font-size: 12px; color: var(--color-text-secondary);">版本</div>
              <div style="font-weight: 600;">${s.general.version}</div>
            </div>
            <div style="padding: 10px 14px; background: var(--color-bg); border-radius: 6px;">
              <div style="font-size: 12px; color: var(--color-text-secondary);">时区</div>
              <div style="font-weight: 600;">${s.general.timezone}</div>
            </div>
            <div style="padding: 10px 14px; background: var(--color-bg); border-radius: 6px;">
              <div style="font-size: 12px; color: var(--color-text-secondary);">语言</div>
              <div style="font-weight: 600;">${s.general.language}</div>
            </div>
            <div style="padding: 10px 14px; background: var(--color-bg); border-radius: 6px;">
              <div style="font-size: 12px; color: var(--color-text-secondary);">最近备份</div>
              <div style="font-weight: 600;">${s.general.lastBackup}</div>
            </div>
          </div>
        </div>

        <div class="arch-card" style="margin-bottom: 16px;">
          <div class="arch-card-header">
            <h3>🔔 通知设置</h3>
          </div>
          <div style="margin-top: 10px; font-size: 14px; line-height: 2;">
            <div>推送通知: ${s.notifications.pushEnabled ? '✅ 已启用' : '❌ 未启用'}</div>
            <div>邮件通知: ${s.notifications.emailEnabled ? '✅ 已启用' : '❌ 未启用'}</div>
            <div>日报推送: ${s.notifications.dailyReport ? '✅ 已启用' : '❌ 未启用'}</div>
            <div>周报推送: ${s.notifications.weeklyReport ? '✅ 已启用' : '❌ 未启用'}</div>
            <div>预警阈值: <strong>${s.notifications.alertThreshold}</strong></div>
          </div>
        </div>

        <div class="arch-card">
          <div class="arch-card-header">
            <h3>☁️ 云端同步</h3>
          </div>
          <div style="margin-top: 10px; font-size: 14px; line-height: 2;">
            <div>自动同步: ${s.autoSync.enabled ? '✅ 已启用' : '❌ 未启用'}</div>
            <div>同步频率: <strong>${s.autoSync.frequency}</strong></div>
            <div>最近同步: ${s.autoSync.lastSync}</div>
            <div>云存储: <strong>${s.autoSync.cloudStorage}</strong></div>
          </div>
          <div style="margin-top: 10px;">
            <button class="card-action-btn primary" onclick="App.showToast('立即同步到云端')">🔄 立即同步</button>
            <button class="card-action-btn" onclick="App.showToast('正在备份')">💾 备份</button>
            <button class="card-action-btn" onclick="App.showToast('进入设置编辑')">⚙️ 编辑</button>
          </div>
        </div>
      </div>
    `;
  },

  /* ========== 团队管理标签页 ========== */

  renderTeamTab() {
    const activeSub = this.state.activeSubTab['tab-team'];
    this.renderTeamSubTab(activeSub);
  },

  renderTeamSubTab(subTabId) {
    switch (subTabId) {
      case 'team-overview':
        this.renderTeamOverview();
        break;
      case 'team-members':
        this.renderTeamMembers();
        break;
      case 'team-growth':
        this.renderTeamGrowth();
        break;
      case 'team-traffic':
        this.renderTeamTraffic();
        break;
      case 'team-market':
        this.renderTeamMarket();
        break;
    }
  },

  /* --- 团队概览 --- */
  renderTeamOverview() {
    const container = document.getElementById('team-overview');
    if (!container) return;

    const isAdmin = (typeof Auth !== 'undefined' && Auth.isAdmin) ? Auth.isAdmin() : false;
    const isSDPlus = (typeof Auth !== 'undefined' && Auth.isSDPlus) ? Auth.isSDPlus() : false;
    const isTeamLead = (typeof Auth !== 'undefined' && Auth.isTeamLead) ? Auth.isTeamLead() : false;
    const userDomain = (typeof Auth !== 'undefined' && Auth.getDomain) ? Auth.getDomain() : null;

    let displayTeams = teamData;
    if (!isAdmin && !isSDPlus) {
      // 只显示自己所在领域的团队
      if (userDomain) {
        displayTeams = teamData.filter(t => t.domain === userDomain);
      } else {
        displayTeams = teamData.slice(0, 1);
      }
    }

    const domainLabels = { social: '自媒体', community: '社群运营', offline: '线下活动', exp_center: '体验馆', hub: '运营中枢' };
    const gradeColors = {
      A: '#4CAF50', B: '#2196F3', C: '#FF9800', D: '#F44336'
    };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <div style="font-size: 16px; font-weight: 700; color: var(--color-primary);">
              ${isAdmin ? '全部团队概览' : (isSDPlus ? '我的市场团队' : '我的团队')}
            </div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">共 ${displayTeams.length} 个团队</div>
          </div>
          ${isAdmin ? '<button class="secondary-action-btn" style="display:inline-block" onclick="App.showToast(\'已复制创建团队提示词\')">➕ 创建团队</button>' : ''}
        </div>
        <div class="card-grid">
          ${displayTeams.map(t => `
            <div class="content-card" style="cursor: pointer;" onclick="App.showToast('查看团队详情: ${t.name}')">
              <div class="card-header">
                <div class="card-title">${t.name}</div>
                <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;background:${gradeColors[t.contributionLevel]}20;color:${gradeColors[t.contributionLevel]};">
                  ${t.contributionLevel}类
                </span>
              </div>
              <div class="card-tags">
                <span class="card-tag">#${domainLabels[t.domain] || t.domain}</span>
                <span class="card-tag">#${t.track || '通用'}</span>
              </div>
              <div class="card-metrics">
                <span class="metric-item">👤 源头: <strong>${t.leadName}</strong></span>
                <span class="metric-item">👥 成员: <strong>${t.memberCount}人</strong></span>
              </div>
              ${t.domain === 'social' ? `
                <div class="card-metrics">
                  <span class="metric-item">📱 粉丝: <strong>${(t.totalFans || 0).toLocaleString()}</strong></span>
                  <span class="metric-item">📝 月产出: <strong>${t.monthlyOutput || 0}篇</strong></span>
                </div>
              ` : ''}
              ${t.domain === 'community' ? `
                <div class="card-metrics">
                  <span class="metric-item">💬 转化率: <strong>${t.conversionRate || '0%'}</strong></span>
                </div>
              ` : ''}
              <div class="card-trend" style="color:${t.growthTrend === 'up' ? '#4CAF50' : '#F44336'}">
                ${t.growthTrend === 'up' ? '📈 增长中' : '📉 需关注'}
              </div>
              <div class="card-actions">
                <button class="card-action-btn primary" onclick="event.stopPropagation(); App.showToast('查看团队详情')">详情</button>
                ${isAdmin ? `<button class="card-action-btn" onclick="event.stopPropagation(); App.showToast('编辑团队')">✏️ 编辑</button>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /* --- 成员管理 --- */
  renderTeamMembers() {
    const container = document.getElementById('team-members');
    if (!container) return;

    const isAdmin = (typeof Auth !== 'undefined' && Auth.isAdmin) ? Auth.isAdmin() : false;
    const canManage = (typeof Auth !== 'undefined' && Auth.canManageTeamMembers) ? Auth.canManageTeamMembers() : false;

    // 显示管理按钮
    const addBtn = document.getElementById('team-btn-add-member');
    const exportBtn = document.getElementById('team-btn-export');
    if (addBtn) addBtn.style.display = canManage ? '' : 'none';
    if (exportBtn) exportBtn.style.display = canManage ? '' : 'none';

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <table class="follow-table">
          <thead>
            <tr>
              <th>成员</th>
              <th>角色</th>
              <th>团队</th>
              <th>阶衔</th>
              <th>贡献评级</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${(typeof teamMembers !== 'undefined' ? teamMembers : [
              { name: '小王', role: '内容策划', team: '自媒体·营养学', rank: 'D5', grade: 'A', status: '活跃' },
              { name: '小李', role: '视频剪辑', team: '自媒体·营养学', rank: 'D3', grade: 'B', status: '活跃' },
              { name: '小赵', role: '内容运营', team: '社群运营·L1训练营', rank: 'D5', grade: 'A', status: '活跃' },
              { name: '小钱', role: '互动引导', team: '社群运营·L1训练营', rank: 'D3', grade: 'B', status: '活跃' },
              { name: '小孙', role: '活动策划', team: '线下活动·体验馆A', rank: 'D8', grade: 'A', status: '活跃' },
              { name: '小周', role: '执行统筹', team: '线下活动·体验馆A', rank: 'D5', grade: 'B', status: '活跃' }
            ]).map(m => `
              <tr>
                <td><strong>${m.name}</strong></td>
                <td><span class="card-tag">#${m.role}</span></td>
                <td>${m.team}</td>
                <td><span class="card-tag">${m.rank}</span></td>
                <td><span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;border-radius:50%;background:${m.grade === 'A' ? '#4CAF50' : m.grade === 'B' ? '#2196F3' : '#FF9800'}20;color:${m.grade === 'A' ? '#4CAF50' : m.grade === 'B' ? '#2196F3' : '#FF9800'};font-weight:700;">${m.grade}</span></td>
                <td><span class="status-badge active">${m.status}</span></td>
                <td>
                  ${canManage ? `<button class="card-action-btn primary" onclick="App.showToast('编辑成员权限')">权限</button>` : ''}
                  <button class="card-action-btn" onclick="App.showToast('查看成员详情')">详情</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  /* --- 成长追踪 --- */
  renderTeamGrowth() {
    const container = document.getElementById('team-growth');
    if (!container) return;

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div class="card-grid">
          ${(typeof growthTrackingData !== 'undefined' ? growthTrackingData : [
            { name: '小王', team: '自媒体·营养学', from: 'D3', to: 'D5', progress: '80%', eta: '2026-08-15', status: 'on_track' },
            { name: '小李', team: '自媒体·营养学', from: 'D', to: 'D3', progress: '45%', eta: '2026-09-01', status: 'on_track' },
            { name: '小赵', team: '社群运营·L1训练营', from: 'D5', to: 'D8', progress: '60%', eta: '2026-08-20', status: 'on_track' },
            { name: '小孙', team: '线下活动·体验馆A', from: 'D8', to: 'SD', progress: '30%', eta: '2026-10-01', status: 'at_risk' }
          ]).map(g => `
            <div class="content-card">
              <div class="card-header">
                <div class="card-title">${g.name} · ${g.from} → ${g.to}</div>
                <span class="status-badge ${g.status === 'on_track' ? 'active' : 'need_optimize'}">${g.status === 'on_track' ? '正常' : '需关注'}</span>
              </div>
              <div class="card-tags">
                <span class="card-tag">#${g.team}</span>
              </div>
              <div class="card-metrics">
                <span class="metric-item">📅 预计: <strong>${g.eta}</strong></span>
              </div>
              <div style="margin-top: 8px; font-size: 12px; color: var(--color-text-secondary);">晋升进度: ${g.progress}</div>
              <div style="height: 6px; background: var(--color-bg); border-radius: 3px; margin: 6px 0 10px; overflow: hidden;">
                <div style="height: 100%; width: ${g.progress}; background: linear-gradient(to right, var(--color-primary), var(--color-accent)); border-radius: 3px;"></div>
              </div>
              <div class="card-actions">
                <button class="card-action-btn primary" onclick="App.showToast('查看成长详情')">详情</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /* --- 团队流量 --- */
  renderTeamTraffic() {
    const container = document.getElementById('team-traffic');
    if (!container) return;

    const isAdmin = (typeof Auth !== 'undefined' && Auth.isAdmin) ? Auth.isAdmin() : false;
    const canView = (typeof Auth !== 'undefined' && Auth.canViewTrafficAll) ? Auth.canViewTrafficAll() : false;

    if (!canView && !isAdmin) {
      container.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--color-text-secondary);">您暂无权限查看团队流量分配详情</div>';
      return;
    }

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
          <div style="background: linear-gradient(135deg, var(--color-primary) 0%, #1a4d2e 100%); color: white; padding: 16px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700;">300</div>
            <div style="font-size: 12px; opacity: 0.9;">本月流量池</div>
          </div>
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); padding: 16px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: var(--color-primary);">287</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">已分配</div>
          </div>
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); padding: 16px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: var(--color-accent);">13</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">待分配</div>
          </div>
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); padding: 16px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #4CAF50;">+45</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">本月新增</div>
          </div>
        </div>
        <table class="follow-table">
          <thead>
            <tr><th>团队</th><th>领域</th><th>评级</th><th>分配权重</th><th>已分配</th><th>成员均分</th></tr>
          </thead>
          <tbody>
            ${teamData.map(t => `
              <tr>
                <td><strong>${t.name}</strong></td>
                <td><span class="card-tag">#${t.domain}</span></td>
                <td><span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;border-radius:50%;background:${t.contributionLevel === 'A' ? '#4CAF5020' : t.contributionLevel === 'B' ? '#2196F320' : '#FF980020'};color:${t.contributionLevel === 'A' ? '#4CAF50' : t.contributionLevel === 'B' ? '#2196F3' : '#FF9800'};font-weight:700;">${t.contributionLevel}</span></td>
                <td>×${t.contributionLevel === 'A' ? '1.5' : t.contributionLevel === 'B' ? '1.0' : '0.7'}</td>
                <td>${Math.floor(Math.random() * 20 + 5)}</td>
                <td>${Math.floor(Math.random() * 5 + 1)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  /* --- 市场视图（SD+/管理员） --- */
  renderTeamMarket() {
    const container = document.getElementById('team-market');
    if (!container) return;

    const isAdmin = (typeof Auth !== 'undefined' && Auth.isAdmin) ? Auth.isAdmin() : false;
    const isSDPlus = (typeof Auth !== 'undefined' && Auth.isSDPlus) ? Auth.isSDPlus() : false;

    if (!isAdmin && !isSDPlus) {
      container.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--color-text-secondary);">您暂无权限查看市场视图<br><small>仅 SD+ 市场领导者与管理员可查看</small></div>';
      return;
    }

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div style="font-size: 16px; font-weight: 700; color: var(--color-primary); margin-bottom: 16px;">
          🌳 ${isAdmin ? '全系统' : '我的'}市场团队树
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
          ${teamData.map((t, i) => {
            const isRoot = i === 0 || i === 2 || i === 4;
            return `
              <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; padding: 16px; ${!isRoot ? 'margin-left: 24px;' : ''}">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <span style="font-size: 20px;">${isRoot ? '🏢' : '└ 📌'}</span>
                  <div>
                    <div style="font-weight: 600; color: var(--color-primary);">${t.name}</div>
                    <div style="font-size: 11px; color: var(--color-text-secondary);">源头: ${t.leadName}</div>
                  </div>
                </div>
                <div style="display: flex; gap: 12px; font-size: 12px; color: var(--color-text-secondary);">
                  <span>👥 ${t.memberCount}人</span>
                  <span>📊 ${t.contributionLevel}类</span>
                  <span>${t.growthTrend === 'up' ? '📈 增长' : '📉 下降'}</span>
                </div>
                ${isRoot ? '<div style="margin-top: 8px; padding: 6px 10px; background: var(--color-accent-light); border-radius: 6px; font-size: 11px; color: var(--color-accent);">📊 子团队: 1个 · 点击展开</div>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  /* ========== 开发管理标签页 ========== */

  /* --- 任务计划 --- */
  renderTasksTab() {
    const activeSub = this.state.activeSubTab['tab-tasks'];
    this.renderTasksSubTab(activeSub);
  },

  renderTasksSubTab(subTabId) {
    switch (subTabId) {
      case 'tasks-today':
        this.renderTasksToday();
        break;
      case 'tasks-week':
        this.renderTasksWeek();
        break;
      case 'tasks-gantt':
        this.renderTasksGantt();
        break;
    }
  },

  renderTasksToday() {
    const container = document.getElementById('tasks-today');
    if (!container) return;

    const todayTasks = [
      { id: 'tk_01', title: '推送营养训练营Day15内容到飞书群', priority: '高', module: '社群运营', status: 'pending', deadline: '08:00' },
      { id: 'tk_02', title: '小红书发布今日文案（绿茶片话题）', priority: '高', module: '自媒体运营', status: 'pending', deadline: '10:00' },
      { id: 'tk_03', title: '回复社群成员打卡消息', priority: '中', module: '社群运营', status: 'in_progress', deadline: '全天' },
      { id: 'tk_04', title: '更新爆款内容库（抖音+小红书）', priority: '中', module: '自媒体运营', status: 'pending', deadline: '14:00' },
      { id: 'tk_05', title: '跟进3名未消费会员提醒', priority: '高', module: '社群运营', status: 'pending', deadline: '16:00' },
      { id: 'tk_06', title: '精油沙龙物料准备确认', priority: '中', module: '线下活动', status: 'completed', deadline: '已完成' },
      { id: 'tk_07', title: '审核新人课件PPT大纲', priority: '低', module: '课件制作', status: 'pending', deadline: '18:00' },
      { id: 'tk_08', title: '经营者培训考核试卷审核', priority: '高', module: '经营者培训', status: 'pending', deadline: '20:00' },
      { id: 'tk_09', title: '抖音短视频剪辑（护肤成分党）', priority: '高', module: '自媒体运营', status: 'in_progress', deadline: '15:00' },
      { id: 'tk_10', title: '每日数据复盘报表', priority: '中', module: '运营中枢', status: 'pending', deadline: '22:00' },
      { id: 'tk_11', title: '跟进宋玲林晋升进度', priority: '中', module: '经营者培训', status: 'pending', deadline: '17:00' },
      { id: 'tk_12', title: '飞书自动化任务检查', priority: '低', module: '运营中枢', status: 'completed', deadline: '已完成' }
    ];

    const statusMap = {
      pending: { text: '待处理', class: 'pending' },
      in_progress: { text: '进行中', class: 'in_progress' },
      completed: { text: '已完成', class: 'completed' }
    };
    const priorityMap = { '高': 'danger', '中': 'warning', '低': 'info' };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
          <div style="flex:1; padding: 12px; background: var(--color-card); border-radius: 8px; border-left: 3px solid var(--color-accent);">
            <div style="font-size: 24px; font-weight: 700; color: var(--color-primary);">${todayTasks.length}</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">今日总任务</div>
          </div>
          <div style="flex:1; padding: 12px; background: var(--color-card); border-radius: 8px; border-left: 3px solid var(--color-warning);">
            <div style="font-size: 24px; font-weight: 700; color: var(--color-warning);">${todayTasks.filter(t => t.status === 'pending').length}</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">待处理</div>
          </div>
          <div style="flex:1; padding: 12px; background: var(--color-card); border-radius: 8px; border-left: 3px solid var(--color-primary-light);">
            <div style="font-size: 24px; font-weight: 700; color: var(--color-primary-light);">${todayTasks.filter(t => t.status === 'in_progress').length}</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">进行中</div>
          </div>
          <div style="flex:1; padding: 12px; background: var(--color-card); border-radius: 8px; border-left: 3px solid var(--color-success);">
            <div style="font-size: 24px; font-weight: 700; color: var(--color-success);">${todayTasks.filter(t => t.status === 'completed').length}</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">已完成</div>
          </div>
        </div>
        <table class="follow-table">
          <thead>
            <tr><th>状态</th><th>优先级</th><th>任务</th><th>模块</th><th>截止</th><th>操作</th></tr>
          </thead>
          <tbody>
            ${todayTasks.map(t => `
              <tr>
                <td><span class="status-badge ${statusMap[t.status].class}">${statusMap[t.status].text}</span></td>
                <td><span class="alert-tag ${priorityMap[t.priority]}">${t.priority}</span></td>
                <td><strong>${t.title}</strong></td>
                <td><span class="card-tag">#${t.module}</span></td>
                <td>${t.deadline}</td>
                <td>
                  ${t.status !== 'completed' ? `<button class="card-action-btn primary" onclick="App.showToast('已标记完成')">完成</button>` : ''}
                  <button class="card-action-btn" onclick="App.showToast('查看任务详情')">详情</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  renderTasksWeek() {
    const container = document.getElementById('tasks-week');
    if (!container) return;

    const weekTasks = [
      { id: 'wk_01', title: '完成8月第1周自媒体内容排期', module: '自媒体运营', deadline: '08-04', status: 'in_progress', assignee: '博主A' },
      { id: 'wk_02', title: '精油沙龙活动执行+复盘', module: '线下活动', deadline: '08-04', status: 'pending', assignee: '芳疗师A' },
      { id: 'wk_03', title: '营养训练营Day15-21内容准备', module: '课件制作', deadline: '08-05', status: 'pending', assignee: '营养师L' },
      { id: 'wk_04', title: '会员月度消费跟进报告', module: '社群运营', deadline: '08-05', status: 'pending', assignee: '社群专员' },
      { id: 'wk_05', title: '经营者培训考核（8月批次）', module: '经营者培训', deadline: '08-05', status: 'pending', assignee: '周老师' },
      { id: 'wk_06', title: '护肤体验课策划与执行', module: '线下活动', deadline: '08-06', status: 'pending', assignee: '小雅' },
      { id: 'wk_07', title: '周度数据复盘+优化方案', module: '运营中枢', deadline: '08-06', status: 'pending', assignee: '管理员' },
      { id: 'wk_08', title: '飞书群推送日历更新', module: '社群运营', deadline: '08-07', status: 'pending', assignee: '社群专员' },
      { id: 'wk_09', title: '短视频脚本批量生产', module: '课件制作', deadline: '08-07', status: 'in_progress', assignee: '博主A' },
      { id: 'wk_10', title: '团队建设活动复盘', module: '经营者培训', deadline: '08-07', status: 'pending', assignee: '李老师' },
      { id: 'wk_11', title: '对标账号月度分析报告', module: '自媒体运营', deadline: '08-08', status: 'pending', assignee: '博主A' },
      { id: 'wk_12', title: '合规审查（月度）', module: '运营中枢', deadline: '08-08', status: 'pending', assignee: '管理员' },
      { id: 'wk_13', title: '体验馆月度开放日筹备', module: '线下活动', deadline: '08-09', status: 'pending', assignee: '体验馆' },
      { id: 'wk_14', title: '8月第2周内容排期', module: '自媒体运营', deadline: '08-09', status: 'pending', assignee: '博主A' },
      { id: 'wk_15', title: '社区公益讲座执行', module: '线下活动', deadline: '08-10', status: 'pending', assignee: '待定' }
    ];

    const statusMap = {
      pending: { text: '待处理', class: 'pending' },
      in_progress: { text: '进行中', class: 'in_progress' },
      completed: { text: '已完成', class: 'completed' }
    };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <table class="follow-table">
          <thead>
            <tr><th>状态</th><th>任务</th><th>模块</th><th>截止日期</th><th>负责人</th><th>操作</th></tr>
          </thead>
          <tbody>
            ${weekTasks.map(t => `
              <tr>
                <td><span class="status-badge ${statusMap[t.status].class}">${statusMap[t.status].text}</span></td>
                <td><strong>${t.title}</strong></td>
                <td><span class="card-tag">#${t.module}</span></td>
                <td>${t.deadline}</td>
                <td>${t.assignee}</td>
                <td>
                  <button class="card-action-btn" onclick="App.showToast('查看任务详情')">详情</button>
                  <button class="card-action-btn" onclick="App.showToast('已复制任务提示词')">AI辅助</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  renderTasksGantt() {
    const container = document.getElementById('tasks-gantt');
    if (!container) return;

    const ganttData = [
      { name: '自媒体内容排期', start: 1, end: 5, color: '#2E7D32' },
      { name: '精油沙龙执行', start: 3, end: 4, color: '#F9A825' },
      { name: '营养训练营内容', start: 2, end: 6, color: '#2E7D32' },
      { name: '会员消费跟进', start: 4, end: 5, color: '#2196F3' },
      { name: '经营者考核', start: 5, end: 5, color: '#9C27B0' },
      { name: '护肤体验课', start: 6, end: 6, color: '#F9A825' },
      { name: '数据复盘', start: 6, end: 6, color: '#FF9800' },
      { name: '短视频制作', start: 3, end: 7, color: '#2E7D32' },
      { name: '合规审查', start: 7, end: 8, color: '#E53935' },
      { name: '体验馆开放日', start: 8, end: 9, color: '#F9A825' }
    ];
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日', '下周一', '下周二'];

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <h3 style="font-size: 16px; margin-bottom: 16px;">📊 本周甘特图</h3>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr>
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid var(--color-border); min-width: 160px;">任务</th>
                ${days.map((d, i) => `<th style="padding: 8px; text-align: center; border-bottom: 2px solid var(--color-border); min-width: 60px;">${d}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${ganttData.map(g => `
                <tr>
                  <td style="padding: 10px 8px; border-bottom: 1px solid var(--color-border); font-weight: 500;">${g.name}</td>
                  ${days.map((_, i) => {
                    const day = i + 1;
                    if (day >= g.start && day <= g.end) {
                      return `<td style="padding: 10px 4px; border-bottom: 1px solid var(--color-border);"><div style="height: 20px; background: ${g.color}; border-radius: 4px; margin: 0 2px;"></div></td>`;
                    }
                    return `<td style="padding: 10px 4px; border-bottom: 1px solid var(--color-border);"></td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /* --- Skills管理 --- */
  renderSkillsTab() {
    const activeSub = this.state.activeSubTab['tab-skills'];
    this.renderSkillsSubTab(activeSub);
  },

  renderSkillsSubTab(subTabId) {
    switch (subTabId) {
      case 'skills-list':
        this.renderSkillsList();
        break;
      case 'skills-prompts':
        this.renderSkillsPrompts();
        break;
      case 'skills-config':
        this.renderSkillsConfig();
        break;
    }
  },

  renderSkillsList() {
    const container = document.getElementById('skills-list');
    if (!container) return;

    const skills = [
      { id: 'sk_01', name: '自媒体内容生成器', desc: '根据平台、赛道、品类自动生成文案', category: '自媒体运营', triggers: 128, status: 'active' },
      { id: 'sk_02', name: '社群推送日历生成', desc: '根据社群类型自动匹配推送内容', category: '社群运营', triggers: 95, status: 'active' },
      { id: 'sk_03', name: '课件评估助手', desc: '上传旧课件AI评估质量并优化', category: '课件制作', triggers: 42, status: 'active' },
      { id: 'sk_04', name: '活动方案生成器', desc: '选择类型自动生成完整活动方案', category: '线下活动', triggers: 28, status: 'active' },
      { id: 'sk_05', name: '考核试卷生成', desc: '根据课程内容自动出题', category: '经营者培训', triggers: 15, status: 'active' },
      { id: 'sk_06', name: '合规检查器', desc: '检查内容是否触犯合规红线', category: '运营中枢', triggers: 67, status: 'active' }
    ];

    const statusMap = { active: { text: '启用中', class: 'active' }, inactive: { text: '已禁用', class: 'pending' } };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div class="card-grid">
          ${skills.map(s => `
            <div class="content-card">
              <div class="card-header">
                <div class="card-title">🧩 ${s.name}</div>
                <span class="status-badge ${statusMap[s.status].class}">${statusMap[s.status].text}</span>
              </div>
              <div class="card-tags">
                <span class="card-tag">#${s.category}</span>
              </div>
              <div style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 8px;">${s.desc}</div>
              <div class="card-metrics">
                <span class="metric-item">触发次数: <strong>${s.triggers}</strong></span>
              </div>
              <div class="card-actions">
                <button class="card-action-btn primary" onclick="App.showToast('查看技能详情')">详情</button>
                <button class="card-action-btn" onclick="App.showToast('已复制技能配置')">⚙️ 配置</button>
                <button class="card-action-btn" onclick="App.showToast('已复制技能代码')">复制</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderSkillsPrompts() {
    const container = document.getElementById('skills-prompts');
    if (!container) return;

    const prompts = [
      { id: 'pt_01', name: '小红书爆款文案提示词', category: '自媒体运营', uses: 86, lastUpdate: '2026-07-25' },
      { id: 'pt_02', name: '社群早安话术提示词', category: '社群运营', uses: 62, lastUpdate: '2026-07-24' },
      { id: 'pt_03', name: '课件优化提示词', category: '课件制作', uses: 35, lastUpdate: '2026-07-22' },
      { id: 'pt_04', name: '活动SOP生成提示词', category: '线下活动', uses: 22, lastUpdate: '2026-07-20' },
      { id: 'pt_05', name: '考核出题提示词', category: '经营者培训', uses: 12, lastUpdate: '2026-07-18' },
      { id: 'pt_06', name: '合规检查提示词', category: '运营中枢', uses: 54, lastUpdate: '2026-07-26' }
    ];

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div class="card-grid">
          ${prompts.map(p => `
            <div class="content-card">
              <div class="card-header">
                <div class="card-title">📝 ${p.name}</div>
              </div>
              <div class="card-tags">
                <span class="card-tag">#${p.category}</span>
              </div>
              <div class="card-metrics">
                <span class="metric-item">使用次数: <strong>${p.uses}</strong></span>
                <span class="metric-item">更新: <strong>${p.lastUpdate}</strong></span>
              </div>
              <div class="card-actions">
                <button class="card-action-btn primary" onclick="App.showToast('已复制提示词')">📋 复制</button>
                <button class="card-action-btn" onclick="App.showToast('进入编辑')">编辑</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderSkillsConfig() {
    const container = document.getElementById('skills-config');
    if (!container) return;

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div class="arch-card">
          <div class="arch-card-header"><h3>⚙️ 全局技能配置</h3></div>
          <div style="margin-top: 10px; font-size: 14px; line-height: 2;">
            <div>AI模型: <strong>Claude Sonnet 4.5</strong></div>
            <div>温度参数: <strong>0.7</strong></div>
            <div>最大Token: <strong>4096</strong></div>
            <div>自动触发: <strong>已启用</strong></div>
            <div>提示词缓存: <strong>已启用</strong></div>
          </div>
          <div style="margin-top: 10px;">
            <button class="card-action-btn primary" onclick="App.showToast('进入配置编辑')">编辑配置</button>
            <button class="card-action-btn" onclick="App.showToast('已重置为默认')">重置</button>
          </div>
        </div>
      </div>
    `;
  },

  /* --- 品牌合作 --- */
  renderBrandTab() {
    const activeSub = this.state.activeSubTab['tab-brand'];
    this.renderBrandSubTab(activeSub);
  },

  renderBrandSubTab(subTabId) {
    switch (subTabId) {
      case 'brand-kol':
        this.renderBrandKol();
        break;
      case 'brand-assets':
        this.renderBrandAssets();
        break;
      case 'brand-proposal':
        this.renderBrandProposal();
        break;
    }
  },

  renderBrandKol() {
    const container = document.getElementById('brand-kol');
    if (!container) return;

    const kols = [
      { id: 'kol_01', name: '营养师小林', platform: '小红书', followers: 52000, domain: '营养学', status: 'collaborating', fee: '产品置换+500元', lastCoop: '2026-07-20' },
      { id: 'kol_02', name: '芳疗师小A', platform: '抖音', followers: 89000, domain: '精油芳疗', status: 'collaborating', fee: '产品置换+1000元', lastCoop: '2026-07-18' },
      { id: 'kol_03', name: '成分党小雅', platform: '小红书', followers: 35000, domain: '美妆护肤', status: 'collaborating', fee: '产品置换', lastCoop: '2026-07-13' },
      { id: 'kol_04', name: '生活家老王', platform: 'B站', followers: 120000, domain: '居家生活', status: 'pending', fee: '待商议', lastCoop: '--' },
      { id: 'kol_05', name: '健康说书人', platform: '小宇宙', followers: 8000, domain: '营养学', status: 'contacting', fee: '待商议', lastCoop: '--' }
    ];

    const statusMap = {
      collaborating: { text: '合作中', class: 'active' },
      pending: { text: '待回复', class: 'pending' },
      contacting: { text: '接洽中', class: 'monitoring' }
    };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div class="card-grid">
          ${kols.map(k => `
            <div class="content-card">
              <div class="card-header">
                <div class="card-title">👤 ${k.name}</div>
                <span class="status-badge ${statusMap[k.status].class}">${statusMap[k.status].text}</span>
              </div>
              <div class="card-tags">
                <span class="card-tag">#${k.platform}</span>
                <span class="card-tag">#${k.domain}</span>
              </div>
              <div class="card-metrics">
                <span class="metric-item">粉丝: <strong>${k.followers.toLocaleString()}</strong></span>
                <span class="metric-item">费用: <strong>${k.fee}</strong></span>
              </div>
              <div class="card-trend">📅 最近合作: ${k.lastCoop}</div>
              <div class="card-actions">
                <button class="card-action-btn primary" onclick="App.showToast('查看KOL详情')">详情</button>
                <button class="card-action-btn" onclick="App.showToast('已复制合作邀约信')">邀约</button>
                <button class="card-action-btn" onclick="App.showToast('已复制合作方案')">方案</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderBrandAssets() {
    const container = document.getElementById('brand-assets');
    if (!container) return;

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div class="kb-categories">
          <div class="kb-category-card" onclick="App.showToast('查看LOGO素材')"><span class="cat-name">LOGO素材</span><span class="cat-count">8</span></div>
          <div class="kb-category-card" onclick="App.showToast('查看品牌图集')"><span class="cat-name">品牌图集</span><span class="cat-count">45</span></div>
          <div class="kb-category-card" onclick="App.showToast('查看金句海报')"><span class="cat-name">金句海报</span><span class="cat-count">15</span></div>
          <div class="kb-category-card" onclick="App.showToast('查看产品图片')"><span class="cat-name">产品图片</span><span class="cat-count">48</span></div>
          <div class="kb-category-card" onclick="App.showToast('查看视频素材')"><span class="cat-name">视频素材</span><span class="cat-count">28</span></div>
        </div>
      </div>
    `;
  },

  renderBrandProposal() {
    const container = document.getElementById('brand-proposal');
    if (!container) return;

    const proposals = [
      { id: 'pr_01', title: 'KOL招商信模板', desc: '标准化KOL合作邀约模板', status: 'ready', lastUpdate: '2026-07-25' },
      { id: 'pr_02', title: '项目合作方案模板', desc: '品牌项目合作方案框架', status: 'ready', lastUpdate: '2026-07-20' },
      { id: 'pr_03', title: '体验馆联名方案', desc: '与其他品牌联名活动方案', status: 'draft', lastUpdate: '2026-07-15' }
    ];

    const statusMap = { ready: { text: '可使用', class: 'completed' }, draft: { text: '草稿', class: 'draft' } };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div class="card-grid">
          ${proposals.map(p => `
            <div class="content-card">
              <div class="card-header">
                <div class="card-title">🤝 ${p.title}</div>
                <span class="status-badge ${statusMap[p.status].class}">${statusMap[p.status].text}</span>
              </div>
              <div style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 8px;">${p.desc}</div>
              <div class="card-metrics">
                <span class="metric-item">更新: <strong>${p.lastUpdate}</strong></span>
              </div>
              <div class="card-actions">
                <button class="card-action-btn primary" onclick="App.showToast('已复制方案内容')">复制方案</button>
                <button class="card-action-btn" onclick="App.showToast('进入编辑')">编辑</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /* --- 后台管理 --- */
  renderAdminTab() {
    const activeSub = this.state.activeSubTab['tab-admin'];
    this.renderAdminSubTab(activeSub);
  },

  renderAdminSubTab(subTabId) {
    switch (subTabId) {
      case 'admin-users':
        this.renderAdminUsers();
        break;
      case 'admin-roles':
        this.renderAdminRoles();
        break;
      case 'admin-settings':
        this.renderAdminSettings();
        break;
    }
  },

  renderAdminUsers() {
    const container = document.getElementById('admin-users');
    if (!container) return;

    const statusMap = {
      active: { text: '活跃', class: 'active' },
      inactive: { text: '非活跃', class: 'pending' }
    };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <table class="follow-table">
          <thead>
            <tr>
              <th>头像</th>
              <th>用户名</th>
              <th>姓名</th>
              <th>角色</th>
              <th>状态</th>
              <th>权限</th>
              <th>最近登录</th>
              <th>创建日期</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${userAccounts.map(u => `
              <tr>
                <td style="font-size: 20px;">${u.avatar}</td>
                <td><strong>${u.username}</strong></td>
                <td>${u.name}</td>
                <td><span class="card-tag">#${u.role}</span></td>
                <td><span class="status-badge ${statusMap[u.status].class}">${statusMap[u.status].text}</span></td>
                <td style="font-size: 12px;">${u.permissions}</td>
                <td>${u.lastLogin}</td>
                <td>${u.createdDate}</td>
                <td>
                  <button class="card-action-btn" onclick="App.showToast('编辑用户: ${u.name}')">编辑</button>
                  ${u.username !== 'admin' ? `<button class="card-action-btn" onclick="App.showToast('已重置密码')">重置密码</button>` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  renderAdminRoles() {
    const container = document.getElementById('admin-roles');
    if (!container) return;

    // V4.2 第二阶段修复：权限面板细化到「子标签页 + 操作按钮级」
    // 1. 动态遍历全部 35 个角色（按领域分组），不再硬编码 5 个错误的角色代码
    // 2. 三层权限展示：标签页 / 子标签页 / 操作按钮（specialAbilities）
    // 3. 修正 accessLevels 为 AUTH_ACCESS 实际值（移除被误当作访问级别的 personal）
    // 4. 角色选择器 + 详情面板模式，避免一次性渲染 35×11×N 矩阵导致卡顿

    // 标签页元数据（id → 名称/图标）
    const allTabs = [
      { id: 'tab-social', name: '自媒体运营', icon: '📱' },
      { id: 'tab-community', name: '社群运营', icon: '💬' },
      { id: 'tab-courseware', name: '课件制作', icon: '📚' },
      { id: 'tab-offline', name: '线下活动', icon: '🎪' },
      { id: 'tab-training', name: '经营者培训', icon: '🎓' },
      { id: 'tab-hub', name: '运营中枢', icon: '🏠' },
      { id: 'tab-team', name: '团队管理', icon: '👥' },
      { id: 'tab-tasks', name: '任务计划', icon: '📋' },
      { id: 'tab-skills', name: 'Skills管理', icon: '🧩' },
      { id: 'tab-brand', name: '品牌合作', icon: '🤝' },
      { id: 'tab-admin', name: '后台管理', icon: '🛠️' }
    ];

    // 每个标签页下的子标签清单（用于子标签权限矩阵渲染）
    const subTabsByTab = {
      'tab-social': [
        { id: 'social-overview', name: '账号概览' },
        { id: 'social-content', name: '内容库' },
        { id: 'social-viral', name: '爆款内容库' },
        { id: 'social-topics', name: '选题库' },
        { id: 'social-benchmark', name: '对标账号' },
        { id: 'social-diagnostic', name: '数据诊断' },
        { id: 'social-rules', name: '平台规则' }
      ],
      'tab-community': [
        { id: 'comm-calendar', name: '推送日历' },
        { id: 'comm-manage', name: '社群管理' },
        { id: 'comm-onboarding', name: '新人引导' },
        { id: 'comm-follow', name: '消费跟进' },
        { id: 'comm-funnel', name: '转化漏斗' },
        { id: 'comm-arch', name: '架构设计' }
      ],
      'tab-courseware': [
        { id: 'cw-library', name: '课件库' },
        { id: 'cw-framework', name: '培训框架' },
        { id: 'cw-script', name: '短视频脚本' },
        { id: 'cw-outline', name: 'PPT大纲' },
        { id: 'cw-fulltext', name: '逐字稿' },
        { id: 'cw-materials', name: '素材库' }
      ],
      'tab-offline': [
        { id: 'offline-calendar', name: '活动日历' },
        { id: 'offline-salon', name: '沙龙讲座' },
        { id: 'offline-exp', name: '体验馆运营' },
        { id: 'offline-community', name: '社区公益' },
        { id: 'offline-materials', name: '物料清单' },
        { id: 'offline-review', name: '活动复盘' }
      ],
      'tab-training': [
        { id: 'training-mine', name: '我的培训' },
        { id: 'training-exam', name: '考核管理' },
        { id: 'training-calendar', name: '培训日历' },
        { id: 'training-activity', name: '团队活动' },
        { id: 'training-courseware', name: '课件设计' }
      ],
      'tab-hub': [
        { id: 'hub-dashboard', name: '角色专属看板' },
        { id: 'hub-automation', name: '自动化任务' },
        { id: 'hub-traffic', name: '流量分配' },
        { id: 'hub-promotion', name: '晋升追踪' },
        { id: 'hub-reviews', name: '月度复盘' },
        { id: 'hub-delegation', name: '委托管理' },
        { id: 'hub-compliance', name: '合规中心' },
        { id: 'hub-knowledge', name: '知识库' },
        { id: 'hub-settings', name: '系统设置' }
      ],
      'tab-team': [
        { id: 'team-overview', name: '团队概览' },
        { id: 'team-members', name: '成员管理' },
        { id: 'team-growth', name: '成长追踪' },
        { id: 'team-traffic', name: '团队流量' },
        { id: 'team-market', name: '市场视图' }
      ],
      'tab-tasks': [
        { id: 'tasks-today', name: '今日任务' },
        { id: 'tasks-week', name: '本周任务' },
        { id: 'tasks-gantt', name: '甘特图' }
      ],
      'tab-skills': [
        { id: 'skills-list', name: '技能列表' },
        { id: 'skills-prompts', name: '提示词模板' },
        { id: 'skills-config', name: '配置管理' }
      ],
      'tab-brand': [
        { id: 'brand-kol', name: 'KOL管理' },
        { id: 'brand-assets', name: '品牌素材' },
        { id: 'brand-proposal', name: '招商合作' }
      ],
      'tab-admin': [
        { id: 'admin-users', name: '用户管理' },
        { id: 'admin-roles', name: '权限配置' },
        { id: 'admin-settings', name: '系统设置' }
      ]
    };

    // 修正：访问级别严格对齐 AUTH_ACCESS（移除被误当作访问级别的 personal）
    const accessLevels = [
      { value: 'none', label: '❌ 无权限', color: '#9E9E9E' },
      { value: 'view', label: '👁️ 只读', color: '#2196F3' },
      { value: 'create', label: '✏️ 可创建', color: '#FF9800' },
      { value: 'manage', label: '🔧 可管理', color: '#9C27B0' },
      { value: 'full', label: '✅ 完全', color: '#4CAF50' }
    ];

    // 子标签访问级别（SUBTAB_ACCESS 多一个 participate）
    const subTabLevels = [
      { value: 'hidden', label: '隐藏', color: '#9E9E9E' },
      { value: 'view', label: '只读', color: '#2196F3' },
      { value: 'participate', label: '可参与', color: '#00BCD4' },
      { value: 'create', label: '可创建', color: '#FF9800' },
      { value: 'manage', label: '可管理', color: '#9C27B0' },
      { value: 'full', label: '完全', color: '#4CAF50' }
    ];

    // 操作能力元数据
    const abilityList = [
      { key: 'canDesignCourse', label: '课件设计', desc: '可设计/编辑培训课件', icon: '📚' },
      { key: 'canCreateExam', label: '创建考核', desc: '可创建试卷与考核任务', icon: '📝' },
      { key: 'canWriteLecture', label: '撰写讲稿', desc: '可编写逐字稿/讲稿', icon: '✍️' },
      { key: 'canManageTraining', label: '管理培训', desc: '可发布/调整培训计划', icon: '🎓' },
      { key: 'canViewAllStudents', label: '查看全部学员', desc: '跨团队查看学员数据', icon: '👥' },
      { key: 'canAssignTraffic', label: '分配流量', desc: '可调整流量池分配权重', icon: '🔀' },
      { key: 'canViewAllTeams', label: '查看全部团队', desc: '跨市场查看团队数据', icon: '🏢' },
      { key: 'canManageAnyPermission', label: '管理任意权限', desc: '可修改任意角色权限', icon: '🛡️' }
    ];

    // 按领域分组角色（自动从 ROLE_PERMISSIONS 派生，而非硬编码）
    const domainGroups = [
      { domain: null, label: '系统级', icon: '⚙️' },
      { domain: 'social', label: '自媒体', icon: '📱' },
      { domain: 'community', label: '社群运营', icon: '💬' },
      { domain: 'offline', label: '线下活动', icon: '🎪' },
      { domain: 'exp_center', label: '体验馆', icon: '🏬' },
      { domain: 'hub', label: '运营中枢', icon: '🏠' }
    ];

    // 选中角色（默认 admin）
    if (!this.state.adminSelectedRole || !ROLE_PERMISSIONS[this.state.adminSelectedRole]) {
      this.state.adminSelectedRole = 'admin';
    }
    const selectedRole = this.state.adminSelectedRole;
    const roleData = ROLE_PERMISSIONS[selectedRole];
    const isAdminRole = selectedRole === 'admin';

    // 数据范围标签
    const scopeLabels = { personal: '个人', team: '团队', market: '市场', all: '全部' };

    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <!-- 说明栏 -->
        <div style="background: var(--color-accent-light); border-left: 4px solid var(--color-accent); padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
          <div style="font-size: 14px; font-weight: 600; color: var(--color-primary); margin-bottom: 6px;">🔐 三层权限架构</div>
          <div style="font-size: 12px; color: var(--color-text-secondary); line-height: 1.8;">
            <span style="display: inline-block; margin-right: 14px;"><strong>第一层·标签页</strong>：模块访问级别（none/view/create/manage/full）</span>
            <span style="display: inline-block; margin-right: 14px;"><strong>第二层·子标签页</strong>：细粒度功能可见性（hidden/view/participate/create/manage/full）</span>
            <span style="display: inline-block;"><strong>第三层·操作按钮</strong>：specialAbilities 特殊能力开关</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 280px 1fr; gap: 20px; min-height: 600px;">
          <!-- 左侧：角色选择器（按领域分组） -->
          <div style="background: var(--color-surface); border-radius: 10px; border: 1px solid var(--color-border); padding: 12px; max-height: 70vh; overflow-y: auto;">
            ${domainGroups.map(group => {
              const rolesInGroup = Object.entries(ROLE_PERMISSIONS)
                .filter(([code, data]) => data.domain === group.domain)
                .map(([code, data]) => ({ code, ...data }));
              if (rolesInGroup.length === 0) return '';
              return `
                <div style="margin-bottom: 14px;">
                  <div style="font-size: 11px; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin: 8px 6px 6px; padding-bottom: 4px; border-bottom: 1px solid var(--color-border);">
                    ${group.icon} ${group.label} <span style="color: var(--color-accent);">(${rolesInGroup.length})</span>
                  </div>
                  ${rolesInGroup.map(r => `
                    <div class="admin-role-item ${selectedRole === r.code ? 'active' : ''}" 
                         onclick="App.selectAdminRole('${r.code}')"
                         style="padding: 8px 10px; border-radius: 6px; cursor: pointer; margin-bottom: 2px; display: flex; align-items: center; justify-content: space-between; gap: 8px; background: ${selectedRole === r.code ? 'var(--color-accent-light)' : 'transparent'}; border-left: 3px solid ${selectedRole === r.code ? 'var(--color-accent)' : 'transparent'}; transition: var(--transition);"
                         onmouseover="this.style.background='${selectedRole === r.code ? 'var(--color-accent-light)' : 'var(--color-bg)'}'"
                         onmouseout="this.style.background='${selectedRole === r.code ? 'var(--color-accent-light)' : 'transparent'}'">
                      <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 13px; font-weight: 500; color: var(--color-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.label || r.code}</div>
                        <div style="font-size: 10px; color: var(--color-text-secondary); font-family: monospace;">${r.code}</div>
                      </div>
                      <div style="display: flex; gap: 3px; flex-shrink: 0;">
                        ${r.isLead ? '<span title="团队源头" style="font-size: 10px; padding: 1px 5px; border-radius: 4px; background: rgba(249,168,37,0.2); color: var(--color-accent);">源头</span>' : ''}
                        ${r.isSDPlus ? '<span title="SD+阶衔" style="font-size: 10px; padding: 1px 5px; border-radius: 4px; background: rgba(76,175,80,0.2); color: var(--success);">SD+</span>' : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              `;
            }).join('')}
          </div>

          <!-- 右侧：选中角色的三层权限详情 -->
          <div style="background: var(--color-surface); border-radius: 10px; border: 1px solid var(--color-border); padding: 20px;">
            <!-- 角色头部信息 -->
            <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid var(--color-border);">
              <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                  <h3 style="font-size: 18px; font-weight: 700; color: var(--color-primary); margin: 0;">${roleData.label || selectedRole}</h3>
                  <span style="font-family: monospace; font-size: 11px; padding: 2px 8px; border-radius: 4px; background: var(--color-bg); color: var(--color-text-secondary);">${selectedRole}</span>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap; font-size: 12px;">
                  <span style="padding: 2px 8px; border-radius: 4px; background: var(--color-bg);">领域: <strong>${roleData.domain || '系统'}</strong></span>
                  <span style="padding: 2px 8px; border-radius: 4px; background: var(--color-bg);">数据范围: <strong>${scopeLabels[roleData.dataScope] || roleData.dataScope}</strong></span>
                  <span style="padding: 2px 8px; border-radius: 4px; background: var(--color-bg);">看板: <strong>${roleData.dashboardType || '—'}</strong></span>
                  ${roleData.isLead ? '<span style="padding: 2px 8px; border-radius: 4px; background: rgba(249,168,37,0.15); color: var(--color-accent);">⭐ 团队源头</span>' : ''}
                  ${roleData.isSDPlus ? '<span style="padding: 2px 8px; border-radius: 4px; background: rgba(76,175,80,0.15); color: var(--success);">👑 SD+阶衔</span>' : ''}
                </div>
              </div>
              ${!isAdminRole ? `
                <button class="card-action-btn" style="font-size: 12px; padding: 6px 12px;" onclick="App.resetRolePermissions('${selectedRole}')">↩️ 重置默认</button>
              ` : '<span style="font-size: 11px; color: var(--danger); padding: 4px 10px; background: rgba(229,57,53,0.08); border-radius: 4px;">管理员权限只读</span>'}
            </div>

            <!-- 第一层：标签页权限 -->
            <div style="margin-bottom: 24px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <span style="font-size: 14px; font-weight: 700; color: var(--color-primary);">① 标签页访问权限</span>
                <span style="font-size: 11px; color: var(--color-text-secondary);">控制该角色可见哪些主模块</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px;">
                ${allTabs.map(tab => {
                  const currentLevel = (roleData.tabs && roleData.tabs[tab.id]) || 'none';
                  return `
                    <div style="background: var(--color-bg); border-radius: 6px; padding: 8px 10px; border: 1px solid var(--color-border);">
                      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                        <span style="font-size: 14px;">${tab.icon}</span>
                        <span style="font-size: 12px; font-weight: 500; color: var(--color-primary);">${tab.name}</span>
                      </div>
                      <select class="perm-select"
                        data-role="${selectedRole}" data-tab="${tab.id}"
                        onchange="App.updateRolePermission(this)"
                        ${isAdminRole ? 'disabled' : ''}
                        style="width: 100%; padding: 4px 6px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-surface); font-size: 11px; color: var(--color-primary); cursor: ${isAdminRole ? 'not-allowed' : 'pointer'};">
                        ${accessLevels.map(l => `<option value="${l.value}" ${currentLevel === l.value ? 'selected' : ''} style="color: ${l.color};">${l.label}</option>`).join('')}
                      </select>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- 第二层：子标签页权限矩阵（仅展示该角色已开启的标签页下的子标签） -->
            <div style="margin-bottom: 24px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <span style="font-size: 14px; font-weight: 700; color: var(--color-primary);">② 子标签页权限</span>
                <span style="font-size: 11px; color: var(--color-text-secondary);">仅展示已开启访问的模块下的子功能</span>
              </div>
              ${(() => {
                const accessibleTabs = allTabs.filter(t => roleData.tabs && roleData.tabs[t.id] && roleData.tabs[t.id] !== 'none');
                if (accessibleTabs.length === 0) {
                  return '<div style="padding: 12px; background: var(--color-bg); border-radius: 6px; color: var(--color-text-secondary); font-size: 12px; text-align: center;">该角色尚未开启任何标签页访问权限</div>';
                }
                return accessibleTabs.map(tab => {
                  const subTabs = subTabsByTab[tab.id] || [];
                  if (subTabs.length === 0) return '';
                  const roleSubTabConfig = (roleData.subTabs && roleData.subTabs[tab.id]) || {};
                  return `
                    <div style="margin-bottom: 12px; padding: 10px 12px; background: var(--color-bg); border-radius: 8px; border-left: 3px solid var(--color-accent);">
                      <div style="font-size: 12px; font-weight: 600; color: var(--color-primary); margin-bottom: 8px;">${tab.icon} ${tab.name}</div>
                      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 6px;">
                        ${subTabs.map(st => {
                          // 默认值：若标签页为 full/manage 则子标签默认 full，否则 view
                          const tabLevel = roleData.tabs[tab.id];
                          const defaultLevel = (tabLevel === 'full' || tabLevel === 'manage') ? 'full' : 'view';
                          const currentLevel = roleSubTabConfig[st.id] !== undefined ? roleSubTabConfig[st.id] : defaultLevel;
                          return `
                            <div style="display: flex; flex-direction: column; gap: 3px; padding: 5px 8px; background: var(--color-surface); border-radius: 4px; border: 1px solid var(--color-border);">
                              <span style="font-size: 11px; color: var(--color-primary); font-weight: 500;">${st.name}</span>
                              <select class="perm-select"
                                data-role="${selectedRole}" data-tab="${tab.id}" data-subtab="${st.id}"
                                onchange="App.updateRoleSubTabPermission(this)"
                                ${isAdminRole ? 'disabled' : ''}
                                style="width: 100%; padding: 3px 4px; border-radius: 3px; border: 1px solid var(--color-border); background: var(--color-surface); font-size: 10px; color: var(--color-primary); cursor: ${isAdminRole ? 'not-allowed' : 'pointer'};">
                                ${subTabLevels.map(l => `<option value="${l.value}" ${currentLevel === l.value ? 'selected' : ''} style="color: ${l.color};">${l.label}</option>`).join('')}
                              </select>
                            </div>
                          `;
                        }).join('')}
                      </div>
                    </div>
                  `;
                }).join('');
              })()}
            </div>

            <!-- 第三层：操作按钮级权限（specialAbilities） -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <span style="font-size: 14px; font-weight: 700; color: var(--color-primary);">③ 操作按钮权限</span>
                <span style="font-size: 11px; color: var(--color-text-secondary);">specialAbilities 特殊能力开关</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 8px;">
                ${abilityList.map(ab => {
                  const enabled = roleData.specialAbilities && roleData.specialAbilities[ab.key];
                  return `
                    <label style="display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: ${enabled ? 'rgba(76,175,80,0.08)' : 'var(--color-bg)'}; border-radius: 6px; border: 1px solid ${enabled ? 'rgba(76,175,80,0.3)' : 'var(--color-border)'}; cursor: ${isAdminRole ? 'not-allowed' : 'pointer'}; opacity: ${isAdminRole ? 0.7 : 1};">
                      <input type="checkbox" 
                        data-role="${selectedRole}" data-ability="${ab.key}"
                        onchange="App.updateRoleAbility(this)"
                        ${enabled ? 'checked' : ''} ${isAdminRole ? 'disabled' : ''}
                        style="cursor: ${isAdminRole ? 'not-allowed' : 'pointer'}; accent-color: var(--color-accent);">
                      <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 12px; font-weight: 500; color: var(--color-primary);">${ab.icon} ${ab.label}</div>
                        <div style="font-size: 10px; color: var(--color-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${ab.desc}</div>
                      </div>
                    </label>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * 选中后台权限面板中的角色（切换右侧详情）
   */
  selectAdminRole(roleCode) {
    if (!ROLE_PERMISSIONS[roleCode]) return;
    this.state.adminSelectedRole = roleCode;
    this.renderAdminRoles();
  },

  /**
   * 更新角色标签页权限（第一层）
   */
  updateRolePermission(selectEl) {
    const role = selectEl.dataset.role;
    const tab = selectEl.dataset.tab;
    const level = selectEl.value;

    if (!role || !tab || !ROLE_PERMISSIONS[role]) return;

    if (level === 'none') {
      delete ROLE_PERMISSIONS[role].tabs[tab];
    } else {
      ROLE_PERMISSIONS[role].tabs[tab] = level;
    }

    this._persistRolePermissions();
    this.showToast(`已更新 ${ROLE_PERMISSIONS[role].label} 的标签页权限：${tab} → ${level}`);
    // 权限变更后，子标签页矩阵需重新渲染（依赖标签页开启状态）
    this.renderAdminRoles();
  },

  /**
   * 更新角色子标签页权限（第二层，V4.2 第二阶段新增）
   */
  updateRoleSubTabPermission(selectEl) {
    const role = selectEl.dataset.role;
    const tab = selectEl.dataset.tab;
    const subTab = selectEl.dataset.subtab;
    const level = selectEl.value;

    if (!role || !tab || !subTab || !ROLE_PERMISSIONS[role]) return;

    if (!ROLE_PERMISSIONS[role].subTabs) ROLE_PERMISSIONS[role].subTabs = {};
    if (!ROLE_PERMISSIONS[role].subTabs[tab]) ROLE_PERMISSIONS[role].subTabs[tab] = {};

    if (level === 'hidden') {
      delete ROLE_PERMISSIONS[role].subTabs[tab][subTab];
    } else {
      ROLE_PERMISSIONS[role].subTabs[tab][subTab] = level;
    }

    // 清理空的 subTabs 对象，避免内存累积
    if (Object.keys(ROLE_PERMISSIONS[role].subTabs[tab]).length === 0) {
      delete ROLE_PERMISSIONS[role].subTabs[tab];
    }

    this._persistRolePermissions();
    this.showToast(`已更新 ${ROLE_PERMISSIONS[role].label} 的子标签权限：${subTab} → ${level}`);
  },

  /**
   * 更新角色操作能力开关（第三层，V4.2 第二阶段新增）
   */
  updateRoleAbility(checkboxEl) {
    const role = checkboxEl.dataset.role;
    const ability = checkboxEl.dataset.ability;
    const enabled = checkboxEl.checked;

    if (!role || !ability || !ROLE_PERMISSIONS[role]) return;

    if (!ROLE_PERMISSIONS[role].specialAbilities) ROLE_PERMISSIONS[role].specialAbilities = {};
    ROLE_PERMISSIONS[role].specialAbilities[ability] = enabled;

    this._persistRolePermissions();
    this.showToast(`已${enabled ? '开启' : '关闭'} ${ROLE_PERMISSIONS[role].label} 的能力：${ability}`);
    // 重新渲染以更新背景色
    this.renderAdminRoles();
  },

  /**
   * 持久化角色权限到 localStorage（保存完整三层：tabs + subTabs + specialAbilities）
   */
  _persistRolePermissions() {
    const snapshot = Object.fromEntries(
      Object.entries(ROLE_PERMISSIONS).map(([k, v]) => [
        k,
        {
          tabs: v.tabs || {},
          subTabs: v.subTabs || {},
          specialAbilities: v.specialAbilities || {}
        }
      ])
    );
    try {
      localStorage.setItem('melbeacon_role_perms', JSON.stringify(snapshot));
    } catch (e) { /* 忽略存储异常 */ }
  },

  /**
   * 重置角色权限为默认值
   * V4.2 修复：清除 localStorage 中该角色的覆盖，让 ROLE_PERMISSIONS 恢复代码中定义的默认值
   */
  resetRolePermissions(roleCode) {
    if (!roleCode || !ROLE_PERMISSIONS[roleCode] || roleCode === 'admin') return;

    // 从 localStorage 取出当前覆盖层
    let stored = {};
    try {
      stored = JSON.parse(localStorage.getItem('melbeacon_role_perms') || '{}');
    } catch (e) { /* 忽略 */ }

    // 删除该角色的覆盖，恢复代码默认值
    if (stored[roleCode]) {
      delete stored[roleCode];
      try {
        localStorage.setItem('melbeacon_role_perms', JSON.stringify(stored));
      } catch (e) { /* 忽略 */ }
    }

    // 重新加载页面以让 ROLE_PERMISSIONS 恢复代码默认值（最简单可靠的方式）
    this.showToast(`已重置 ${ROLE_PERMISSIONS[roleCode].label} 的权限为默认值，即将刷新...`);
    setTimeout(() => location.reload(), 800);
  },

  renderAdminSettings() {
    const container = document.getElementById('admin-settings');
    if (!container) return;

    const s = systemSettings;
    container.innerHTML = `
      <div style="padding: 20px 28px;">
        <div class="arch-card" style="margin-bottom: 16px;">
          <div class="arch-card-header"><h3>⚙️ 系统信息</h3></div>
          <div style="margin-top: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="padding: 10px 14px; background: var(--color-bg); border-radius: 6px;">
              <div style="font-size: 12px; color: var(--color-text-secondary);">系统名称</div>
              <div style="font-weight: 600;">${s.general.systemName}</div>
            </div>
            <div style="padding: 10px 14px; background: var(--color-bg); border-radius: 6px;">
              <div style="font-size: 12px; color: var(--color-text-secondary);">版本</div>
              <div style="font-weight: 600;">${s.general.version}</div>
            </div>
            <div style="padding: 10px 14px; background: var(--color-bg); border-radius: 6px;">
              <div style="font-size: 12px; color: var(--color-text-secondary);">时区</div>
              <div style="font-weight: 600;">${s.general.timezone}</div>
            </div>
            <div style="padding: 10px 14px; background: var(--color-bg); border-radius: 6px;">
              <div style="font-size: 12px; color: var(--color-text-secondary);">最近备份</div>
              <div style="font-weight: 600;">${s.general.lastBackup}</div>
            </div>
          </div>
        </div>

        <div class="arch-card" style="margin-bottom: 16px;">
          <div class="arch-card-header"><h3>🔔 通知配置</h3></div>
          <div style="margin-top: 10px; font-size: 14px; line-height: 2;">
            <div>推送通知: ${s.notifications.pushEnabled ? '✅ 已启用' : '❌ 未启用'}</div>
            <div>邮件通知: ${s.notifications.emailEnabled ? '✅ 已启用' : '❌ 未启用'}</div>
            <div>日报推送: ${s.notifications.dailyReport ? '✅ 已启用' : '❌ 未启用'}</div>
            <div>周报推送: ${s.notifications.weeklyReport ? '✅ 已启用' : '❌ 未启用'}</div>
            <div>预警阈值: <strong>${s.notifications.alertThreshold}</strong></div>
          </div>
        </div>

        <div class="arch-card">
          <div class="arch-card-header"><h3>☁️ 云端同步配置</h3></div>
          <div style="margin-top: 10px; font-size: 14px; line-height: 2;">
            <div>自动同步: ${s.autoSync.enabled ? '✅ 已启用' : '❌ 未启用'}</div>
            <div>同步频率: <strong>${s.autoSync.frequency}</strong></div>
            <div>最近同步: ${s.autoSync.lastSync}</div>
            <div>云存储: <strong>${s.autoSync.cloudStorage}</strong></div>
          </div>
          <div style="margin-top: 10px;">
            <button class="card-action-btn primary" onclick="App.showToast('立即同步到云端')">🔄 立即同步</button>
            <button class="card-action-btn" onclick="App.showToast('正在备份')">💾 备份</button>
          </div>
        </div>
      </div>
    `;
  },

  /* ========== 全部入口标签页 ========== */
  renderAllTab() {
    const container = document.getElementById('all-entry-grid');
    if (!container) return;

    const modules = [
      { id: 'tab-social', icon: '📱', name: '自媒体运营', desc: '平台优先架构 · 全域IP · 无痕迹转化', stats: '5平台 · 48条内容' },
      { id: 'tab-community', icon: '💬', name: '社群运营', desc: '推送日历为核心 · 社群漏斗 · L1→L2→L3', stats: '6社群 · 21条推送' },
      { id: 'tab-courseware', icon: '📚', name: '课件制作', desc: '课件策略与生产 · 评估→大纲→脚本→素材', stats: '23课件 · 156素材' },
      { id: 'tab-offline', icon: '🎪', name: '线下活动', desc: '沙龙讲座 · 体验馆运营 · 社区公益', stats: '4活动 · 12沙龙' },
      { id: 'tab-training', icon: '🎓', name: '经营者培训', desc: 'D→D3→D5→D8→SD→ED→ND→CD→PD', stats: '24学员 · 6课程' },
      { id: 'tab-hub', icon: '🏠', name: '运营中枢', desc: '角色专属看板 · 自动化任务 · 合规中心', stats: '21自动化 · 4复盘' },
      { id: 'tab-team', icon: '👥', name: '团队管理', desc: '团队全局视图 · 市场树 · 成长追踪', stats: '8团队 · 45成员' },
      { id: 'tab-tasks', icon: '📋', name: '任务计划', desc: '全局任务追踪 · 甘特图 · 优先级', stats: '12今日 · 31本周' },
      { id: 'tab-skills', icon: '🧩', name: 'Skills管理', desc: 'AI能力管理 · 技能配置 · 提示词', stats: '6技能 · 6模板' },
      { id: 'tab-brand', icon: '🤝', name: '品牌合作', desc: 'KOL合作 · 品牌资源 · 招商管理', stats: '5 KOL · 3方案' },
      { id: 'tab-admin', icon: '🛠️', name: '后台管理', desc: '用户管理 · 权限配置 · 系统设置', stats: '6用户 · 4角色' }
    ];

    container.innerHTML = `
      <div class="all-entry-grid">
        ${modules.map(m => `
          <div class="all-entry-card" onclick="App.switchTab('${m.id}')">
            <div class="all-entry-icon">${m.icon}</div>
            <div class="all-entry-body">
              <div class="all-entry-name">${m.name}</div>
              <div class="all-entry-desc">${m.desc}</div>
              <div class="all-entry-stats">${m.stats}</div>
            </div>
            <div class="all-entry-arrow">→</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  /* ========== 通用：给「点击」同时绑定 click + touchend，解决移动端 300ms 延迟 ========== */
  _bindDualEvent(targetSelector, handler, options) {
    const wrap = (e) => {
      // touchend 时先阻止默认，避免和 click 重复触发
      if (e.type === 'touchend') {
        e.preventDefault();
      }
      handler.call(this, e);
    };
    document.addEventListener('click', (e) => {
      if (e.target.closest(targetSelector)) wrap(e);
    });
    document.addEventListener('touchend', (e) => {
      if (e.target.closest(targetSelector)) wrap(e);
    }, options || { passive: false });
  },

  /* ========== 快捷操作绑定 ========== */
  bindQuickActions() {
    this._bindDualEvent('.comm-action-btn', () => {
      this.showToast('已复制提示词到剪贴板');
    });
    // 视图切换按钮 / 所有带 onclick 的卡片按钮——通过 delegate 兜底
    this._bindDualEvent('.view-toggle button', (e) => {
      const btn = e.target.closest('.view-toggle button');
      if (!btn) return;
      const group = btn.closest('.view-toggle');
      if (!group) return;
      group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // 触发卡片视图切换（目前只有样式变化，这里留钩子）
    });
  },

  /* ========== 同步按钮 ========== */
  bindSyncBtn() {
    this._bindDualEvent('.sync-btn', () => {
      this.showToast('正在同步到云端...');
      setTimeout(() => this.showToast('同步完成'), 1500);
    });
  },

  /* ========== Toast 提示 ========== */
  showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    // 3秒后移除
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  },

  /* ========== 复制到剪贴板 ========== */
  copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('已复制到剪贴板');
      }).catch(() => {
        this.showToast('已复制提示词到剪贴板');
      });
    } else {
      // 降级方案
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        this.showToast('已复制到剪贴板');
      } catch (err) {
        this.showToast('已复制提示词到剪贴板');
      }
      document.body.removeChild(textarea);
    }
  }
};

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
