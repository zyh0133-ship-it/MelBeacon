/**
 * MelBeacon 灯塔系统工作台 - 认证与权限系统
 * 文件：auth.js
 * 版本：V4.0
 *
 * 说明：
 *   自包含的登录 / 会话 / 权限模块，不依赖任何其他 JS 文件。
 *   配色与工作台保持一致：墨绿(#0D2818) + 金色(#F9A825)。
 *
 * 核心能力（V4.0 升级）：
 *   1. 登录 / 登出 / 会话恢复（localStorage 持久化，key = melbeacon_user）
 *   2. 30+ 细粒度角色 + 子标签页级别权限矩阵
 *   3. 四级数据范围：personal / team / market / all
 *   4. 自注册 → 领域+职责 → 系统自动匹配权限
 *   5. 委托管理：源头/团队领导可为团队成员改权限
 *   6. 团队管理独立标签页（tab-team）
 *   7. 课件管理员新角色（归属运营中枢团队）
 *   8. 登录界面渲染与事件绑定
 *   9. 与现有 App 联动：自动过滤侧边栏、拦截越权切换、注入用户菜单
 *
 * 对外 API：
 *   Auth.login(user, pwd)           → boolean
 *   Auth.logout()                   → 清除会话并回到登录界面
 *   Auth.restoreSession()           → boolean，从 localStorage 恢复会话
 *   Auth.currentUser                → {username, name, role, avatar, domain, teamId, ...} | null
 *   Auth.hasTabAccess(tabId)        → boolean
 *   Auth.hasSubTabAccess(tabId, subTabId) → boolean
 *   Auth.getSubTabAccessLevel(tabId, subTabId) → string
 *   Auth.isAdmin()                  → boolean
 *   Auth.getPermission()            → 当前角色权限对象 | null
 *   Auth.isViewOnly(tabId)          → boolean
 *   Auth.getDataScope()             → 'personal' | 'team' | 'market' | 'all'
 *   Auth.canManageTeamMembers()     → boolean
 *   Auth.isTeamLead()               → boolean
 *   Auth.isSDPlus()                 → boolean
 *   Auth.autoMatchPermission(domain, responsibility) → roleCode
 *   Auth.registerUser(userInfo)     → 注册新用户并自动匹配权限
 *   Auth.updateTeamMemberPermission(teamMemberId, newRole) → boolean
 *   Auth.getManageableMembers()     → 当前用户可管理的成员列表
 *   Auth.accounts                   → 全部账号定义数组
 *   Auth.renderLoginScreen()        → 登录界面 HTML 字符串
 *   Auth.bindLoginEvents()          → 绑定登录表单事件
 *   Auth.init()                     → 页面加载入口
 */

/* ============================================================
 * 一、权限级别常量（V4.0 扩展）
 * ============================================================ */

/** 标签页访问级别 */
const AUTH_ACCESS = {
  NONE: 'none',         // 无权限（不可见）
  VIEW: 'view',         // 只读权限（可查看不可编辑）
  CREATE: 'create',     // 可创建内容
  MANAGE: 'manage',     // 可管理/编辑
  FULL: 'full'          // 完全读写权限
};

/** 子标签页操作级别 */
const SUBTAB_ACCESS = {
  HIDDEN: 'hidden',     // 不可见
  VIEW: 'view',         // 只读
  PARTICIPATE: 'participate', // 可参与（如参加考核、参加活动）
  CREATE: 'create',     // 可创建内容
  MANAGE: 'manage',     // 可管理
  FULL: 'full'          // 完全权限
};

/** 数据范围 */
const DATA_SCOPE = {
  PERSONAL: 'personal', // 仅个人数据
  TEAM: 'team',         // 所属团队数据
  MARKET: 'market',     // 所属市场（自己培育的团队树）
  ALL: 'all'            // 全系统数据
};

/** 领域定义 */
const DOMAINS = {
  SOCIAL: 'social',           // 自媒体博主
  COMMUNITY: 'community',     // 社群运营
  OFFLINE: 'offline',         // 线下活动
  EXP_CENTER: 'exp_center',   // 体验馆
  HUB: 'hub'                  // 运营中枢
};

/** 领域标签 */
const DOMAIN_LABELS = {
  social: '自媒体',
  community: '社群运营',
  offline: '线下活动',
  exp_center: '体验馆',
  hub: '运营中枢'
};

/** 职责→角色代码映射表（用于自注册自动匹配） */
const RESPONSIBILITY_ROLE_MAP = {
  social: {
    '主理人/团队源头': 'blogger_lead',
    '内容策划': 'blogger_planner',
    '视频拍摄/剪辑': 'blogger_editor',
    '流量运营': 'blogger_traffic',
    '账号运营': 'blogger_ops'
  },
  community: {
    '主理人/团队源头': 'community_lead',
    '内容运营': 'comm_content',
    '互动引导': 'comm_interact',
    '答疑/产品顾问': 'comm_qa',
    '积分管理': 'comm_points',
    '打卡/作业追踪': 'comm_tracker',
    '培训交付': 'comm_trainer',
    '新人引导': 'comm_onboarder'
  },
  offline: {
    '负责人/团队源头': 'offline_lead',
    '活动策划': 'offline_planner',
    '活动执行统筹': 'offline_executor',
    '报名与资格管理': 'offline_reg',
    '活动主持人': 'offline_host',
    '活动记录与传播': 'offline_media',
    '活动复盘': 'offline_reviewer'
  },
  exp_center: {
    '店长/团队源头': 'exp_center_lead',
    '产品体验引导师': 'exp_guide',
    '自媒体运营': 'exp_media',
    '接待与客服': 'exp_reception'
  },
  hub: {
    '中枢负责人': 'hub_lead',
    '课件管理员': 'course_admin',
    '会议与培训协调员': 'hub_coordinator',
    '空间管家': 'hub_manager',
    '综合行政支持': 'hub_admin'
  }
};

/** 职责列表（供注册表单使用） */
const RESPONSIBILITY_OPTIONS = {
  social: ['主理人/团队源头', '内容策划', '视频拍摄/剪辑', '流量运营', '账号运营'],
  community: ['主理人/团队源头', '内容运营', '互动引导', '答疑/产品顾问', '积分管理', '打卡/作业追踪', '培训交付', '新人引导'],
  offline: ['负责人/团队源头', '活动策划', '活动执行统筹', '报名与资格管理', '活动主持人', '活动记录与传播', '活动复盘'],
  exp_center: ['店长/团队源头', '产品体验引导师', '自媒体运营', '接待与客服'],
  hub: ['中枢负责人', '课件管理员', '会议与培训协调员', '空间管家', '综合行政支持']
};


/* ============================================================
 * 二、角色权限矩阵（V4.0：30+ 细粒度角色）
 * ============================================================
 *
 * 每个角色定义：
 *   - label: 中文名称
 *   - domain: 所属领域（social/community/offline/exp_center/hub）
 *   - isLead: 是否是团队源头/领导者
 *   - isSDPlus: 是否是SD+市场领导者
 *   - tabs: 标签页访问级别（tabId → AUTH_ACCESS）
 *   - subTabs: 子标签页访问级别（tabId → { subTabId → SUBTAB_ACCESS }）
 *   - dashboardType: 运营中枢看板类型
 *   - dataScope: 数据范围（personal/team/market/all）
 *   - canManageUsers: 是否可管理用户
 *   - canManageTeamMembers: 是否可管理团队成员权限
 *   - canViewAllData: 是否可查看全部数据
 *   - isSuperAdmin: 是否超级管理员
 *   - specialAbilities: 特殊能力开关
 */

const ROLE_PERMISSIONS = {

  /* ===== A. 系统级角色 ===== */

  admin: {
    label: '系统管理员',
    domain: null,
    isLead: true,
    isSDPlus: true,
    tabs: {
      'tab-social': AUTH_ACCESS.FULL,
      'tab-community': AUTH_ACCESS.FULL,
      'tab-courseware': AUTH_ACCESS.FULL,
      'tab-offline': AUTH_ACCESS.FULL,
      'tab-training': AUTH_ACCESS.FULL,
      'tab-hub': AUTH_ACCESS.FULL,
      'tab-team': AUTH_ACCESS.FULL,
      'tab-tasks': AUTH_ACCESS.FULL,
      'tab-skills': AUTH_ACCESS.FULL,
      'tab-brand': AUTH_ACCESS.FULL,
      'tab-admin': AUTH_ACCESS.FULL,
      'tab-all': AUTH_ACCESS.FULL
    },
    subTabs: {},
    dashboardType: 'admin',
    dataScope: DATA_SCOPE.ALL,
    canManageUsers: true,
    canManageTeamMembers: true,
    canViewAllData: true,
    isSuperAdmin: true,
    specialAbilities: {
      canDesignCourse: true,
      canCreateExam: true,
      canWriteLecture: true,
      canManageTraining: true,
      canViewAllStudents: true,
      canAssignTraffic: true,
      canViewAllTeams: true,
      canManageAnyPermission: true
    }
  },

  /* ===== B. SD+ 阶衔说明 =====
   * SD+ 不是独立角色，而是用户身上的阶衔属性（isSDPlus）。
   * 任何领域角色（如 offline_executor、blogger_planner 等）
   * 只要 isSDPlus=true，即自动叠加以下权限：
   *   - tab-team 访问权限
   *   - canManageTeamMembers = true
   *   - dataScope 提升为 MARKET
   *   - 运营中枢看板切换为"市场全局看板"
   *   - 可查看自己市场下的所有团队
   * 源头（isLead）与 SD+（isSDPlus）互相独立、可叠加。
   * ===== */

  /* ===== C. 团队领导角色（源头） ===== */

  // 自媒体团队源头
  blogger_lead: {
    label: '自媒体团队主理人',
    domain: DOMAINS.SOCIAL,
    isLead: true,
    isSDPlus: false,
    tabs: {
      'tab-social': AUTH_ACCESS.FULL,
      'tab-community': AUTH_ACCESS.VIEW,
      'tab-offline': AUTH_ACCESS.VIEW,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-hub': AUTH_ACCESS.VIEW,
      'tab-team': AUTH_ACCESS.FULL
    },
    subTabs: {
      'tab-team': {
        'team-overview': SUBTAB_ACCESS.FULL,
        'team-members': SUBTAB_ACCESS.MANAGE,
        'team-growth': SUBTAB_ACCESS.VIEW,
        'team-traffic': SUBTAB_ACCESS.VIEW
      }
    },
    dashboardType: 'blogger_lead',
    dataScope: DATA_SCOPE.TEAM,
    canManageUsers: false,
    canManageTeamMembers: true,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  // 社群团队源头
  community_lead: {
    label: '社群团队主理人',
    domain: DOMAINS.COMMUNITY,
    isLead: true,
    isSDPlus: false,
    tabs: {
      'tab-community': AUTH_ACCESS.FULL,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-hub': AUTH_ACCESS.VIEW,
      'tab-team': AUTH_ACCESS.FULL
    },
    subTabs: {
      'tab-team': {
        'team-overview': SUBTAB_ACCESS.FULL,
        'team-members': SUBTAB_ACCESS.MANAGE,
        'team-growth': SUBTAB_ACCESS.VIEW,
        'team-traffic': SUBTAB_ACCESS.VIEW
      }
    },
    dashboardType: 'community_lead',
    dataScope: DATA_SCOPE.TEAM,
    canManageUsers: false,
    canManageTeamMembers: true,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  // 线下活动团队源头
  offline_lead: {
    label: '线下活动团队负责人',
    domain: DOMAINS.OFFLINE,
    isLead: true,
    isSDPlus: false,
    tabs: {
      'tab-offline': AUTH_ACCESS.FULL,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-hub': AUTH_ACCESS.VIEW,
      'tab-team': AUTH_ACCESS.FULL
    },
    subTabs: {
      'tab-team': {
        'team-overview': SUBTAB_ACCESS.FULL,
        'team-members': SUBTAB_ACCESS.MANAGE,
        'team-growth': SUBTAB_ACCESS.VIEW,
        'team-traffic': SUBTAB_ACCESS.VIEW
      }
    },
    dashboardType: 'offline_lead',
    dataScope: DATA_SCOPE.TEAM,
    canManageUsers: false,
    canManageTeamMembers: true,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  // 体验馆团队源头
  exp_center_lead: {
    label: '体验馆店长',
    domain: DOMAINS.EXP_CENTER,
    isLead: true,
    isSDPlus: false,
    tabs: {
      'tab-offline': AUTH_ACCESS.FULL,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-hub': AUTH_ACCESS.VIEW,
      'tab-team': AUTH_ACCESS.FULL
    },
    subTabs: {
      'tab-team': {
        'team-overview': SUBTAB_ACCESS.FULL,
        'team-members': SUBTAB_ACCESS.MANAGE,
        'team-growth': SUBTAB_ACCESS.VIEW,
        'team-traffic': SUBTAB_ACCESS.VIEW
      }
    },
    dashboardType: 'exp_lead',
    dataScope: DATA_SCOPE.TEAM,
    canManageUsers: false,
    canManageTeamMembers: true,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  // 运营中枢负责人
  hub_lead: {
    label: '运营中枢负责人',
    domain: DOMAINS.HUB,
    isLead: true,
    isSDPlus: false,
    tabs: {
      'tab-hub': AUTH_ACCESS.FULL,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-team': AUTH_ACCESS.FULL
    },
    subTabs: {
      'tab-team': {
        'team-overview': SUBTAB_ACCESS.FULL,
        'team-members': SUBTAB_ACCESS.MANAGE,
        'team-growth': SUBTAB_ACCESS.VIEW,
        'team-traffic': SUBTAB_ACCESS.VIEW
      }
    },
    dashboardType: 'hub_lead',
    dataScope: DATA_SCOPE.TEAM,
    canManageUsers: false,
    canManageTeamMembers: true,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  /* ===== D. 自媒体博主团队成员 ===== */

  blogger_planner: {
    label: '内容策划',
    domain: DOMAINS.SOCIAL,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-social': AUTH_ACCESS.CREATE,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-hub': AUTH_ACCESS.VIEW
    },
    subTabs: {
      'tab-social': {
        'social-overview': SUBTAB_ACCESS.VIEW,
        'social-content': SUBTAB_ACCESS.CREATE,
        'social-viral': SUBTAB_ACCESS.VIEW,
        'social-topics': SUBTAB_ACCESS.CREATE,
        'social-benchmark': SUBTAB_ACCESS.VIEW,
        'social-diagnostic': SUBTAB_ACCESS.VIEW,
        'social-rules': SUBTAB_ACCESS.VIEW
      }
    },
    dashboardType: 'blogger',
    dataScope: DATA_SCOPE.PERSONAL,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  blogger_editor: {
    label: '视频拍摄/剪辑',
    domain: DOMAINS.SOCIAL,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-social': AUTH_ACCESS.CREATE,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-hub': AUTH_ACCESS.VIEW
    },
    subTabs: {
      'tab-social': {
        'social-overview': SUBTAB_ACCESS.VIEW,
        'social-content': SUBTAB_ACCESS.CREATE,
        'social-viral': SUBTAB_ACCESS.VIEW,
        'social-topics': SUBTAB_ACCESS.VIEW,
        'social-benchmark': SUBTAB_ACCESS.VIEW,
        'social-diagnostic': SUBTAB_ACCESS.VIEW,
        'social-rules': SUBTAB_ACCESS.VIEW
      }
    },
    dashboardType: 'blogger',
    dataScope: DATA_SCOPE.PERSONAL,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  blogger_traffic: {
    label: '流量运营',
    domain: DOMAINS.SOCIAL,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-social': AUTH_ACCESS.VIEW,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-hub': AUTH_ACCESS.VIEW
    },
    subTabs: {
      'tab-social': {
        'social-overview': SUBTAB_ACCESS.VIEW,
        'social-content': SUBTAB_ACCESS.VIEW,
        'social-viral': SUBTAB_ACCESS.VIEW,
        'social-topics': SUBTAB_ACCESS.VIEW,
        'social-benchmark': SUBTAB_ACCESS.VIEW,
        'social-diagnostic': SUBTAB_ACCESS.FULL,
        'social-rules': SUBTAB_ACCESS.VIEW
      }
    },
    dashboardType: 'blogger',
    dataScope: DATA_SCOPE.PERSONAL,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  blogger_ops: {
    label: '账号运营',
    domain: DOMAINS.SOCIAL,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-social': AUTH_ACCESS.MANAGE,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-hub': AUTH_ACCESS.VIEW
    },
    subTabs: {
      'tab-social': {
        'social-overview': SUBTAB_ACCESS.FULL,
        'social-content': SUBTAB_ACCESS.MANAGE,
        'social-viral': SUBTAB_ACCESS.VIEW,
        'social-topics': SUBTAB_ACCESS.VIEW,
        'social-benchmark': SUBTAB_ACCESS.VIEW,
        'social-diagnostic': SUBTAB_ACCESS.VIEW,
        'social-rules': SUBTAB_ACCESS.VIEW
      }
    },
    dashboardType: 'blogger',
    dataScope: DATA_SCOPE.PERSONAL,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  /* ===== E. 社群运营团队成员 ===== */

  comm_content: {
    label: '内容运营专员',
    domain: DOMAINS.COMMUNITY,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-community': AUTH_ACCESS.CREATE,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-hub': AUTH_ACCESS.VIEW
    },
    subTabs: {
      'tab-community': {
        'comm-calendar': SUBTAB_ACCESS.CREATE,
        'comm-manage': SUBTAB_ACCESS.VIEW,
        'comm-onboarding': SUBTAB_ACCESS.VIEW,
        'comm-follow': SUBTAB_ACCESS.VIEW,
        'comm-funnel': SUBTAB_ACCESS.VIEW,
        'comm-arch': SUBTAB_ACCESS.VIEW
      }
    },
    dashboardType: 'community',
    dataScope: DATA_SCOPE.PERSONAL,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  comm_interact: {
    label: '互动引导员',
    domain: DOMAINS.COMMUNITY,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-community': AUTH_ACCESS.VIEW,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-hub': AUTH_ACCESS.VIEW
    },
    subTabs: {
      'tab-community': {
        'comm-calendar': SUBTAB_ACCESS.VIEW,
        'comm-manage': SUBTAB_ACCESS.PARTICIPATE,
        'comm-onboarding': SUBTAB_ACCESS.VIEW,
        'comm-follow': SUBTAB_ACCESS.VIEW,
        'comm-funnel': SUBTAB_ACCESS.VIEW,
        'comm-arch': SUBTAB_ACCESS.HIDDEN
      }
    },
    dashboardType: 'community',
    dataScope: DATA_SCOPE.PERSONAL,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  comm_qa: {
    label: '答疑/产品顾问',
    domain: DOMAINS.COMMUNITY,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-community': AUTH_ACCESS.VIEW,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-hub': AUTH_ACCESS.VIEW
    },
    subTabs: {
      'tab-community': {
        'comm-calendar': SUBTAB_ACCESS.VIEW,
        'comm-manage': SUBTAB_ACCESS.VIEW,
        'comm-onboarding': SUBTAB_ACCESS.VIEW,
        'comm-follow': SUBTAB_ACCESS.MANAGE,
        'comm-funnel': SUBTAB_ACCESS.VIEW,
        'comm-arch': SUBTAB_ACCESS.HIDDEN
      }
    },
    dashboardType: 'community',
    dataScope: DATA_SCOPE.PERSONAL,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  comm_points: {
    label: '积分管理员',
    domain: DOMAINS.COMMUNITY,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-community': AUTH_ACCESS.VIEW,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-hub': AUTH_ACCESS.VIEW
    },
    subTabs: {
      'tab-community': {
        'comm-calendar': SUBTAB_ACCESS.VIEW,
        'comm-manage': SUBTAB_ACCESS.MANAGE,
        'comm-onboarding': SUBTAB_ACCESS.VIEW,
        'comm-follow': SUBTAB_ACCESS.VIEW,
        'comm-funnel': SUBTAB_ACCESS.VIEW,
        'comm-arch': SUBTAB_ACCESS.HIDDEN
      }
    },
    dashboardType: 'community',
    dataScope: DATA_SCOPE.PERSONAL,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  comm_tracker: {
    label: '打卡/作业追踪员',
    domain: DOMAINS.COMMUNITY,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-community': AUTH_ACCESS.VIEW,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-hub': AUTH_ACCESS.VIEW
    },
    subTabs: {
      'tab-community': {
        'comm-calendar': SUBTAB_ACCESS.VIEW,
        'comm-manage': SUBTAB_ACCESS.VIEW,
        'comm-onboarding': SUBTAB_ACCESS.MANAGE,
        'comm-follow': SUBTAB_ACCESS.VIEW,
        'comm-funnel': SUBTAB_ACCESS.VIEW,
        'comm-arch': SUBTAB_ACCESS.HIDDEN
      }
    },
    dashboardType: 'community',
    dataScope: DATA_SCOPE.PERSONAL,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  comm_trainer: {
    label: '培训交付专员',
    domain: DOMAINS.COMMUNITY,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-community': AUTH_ACCESS.VIEW,
      'tab-training': AUTH_ACCESS.MANAGE,
      'tab-hub': AUTH_ACCESS.VIEW
    },
    subTabs: {
      'tab-training': {
        'training-mine': SUBTAB_ACCESS.VIEW,
        'training-progress': SUBTAB_ACCESS.VIEW,
        'training-exam': SUBTAB_ACCESS.VIEW,
        'training-calendar': SUBTAB_ACCESS.MANAGE,
        'training-activity': SUBTAB_ACCESS.VIEW
      }
    },
    dashboardType: 'community',
    dataScope: DATA_SCOPE.TEAM,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  comm_onboarder: {
    label: '新人引导员',
    domain: DOMAINS.COMMUNITY,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-community': AUTH_ACCESS.VIEW,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-hub': AUTH_ACCESS.VIEW
    },
    subTabs: {
      'tab-community': {
        'comm-calendar': SUBTAB_ACCESS.VIEW,
        'comm-manage': SUBTAB_ACCESS.VIEW,
        'comm-onboarding': SUBTAB_ACCESS.MANAGE,
        'comm-follow': SUBTAB_ACCESS.VIEW,
        'comm-funnel': SUBTAB_ACCESS.VIEW,
        'comm-arch': SUBTAB_ACCESS.HIDDEN
      }
    },
    dashboardType: 'community',
    dataScope: DATA_SCOPE.PERSONAL,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  /* ===== F. 线下活动团队成员 ===== */

  offline_planner: {
    label: '活动策划师',
    domain: DOMAINS.OFFLINE,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-offline': AUTH_ACCESS.CREATE,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-hub': AUTH_ACCESS.VIEW
    },
    subTabs: {
      'tab-offline': {
        'offline-calendar': SUBTAB_ACCESS.CREATE,
        'offline-execute': SUBTAB_ACCESS.VIEW,
        'offline-review': SUBTAB_ACCESS.VIEW
      }
    },
    dashboardType: 'offline',
    dataScope: DATA_SCOPE.PERSONAL,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  offline_executor: {
    label: '活动执行统筹',
    domain: DOMAINS.OFFLINE,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-offline': AUTH_ACCESS.VIEW,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-hub': AUTH_ACCESS.VIEW
    },
    subTabs: {
      'tab-offline': {
        'offline-calendar': SUBTAB_ACCESS.VIEW,
        'offline-execute': SUBTAB_ACCESS.MANAGE,
        'offline-review': SUBTAB_ACCESS.VIEW
      }
    },
    dashboardType: 'offline',
    dataScope: DATA_SCOPE.PERSONAL,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  offline_reg: {
    label: '报名与资格管理',
    domain: DOMAINS.OFFLINE,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-offline': AUTH_ACCESS.VIEW,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-hub': AUTH_ACCESS.VIEW
    },
    subTabs: {
      'tab-offline': {
        'offline-calendar': SUBTAB_ACCESS.VIEW,
        'offline-execute': SUBTAB_ACCESS.VIEW,
        'offline-review': SUBTAB_ACCESS.VIEW
      }
    },
    dashboardType: 'offline',
    dataScope: DATA_SCOPE.PERSONAL,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  offline_host: {
    label: '活动主持人',
    domain: DOMAINS.OFFLINE,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-offline': AUTH_ACCESS.VIEW,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-hub': AUTH_ACCESS.VIEW
    },
    subTabs: {
      'tab-offline': {
        'offline-calendar': SUBTAB_ACCESS.VIEW,
        'offline-execute': SUBTAB_ACCESS.PARTICIPATE,
        'offline-review': SUBTAB_ACCESS.VIEW
      }
    },
    dashboardType: 'offline',
    dataScope: DATA_SCOPE.PERSONAL,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  offline_media: {
    label: '活动记录与传播',
    domain: DOMAINS.OFFLINE,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-offline': AUTH_ACCESS.VIEW,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-hub': AUTH_ACCESS.VIEW
    },
    subTabs: {
      'tab-offline': {
        'offline-calendar': SUBTAB_ACCESS.VIEW,
        'offline-execute': SUBTAB_ACCESS.VIEW,
        'offline-review': SUBTAB_ACCESS.CREATE
      }
    },
    dashboardType: 'offline',
    dataScope: DATA_SCOPE.PERSONAL,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  offline_reviewer: {
    label: '活动复盘专员',
    domain: DOMAINS.OFFLINE,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-offline': AUTH_ACCESS.VIEW,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-hub': AUTH_ACCESS.VIEW
    },
    subTabs: {
      'tab-offline': {
        'offline-calendar': SUBTAB_ACCESS.VIEW,
        'offline-execute': SUBTAB_ACCESS.VIEW,
        'offline-review': SUBTAB_ACCESS.MANAGE
      }
    },
    dashboardType: 'offline',
    dataScope: DATA_SCOPE.PERSONAL,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  /* ===== G. 体验馆团队成员 ===== */

  exp_guide: {
    label: '产品体验引导师',
    domain: DOMAINS.EXP_CENTER,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-offline': AUTH_ACCESS.VIEW,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-hub': AUTH_ACCESS.VIEW
    },
    subTabs: {
      'tab-offline': {
        'offline-calendar': SUBTAB_ACCESS.VIEW,
        'offline-execute': SUBTAB_ACCESS.PARTICIPATE,
        'offline-review': SUBTAB_ACCESS.VIEW
      }
    },
    dashboardType: 'exp',
    dataScope: DATA_SCOPE.PERSONAL,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  exp_media: {
    label: '体验馆自媒体运营',
    domain: DOMAINS.EXP_CENTER,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-social': AUTH_ACCESS.VIEW,
      'tab-offline': AUTH_ACCESS.VIEW,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-hub': AUTH_ACCESS.VIEW
    },
    subTabs: {
      'tab-social': {
        'social-overview': SUBTAB_ACCESS.VIEW,
        'social-content': SUBTAB_ACCESS.CREATE,
        'social-viral': SUBTAB_ACCESS.VIEW,
        'social-topics': SUBTAB_ACCESS.VIEW,
        'social-benchmark': SUBTAB_ACCESS.VIEW,
        'social-diagnostic': SUBTAB_ACCESS.VIEW,
        'social-rules': SUBTAB_ACCESS.VIEW
      }
    },
    dashboardType: 'exp',
    dataScope: DATA_SCOPE.PERSONAL,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  exp_reception: {
    label: '接待与客服',
    domain: DOMAINS.EXP_CENTER,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-offline': AUTH_ACCESS.VIEW,
      'tab-training': AUTH_ACCESS.VIEW,
      'tab-hub': AUTH_ACCESS.VIEW
    },
    subTabs: {},
    dashboardType: 'exp',
    dataScope: DATA_SCOPE.PERSONAL,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  /* ===== H. 运营中枢团队成员 ===== */

  // 课件管理员（新增核心角色）
  course_admin: {
    label: '课件管理员',
    domain: DOMAINS.HUB,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-courseware': AUTH_ACCESS.FULL,
      'tab-training': AUTH_ACCESS.MANAGE,
      'tab-hub': AUTH_ACCESS.VIEW
    },
    subTabs: {
      'tab-training': {
        'training-mine': SUBTAB_ACCESS.VIEW,
        'training-progress': SUBTAB_ACCESS.VIEW,
        'training-exam': SUBTAB_ACCESS.MANAGE,
        'training-calendar': SUBTAB_ACCESS.VIEW,
        'training-activity': SUBTAB_ACCESS.VIEW,
        'training-courseware': SUBTAB_ACCESS.FULL
      }
    },
    dashboardType: 'course_admin',
    dataScope: DATA_SCOPE.TEAM,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: true,
      canCreateExam: true,
      canWriteLecture: true,
      canManageTraining: true,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  hub_coordinator: {
    label: '会议与培训协调员',
    domain: DOMAINS.HUB,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-hub': AUTH_ACCESS.VIEW,
      'tab-training': AUTH_ACCESS.VIEW
    },
    subTabs: {},
    dashboardType: 'hub',
    dataScope: DATA_SCOPE.PERSONAL,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  hub_manager: {
    label: '空间管家',
    domain: DOMAINS.HUB,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-hub': AUTH_ACCESS.VIEW,
      'tab-training': AUTH_ACCESS.VIEW
    },
    subTabs: {},
    dashboardType: 'hub',
    dataScope: DATA_SCOPE.PERSONAL,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  },

  hub_admin: {
    label: '综合行政支持',
    domain: DOMAINS.HUB,
    isLead: false,
    isSDPlus: false,
    tabs: {
      'tab-hub': AUTH_ACCESS.VIEW,
      'tab-training': AUTH_ACCESS.VIEW
    },
    subTabs: {},
    dashboardType: 'hub',
    dataScope: DATA_SCOPE.PERSONAL,
    canManageUsers: false,
    canManageTeamMembers: false,
    canViewAllData: false,
    isSuperAdmin: false,
    specialAbilities: {
      canDesignCourse: false,
      canCreateExam: false,
      canWriteLecture: false,
      canManageTraining: false,
      canViewAllStudents: false,
      canAssignTraffic: false,
      canViewAllTeams: false,
      canManageAnyPermission: false
    }
  }
};

/** 全部标签页（按优先级排序，用于无权限时默认跳转） */
const ALL_TABS = [
  'tab-social', 'tab-community', 'tab-courseware', 'tab-offline',
  'tab-training', 'tab-hub', 'tab-team',
  'tab-tasks', 'tab-skills', 'tab-brand', 'tab-admin', 'tab-all'
];

/** 开发管理分组标签页 */
const DEV_TABS = ['tab-tasks', 'tab-skills', 'tab-brand', 'tab-admin', 'tab-all'];

/** 团队管理标签页（仅源头/SD+/管理员可见） */
const TEAM_TABS = ['tab-team'];


/* ============================================================
 * 三、Auth 主对象
 * ============================================================ */
const Auth = {

  /* ---------- 配置 ---------- */

  SESSION_KEY: 'melbeacon_user',
  REGISTERED_USERS_KEY: 'melbeacon_registered_users',
  OVERLAY_ID: 'auth-login-overlay',
  _styleInjected: false,

  /* ---------- 状态 ---------- */

  /** 当前登录用户：{username, name, role, avatar, domain, teamId, isLead, isSDPlus, dataScope, registeredAt} 或 null */
  currentUser: null,

  /** 已注册用户列表（自注册用户存储在此） */
  registeredUsers: [],

  /* ---------- 回调钩子 ---------- */

  onLogin: null,
  onLogout: null,

  /* ============================================================
   * 四、演示账号定义（V4.0 扩展）
   * ============================================================ */
  accounts: [
    {
      username: 'admin',
      password: 'admin123',
      name: '系统管理员',
      role: 'admin',
      avatar: '🛡️',
      desc: '拥有全部权限，可管理用户与后台配置',
      domain: null,
      teamId: null,
      isLead: true,
      isSDPlus: true
    },
    {
      username: 'sdleader',
      password: 'sdleader123',
      name: 'SD+线下活动执行统筹',
      role: 'offline_executor',
      avatar: '👑',
      desc: '线下活动执行统筹，已晋升SD+，拥有市场管理权限',
      domain: 'offline',
      teamId: 'team-offline-01',
      isLead: false,
      isSDPlus: true
    },
    {
      username: 'blogger',
      password: 'blogger123',
      name: '自媒体博主',
      role: 'blogger_lead',
      avatar: '📱',
      desc: '自媒体团队主理人，管理内容团队',
      domain: 'social',
      teamId: 'team-social-01',
      isLead: true,
      isSDPlus: false
    },
    {
      username: 'community',
      password: 'community123',
      name: '社群运营主理人',
      role: 'community_lead',
      avatar: '💬',
      desc: '社群团队主理人，管理运营团队',
      domain: 'community',
      teamId: 'team-comm-01',
      isLead: true,
      isSDPlus: false
    },
    {
      username: 'offline',
      password: 'offline123',
      name: '线下活动负责人',
      role: 'offline_lead',
      avatar: '🎪',
      desc: '线下活动团队负责人',
      domain: 'offline',
      teamId: 'team-offline-01',
      isLead: true,
      isSDPlus: false
    },
    {
      username: 'courseadmin',
      password: 'course123',
      name: '课件管理员',
      role: 'course_admin',
      avatar: '📚',
      desc: '运营中枢课件管理员，可设计课程/出试卷/写讲稿',
      domain: 'hub',
      teamId: 'team-hub-01',
      isLead: false,
      isSDPlus: false
    },
    {
      username: 'blogplanner',
      password: 'blogplanner123',
      name: '内容策划',
      role: 'blogger_planner',
      avatar: '✍️',
      desc: '自媒体团队·内容策划，选题与内容规划',
      domain: 'social',
      teamId: 'team-social-01',
      isLead: false,
      isSDPlus: false
    },
    {
      username: 'comminteract',
      password: 'comminteract123',
      name: '互动引导员',
      role: 'comm_interact',
      avatar: '🤝',
      desc: '社群团队·互动引导，社群互动管理',
      domain: 'community',
      teamId: 'team-comm-01',
      isLead: false,
      isSDPlus: false
    },
    {
      username: 'offlineexec',
      password: 'offlineexec123',
      name: '活动执行统筹',
      role: 'offline_executor',
      avatar: '📋',
      desc: '线下活动团队·执行统筹',
      domain: 'offline',
      teamId: 'team-offline-01',
      isLead: false,
      isSDPlus: false
    }
  ],

  /* ============================================================
   * 五、登录 / 登出 / 会话
   * ============================================================ */

  /**
   * 登录
   * @param {string} username
   * @param {string} password
   * @returns {boolean}
   */
  login(username, password) {
    const u = (username || '').trim();
    const p = (password || '').trim();

    // 先查内置账号
    let account = this.accounts.find(a => a.username === u && a.password === p);

    // 再查自注册用户
    if (!account) {
      this._loadRegisteredUsers();
      account = this.registeredUsers.find(a => a.username === u && a.password === p);
    }

    if (!account) return false;

    this.currentUser = {
      username: account.username,
      name: account.name,
      role: account.role,
      avatar: account.avatar,
      domain: account.domain || null,
      teamId: account.teamId || null,
      isLead: account.isLead || false,
      isSDPlus: account.isSDPlus || false,
      dataScope: account.dataScope || DATA_SCOPE.PERSONAL,
      registeredAt: account.registeredAt || null
    };
    this._saveSession();
    return true;
  },

  /**
   * 登出
   */
  logout() {
    this.currentUser = null;
    try { localStorage.removeItem(this.SESSION_KEY); } catch (e) { /* 忽略 */ }
    const menu = document.getElementById('auth-user-menu');
    if (menu) menu.remove();
    const banner = document.getElementById('auth-viewonly-banner');
    if (banner) banner.remove();
    document.querySelectorAll('.nav-item').forEach(item => {
      item.style.display = '';
      item.classList.remove('auth-viewonly');
    });
    const devGroup = document.querySelector('.nav-group');
    if (devGroup) devGroup.style.display = '';
    // 清理管理员标识，避免登出后 .admin-only 元素仍可见
    document.body.classList.remove('auth-is-admin');
    this.showLogin();
    if (typeof this.onLogout === 'function') this.onLogout();
  },

  _saveSession() {
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(this.currentUser));
    } catch (e) { /* 忽略 */ }
  },

  restoreSession() {
    try {
      const saved = localStorage.getItem(this.SESSION_KEY);
      if (!saved) return false;
      const user = JSON.parse(saved);
      if (!user || !user.username) {
        localStorage.removeItem(this.SESSION_KEY);
        return false;
      }
      // 校验内置账号
      let account = this.accounts.find(a => a.username === user.username);
      // 校验自注册账号
      if (!account) {
        this._loadRegisteredUsers();
        account = this.registeredUsers.find(a => a.username === user.username);
      }
      if (!account) {
        localStorage.removeItem(this.SESSION_KEY);
        return false;
      }
      this.currentUser = {
        username: account.username,
        name: account.name,
        role: account.role,
        avatar: account.avatar,
        domain: account.domain || null,
        teamId: account.teamId || null,
        isLead: account.isLead || false,
        isSDPlus: account.isSDPlus || false,
        dataScope: account.dataScope || DATA_SCOPE.PERSONAL,
        registeredAt: account.registeredAt || null
      };
      return true;
    } catch (e) {
      try { localStorage.removeItem(this.SESSION_KEY); } catch (e2) { /* 忽略 */ }
      return false;
    }
  },

  /**
   * 加载自定义权限配置
   */
  loadCustomPermissions() {
    try {
      const saved = localStorage.getItem('melbeacon_role_perms');
      if (!saved) return;
      const customPerms = JSON.parse(saved);
      Object.entries(customPerms).forEach(([roleCode, permData]) => {
        if (ROLE_PERMISSIONS[roleCode]) {
          if (permData.tabs) {
            ROLE_PERMISSIONS[roleCode].tabs = { ...ROLE_PERMISSIONS[roleCode].tabs, ...permData.tabs };
          }
          if (permData.subTabs) {
            ROLE_PERMISSIONS[roleCode].subTabs = { ...ROLE_PERMISSIONS[roleCode].subTabs, ...permData.subTabs };
          }
          if (permData.dataScope) {
            ROLE_PERMISSIONS[roleCode].dataScope = permData.dataScope;
          }
          if (permData.specialAbilities) {
            ROLE_PERMISSIONS[roleCode].specialAbilities = { ...ROLE_PERMISSIONS[roleCode].specialAbilities, ...permData.specialAbilities };
          }
        }
      });
    } catch (e) { /* 忽略 */ }
  },

  /* ============================================================
   * 六、权限查询（V4.0 扩展）
   * ============================================================ */

  isAdmin() {
    return !!this.currentUser && this.currentUser.role === 'admin';
  },

  getPermission() {
    if (!this.currentUser) return null;
    return ROLE_PERMISSIONS[this.currentUser.role] || null;
  },

  getAccessLevel(tabId) {
    const perm = this.getPermission();
    if (!perm || !perm.tabs) return null;
    return perm.tabs[tabId] || null;
  },

  hasTabAccess(tabId) {
    const level = this.getAccessLevel(tabId);
    if (level !== null && level !== AUTH_ACCESS.NONE) return true;
    // SD+ 阶衔自动获得团队管理(tab-team)等关键标签的查看权限
    if (this.currentUser && this.currentUser.isSDPlus) {
      const sdPlusTabs = ['tab-team', 'tab-hub', 'tab-training'];
      if (sdPlusTabs.includes(tabId)) return true;
    }
    return false;
  },

  isViewOnly(tabId) {
    const level = this.getAccessLevel(tabId);
    // SD+ 自动获得的标签页默认为只读
    if (level === null || level === AUTH_ACCESS.NONE) {
      if (this.currentUser && this.currentUser.isSDPlus) {
        const sdPlusTabs = ['tab-team', 'tab-hub', 'tab-training'];
        if (sdPlusTabs.includes(tabId)) return true;
      }
      return false;
    }
    return level === AUTH_ACCESS.VIEW;
  },

  /**
   * 获取子标签页访问级别
   * @param {string} tabId
   * @param {string} subTabId
   * @returns {string} SUBTAB_ACCESS 级别
   */
  getSubTabAccessLevel(tabId, subTabId) {
    const perm = this.getPermission();
    if (!perm) return SUBTAB_ACCESS.HIDDEN;

    // 如果该标签页本身无权限，所有子标签页都不可见
    if (!this.hasTabAccess(tabId)) return SUBTAB_ACCESS.HIDDEN;

    // 如果有子标签页权限定义，查具体配置
    if (perm.subTabs && perm.subTabs[tabId] && perm.subTabs[tabId][subTabId] !== undefined) {
      return perm.subTabs[tabId][subTabId];
    }

    // SD+ 阶衔自动获得团队管理相关子标签的查看权限
    if (this.currentUser && this.currentUser.isSDPlus && tabId === 'tab-team') {
      const sdPlusSubTabs = ['team-overview', 'team-members', 'team-growth', 'team-traffic', 'team-market'];
      if (sdPlusSubTabs.includes(subTabId)) return SUBTAB_ACCESS.VIEW;
    }

    // 敏感子标签：需要特殊能力才能访问，未显式定义则默认隐藏
    const sensitiveSubTabs = {
      'tab-training': ['training-courseware'],  // 课件设计需要 canDesignCourse
      'tab-hub': ['hub-delegation']             // 委托管理需团队源头/SD+/管理员
    };
    if (sensitiveSubTabs[tabId] && sensitiveSubTabs[tabId].includes(subTabId)) {
      // V4.2 第二阶段：委托管理对团队源头/SD+/管理员自动放行
      if (subTabId === 'hub-delegation' && this.currentUser &&
          (this.currentUser.isLead || this.currentUser.isSDPlus || this.isAdmin())) {
        return SUBTAB_ACCESS.FULL;
      }
      return SUBTAB_ACCESS.HIDDEN;
    }

    // 否则根据标签页权限级别推断子标签页权限
    const tabLevel = this.getAccessLevel(tabId);
    if (tabLevel === AUTH_ACCESS.FULL) return SUBTAB_ACCESS.FULL;
    if (tabLevel === AUTH_ACCESS.MANAGE) return SUBTAB_ACCESS.MANAGE;
    if (tabLevel === AUTH_ACCESS.CREATE) return SUBTAB_ACCESS.CREATE;
    if (tabLevel === AUTH_ACCESS.VIEW) return SUBTAB_ACCESS.VIEW;
    // SD+ 自动获得的标签页，子标签默认只读
    if (this.currentUser && this.currentUser.isSDPlus) {
      const sdPlusTabs = ['tab-team', 'tab-hub', 'tab-training'];
      if (sdPlusTabs.includes(tabId)) return SUBTAB_ACCESS.VIEW;
    }
    return SUBTAB_ACCESS.HIDDEN;
  },

  hasSubTabAccess(tabId, subTabId) {
    const level = this.getSubTabAccessLevel(tabId, subTabId);
    return level !== SUBTAB_ACCESS.HIDDEN;
  },

  /**
   * 获取当前用户的数据范围
   * SD+ 阶衔自动将数据范围提升为 MARKET（若原范围更低）
   * @returns {string}
   */
  getDataScope() {
    if (!this.currentUser) return DATA_SCOPE.PERSONAL;
    const perm = this.getPermission();
    let scope = perm ? (perm.dataScope || DATA_SCOPE.PERSONAL) : DATA_SCOPE.PERSONAL;
    // SD+ 自动提升为 MARKET（个人/团队 → 市场）
    if (this.currentUser.isSDPlus && (scope === DATA_SCOPE.PERSONAL || scope === DATA_SCOPE.TEAM)) {
      scope = DATA_SCOPE.MARKET;
    }
    return scope;
  },

  /**
   * 获取运营中枢看板类型
   * SD+ 阶衔自动使用 'sd_plus' 看板（市场全局看板）
   */
  getDashboardType() {
    const perm = this.getPermission();
    if (!perm) return null;
    // SD+ 优先显示市场全局看板，不受具体角色限制
    if (this.currentUser && this.currentUser.isSDPlus) {
      return 'sd_plus';
    }
    return perm.dashboardType || null;
  },

  canViewTrafficAll() {
    if (!this.currentUser) return false;
    if (this.isAdmin()) return true;
    // SD+ 阶衔自动获得全量流量查看权（不限于特定角色）
    return this.currentUser.isSDPlus === true;
  },

  /**
   * 是否可以管理团队成员权限
   * @returns {boolean}
   */
  canManageTeamMembers() {
    if (!this.currentUser) return false;
    const perm = this.getPermission();
    // 源头(isLead)或SD+阶衔均可管理团队成员
    return perm ? (perm.canManageTeamMembers || perm.isSuperAdmin || this.currentUser.isSDPlus || false) : false;
  },

  /**
   * 是否是团队源头/领导者
   * @returns {boolean}
   */
  isTeamLead() {
    if (!this.currentUser) return false;
    const perm = this.getPermission();
    return perm ? (perm.isLead || false) : false;
  },

  /**
   * 是否是SD+市场领导者（阶衔属性，与角色独立）
   * @returns {boolean}
   */
  isSDPlus() {
    if (!this.currentUser) return false;
    // isSDPlus 是用户身上的阶衔属性，不依赖角色定义
    return this.currentUser.isSDPlus === true;
  },

  /**
   * 获取当前用户的团队ID
   * @returns {string|null}
   */
  getTeamId() {
    return this.currentUser ? this.currentUser.teamId : null;
  },

  /**
   * 获取当前用户的领域
   * @returns {string|null}
   */
  getDomain() {
    return this.currentUser ? this.currentUser.domain : null;
  },

  /**
   * 检查特殊能力
   * @param {string} ability
   * @returns {boolean}
   */
  hasSpecialAbility(ability) {
    if (!this.currentUser) return false;
    const perm = this.getPermission();
    if (!perm || !perm.specialAbilities) return false;
    return perm.specialAbilities[ability] || false;
  },

  getAccessibleTabs() {
    const perm = this.getPermission();
    if (!perm) return [];
    return ALL_TABS.filter(t => perm.tabs[t] && perm.tabs[t] !== AUTH_ACCESS.NONE);
  },

  _firstAccessibleTab() {
    const tabs = this.getAccessibleTabs();
    return tabs.length ? tabs[0] : null;
  },

  /* ============================================================
   * 七、自注册与权限自动匹配（V4.0 新增）
   * ============================================================ */

  /**
   * 根据领域和职责自动匹配角色代码
   * @param {string} domain - 领域代码
   * @param {string} responsibility - 职责名称
   * @returns {string|null} 角色代码
   */
  autoMatchPermission(domain, responsibility) {
    const domainMap = RESPONSIBILITY_ROLE_MAP[domain];
    if (!domainMap) return null;
    return domainMap[responsibility] || null;
  },

  /**
   * 注册新用户
   * @param {object} userInfo
   * @param {string} userInfo.username - 用户名
   * @param {string} userInfo.password - 密码
   * @param {string} userInfo.name - 姓名
   * @param {string} userInfo.domain - 领域
   * @param {string} userInfo.responsibility - 职责
   * @param {string} [userInfo.teamId] - 所属团队ID
   * @param {string} [userInfo.avatar] - 头像（可选）
   * @returns {object} { success: boolean, message: string, account: object|null }
   */
  registerUser(userInfo) {
    const { username, password, name, domain, responsibility, teamId, avatar } = userInfo;

    // 校验
    if (!username || !password || !name || !domain || !responsibility) {
      return { success: false, message: '请填写完整的注册信息', account: null };
    }

    // 用户名唯一性检查
    const allAccounts = this._getAllAccounts();
    if (allAccounts.find(a => a.username === username.trim())) {
      return { success: false, message: '该用户名已被使用', account: null };
    }

    // 自动匹配角色
    const roleCode = this.autoMatchPermission(domain, responsibility);
    if (!roleCode) {
      return { success: false, message: '无法匹配到合适的角色权限，请联系管理员', account: null };
    }

    const rolePerm = ROLE_PERMISSIONS[roleCode];
    if (!rolePerm) {
      return { success: false, message: '角色权限配置异常，请联系管理员', account: null };
    }

    // 创建账号
    const newAccount = {
      username: username.trim(),
      password: password.trim(),
      name: name.trim(),
      role: roleCode,
      avatar: avatar || this._getDefaultAvatar(domain),
      desc: `${DOMAIN_LABELS[domain] || domain} · ${responsibility}`,
      domain: domain,
      teamId: teamId || null,
      isLead: rolePerm.isLead || false,
      isSDPlus: rolePerm.isSDPlus || false,
      dataScope: rolePerm.dataScope || DATA_SCOPE.PERSONAL,
      registeredAt: new Date().toISOString(),
      isRegistered: true
    };

    // 保存到已注册用户列表
    this._loadRegisteredUsers();
    this.registeredUsers.push(newAccount);
    this._saveRegisteredUsers();

    return { success: true, message: '注册成功！', account: newAccount };
  },

  /**
   * 更新团队成员权限（由源头/团队领导/管理员操作）
   * @param {string} targetUsername - 目标用户名
   * @param {string} newRole - 新角色代码
   * @returns {object} { success: boolean, message: string }
   */
  updateTeamMemberPermission(targetUsername, newRole) {
    // 权限检查：只有管理员、源头、团队领导可以操作
    if (!this.canManageTeamMembers() && !this.isAdmin()) {
      return { success: false, message: '您没有权限修改其他成员的权限' };
    }

    if (!ROLE_PERMISSIONS[newRole]) {
      return { success: false, message: '无效的角色代码' };
    }

    // 查找目标用户
    this._loadRegisteredUsers();
    const target = this.registeredUsers.find(u => u.username === targetUsername);
    if (!target) {
      return { success: false, message: '未找到该用户' };
    }

    // 团队领导只能管理自己团队的成员
    if (this.isTeamLead() && !this.isAdmin()) {
      if (target.teamId !== this.currentUser.teamId) {
        return { success: false, message: '您只能管理自己团队的成员' };
      }
    }

    // SD+ 只能管理自己市场下的成员
    if (this.isSDPlus() && !this.isAdmin() && !this.isTeamLead()) {
      // 简化：SD+ 可以管理所有非管理员用户
      if (target.role === 'admin') {
        return { success: false, message: '您不能修改管理员的权限' };
      }
    }

    // 更新权限（角色权限 + 阶衔属性分离）
    const newPerm = ROLE_PERMISSIONS[newRole];
    target.role = newRole;
    target.domain = newPerm.domain || target.domain;
    target.isLead = newPerm.isLead || false;
    // isSDPlus 是阶衔属性，不因角色切换而改变，需单独维护
    // target.isSDPlus 保持原值
    target.dataScope = newPerm.dataScope || DATA_SCOPE.PERSONAL;

    this._saveRegisteredUsers();

    // 如果目标用户当前在线，更新其会话
    if (this.currentUser && this.currentUser.username === targetUsername) {
      this.currentUser.role = newRole;
      this.currentUser.domain = target.domain;
      this.currentUser.isLead = target.isLead;
      // isSDPlus 保持不变
      this.currentUser.dataScope = target.dataScope;
      this._saveSession();
    }

    return { success: true, message: `已成功将 ${target.name} 的权限更新为 ${newPerm.label}` };
  },

  /**
   * 获取当前用户可管理的成员列表
   * @returns {Array}
   */
  getManageableMembers() {
    this._loadRegisteredUsers();

    if (this.isAdmin()) {
      // 管理员可以管理所有注册用户
      return [...this.registeredUsers];
    }

    if (this.isSDPlus()) {
      // SD+ 可以管理自己市场下的所有非管理员
      return this.registeredUsers.filter(u => u.role !== 'admin');
    }

    if (this.isTeamLead()) {
      // 团队源头只能管理自己团队的成员
      return this.registeredUsers.filter(u => u.teamId === this.currentUser.teamId);
    }

    return [];
  },

  /**
   * 获取所有可用于权限管理的角色列表
   * @returns {Array}
   */
  getAvailableRoles() {
    return Object.entries(ROLE_PERMISSIONS).map(([code, perm]) => ({
      code,
      label: perm.label,
      domain: perm.domain,
      domainLabel: DOMAIN_LABELS[perm.domain] || '通用',
      isLead: perm.isLead
    }));
  },

  /* ============================================================
   * 八、内部辅助方法
   * ============================================================ */

  _getAllAccounts() {
    this._loadRegisteredUsers();
    return [...this.accounts, ...this.registeredUsers];
  },

  _loadRegisteredUsers() {
    try {
      const saved = localStorage.getItem(this.REGISTERED_USERS_KEY);
      if (saved) {
        this.registeredUsers = JSON.parse(saved);
      }
    } catch (e) {
      this.registeredUsers = [];
    }
  },

  _saveRegisteredUsers() {
    try {
      localStorage.setItem(this.REGISTERED_USERS_KEY, JSON.stringify(this.registeredUsers));
    } catch (e) { /* 忽略 */ }
  },

  _getDefaultAvatar(domain) {
    const avatars = {
      social: '📱',
      community: '💬',
      offline: '🎪',
      exp_center: '🏠',
      hub: '🏛️'
    };
    return avatars[domain] || '👤';
  },

  /* ============================================================
   * 九、登录界面渲染与事件
   * ============================================================ */

  renderLoginScreen() {
    const demoCards = this.accounts.map(a => `
      <div class="auth-demo-card" data-username="${a.username}" data-password="${a.password}" title="点击一键登录">
        <div class="auth-demo-avatar">${a.avatar}</div>
        <div class="auth-demo-info">
          <div class="auth-demo-name">${a.name}</div>
          <div class="auth-demo-desc">${a.desc}</div>
          <div class="auth-demo-cred"><code>${a.username}</code><span class="auth-sep">/</span><code>${a.password}</code></div>
        </div>
        <div class="auth-demo-go">登录 →</div>
      </div>
    `).join('');

    return `
      <div id="${this.OVERLAY_ID}" class="auth-overlay">
        <div class="auth-login-card">
          <div class="auth-brand">
            <div class="auth-logo">🗼</div>
            <h1>MelBeacon</h1>
            <p>灯塔系统 · 工作台</p>
          </div>

          <form id="auth-login-form" class="auth-form" autocomplete="off">
            <div class="auth-field">
              <label for="auth-username">用户名</label>
              <input type="text" id="auth-username" placeholder="请输入用户名" autocomplete="username">
            </div>
            <div class="auth-field">
              <label for="auth-password">密码</label>
              <input type="password" id="auth-password" placeholder="请输入密码" autocomplete="current-password">
            </div>
            <div id="auth-error" class="auth-error" role="alert"></div>
            <button type="submit" class="auth-login-btn">登 录</button>
          </form>

          <div class="auth-demo-section">
            <div class="auth-demo-title">演示账号 · 点击卡片一键登录</div>
            <div class="auth-demo-grid">${demoCards}</div>
          </div>

          <div class="auth-register-link">
            没有账号？<a href="#" id="auth-show-register">注册新账号</a>
          </div>

          <div class="auth-footer">MelBeacon © 2026 · DORA STUDIO</div>
        </div>
      </div>
    `;
  },

  /**
   * 渲染注册表单
   */
  renderRegisterForm() {
    const domainOptions = Object.entries(DOMAIN_LABELS).map(([code, label]) =>
      `<option value="${code}">${label}</option>`
    ).join('');

    return `
      <div id="${this.OVERLAY_ID}" class="auth-overlay">
        <div class="auth-login-card auth-register-card">
          <div class="auth-brand">
            <div class="auth-logo">🗼</div>
            <h1>注册新账号</h1>
            <p>选择您的领域和职责，系统将自动匹配权限</p>
          </div>

          <form id="auth-register-form" class="auth-form" autocomplete="off">
            <div class="auth-field">
              <label for="reg-name">姓名</label>
              <input type="text" id="reg-name" placeholder="请输入您的姓名" required>
            </div>
            <div class="auth-field">
              <label for="reg-username">用户名</label>
              <input type="text" id="reg-username" placeholder="请设置登录用户名" required>
            </div>
            <div class="auth-field">
              <label for="reg-password">密码</label>
              <input type="password" id="reg-password" placeholder="请设置密码" required>
            </div>
            <div class="auth-field">
              <label for="reg-domain">所属领域</label>
              <select id="reg-domain" required>
                <option value="">请选择领域</option>
                ${domainOptions}
              </select>
            </div>
            <div class="auth-field">
              <label for="reg-responsibility">具体职责</label>
              <select id="reg-responsibility" required disabled>
                <option value="">请先选择领域</option>
              </select>
            </div>
            <div class="auth-field">
              <label for="reg-team">所属团队（可选）</label>
              <input type="text" id="reg-team" placeholder="请输入团队ID或名称">
            </div>
            <div id="reg-error" class="auth-error" role="alert"></div>
            <button type="submit" class="auth-login-btn">注 册</button>
          </form>

          <div class="auth-register-link">
            已有账号？<a href="#" id="auth-show-login">返回登录</a>
          </div>

          <div class="auth-footer">MelBeacon © 2026 · DORA STUDIO</div>
        </div>
      </div>
    `;
  },

  bindLoginEvents() {
    const form = document.getElementById('auth-login-form');
    if (!form) return;
    if (form.dataset.authBound === '1') return;
    form.dataset.authBound = '1';

    // 表单提交
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('auth-username').value;
      const password = document.getElementById('auth-password').value;
      const errEl = document.getElementById('auth-error');

      if (!username.trim() || !password.trim()) {
        if (errEl) errEl.textContent = '请输入用户名和密码';
        return;
      }
      if (this.login(username, password)) {
        this._onLoginSuccess();
      } else {
        if (errEl) errEl.textContent = '用户名或密码错误，请重试';
      }
    });

    // 演示账号一键登录
    document.querySelectorAll('.auth-demo-card').forEach(card => {
      card.addEventListener('click', () => {
        const u = card.dataset.username;
        const p = card.dataset.password;
        document.getElementById('auth-username').value = u;
        document.getElementById('auth-password').value = p;
        const errEl = document.getElementById('auth-error');
        if (errEl) errEl.textContent = '';
        if (this.login(u, p)) {
          this._onLoginSuccess();
        }
      });
    });

    // 注册链接
    const showRegister = document.getElementById('auth-show-register');
    if (showRegister) {
      showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        this.showRegisterForm();
      });
    }
  },

  bindRegisterEvents() {
    const form = document.getElementById('auth-register-form');
    if (!form) return;
    if (form.dataset.authBound === '1') return;
    form.dataset.authBound = '1';

    // 领域切换时更新职责选项
    const domainSelect = document.getElementById('reg-domain');
    const respSelect = document.getElementById('reg-responsibility');

    if (domainSelect && respSelect) {
      domainSelect.addEventListener('change', () => {
        const domain = domainSelect.value;
        respSelect.innerHTML = '<option value="">请选择职责</option>';
        respSelect.disabled = !domain;

        if (domain && RESPONSIBILITY_OPTIONS[domain]) {
          RESPONSIBILITY_OPTIONS[domain].forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            respSelect.appendChild(option);
          });
        }
      });
    }

    // 注册表单提交
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const errEl = document.getElementById('reg-error');

      const userInfo = {
        name: document.getElementById('reg-name').value,
        username: document.getElementById('reg-username').value,
        password: document.getElementById('reg-password').value,
        domain: document.getElementById('reg-domain').value,
        responsibility: document.getElementById('reg-responsibility').value,
        teamId: document.getElementById('reg-team').value || null
      };

      const result = this.registerUser(userInfo);
      if (result.success) {
        // 注册成功后自动登录
        this.login(userInfo.username, userInfo.password);
        this._onLoginSuccess();
      } else {
        if (errEl) errEl.textContent = result.message;
      }
    });

    // 返回登录链接
    const showLogin = document.getElementById('auth-show-login');
    if (showLogin) {
      showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        this.showLogin();
      });
    }
  },

  showLogin() {
    this._injectStyles();
    this._replaceOverlay(this.renderLoginScreen());
    this.bindLoginEvents();
    setTimeout(() => {
      const u = document.getElementById('auth-username');
      if (u) u.focus();
    }, 60);
  },

  showRegisterForm() {
    this._injectStyles();
    this._replaceOverlay(this.renderRegisterForm());
    this.bindRegisterEvents();
    setTimeout(() => {
      const n = document.getElementById('reg-name');
      if (n) n.focus();
    }, 60);
  },

  _replaceOverlay(html) {
    let overlay = document.getElementById(this.OVERLAY_ID);
    if (overlay) overlay.remove();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    overlay = wrapper.firstElementChild;
    if (overlay) document.body.appendChild(overlay);
    if (overlay) overlay.style.display = 'flex';
  },

  hideLogin() {
    const overlay = document.getElementById(this.OVERLAY_ID);
    if (overlay) overlay.style.display = 'none';
  },

  _onLoginSuccess() {
    this.hideLogin();
    if (typeof this.onLogin === 'function') this.onLogin(this.currentUser);
    this._waitForApp(() => this.applyPermissions());
  },

  /* ============================================================
   * 十、与 App 联动：权限过滤 / 越权拦截 / 用户菜单
   * ============================================================ */

  applyPermissions() {
    if (!this.currentUser) return;
    this._patchApp();

    // 0. 标记管理员身份到 <body>，供 .admin-only 兜底样式使用
    //    （未登录或非管理员时 .admin-only 元素默认隐藏，见 style.css）
    document.body.classList.toggle('auth-is-admin', this.isAdmin());

    // 1. 过滤侧边栏导航项
    document.querySelectorAll('.nav-item').forEach(item => {
      const tabId = item.dataset.tab;
      if (!tabId) return;
      const hasAccess = this.hasTabAccess(tabId);
      item.style.display = hasAccess ? '' : 'none';
      item.classList.toggle('auth-viewonly', this.isViewOnly(tabId));
    });

    // 2. 隐藏无权限的"开发管理"分组
    const navDev = document.getElementById('nav-dev');
    if (navDev) {
      const anyDev = DEV_TABS.some(t => this.hasTabAccess(t));
      const group = navDev.closest('.nav-group');
      if (group) group.style.display = anyDev ? '' : 'none';
    }

    // 3. 注入用户菜单
    this._injectUserMenu();

    // 4. 校正当前激活标签页
    const activeItem = document.querySelector('.nav-item.active');
    const activeTab = activeItem ? activeItem.dataset.tab : null;
    if (!activeTab || !this.hasTabAccess(activeTab)) {
      const first = this._firstAccessibleTab();
      if (first && typeof App !== 'undefined' && typeof App.switchTab === 'function') {
        App.switchTab(first);
      }
    } else {
      this._markViewOnly(activeTab);
    }

    // 5. 应用子标签页过滤
    this._applySubTabFilters();

    // 6. 隐藏无特殊能力权限的功能区块（data-auth-ability）
    document.querySelectorAll('[data-auth-ability]').forEach(el => {
      const ability = el.dataset.authAbility;
      const perm = this.getPermission();
      const hasAbility = perm && perm.specialAbilities && perm.specialAbilities[ability] === true;
      el.style.display = hasAbility ? '' : 'none';
    });
  },

  /**
   * 应用子标签页过滤：隐藏当前活跃标签页中无权限的子标签
   */
  _applySubTabFilters() {
    const activeItem = document.querySelector('.nav-item.active');
    if (!activeItem) return;
    const activeTab = activeItem.dataset.tab;
    if (!activeTab) return;

    const perm = this.getPermission();
    if (!perm) return;

    // 过滤子标签
    const subTabsContainer = document.querySelector(`.sub-tabs[data-tab="${activeTab}"]`);
    if (subTabsContainer) {
      subTabsContainer.querySelectorAll('.sub-tab').forEach(subTab => {
        const subTabId = subTab.dataset.subtab;
        if (subTabId) {
          const hasAccess = this.hasSubTabAccess(activeTab, subTabId);
          subTab.style.display = hasAccess ? '' : 'none';
        }
      });
    }

    // 过滤子内容区域
    const tabContent = document.querySelector(`#content-${activeTab}`);
    if (tabContent) {
      tabContent.querySelectorAll('.sub-content').forEach(subContent => {
        const subTabId = subContent.id;
        if (subTabId) {
          const hasAccess = this.hasSubTabAccess(activeTab, subTabId);
          subContent.style.display = hasAccess ? '' : 'none';
        }
      });
    }
  },

  _patchApp() {
    if (typeof App === 'undefined' || !App || typeof App.switchTab !== 'function') return;
    if (App._authPatched) return;

    const self = this;
    const origSwitch = App.switchTab.bind(App);
    App.switchTab = function (tabId) {
      if (!self.currentUser) return origSwitch(tabId);
      if (!self.hasTabAccess(tabId)) {
        const first = self._firstAccessibleTab();
        if (first && first !== tabId) return origSwitch(first);
        return;
      }
      const result = origSwitch(tabId);
      self._markViewOnly(tabId);
      // 切换后应用子标签过滤
      self._applySubTabFilters();
      return result;
    };
    App._authPatched = true;
  },

  _markViewOnly(tabId) {
    let banner = document.getElementById('auth-viewonly-banner');
    if (this.isViewOnly(tabId)) {
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'auth-viewonly-banner';
        banner.className = 'auth-viewonly-banner';
        banner.innerHTML = '👁 只读模式：您当前对该模块仅有查看权限，无法进行编辑操作。';
        const main = document.querySelector('.main-content');
        if (main) main.insertBefore(banner, main.firstChild);
      }
      banner.style.display = '';
    } else if (banner) {
      banner.style.display = 'none';
    }
  },

  _injectUserMenu() {
    if (!this.currentUser) return;
    let menu = document.getElementById('auth-user-menu');
    if (menu) {
      menu.innerHTML = this._userMenuHTML();
      return;
    }
    menu = document.createElement('div');
    menu.id = 'auth-user-menu';
    menu.className = 'auth-user-menu';
    menu.innerHTML = this._userMenuHTML();

    const footer = document.querySelector('.sidebar-footer');
    const sidebar = document.querySelector('.sidebar');
    if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(menu, footer);
    } else if (sidebar) {
      sidebar.appendChild(menu);
    } else {
      document.body.appendChild(menu);
    }

    menu.addEventListener('click', (e) => {
      if (e.target.closest('.auth-logout-btn')) this.logout();
    });
  },

  _userMenuHTML() {
    const u = this.currentUser;
    const perm = this.getPermission();
    const roleLabel = perm ? perm.label : u.role;
    const domainLabel = u.domain ? DOMAIN_LABELS[u.domain] || '' : '';
    const teamLabel = u.isLead ? ' · 团队源头' : (u.isSDPlus ? ' · SD+市场' : '');
    return `
      <div class="auth-user-avatar">${u.avatar}</div>
      <div class="auth-user-info">
        <div class="auth-user-name">${u.name}</div>
        <div class="auth-user-role">${roleLabel}${domainLabel ? ' · ' + domainLabel : ''}${teamLabel}</div>
      </div>
      <button class="auth-logout-btn" title="退出登录" aria-label="退出登录">⏻</button>
    `;
  },

  /* ============================================================
   * 十一、样式注入与启动
   * ============================================================ */

  _injectStyles() {
    if (this._styleInjected) return;
    this._styleInjected = true;
    const style = document.createElement('style');
    style.id = 'auth-styles';
    style.textContent = `
      /* ===== 登录遮罩 ===== */
      .auth-overlay {
        position: fixed; inset: 0; z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        background: linear-gradient(135deg, #0D2818 0%, #13361F 60%, #1A3A24 100%);
        font-family: 'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif;
        animation: auth-fade-in 0.3s ease;
      }
      @keyframes auth-fade-in { from { opacity: 0; } to { opacity: 1; } }
      .auth-overlay * { box-sizing: border-box; }

      .auth-login-card {
        width: 460px; max-width: 94vw; max-height: 92vh; overflow-y: auto;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(249,168,37,0.25);
        border-radius: 16px;
        padding: 36px 34px 24px;
        color: #fff;
        box-shadow: 0 20px 60px rgba(0,0,0,0.45);
        backdrop-filter: blur(8px);
        animation: auth-pop 0.35s cubic-bezier(0.2, 0.8, 0.3, 1.2);
      }
      @keyframes auth-pop { from { transform: translateY(16px) scale(0.98); opacity: 0; } to { transform: none; opacity: 1; } }

      .auth-brand { text-align: center; margin-bottom: 22px; }
      .auth-logo { font-size: 40px; line-height: 1; }
      .auth-brand h1 { font-size: 24px; font-weight: 700; margin: 6px 0 4px; color: #F9A825; letter-spacing: 1px; }
      .auth-brand p { font-size: 12px; color: rgba(255,255,255,0.5); letter-spacing: 2px; }

      /* ===== 表单 ===== */
      .auth-form { display: flex; flex-direction: column; gap: 12px; }
      .auth-field { display: flex; flex-direction: column; gap: 5px; }
      .auth-field label { font-size: 12px; color: rgba(255,255,255,0.6); }
      .auth-field input,
      .auth-field select {
        width: 100%; padding: 10px 12px;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 8px; color: #fff; font-size: 14px;
        transition: all 0.2s ease;
      }
      .auth-field select { cursor: pointer; }
      .auth-field select option { background: #13361F; color: #fff; }
      .auth-field input::placeholder { color: rgba(255,255,255,0.35); }
      .auth-field input:focus, .auth-field select:focus {
        outline: none; border-color: #F9A825;
        background: rgba(249,168,37,0.08);
        box-shadow: 0 0 0 3px rgba(249,168,37,0.15);
      }

      .auth-error { font-size: 12px; color: #FF7A7A; min-height: 16px; }

      .auth-login-btn {
        margin-top: 2px; padding: 11px; border: none; cursor: pointer;
        background: linear-gradient(135deg, #F9A825 0%, #FBC02D 100%);
        color: #0D2818; font-size: 15px; font-weight: 700;
        border-radius: 8px; letter-spacing: 4px;
        transition: all 0.2s ease;
      }
      .auth-login-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(249,168,37,0.35); }
      .auth-login-btn:active { transform: translateY(0); }

      /* ===== 演示账号 ===== */
      .auth-demo-section { margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); }
      .auth-demo-title { font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 10px; }
      .auth-demo-grid { display: flex; flex-direction: column; gap: 6px; max-height: 220px; overflow-y: auto; }
      .auth-demo-card {
        display: flex; align-items: center; gap: 10px; cursor: pointer;
        padding: 8px 10px; border-radius: 8px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        transition: all 0.2s ease;
      }
      .auth-demo-card:hover {
        background: rgba(249,168,37,0.1);
        border-color: rgba(249,168,37,0.4);
        transform: translateX(2px);
      }
      .auth-demo-avatar { font-size: 20px; width: 30px; text-align: center; flex-shrink: 0; }
      .auth-demo-info { flex: 1; min-width: 0; }
      .auth-demo-name { font-size: 12px; font-weight: 600; color: #fff; }
      .auth-demo-desc { font-size: 10px; color: rgba(255,255,255,0.45); margin: 1px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .auth-demo-cred { font-size: 10px; color: rgba(255,255,255,0.55); }
      .auth-demo-cred code {
        background: rgba(0,0,0,0.28); padding: 1px 5px; border-radius: 4px;
        color: #F9A825; font-family: monospace; font-size: 10px;
      }
      .auth-demo-cred .auth-sep { margin: 0 3px; opacity: 0.5; }
      .auth-demo-go { font-size: 11px; color: #F9A825; white-space: nowrap; }

      /* ===== 注册链接 ===== */
      .auth-register-link {
        text-align: center; margin-top: 14px; font-size: 12px; color: rgba(255,255,255,0.5);
      }
      .auth-register-link a {
        color: #F9A825; text-decoration: none; cursor: pointer;
      }
      .auth-register-link a:hover { text-decoration: underline; }

      .auth-footer { text-align: center; margin-top: 16px; font-size: 11px; color: rgba(255,255,255,0.3); letter-spacing: 1px; }

      /* ===== 侧边栏用户菜单 ===== */
      .auth-user-menu {
        display: flex; align-items: center; gap: 10px;
        padding: 10px 14px; margin: 8px 12px;
        background: rgba(255,255,255,0.05);
        border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);
      }
      .auth-user-avatar { font-size: 20px; line-height: 1; }
      .auth-user-info { flex: 1; min-width: 0; }
      .auth-user-name { font-size: 13px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .auth-user-role { font-size: 11px; color: #F9A825; }
      .auth-logout-btn {
        background: rgba(229,57,53,0.15); color: #FF8A80;
        border: none; cursor: pointer; font-size: 15px;
        width: 30px; height: 30px; border-radius: 6px;
        transition: all 0.2s ease; flex-shrink: 0;
      }
      .auth-logout-btn:hover { background: rgba(229,57,53,0.35); color: #fff; }

      /* 只读导航项标记 */
      .nav-item.auth-viewonly::after {
        content: '👁'; margin-left: auto; font-size: 11px; opacity: 0.7;
      }

      /* ===== 只读提示条 ===== */
      .auth-viewonly-banner {
        padding: 8px 24px; font-size: 13px; color: #0D2818;
        background: linear-gradient(90deg, #FFF3D6 0%, #FFE9B0 100%);
        border-bottom: 1px solid rgba(249,168,37,0.4);
        text-align: center; font-weight: 500;
      }
    `;
    document.head.appendChild(style);
  },

  _waitForApp(cb) {
    let tries = 0;
    const check = () => {
      if (document.querySelectorAll('.nav-item').length > 0 || tries++ > 80) {
        cb();
      } else {
        setTimeout(check, 25);
      }
    };
    check();
  },

  init() {
    this._injectStyles();
    this.loadCustomPermissions();
    if (this.restoreSession()) {
      this._waitForApp(() => this.applyPermissions());
    } else {
      this.showLogin();
    }
  }
};

/* ============================================================
 * 十二、自动启动
 * ============================================================ */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () { Auth.init(); });
} else {
  Auth.init();
}