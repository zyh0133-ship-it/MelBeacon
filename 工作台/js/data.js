/**
 * MelBeacon 灯塔系统 - 模拟数据
 * 包含所有标签页的模拟数据
 */

// ========== 自媒体运营数据 ==========
const socialMediaPlatforms = [
  { id: 'all', name: '全部', icon: '🌐' },
  { id: 'xiaohongshu', name: '小红书', icon: '📕' },
  { id: 'douyin', name: '抖音', icon: '🎵' },
  { id: 'bilibili', name: 'B站', icon: '📺' },
  { id: 'xiaoyuzhou', name: '小宇宙', icon: '🎙️' },
  { id: 'shipinhao', name: '视频号', icon: '📱' }
];

// 自媒体运营 - 内容库卡片数据
const socialMediaCards = [
  {
    id: 'sm_001',
    title: '每天一杯绿茶片的真实变化，坚持30天后...',
    status: 'published',
    platform: 'xiaohongshu',
    domain: '营养学',
    track: '老年健康',
    format: '图文',
    views: 12800,
    likes: 856,
    comments: 124,
    favorites: 632,
    followerGrowth: '+2.3%',
    publishDate: '2026-07-25',
    tags: ['#营养学', '#小红书', '#老年健康'],
    score: 92
  },
  {
    id: 'sm_002',
    title: '新手精油入门指南！这5款精油改变我的生活',
    status: 'published',
    platform: 'xiaohongshu',
    domain: '精油芳疗',
    track: '精油入门',
    format: '图文',
    views: 8500,
    likes: 623,
    comments: 89,
    favorites: 478,
    followerGrowth: '+1.8%',
    publishDate: '2026-07-22',
    tags: ['#精油芳疗', '#小红书', '#精油入门'],
    score: 88
  },
  {
    id: 'sm_003',
    title: '护肤成分党必看！这个成分比VC还厉害',
    status: 'monitoring',
    platform: 'douyin',
    domain: '美妆护肤',
    track: '护肤成分党',
    format: '短视频',
    views: 45600,
    likes: 3200,
    comments: 456,
    favorites: 2100,
    followerGrowth: '+5.1%',
    publishDate: '2026-07-20',
    tags: ['#美妆护肤', '#抖音', '#护肤成分党'],
    score: 95
  },
  {
    id: 'sm_004',
    title: '居家清洁不踩坑！3个被低估的清洁好物',
    status: 'published',
    platform: 'bilibili',
    domain: '居家生活',
    track: '居家清洁',
    format: '长视频',
    views: 23400,
    likes: 1560,
    comments: 234,
    favorites: 890,
    followerGrowth: '+3.2%',
    publishDate: '2026-07-18',
    tags: ['#居家生活', '#B站', '#居家清洁'],
    score: 86
  },
  {
    id: 'sm_005',
    title: '减脂期怎么吃才不饿？营养师教你搭配',
    status: 'pending',
    platform: 'xiaohongshu',
    domain: '营养学',
    track: '减脂控糖',
    format: '短视频',
    views: 0,
    likes: 0,
    comments: 0,
    favorites: 0,
    followerGrowth: '--',
    publishDate: '2026-07-28',
    tags: ['#营养学', '#小红书', '#减脂控糖'],
    score: 78
  },
  {
    id: 'sm_006',
    title: '芳疗进阶：精油复配的黄金法则',
    status: 'need_optimize',
    platform: 'xiaohongshu',
    domain: '精油芳疗',
    track: '芳疗进阶',
    format: '图文',
    views: 3200,
    likes: 156,
    comments: 23,
    favorites: 98,
    followerGrowth: '+0.5%',
    publishDate: '2026-07-15',
    tags: ['#精油芳疗', '#小红书', '#芳疗进阶'],
    score: 65
  },
  {
    id: 'sm_007',
    title: '播客EP12：聊聊我的精油治愈之旅',
    status: 'published',
    platform: 'xiaoyuzhou',
    domain: '精油芳疗',
    track: '芳疗进阶',
    format: '播客',
    views: 5600,
    likes: 420,
    comments: 67,
    favorites: 312,
    followerGrowth: '+1.5%',
    publishDate: '2026-07-16',
    tags: ['#精油芳疗', '#小宇宙', '#芳疗进阶'],
    score: 82
  },
  {
    id: 'sm_008',
    title: '母婴营养：宝宝辅食添加的正确顺序',
    status: 'published',
    platform: 'shipinhao',
    domain: '营养学',
    track: '母婴营养',
    format: '短视频',
    views: 18900,
    likes: 1200,
    comments: 189,
    favorites: 756,
    followerGrowth: '+4.2%',
    publishDate: '2026-07-19',
    tags: ['#营养学', '#视频号', '#母婴营养'],
    score: 90
  },
  {
    id: 'sm_009',
    title: '环保生活：一个家庭如何减少化学清洁剂',
    status: 'pending',
    platform: 'bilibili',
    domain: '居家生活',
    track: '环保生活',
    format: '长视频',
    views: 0,
    likes: 0,
    comments: 0,
    favorites: 0,
    followerGrowth: '--',
    publishDate: '2026-07-30',
    tags: ['#居家生活', '#B站', '#环保生活'],
    score: 75
  },
  {
    id: 'sm_010',
    title: '老年健康必备：这3种营养素50岁后必须补',
    status: 'monitoring',
    platform: 'douyin',
    domain: '营养学',
    track: '老年健康',
    format: '短视频',
    views: 67800,
    likes: 4500,
    comments: 567,
    favorites: 3200,
    followerGrowth: '+6.8%',
    publishDate: '2026-07-21',
    tags: ['#营养学', '#抖音', '#老年健康'],
    score: 97
  }
];

// 爆款内容库数据
const viralContentCards = [
  {
    id: 'viral_001',
    title: '仅800粉却爆了10w+播放！这个选题太聪明了',
    originalAuthor: '@营养师小林',
    originalPlatform: '小红书',
    authorFollowers: 823,
    views: 125000,
    likes: 8900,
    domain: '营养学',
    track: '减脂控糖',
    format: '图文',
    discoveryDate: '2026-07-26',
    keyInsight: '用"反常识"切入减脂话题，引发评论争议带动流量'
  },
  {
    id: 'viral_002',
    title: '3千粉账号做到单条涨粉2000的秘诀',
    originalAuthor: '@芳疗日记Amy',
    originalPlatform: '抖音',
    authorFollowers: 3200,
    views: 89000,
    likes: 6700,
    domain: '精油芳疗',
    track: '精油入门',
    format: '短视频',
    discoveryDate: '2026-07-24',
    keyInsight: '睡前助眠场景+情绪共鸣，评论区引导互动'
  },
  {
    id: 'viral_003',
    title: '零粉丝冷启动，第一篇就爆了5万播放',
    originalAuthor: '@成分党小雅',
    originalPlatform: '小红书',
    authorFollowers: 12,
    views: 52000,
    likes: 3800,
    domain: '美妆护肤',
    track: '护肤成分党',
    format: '图文',
    discoveryDate: '2026-07-23',
    keyInsight: '产品横向对比测评+痛点列举，满足搜索需求'
  },
  {
    id: 'viral_004',
    title: '居家清洁视频意外出圈，播放破20万',
    originalAuthor: '@生活家老王',
    originalPlatform: '视频号',
    authorFollowers: 1500,
    views: 203000,
    likes: 12000,
    domain: '居家生活',
    track: '居家清洁',
    format: '短视频',
    discoveryDate: '2026-07-22',
    keyInsight: '前后对比强烈+沉浸式ASMR清洁声，完播率极高'
  },
  {
    id: 'viral_005',
    title: '母婴营养博主用"误区辟谣"模式快速起号',
    originalAuthor: '@育儿营养师Lily',
    originalPlatform: '抖音',
    authorFollowers: 500,
    views: 67000,
    likes: 4500,
    domain: '营养学',
    track: '母婴营养',
    format: '短视频',
    discoveryDate: '2026-07-20',
    keyInsight: '纠错型内容天然具有争议性和传播力'
  },
  {
    id: 'viral_006',
    title: 'B站长视频：50分钟精油科普播放量破8万',
    originalAuthor: '@植物星球',
    originalPlatform: 'B站',
    authorFollowers: 4500,
    views: 86000,
    likes: 7200,
    domain: '精油芳疗',
    track: '芳疗进阶',
    format: '长视频',
    discoveryDate: '2026-07-18',
    keyInsight: '硬核科普+精美动画+个人故事，打造差异化深度内容'
  }
];

// 对标账号数据
const benchmarkAccounts = [
  {
    id: 'bm_001',
    name: '@营养师小林',
    platform: 'xiaohongshu',
    domain: '营养学',
    track: '减脂控糖',
    followers: 15200,
    avgViews: 8500,
    avgLikes: 620,
    postFrequency: '每周3-4篇',
    recentGrowth: '+12%月涨粉',
    status: 'tracking',
    addedDate: '2026-07-01'
  },
  {
    id: 'bm_002',
    name: '@芳疗日记Amy',
    platform: 'douyin',
    domain: '精油芳疗',
    track: '精油入门',
    followers: 8500,
    avgViews: 12000,
    avgLikes: 890,
    postFrequency: '每周5条视频',
    recentGrowth: '+8%月涨粉',
    status: 'tracking',
    addedDate: '2026-06-28'
  },
  {
    id: 'bm_003',
    name: '@成分党小雅',
    platform: 'xiaohongshu',
    domain: '美妆护肤',
    track: '护肤成分党',
    followers: 3200,
    avgViews: 15000,
    avgLikes: 1100,
    postFrequency: '每周2篇',
    recentGrowth: '+25%月涨粉',
    status: 'tracking',
    addedDate: '2026-07-05'
  },
  {
    id: 'bm_004',
    name: '@植物星球',
    platform: 'bilibili',
    domain: '精油芳疗',
    track: '芳疗进阶',
    followers: 4500,
    avgViews: 22000,
    avgLikes: 1800,
    postFrequency: '每月2条长视频',
    recentGrowth: '+15%月涨粉',
    status: 'tracking',
    addedDate: '2026-06-15'
  },
  {
    id: 'bm_005',
    name: '@生活家老王',
    platform: 'shipinhao',
    domain: '居家生活',
    track: '居家清洁',
    followers: 6800,
    avgViews: 9000,
    avgLikes: 650,
    postFrequency: '每周3条视频',
    recentGrowth: '+10%月涨粉',
    status: 'paused',
    addedDate: '2026-07-10'
  },
  {
    id: 'bm_006',
    name: '@育儿营养师Lily',
    platform: 'douyin',
    domain: '营养学',
    track: '母婴营养',
    followers: 22000,
    avgViews: 18000,
    avgLikes: 1300,
    postFrequency: '每周4条视频',
    recentGrowth: '+18%月涨粉',
    status: 'tracking',
    addedDate: '2026-06-20'
  },
  {
    id: 'bm_007',
    name: '@精油科学实验室',
    platform: 'xiaoyuzhou',
    domain: '精油芳疗',
    track: '芳疗进阶',
    followers: 3200,
    avgViews: 4500,
    avgLikes: 320,
    postFrequency: '每两周1期播客',
    recentGrowth: '+6%月涨粉',
    status: 'tracking',
    addedDate: '2026-07-08'
  }
];

// 选题库数据
const topicIdeas = [
  {
    id: 'topic_001',
    title: '早餐只吃这些，营养师不推荐',
    source: '@营养师小林',
    sourcePlatform: '小红书',
    domain: '营养学',
    track: '减脂控糖',
    format: '图文',
    estimatedScore: 85,
    status: 'planned',
    plannedDate: '2026-07-29'
  },
  {
    id: 'topic_002',
    title: '精油+瑜伽=最佳助眠组合？实测分享',
    source: '@芳疗日记Amy',
    sourcePlatform: '抖音',
    domain: '精油芳疗',
    track: '精油入门',
    format: '短视频',
    estimatedScore: 80,
    status: 'idea',
    plannedDate: null
  },
  {
    id: 'topic_003',
    title: '夏日防晒误区TOP5，你中了几个',
    source: '@成分党小雅',
    sourcePlatform: '小红书',
    domain: '美妆护肤',
    track: '护肤成分党',
    format: '图文',
    estimatedScore: 88,
    status: 'planned',
    plannedDate: '2026-07-30'
  },
  {
    id: 'topic_004',
    title: '厨房清洁顺序错误，难怪越擦越脏',
    source: '@生活家老王',
    sourcePlatform: '视频号',
    domain: '居家生活',
    track: '居家清洁',
    format: '短视频',
    estimatedScore: 82,
    status: 'idea',
    plannedDate: null
  },
  {
    id: 'topic_005',
    title: '50岁后补钙，到底哪种钙片最好',
    source: '@育儿营养师Lily',
    sourcePlatform: '抖音',
    domain: '营养学',
    track: '老年健康',
    format: '短视频',
    estimatedScore: 90,
    status: 'planned',
    plannedDate: '2026-07-28'
  },
  {
    id: 'topic_006',
    title: '宝宝第一口辅食，90%的妈妈做错了',
    source: '@育儿营养师Lily',
    sourcePlatform: '抖音',
    domain: '营养学',
    track: '母婴营养',
    format: '短视频',
    estimatedScore: 86,
    status: 'idea',
    plannedDate: null
  }
];

// 账号概览数据
const accountOverview = {
  xiaohongshu: {
    name: '营养生活家',
    followers: 5800,
    totalLikes: 12500,
    totalViews: 89000,
    postsCount: 48,
    followerGrowthWeek: '+3.2%',
    followerGrowthMonth: '+12.5%',
    avgEngagement: '5.8%',
    topPost: { title: '每天一杯绿茶片的真实变化', views: 12800 }
  },
  douyin: {
    name: '美好生活实验室',
    followers: 3200,
    totalLikes: 8900,
    totalViews: 156000,
    postsCount: 35,
    followerGrowthWeek: '+5.1%',
    followerGrowthMonth: '+22.3%',
    avgEngagement: '7.2%',
    topPost: { title: '老年健康必备：这3种营养素50岁后必须补', views: 67800 }
  },
  bilibili: {
    name: '植物星球',
    followers: 2100,
    totalLikes: 5600,
    totalViews: 67000,
    postsCount: 12,
    followerGrowthWeek: '+2.8%',
    followerGrowthMonth: '+15.0%',
    avgEngagement: '8.3%',
    topPost: { title: '居家清洁不踩坑！3个被低估的清洁好物', views: 23400 }
  },
  xiaoyuzhou: {
    name: '芳疗之声',
    followers: 1500,
    totalLikes: 3200,
    totalViews: 28000,
    postsCount: 15,
    followerGrowthWeek: '+1.5%',
    followerGrowthMonth: '+6.0%',
    avgEngagement: '11.4%',
    topPost: { title: '播客EP12：聊聊我的精油治愈之旅', views: 5600 }
  },
  shipinhao: {
    name: '健康生活plus',
    followers: 4200,
    totalLikes: 7800,
    totalViews: 112000,
    postsCount: 28,
    followerGrowthWeek: '+4.2%',
    followerGrowthMonth: '+18.6%',
    avgEngagement: '6.9%',
    topPost: { title: '母婴营养：宝宝辅食添加的正确顺序', views: 18900 }
  }
};

// 数据诊断数据
const diagnosticData = {
  weekRange: '2026.07.21 - 2026.07.27',
  summary: {
    totalViews: 287600,
    totalLikes: 18900,
    totalComments: 2456,
    totalNewFollowers: 856,
    avgEngagement: '6.8%',
    bestPerformingPlatform: '抖音',
    bestPerformingPost: '老年健康必备：这3种营养素50岁后必须补'
  },
  platformBreakdown: [
    { platform: '小红书', views: 45000, likes: 3200, followers: '+230' },
    { platform: '抖音', views: 113400, likes: 7700, followers: '+350' },
    { platform: 'B站', views: 23400, likes: 1560, followers: '+56' },
    { platform: '小宇宙', views: 5600, likes: 420, followers: '+45' },
    { platform: '视频号', views: 99200, likes: 6020, followers: '+175' }
  ],
  recommendations: [
    '抖音老年健康赛道表现突出，建议加大投入',
    '小红书图文内容互动率下降，需要优化标题和封面',
    'B站长视频制作周期长，建议保持月更节奏',
    '播客听众粘性高但增长慢，考虑联动其他平台引流'
  ]
};

// 平台规则数据
const platformRules = [
  {
    id: 'rule_001',
    platform: '小红书',
    title: '小红书更新"虚假种草"治理规则 v3.0',
    publishDate: '2026-07-20',
    impact: '高',
    summary: '严厉打击代写代发、虚假测评、未使用声称使用等行为，违规内容将限流或下架',
    action: '检查所有已发布内容，确保真实体验声明'
  },
  {
    id: 'rule_002',
    platform: '抖音',
    title: '抖音电商创作者带货新规',
    publishDate: '2026-07-18',
    impact: '中',
    summary: '带货视频需要标注"广告"标签，严禁在非带货视频中暗示购买',
    action: '所有涉及产品推荐的内容需重新审查'
  },
  {
    id: 'rule_003',
    platform: 'B站',
    title: 'B站知识区推荐算法调整',
    publishDate: '2026-07-15',
    impact: '中',
    summary: '提升完播率权重，降低点赞率权重，长视频需在前30秒设置悬念',
    action: '优化长视频开头，提升完播率'
  },
  {
    id: 'rule_004',
    platform: '小宇宙',
    title: '小宇宙播客推荐机制更新',
    publishDate: '2026-07-12',
    impact: '低',
    summary: '新增"连续收听"推荐维度，鼓励系列化内容制作',
    action: '将精油播客改为系列化内容'
  }
];

// ========== 社群运营数据 ==========

// 推送日历数据
const pushCalendarData = {
  '2026-07-28': [
    {
      id: 'push_001',
      time: '08:30',
      communityName: '30天营养训练营·第12期',
      status: 'pushed',
      contentType: '知识卡片',
      content: '【营养知识卡】膳食纤维的分类与作用 - 纤维分水溶性和不溶性两大类...',
      targetGroup: '飞书群：营养训练营12期A组',
      pushTime: '08:30',
      operator: '系统自动'
    },
    {
      id: 'push_002',
      time: '09:00',
      communityName: '护肤科普社群·第3期',
      status: 'pending',
      contentType: '互动话题',
      content: '【早间互动】你目前用的护肤品中，含有什么核心成分？打在评论区...',
      targetGroup: '飞书群：护肤科普3期',
      pushTime: '09:00',
      operator: '手动推送'
    },
    {
      id: 'push_003',
      time: '12:00',
      communityName: '30天营养训练营·第12期',
      status: 'pending',
      contentType: '知识卡片',
      content: '【午间科普】你的午餐营养均衡吗？用5分钟自测一下',
      targetGroup: '飞书群：营养训练营12期A组/B组/C组',
      pushTime: '12:00',
      operator: '系统自动'
    },
    {
      id: 'push_004',
      time: '14:00',
      communityName: '精油芳疗体验营·第2期',
      status: 'pushed',
      contentType: '话术',
      content: '【下午茶时间】今天推荐薰衣草精油的使用方法 - 滴1滴在枕头上...',
      targetGroup: '飞书群：精油体验营2期',
      pushTime: '14:00',
      operator: '手动推送'
    },
    {
      id: 'push_005',
      time: '18:00',
      communityName: '护肤科普社群·第3期',
      status: 'pending',
      contentType: '知识卡片',
      content: '【晚间护肤课】晚间护肤的正确步骤与误区',
      targetGroup: '飞书群：护肤科普3期',
      pushTime: '18:00',
      operator: '系统自动'
    },
    {
      id: 'push_006',
      time: '20:00',
      communityName: '30天营养训练营·第12期',
      status: 'pending',
      contentType: '打卡提醒',
      content: '【今日打卡】完成今天的营养知识小测验，分享你的学习笔记',
      targetGroup: '飞书群：营养训练营12期A组/B组/C组',
      pushTime: '20:00',
      operator: '系统自动'
    }
  ],
  '2026-07-27': [
    {
      id: 'push_y01',
      time: '08:30',
      communityName: '30天营养训练营·第12期',
      status: 'pushed',
      contentType: '知识卡片',
      content: '【营养知识卡】维生素D的正确补充方式',
      targetGroup: '飞书群：营养训练营12期A组',
      pushTime: '08:30',
      operator: '系统自动'
    },
    {
      id: 'push_y02',
      time: '14:00',
      communityName: '精油芳疗体验营·第2期',
      status: 'pushed',
      contentType: '话术',
      content: '【精油小课堂】柠檬精油的10种日常用法',
      targetGroup: '飞书群：精油体验营2期',
      pushTime: '14:00',
      operator: '手动推送'
    },
    {
      id: 'push_y03',
      time: '20:00',
      communityName: '30天营养训练营·第12期',
      status: 'pushed',
      contentType: '打卡提醒',
      content: '【今日打卡】分享你今天的健康饮食照片',
      targetGroup: '飞书群：营养训练营12期A组/B组/C组',
      pushTime: '20:00',
      operator: '系统自动'
    }
  ],
  '2026-07-29': [
    {
      id: 'push_t01',
      time: '08:30',
      communityName: '30天营养训练营·第12期',
      status: 'pending',
      contentType: '知识卡片',
      content: '【营养知识卡】微量元素锌的重要性',
      targetGroup: '飞书群：营养训练营12期A组',
      pushTime: '08:30',
      operator: '系统自动'
    },
    {
      id: 'push_t02',
      time: '12:00',
      communityName: '护肤科普社群·第3期',
      status: 'pending',
      contentType: '互动话题',
      content: '【午间互动】你的防晒习惯打几分？',
      targetGroup: '飞书群：护肤科普3期',
      pushTime: '12:00',
      operator: '手动推送'
    },
    {
      id: 'push_t03',
      time: '18:00',
      communityName: '精油芳疗体验营·第2期',
      status: 'pending',
      contentType: '话术',
      content: '【晚间放松】茶树精油的居家使用指南',
      targetGroup: '飞书群：精油体验营2期',
      pushTime: '18:00',
      operator: '系统自动'
    },
    {
      id: 'push_t04',
      time: '20:00',
      communityName: '30天营养训练营·第12期',
      status: 'pending',
      contentType: '打卡提醒',
      content: '【今日打卡】完成微量元素小测验',
      targetGroup: '飞书群：营养训练营12期A组/B组/C组',
      pushTime: '20:00',
      operator: '系统自动'
    }
  ]
};

// 社群管理数据
const communityCards = [
  {
    id: 'comm_001',
    name: '30天营养训练营·第12期',
    status: 'active',
    dayProgress: 'Day 12/30',
    checkinRate: '78%',
    conversionRate: '35%',
    activityRate: '62%',
    newMembers: '+12',
    morningPush: '08:30 膳食纤维科普',
    afternoonPush: '12:00 午餐自测',
    weekTrend: [65, 72, 68, 78, 75, 80, 78],
    groups: ['A组', 'B组', 'C组']
  },
  {
    id: 'comm_002',
    name: '护肤科普社群·第3期',
    status: 'active',
    dayProgress: 'Day 8/21',
    checkinRate: '82%',
    conversionRate: '28%',
    activityRate: '70%',
    newMembers: '+5',
    morningPush: '09:00 成分互动',
    afternoonPush: '18:00 护肤课程',
    weekTrend: [70, 75, 78, 82, 80, 85, 82],
    groups: ['主群']
  },
  {
    id: 'comm_003',
    name: '精油芳疗体验营·第2期',
    status: 'active',
    dayProgress: 'Day 5/14',
    checkinRate: '88%',
    conversionRate: '42%',
    activityRate: '75%',
    newMembers: '+8',
    morningPush: '--',
    afternoonPush: '14:00 精油话术',
    weekTrend: [80, 82, 85, 88, 90, 87, 88],
    groups: ['主群']
  },
  {
    id: 'comm_004',
    name: '居家生活分享群',
    status: 'paused',
    dayProgress: '已结束',
    checkinRate: '65%',
    conversionRate: '22%',
    activityRate: '45%',
    newMembers: '+0',
    morningPush: '--',
    afternoonPush: '--',
    weekTrend: [55, 50, 48, 45, 42, 40, 38],
    groups: ['主群']
  },
  {
    id: 'comm_005',
    name: '新人引导社群·7月批次',
    status: 'active',
    dayProgress: 'Day 3/7',
    checkinRate: '90%',
    conversionRate: '--',
    activityRate: '85%',
    newMembers: '+15',
    morningPush: '09:00 新人必读',
    afternoonPush: '15:00 产品体验',
    weekTrend: [85, 88, 90, 92, 90, 88, 90],
    groups: ['A组', 'B组']
  },
  {
    id: 'comm_006',
    name: '经营者培育社群·D3进阶班',
    status: 'active',
    dayProgress: 'Day 10/30',
    checkinRate: '72%',
    conversionRate: '55%',
    activityRate: '68%',
    newMembers: '+3',
    morningPush: '08:00 每日一课',
    afternoonPush: '19:00 案例讨论',
    weekTrend: [60, 65, 68, 70, 72, 74, 72],
    groups: ['主群']
  }
];

// 新人引导数据
const onboardingData = [
  { id: 'ob_001', day: 'Day 1', title: '欢迎加入+会员权益介绍', status: 'completed', completionRate: '95%' },
  { id: 'ob_002', day: 'Day 2', title: '新手必买清单+首单指导', status: 'completed', completionRate: '88%' },
  { id: 'ob_003', day: 'Day 3', title: '产品体验打卡：营养辅助食品', status: 'in_progress', completionRate: '72%' },
  { id: 'ob_004', day: 'Day 4', title: '会员省钱攻略：消费回馈+尊荣迎宾礼', status: 'pending', completionRate: '--' },
  { id: 'ob_005', day: 'Day 5', title: '产品体验打卡：精油系列', status: 'pending', completionRate: '--' },
  { id: 'ob_006', day: 'Day 6', title: '社群答疑+常见问题', status: 'pending', completionRate: '--' },
  { id: 'ob_007', day: 'Day 7', title: '开启月度消费计划+专属顾问对接', status: 'pending', completionRate: '--' }
];

// 消费跟进数据
const consumptionFollowData = [
  { id: 'cf_001', member: '张**', status: '正常消费', lastOrder: '2026-07-15', monthlyPoints: 28, alert: null },
  { id: 'cf_002', member: '李**', status: '即将到期', lastOrder: '2026-06-20', monthlyPoints: 0, alert: '需要提醒续购' },
  { id: 'cf_003', member: '王**', status: '正常消费', lastOrder: '2026-07-22', monthlyPoints: 35, alert: null },
  { id: 'cf_004', member: '赵**', status: '可能流失', lastOrder: '2026-05-18', monthlyPoints: 0, alert: '2个月未消费' },
  { id: 'cf_005', member: '陈**', status: '新会员', lastOrder: '2026-07-25', monthlyPoints: 22, alert: '完成首月引导' },
  { id: 'cf_006', member: '孙**', status: '正常消费', lastOrder: '2026-07-18', monthlyPoints: 20, alert: null },
  { id: 'cf_007', member: '周**', status: '即将到期', lastOrder: '2026-06-25', monthlyPoints: 0, alert: '需要提醒续购' }
];

// 转化漏斗数据
const funnelData = [
  { stage: '公域关注', count: 5800, percentage: '100%' },
  { stage: '加私域', count: 2100, percentage: '36%' },
  { stage: '入社群', count: 890, percentage: '43%' },
  { stage: '成为会员', count: 234, percentage: '26%' },
  { stage: '持续消费(3月+)', count: 156, percentage: '67%' },
  { stage: '成为推广商', count: 45, percentage: '29%' },
  { stage: '晋升D3以上', count: 12, percentage: '27%' }
];

// 架构设计数据
const architectureData = [
  {
    id: 'arch_001',
    name: '30天营养训练营',
    type: '引流社群',
    duration: '30天',
    targetAudience: '公域引流用户',
    funnelStage: 'L1 -> L2',
    status: '运行中',
    version: 'V3.0'
  },
  {
    id: 'arch_002',
    name: '护肤科普社群',
    type: '引流社群',
    duration: '21天',
    targetAudience: '公域引流用户',
    funnelStage: 'L1 -> L2',
    status: '运行中',
    version: 'V1.5'
  },
  {
    id: 'arch_003',
    name: '精油芳疗体验营',
    type: '引流社群',
    duration: '14天',
    targetAudience: '公域引流用户',
    funnelStage: 'L1 -> L2',
    status: '运行中',
    version: 'V2.0'
  },
  {
    id: 'arch_004',
    name: '新人启航7天引导',
    type: '会员服务',
    duration: '7天',
    targetAudience: '新入会会员',
    funnelStage: 'L2',
    status: '运行中',
    version: 'V1.0'
  },
  {
    id: 'arch_005',
    name: '经营者培育社群',
    type: '经营者培育',
    duration: '30天',
    targetAudience: 'D及以上推广商',
    funnelStage: 'L2 -> L3',
    status: '运行中',
    version: 'V2.0'
  },
  {
    id: 'arch_006',
    name: '会员月度服务群',
    type: '会员服务',
    duration: '长期',
    targetAudience: '活跃会员',
    funnelStage: 'L2',
    status: '规划中',
    version: 'V0.1'
  }
];

// ========== 课件制作数据 ==========
// V4.2 第二阶段：打通课件中心与文件系统
// 每个课件关联 files 数组，包含 PPT/脚本/逐字稿/素材等虚拟文件
// 文件类型映射：pptx/word/md/mp4/png 等，对应前端展示与"下载"行为
const coursewareCards = [
  {
    id: 'cw_001',
    title: '绿茶片产品知识详解',
    level: 'L2',
    category: '营养辅助食品',
    format: 'PPT',
    status: 'completed',
    priority: '高',
    version: 'V2.0',
    description: '绿茶片成分解析、功效机制、对比竞品卖点、典型用户问答',
    author: '芳疗师小A',
    lastUpdate: '2026-07-15',
    files: [
      { id: 'f_001a', name: '绿茶片产品知识详解_V2.0.pptx', type: 'pptx', size: '4.2MB', lastModified: '2026-07-15', version: 'V2.0', uploadedBy: '芳疗师小A' },
      { id: 'f_001b', name: '绿茶片成分对照表.xlsx', type: 'xlsx', size: '128KB', lastModified: '2026-07-12', version: 'V1.0', uploadedBy: '芳疗师小A' },
      { id: 'f_001c', name: '绿茶片讲解逐字稿.docx', type: 'docx', size: '32KB', lastModified: '2026-07-14', version: 'V2.0', uploadedBy: '课件管理员' }
    ]
  },
  {
    id: 'cw_002',
    title: '精油入门培训课程',
    level: 'L3',
    category: '精油与身体护理',
    format: 'PPT',
    status: 'completed',
    priority: '高',
    version: 'V3.0',
    description: '精油基础知识、安全使用、芳疗应用、调配原则、案例分享',
    author: '芳疗师小A',
    lastUpdate: '2026-06-28',
    files: [
      { id: 'f_002a', name: '精油入门培训课程_V3.0.pptx', type: 'pptx', size: '6.8MB', lastModified: '2026-06-28', version: 'V3.0', uploadedBy: '芳疗师小A' },
      { id: 'f_002b', name: '精油安全使用指南.pdf', type: 'pdf', size: '512KB', lastModified: '2026-06-25', version: 'V1.0', uploadedBy: '课件管理员' },
      { id: 'f_002c', name: '精油调配比例速查表.png', type: 'png', size: '256KB', lastModified: '2026-06-27', version: 'V2.0', uploadedBy: '芳疗师小A' }
    ]
  },
  {
    id: 'cw_003',
    title: '水贝娜护肤系列介绍',
    level: 'L2',
    category: '美妆护肤',
    format: 'PPT',
    status: 'in_progress',
    priority: '中',
    version: 'V1.0',
    description: '水贝娜品牌故事、产品矩阵、核心成分、使用顺序、搭配推荐',
    author: '张**',
    lastUpdate: '2026-07-20',
    files: [
      { id: 'f_003a', name: '水贝娜护肤系列介绍_V1.0.pptx', type: 'pptx', size: '5.1MB', lastModified: '2026-07-20', version: 'V1.0', uploadedBy: '张**' },
      { id: 'f_003b', name: '水贝娜成分详解.docx', type: 'docx', size: '48KB', lastModified: '2026-07-18', version: 'V0.9', uploadedBy: '张**' }
    ]
  },
  {
    id: 'cw_004',
    title: '30天营养训练营Day 1-5课件',
    level: 'L1',
    category: '营养辅助食品',
    format: '短视频脚本',
    status: 'completed',
    priority: '高',
    version: 'V2.0',
    description: '营养训练营前5天每日主题脚本、镜头分镜、口播稿、互动话术',
    author: '李**',
    lastUpdate: '2026-07-10',
    files: [
      { id: 'f_004a', name: '30天营养训练营_Day1-5_脚本合集.docx', type: 'docx', size: '156KB', lastModified: '2026-07-10', version: 'V2.0', uploadedBy: '李**' },
      { id: 'f_004b', name: 'Day1_开场视频脚本.mp4', type: 'mp4', size: '12.4MB', lastModified: '2026-07-08', version: 'V1.0', uploadedBy: '李**' },
      { id: 'f_004c', name: 'Day2-5_分镜表.xlsx', type: 'xlsx', size: '84KB', lastModified: '2026-07-09', version: 'V2.0', uploadedBy: '李**' },
      { id: 'f_004d', name: '训练营互动话术库.md', type: 'md', size: '24KB', lastModified: '2026-07-10', version: 'V1.0', uploadedBy: '李**' }
    ]
  },
  {
    id: 'cw_005',
    title: '奖金制度讲解2026新版',
    level: 'L3',
    category: '综合',
    format: 'PPT',
    status: 'completed',
    priority: '高',
    version: 'V1.0',
    description: '2026奖金制度变更点、阶衔体系、晋升路径、收益测算示例',
    author: '周**',
    lastUpdate: '2026-06-15',
    files: [
      { id: 'f_005a', name: '奖金制度讲解2026新版_V1.0.pptx', type: 'pptx', size: '3.6MB', lastModified: '2026-06-15', version: 'V1.0', uploadedBy: '周**' },
      { id: 'f_005b', name: '2026奖金制度对比表.xlsx', type: 'xlsx', size: '96KB', lastModified: '2026-06-14', version: 'V1.0', uploadedBy: '周**' },
      { id: 'f_005c', name: '收益测算工具.xlsx', type: 'xlsx', size: '64KB', lastModified: '2026-06-15', version: 'V1.0', uploadedBy: '周**' }
    ]
  },
  {
    id: 'cw_006',
    title: '新品上市发布会脚本',
    level: 'L2',
    category: '综合',
    format: '逐字稿',
    status: 'draft',
    priority: '低',
    version: 'V0.5',
    description: '新品发布会主持人脚本、嘉宾介绍、产品揭幕流程、媒体问答预案',
    author: '张**',
    lastUpdate: '2026-07-22',
    files: [
      { id: 'f_006a', name: '新品上市发布会脚本_V0.5.docx', type: 'docx', size: '42KB', lastModified: '2026-07-22', version: 'V0.5', uploadedBy: '张**' }
    ]
  },
  {
    id: 'cw_007',
    title: '居家清洁产品对比测评脚本',
    level: 'L1',
    category: '居家清洁',
    format: '短视频脚本',
    status: 'in_progress',
    priority: '中',
    version: 'V1.0',
    description: '4款居家清洁产品测评对比、使用场景、性价比分析、推荐话术',
    author: '李**',
    lastUpdate: '2026-07-25',
    files: [
      { id: 'f_007a', name: '居家清洁产品对比测评脚本.docx', type: 'docx', size: '38KB', lastModified: '2026-07-25', version: 'V1.0', uploadedBy: '李**' },
      { id: 'f_007b', name: '产品测评数据.xlsx', type: 'xlsx', size: '72KB', lastModified: '2026-07-24', version: 'V1.0', uploadedBy: '李**' }
    ]
  },
  {
    id: 'cw_008',
    title: '社群运营SOP培训',
    level: 'L3',
    category: '综合',
    format: '逐字稿',
    status: 'completed',
    priority: '中',
    version: 'V1.0',
    description: '社群运营全流程SOP讲解、话术模板、危机处理、活跃度提升技巧',
    author: '李**',
    lastUpdate: '2026-06-30',
    files: [
      { id: 'f_008a', name: '社群运营SOP培训_逐字稿.docx', type: 'docx', size: '88KB', lastModified: '2026-06-30', version: 'V1.0', uploadedBy: '李**' },
      { id: 'f_008b', name: '社群运营SOP流程图.png', type: 'png', size: '320KB', lastModified: '2026-06-28', version: 'V1.0', uploadedBy: '李**' },
      { id: 'f_008c', name: '社群话术模板库.md', type: 'md', size: '45KB', lastModified: '2026-06-29', version: 'V1.0', uploadedBy: '李**' }
    ]
  },
  {
    id: 'cw_009',
    title: '自媒体运营实战（L3经营者必修）',
    level: 'L3',
    category: '综合',
    format: 'PPT',
    status: 'completed',
    priority: '高',
    version: 'V1.0',
    description: '多平台账号定位、内容选题方法论、爆款拆解、涨粉策略、数据复盘与变现路径——L3经营者培育必修课',
    author: '张**',
    lastUpdate: '2026-07-26',
    files: [
      { id: 'f_009a', name: '自媒体运营实战_L3必修_V1.0.pptx', type: 'pptx', size: '7.2MB', lastModified: '2026-07-26', version: 'V1.0', uploadedBy: '张**' },
      { id: 'f_009b', name: '爆款选题方法论.pdf', type: 'pdf', size: '680KB', lastModified: '2026-07-24', version: 'V1.0', uploadedBy: '张**' },
      { id: 'f_009c', name: '多平台运营对照表.xlsx', type: 'xlsx', size: '156KB', lastModified: '2026-07-23', version: 'V1.0', uploadedBy: '张**' },
      { id: 'f_009d', name: '自媒体运营实战_逐字稿.docx', type: 'docx', size: '92KB', lastModified: '2026-07-25', version: 'V1.0', uploadedBy: '张**' }
    ]
  },
  {
    id: 'cw_010',
    title: '数据复盘与目标管理（L3经营者必修）',
    level: 'L3',
    category: '综合',
    format: 'PPT',
    status: 'in_progress',
    priority: '高',
    version: 'V0.9',
    description: '月度/季度数据复盘框架、关键指标解读、目标拆解OKR、漏斗分析与归因方法、改进计划制定——L3经营者培育必修课',
    author: '周**',
    lastUpdate: '2026-07-27',
    files: [
      { id: 'f_010a', name: '数据复盘与目标管理_L3必修_V0.9.pptx', type: 'pptx', size: '5.6MB', lastModified: '2026-07-27', version: 'V0.9', uploadedBy: '周**' },
      { id: 'f_010b', name: '月度复盘模板.xlsx', type: 'xlsx', size: '112KB', lastModified: '2026-07-26', version: 'V1.0', uploadedBy: '周**' },
      { id: 'f_010c', name: 'OKR目标拆解工具.xlsx', type: 'xlsx', size: '88KB', lastModified: '2026-07-25', version: 'V1.0', uploadedBy: '周**' }
    ]
  },
  {
    id: 'cw_011',
    title: '团队领导力进阶（L3经营者必修）',
    level: 'L3',
    category: '综合',
    format: 'PPT',
    status: 'in_progress',
    priority: '高',
    version: 'V0.8',
    description: '团队发展阶段识别、授权与赋能、冲突管理、激励技巧、跨团队协作、SD+/ED领导力跃迁——L3经营者培育必修课（D8晋升SD必备）',
    author: '周**',
    lastUpdate: '2026-07-27',
    files: [
      { id: 'f_011a', name: '团队领导力进阶_L3必修_V0.8.pptx', type: 'pptx', size: '6.4MB', lastModified: '2026-07-27', version: 'V0.8', uploadedBy: '周**' },
      { id: 'f_011b', name: '团队发展阶段评估表.xlsx', type: 'xlsx', size: '76KB', lastModified: '2026-07-26', version: 'V1.0', uploadedBy: '周**' },
      { id: 'f_011c', name: '领导力案例集.docx', type: 'docx', size: '128KB', lastModified: '2026-07-25', version: 'V0.9', uploadedBy: '周**' }
    ]
  }
];

/**
 * 课件文件类型元数据（V4.2 第二阶段新增）
 * 用于渲染文件图标、颜色、"下载"行为提示
 */
const COURSEWARE_FILE_TYPES = {
  pptx: { icon: '📊', label: 'PPT', color: '#E64A19', desc: 'PowerPoint 演示文稿' },
  docx: { icon: '📄', label: 'Word', color: '#1565C0', desc: 'Word 文档' },
  xlsx: { icon: '📗', label: 'Excel', color: '#2E7D32', desc: 'Excel 表格' },
  pdf:  { icon: '📕', label: 'PDF', color: '#C62828', desc: 'PDF 文档' },
  mp4:  { icon: '🎬', label: '视频', color: '#6A1B9A', desc: '视频文件' },
  png:  { icon: '🖼️', label: '图片', color: '#00838F', desc: 'PNG 图片' },
  md:   { icon: '📝', label: 'MD', color: '#5D4037', desc: 'Markdown 文档' }
};

/**
 * 获取课件文件类型元数据
 */
function getCoursewareFileType(fileType) {
  return COURSEWARE_FILE_TYPES[fileType] || { icon: '📎', label: fileType, color: '#757575', desc: '文件' };
}

// ========== 线下活动数据 ==========
const activityCards = [
  { id: 'act_001', title: '精油体验沙龙·夏日特辑', type: '沙龙讲座', status: 'upcoming', date: '2026-08-03', venue: '体验馆A区', capacity: 30, registered: 22 },
  { id: 'act_002', title: '社区公益讲座：吃出健康来', type: '社区公益', status: 'completed', date: '2026-07-20', venue: '阳光社区活动中心', capacity: 80, registered: 65 },
  { id: 'act_003', title: '营养知识讲座·老年健康专场', type: '沙龙讲座', status: 'upcoming', date: '2026-08-10', venue: '体验馆B区', capacity: 25, registered: 18 },
  { id: 'act_004', title: '护肤体验课·成分党聚会', type: '沙龙讲座', status: 'completed', date: '2026-07-13', venue: '体验馆A区', capacity: 20, registered: 20 },
  { id: 'act_005', title: '体验馆月度开放日', type: '体验馆运营', status: 'upcoming', date: '2026-08-15', venue: '体验馆全馆', capacity: 50, registered: 12 },
  { id: 'act_006', title: '社区健康检测公益活动', type: '社区公益', status: 'planning', date: '2026-08-25', venue: '待定', capacity: 100, registered: 0 },
  { id: 'act_007', title: '经营者内训·社群运营实战', type: '内训', status: 'completed', date: '2026-07-10', venue: '线上+线下', capacity: 15, registered: 15 },
  { id: 'act_008', title: '秋季新品品鉴会', type: '沙龙讲座', status: 'planning', date: '2026-09-05', venue: '体验馆A区', capacity: 40, registered: 0 }
];

// ========== 经营者培训数据 ==========
const traineeCards = [
  { id: 'tr_001', name: '宋**', rank: 'D3', stage: '基础培训', status: 'active', joinDate: '2026-05-15', coursesCompleted: 8, totalCourses: 12, lastActive: '2026-07-27' },
  { id: 'tr_002', name: '李**', rank: 'D5', stage: '进阶培训', status: 'active', joinDate: '2026-03-20', coursesCompleted: 18, totalCourses: 24, lastActive: '2026-07-26' },
  { id: 'tr_003', name: '王**', rank: 'D', stage: '新手入门', status: 'active', joinDate: '2026-07-01', coursesCompleted: 3, totalCourses: 12, lastActive: '2026-07-28' },
  { id: 'tr_004', name: '赵**', rank: 'D8', stage: '高级培训', status: 'active', joinDate: '2026-01-10', coursesCompleted: 35, totalCourses: 40, lastActive: '2026-07-27' },
  { id: 'tr_005', name: '陈**', rank: 'D', stage: '新手入门', status: 'inactive', joinDate: '2026-06-15', coursesCompleted: 2, totalCourses: 12, lastActive: '2026-07-10' },
  { id: 'tr_006', name: '张**', rank: 'SD', stage: '导师培训', status: 'active', joinDate: '2025-11-20', coursesCompleted: 48, totalCourses: 52, lastActive: '2026-07-28' },
  { id: 'tr_007', name: '孙**', rank: 'D3', stage: '基础培训', status: 'active', joinDate: '2026-04-22', coursesCompleted: 10, totalCourses: 12, lastActive: '2026-07-25' },
  { id: 'tr_008', name: '周**', rank: 'ED', stage: '高管培训', status: 'active', joinDate: '2025-08-15', coursesCompleted: 60, totalCourses: 65, lastActive: '2026-07-28' }
];

// 培训课程数据
const trainingCourses = [
  { id: 'course_001', title: '企业认知与品牌故事', level: 'D-D3', status: 'active', students: 8, duration: '2小时' },
  { id: 'course_002', title: '产品经理初级课程·精油', level: 'D3-D5', status: 'active', students: 5, duration: '4小时' },
  { id: 'course_003', title: '社群运营全流程SOP', level: 'D3+', status: 'active', students: 12, duration: '6小时' },
  { id: 'course_004', title: '奖金制度与财务规划', level: 'D5+', status: 'completed', students: 6, duration: '3小时' },
  { id: 'course_005', title: '自媒体运营实战', level: 'D-D8', status: 'active', students: 10, duration: '8小时' },
  { id: 'course_006', title: '团队领导力进阶', level: 'D8+', status: 'planned', students: 0, duration: '4小时' },
  // V4.2 审计修复：补齐 SD+ 阶衔专属必修课程
  { id: 'course_007', title: '数据复盘与目标管理', level: 'SD+', status: 'active', students: 4, duration: '5小时' },
  { id: 'course_008', title: '市场战略与全局规划', level: 'SD+', status: 'active', students: 3, duration: '6小时' },
  { id: 'course_009', title: '跨领域协同与资源调度', level: 'SD+', status: 'planned', students: 0, duration: '4小时' },
  { id: 'course_010', title: '高阶演讲与公众影响力', level: 'SD+', status: 'planned', students: 0, duration: '3小时' }
];

// SD+ 阶衔专属必修课程（不论领域角色，晋升 SD+ 后自动追加到「我正在学的课」）
// V4.2 审计修复：解决 _getMyCourses() 未考虑 isSDPlus 的问题
const SDPLUS_REQUIRED_COURSES = [
  { title: '团队领导力进阶', level: 'D8+', status: 'active', duration: '4小时', progress: 35 },
  { title: '数据复盘与目标管理', level: 'SD+', status: 'active', duration: '5小时', progress: 20 },
  { title: '市场战略与全局规划', level: 'SD+', status: 'planned', duration: '6小时', progress: 0 }
];

// ========== 运营中枢数据 ==========

// 创始人看板数据
const dashboardMetrics = [
  { id: 'metric_001', title: '全平台粉丝', value: '17,400', change: '+856', changeType: 'positive', icon: '👥' },
  { id: 'metric_002', title: '活跃会员数', value: '234', change: '+18', changeType: 'positive', icon: '👤' },
  { id: 'metric_003', title: '经营者总数', value: '45', change: '+3', changeType: 'positive', icon: '🏆' },
  { id: 'metric_004', title: '社群活跃率', value: '72%', change: '+5%', changeType: 'positive', icon: '📊' },
  { id: 'metric_005', title: '月转化率', value: '26%', change: '-2%', changeType: 'negative', icon: '📈' },
  { id: 'metric_006', title: '任务运行率', value: '95%', change: '+3%', changeType: 'positive', icon: '⚙️' }
];

// 自动化任务数据（V4.0：增加 targetRoles 字段用于角色过滤）
const automationTasks = [
  { id: 'auto_001', name: '每日营养知识推送', status: 'running', schedule: '每天 08:30', lastRun: '2026-07-28 08:30', nextRun: '2026-07-29 08:30', target: '营养训练营12期', targetRoles: ['community'] },
  { id: 'auto_002', name: '消费到期提醒', status: 'running', schedule: '每月 20日', lastRun: '2026-07-20 10:00', nextRun: '2026-08-20 10:00', target: '全部会员', targetRoles: ['community'] },
  { id: 'auto_003', name: '社群活跃度报告', status: 'running', schedule: '每周一 09:00', lastRun: '2026-07-28 09:00', nextRun: '2026-08-04 09:00', target: '运营团队', targetRoles: ['community', 'hub'] },
  { id: 'auto_004', name: '对标账号数据采集', status: 'paused', schedule: '每天 06:00', lastRun: '2026-07-25 06:00', nextRun: '--', target: '自媒体运营', targetRoles: ['social'] },
  { id: 'auto_005', name: '新人引导Day3提醒', status: 'running', schedule: '触发式', lastRun: '2026-07-28 09:00', nextRun: '按触发', target: '新入会会员', targetRoles: ['community'] },
  { id: 'auto_006', name: '周报自动生成', status: 'error', schedule: '每周日 20:00', lastRun: '2026-07-27 20:00 (失败)', nextRun: '2026-08-03 20:00', target: '运营中枢', targetRoles: ['hub'] },
  { id: 'auto_007', name: '推送日历生成', status: 'running', schedule: '每天 07:00', lastRun: '2026-07-28 07:00', nextRun: '2026-07-29 07:00', target: '社群运营', targetRoles: ['community'] },
  { id: 'auto_008', name: '内容发布提醒', status: 'running', schedule: '每天 08:00', lastRun: '2026-07-28 08:00', nextRun: '2026-07-29 08:00', target: '自媒体运营', targetRoles: ['social'] },
  { id: 'auto_009', name: '爆款内容监测', status: 'running', schedule: '每天 06:00', lastRun: '2026-07-28 06:00', nextRun: '2026-07-29 06:00', target: '自媒体运营', targetRoles: ['social'] },
  { id: 'auto_010', name: '活动报名提醒', status: 'running', schedule: '活动前3天 10:00', lastRun: '2026-07-25 10:00', nextRun: '2026-08-01 10:00', target: '线下活动', targetRoles: ['offline', 'exp_center'] },
  { id: 'auto_011', name: '活动复盘生成', status: 'active', schedule: '活动后1天 18:00', lastRun: '2026-07-27 18:00', nextRun: '2026-08-03 18:00', target: '线下活动', targetRoles: ['offline'] },
  { id: 'auto_012', name: '培训打卡提醒', status: 'running', schedule: '每周三 08:00', lastRun: '2026-07-24 08:00', nextRun: '2026-07-31 08:00', target: '全部经营者', targetRoles: ['all'] },
  { id: 'auto_013', name: '流量分配计算', status: 'running', schedule: '每月1日 08:00', lastRun: '2026-07-01 08:00', nextRun: '2026-08-01 08:00', target: '运营中枢', targetRoles: ['hub'] },
  { id: 'auto_014', name: '月度复盘生成', status: 'active', schedule: '每月1日 10:00', lastRun: '2026-07-01 10:00', nextRun: '2026-08-01 10:00', target: '运营中枢', targetRoles: ['hub'] },
  { id: 'auto_015', name: '合规审查提醒', status: 'running', schedule: '每月15日 09:00', lastRun: '2026-07-15 09:00', nextRun: '2026-08-15 09:00', target: '运营中枢', targetRoles: ['hub'] },
  { id: 'auto_016', name: '晋升追踪更新', status: 'running', schedule: '每周一 10:00', lastRun: '2026-07-28 10:00', nextRun: '2026-08-04 10:00', target: '运营中枢', targetRoles: ['hub'] },
  { id: 'auto_017', name: '团队贡献评估', status: 'active', schedule: '每月1日 12:00', lastRun: '2026-07-01 12:00', nextRun: '2026-08-01 12:00', target: '运营中枢', targetRoles: ['hub'] },
  { id: 'auto_018', name: '平台规则变更提醒', status: 'running', schedule: '实时监测', lastRun: '2026-07-28 14:00', nextRun: '实时', target: '自媒体运营', targetRoles: ['social'] },
  { id: 'auto_019', name: '体验馆预约提醒', status: 'running', schedule: '每天 08:30', lastRun: '2026-07-28 08:30', nextRun: '2026-07-29 08:30', target: '体验馆', targetRoles: ['exp_center', 'offline'] },
  { id: 'auto_020', name: '课件更新通知', status: 'active', schedule: '课件更新时触发', lastRun: '2026-07-25 15:00', nextRun: '触发式', target: '课件管理员', targetRoles: ['hub'] },
  { id: 'auto_021', name: '团队活动提醒', status: 'running', schedule: '活动前1天 09:00', lastRun: '2026-07-27 09:00', nextRun: '2026-08-03 09:00', target: '全部经营者', targetRoles: ['all'] }
];

// 月度复盘数据
const monthlyReviews = [
  { id: 'review_001', title: '2026年7月运营复盘', status: 'in_progress', createdAt: '2026-07-28', period: '2026.07' },
  { id: 'review_002', title: '2026年6月运营复盘', status: 'completed', createdAt: '2026-06-30', period: '2026.06' },
  { id: 'review_003', title: '2026年Q2季度复盘', status: 'completed', createdAt: '2026-06-30', period: '2026.Q2' },
  { id: 'review_004', title: '2026年5月运营复盘', status: 'completed', createdAt: '2026-05-31', period: '2026.05' }
];

// 合规中心数据
const complianceItems = [
  { id: 'comp_001', title: 'L1公域内容合规检查', status: 'passed', lastCheck: '2026-07-27', items: 48, issues: 0 },
  { id: 'comp_002', title: '收入声明合规审查', status: 'warning', lastCheck: '2026-07-25', items: 15, issues: 2 }
];

// 流量分配数据（ABCD体系）
const trafficDistributionData = {
  pool: {
    total: 300,
    allocated: 287,
    pending: 13,
    thisMonthNew: 45
  },
  distributors: [
    { id: 'dist_001', name: '张博主', role: '自媒体博主', grade: 'A', weight: 1.5, allocated: 12, performance: '持续精进', coefficient: 3.0, trend: 'up' },
    { id: 'dist_002', name: '李社群', role: '社群运营专员', grade: 'A', weight: 1.5, allocated: 10, performance: '持续精进', coefficient: 2.5, trend: 'up' },
    { id: 'dist_003', name: '王线下', role: '线下活动专员', grade: 'B', weight: 1.0, allocated: 6, performance: '踏实前行', coefficient: 2.0, trend: 'stable' },
    { id: 'dist_004', name: '赵中枢', role: '运营中枢专员', grade: 'A', weight: 1.5, allocated: 8, performance: '持续精进', coefficient: 1.0, trend: 'up' },
    { id: 'dist_005', name: '陈博主', role: '自媒体博主', grade: 'B', weight: 1.0, allocated: 7, performance: '踏实前行', coefficient: 3.0, trend: 'stable' },
    { id: 'dist_006', name: '刘社群', role: '社群运营专员', grade: 'C', weight: 0.7, allocated: 4, performance: '起步探索', coefficient: 2.5, trend: 'down' }
  ],
  gradeRules: {
    A: { label: '持续精进', weight: 1.5, desc: '超额完成岗位指标，主动优化流程，积极贡献团队' },
    B: { label: '踏实前行', weight: 1.0, desc: '按时完成岗位基本职责，表现稳定' },
    C: { label: '起步探索', weight: 0.7, desc: '新加入或仍在学习阶段，需更多支持' },
    D: { label: '暂停观察', weight: 0, desc: '连续未达标或违规，暂停流量分配' }
  }
};

// ========== V4.2 第二阶段：流量池全局视图数据模型 ==========

/**
 * 流量池全局视图数据
 * 用于运营中枢 hub-traffic 子标签的全局视图（admin/SD+/hub 可见）
 * 包含：跨团队分配明细 + ABCD 分布 + 月度趋势 + 异常预警
 */
const TRAFFIC_POOL_GLOBAL = {
  // 本月流量池总览
  overview: {
    total: 300,           // 本月总流量池
    allocated: 287,       // 已分配
    pending: 13,          // 待分配
    thisMonthNew: 45,     // 本月新增
    lastMonthTotal: 255,  // 上月总流量池（用于环比）
    utilizationRate: 95.7 // 利用率 %
  },
  // 各团队流量分配明细（按领域分组）
  teams: [
    { id: 't_001', name: '自媒体博主团队', domain: 'social',    lead: '张**', grade: 'A', weight: 1.5, allocated: 78, members: 12, avgPerMember: 6.5, trend: 'up',    change: '+12', utilization: 96.2 },
    { id: 't_002', name: '社群运营团队',   domain: 'community', lead: '李**', grade: 'A', weight: 1.5, allocated: 65, members: 10, avgPerMember: 6.5, trend: 'up',    change: '+8',  utilization: 94.5 },
    { id: 't_003', name: '线下活动团队',   domain: 'offline',   lead: '王**', grade: 'B', weight: 1.0, allocated: 42, members: 8,  avgPerMember: 5.3, trend: 'stable',change: '+3',  utilization: 91.0 },
    { id: 't_004', name: '运营中枢团队',   domain: 'hub',       lead: '赵**', grade: 'A', weight: 1.5, allocated: 55, members: 6,  avgPerMember: 9.2, trend: 'up',    change: '+15', utilization: 98.5 },
    { id: 't_005', name: '精油博主团队',   domain: 'social',    lead: '陈**', grade: 'B', weight: 1.0, allocated: 30, members: 7,  avgPerMember: 4.3, trend: 'stable',change: '+2',  utilization: 88.0 },
    { id: 't_006', name: '会员社群团队',   domain: 'community', lead: '刘**', grade: 'C', weight: 0.7, allocated: 17, members: 5,  avgPerMember: 3.4, trend: 'down',  change: '-5',  utilization: 75.0 }
  ],
  // ABCD 评级分布
  gradeDistribution: {
    A: { count: 3, totalAllocated: 198, percentage: 69.0 }, // 3 个 A 类团队，分配 198
    B: { count: 2, totalAllocated: 72,  percentage: 25.1 }, // 2 个 B 类团队，分配 72
    C: { count: 1, totalAllocated: 17,  percentage: 5.9  }, // 1 个 C 类团队，分配 17
    D: { count: 0, totalAllocated: 0,   percentage: 0    }  // 0 个 D 类团队
  },
  // 各领域月度趋势（近 6 个月）
  domainTrends: {
    social:    { label: '自媒体', months: [55, 58, 62, 68, 72, 78], color: '#4CAF50' },
    community: { label: '社群',   months: [48, 52, 55, 58, 62, 65], color: '#2196F3' },
    offline:   { label: '线下',   months: [32, 35, 36, 38, 40, 42], color: '#FF9800' },
    hub:       { label: '中枢',   months: [38, 42, 45, 48, 52, 55], color: '#9C27B0' }
  },
  // 异常预警
  alerts: [
    { id: 'alert_001', level: 'warning', team: '会员社群团队', issue: 'C 类评级，分配环比下降 5', suggestion: '建议加强培训辅导，提升至 B 类', date: '2026-07-25' },
    { id: 'alert_002', level: 'info',    team: '线下活动团队', issue: 'B 类评级，利用率 91%（低于平均）', suggestion: '可优化活动转化流程，提升利用率', date: '2026-07-22' },
    { id: 'alert_003', level: 'success', team: '运营中枢团队', issue: 'A 类评级，人均分配 9.2（最高）', suggestion: '保持当前表现，可作为标杆分享经验', date: '2026-07-20' }
  ]
};

/**
 * 获取流量池异常预警等级元数据
 */
function getTrafficAlertMeta(level) {
  const meta = {
    warning: { icon: '⚠️', color: '#FF9800', label: '需关注' },
    info:    { icon: 'ℹ️', color: '#2196F3', label: '建议' },
    success: { icon: '✅', color: '#4CAF50', label: '优秀' },
    danger:  { icon: '🚨', color: '#F44336', label: '紧急' }
  };
  return meta[level] || meta.info;
}

// ========== V4.2 第三阶段：自媒体赛道热度数据 ==========
/**
 * 自媒体赛道热度数据
 * 展示各内容赛道的活跃度、竞争度、机会指数、爆款率等
 */
const SOCIAL_TRACK_HEAT = {
  overview: {
    totalTracks: 8,
    hotTracks: 3,        // 热门赛道（机会指数≥80）
    emergingTracks: 2,   // 新兴赛道
    saturatedTracks: 1   // 饱和赛道
  },
  tracks: [
    { id: 'trk_001', name: '营养科普', icon: '🥗', heat: 92, competition: 65, opportunity: 88, viralRate: 12.5, avgLikes: 3200, trend: 'up',    change: '+15%', contentCount: 156, topAccounts: 12 },
    { id: 'trk_002', name: '精油芳疗', icon: '🌸', heat: 85, competition: 45, opportunity: 90, viralRate: 15.2, avgLikes: 2800, trend: 'up',    change: '+22%', contentCount: 89,  topAccounts: 6 },
    { id: 'trk_003', name: '护肤美妆', icon: '💄', heat: 88, competition: 85, opportunity: 62, viralRate: 8.3,  avgLikes: 4500, trend: 'stable',change: '+3%',  contentCount: 234, topAccounts: 28 },
    { id: 'trk_004', name: '居家清洁', icon: '🧽', heat: 72, competition: 40, opportunity: 82, viralRate: 10.8, avgLikes: 2100, trend: 'up',    change: '+18%', contentCount: 67,  topAccounts: 4 },
    { id: 'trk_005', name: '健康养生', icon: '💪', heat: 78, competition: 70, opportunity: 68, viralRate: 7.5,  avgLikes: 2600, trend: 'stable',change: '+5%',  contentCount: 112, topAccounts: 9 },
    { id: 'trk_006', name: '母婴育儿', icon: '👶', heat: 65, competition: 55, opportunity: 75, viralRate: 9.2,  avgLikes: 2400, trend: 'up',    change: '+8%',  contentCount: 78,  topAccounts: 7 },
    { id: 'trk_007', name: '个人IP打造', icon: '⭐', heat: 82, competition: 75, opportunity: 70, viralRate: 6.8,  avgLikes: 3800, trend: 'stable',change: '+2%',  contentCount: 95,  topAccounts: 11 },
    { id: 'trk_008', name: '生活分享', icon: '🌿', heat: 58, competition: 80, opportunity: 35, viralRate: 4.2,  avgLikes: 1800, trend: 'down',  change: '-8%',  contentCount: 189, topAccounts: 22 }
  ],
  // 各赛道近 6 个月热度趋势
  trendData: {
    '营养科普':   [72, 78, 82, 85, 89, 92],
    '精油芳疗':   [60, 68, 75, 80, 83, 85],
    '护肤美妆':   [82, 84, 86, 87, 88, 88],
    '居家清洁':   [55, 60, 65, 68, 70, 72]
  },
  // 平台热度分布
  platformHeat: [
    { platform: '小红书', icon: '📕', tracks: 8, avgHeat: 82, topPerformer: '营养科普', viralRate: 11.5 },
    { platform: '抖音',   icon: '🎵', tracks: 6, avgHeat: 78, topPerformer: '精油芳疗', viralRate: 13.2 },
    { platform: '视频号', icon: '📹', tracks: 5, avgHeat: 68, topPerformer: '护肤美妆', viralRate: 8.8 },
    { platform: '公众号', icon: '📝', tracks: 4, avgHeat: 62, topPerformer: '健康养生', viralRate: 5.5 }
  ]
};

// 知识库数据
const knowledgeBase = {
  categories: [
    { name: '营养宝典', count: 45 },
    { name: '精油手册', count: 32 },
    { name: '美妆护肤指南', count: 28 },
    { name: '居家生活百科', count: 22 },
    { name: '社群运营SOP', count: 15 },
    { name: '经营者培训资料', count: 14 }
  ],
  totalItems: 156,
  recentlyUpdated: [
    { title: '膳食纤维的分类与作用', updatedDate: '2026-07-28', category: '营养宝典' },
    { title: '薰衣草精油使用指南', updatedDate: '2026-07-27', category: '精油手册' },
    { title: '维生素C vs 维生素C衍生物', updatedDate: '2026-07-26', category: '美妆护肤指南' },
    { title: '社群打卡话术模板', updatedDate: '2026-07-25', category: '社群运营SOP' }
  ]
};

// ========== 筛选维度数据 ==========
const filterDimensions = {
  domains: ['全部', '营养学', '精油芳疗', '美妆护肤', '居家生活'],
  tracks: ['全部', '母婴营养', '老年健康', '减脂控糖', '精油入门', '芳疗进阶', '护肤成分党', '居家清洁', '环保生活'],
  formats: ['全部', '短视频', '图文', '长视频', '播客', '直播'],
  timeRanges: ['全部', '今日', '本周', '本月', '本季度'],
  statuses: ['全部', '待发布', '已发布', '监测中', '需优化'],
  sortOptions: ['推荐度', '播放量', '互动量', '涨粉率', '发布时间']
};

// ========== 课件制作 - 补充数据 ==========

// 培训框架数据
const cwFrameworkData = [
  {
    id: 'fw_001',
    name: '新手入门框架（D→D3）',
    level: 'D-D3',
    description: '从零开始建立美乐家认知，涵盖企业认知、产品体验、CDM模式理解',
    courses: ['企业认知与品牌故事', '产品经理初级课程', 'CDM消费者直购系统', '会员权益与省钱攻略'],
    totalCourses: 8,
    completedCourses: 6,
    status: 'active',
    lastUpdate: '2026-07-20'
  },
  {
    id: 'fw_002',
    name: '基础培训框架（D3→D5）',
    level: 'D3-D5',
    description: '社群运营能力培养，产品知识深化，奖金制度理解',
    courses: ['社群运营全流程SOP', '精油产品经理进阶', '奖金制度与财务规划', '消费跟进技巧'],
    totalCourses: 10,
    completedCourses: 7,
    status: 'active',
    lastUpdate: '2026-07-18'
  },
  {
    id: 'fw_003',
    name: '进阶培训框架（D5→D8）',
    level: 'D5-D8',
    description: '自媒体运营实战，团队管理启蒙，转化漏斗优化',
    courses: ['自媒体运营实战', '团队领导力进阶', '转化漏斗分析', '社群裂变策略'],
    totalCourses: 12,
    completedCourses: 4,
    status: 'active',
    lastUpdate: '2026-07-15'
  },
  {
    id: 'fw_004',
    name: '高级培训框架（D8→SD）',
    level: 'D8-SD',
    description: '体系化运营，团队复制，战略规划能力',
    courses: ['体系化运营设计', '团队复制方法论', '战略规划与执行', '教练技术'],
    totalCourses: 10,
    completedCourses: 2,
    status: 'active',
    lastUpdate: '2026-07-10'
  },
  {
    id: 'fw_005',
    name: '导师培训框架（SD→ED）',
    level: 'SD-ED',
    description: '导师能力培养，讲师认证，体系输出',
    courses: ['讲师认证课程', '课程开发方法论', '导师领导力', '体系输出标准'],
    totalCourses: 8,
    completedCourses: 0,
    status: 'planned',
    lastUpdate: '2026-07-05'
  },
  {
    id: 'fw_006',
    name: '高管培训框架（ED→ND+）',
    level: 'ED+',
    description: '战略决策，组织设计，跨团队协作',
    courses: ['战略决策思维', '组织架构设计', '跨团队协作', '愿景与使命'],
    totalCourses: 6,
    completedCourses: 0,
    status: 'planned',
    lastUpdate: '2026-07-01'
  },
  {
    id: 'fw_007',
    name: '合规必修课',
    level: '全部',
    description: '公域不提及品牌、功效声明规范、收入声明规范等合规要求',
    courses: ['公域内容合规红线', '产品功效表述规范', '收入声明规范', '违规销售禁止'],
    totalCourses: 4,
    completedCourses: 4,
    status: 'completed',
    lastUpdate: '2026-07-25'
  },
  {
    id: 'fw_008',
    name: '企业家认知课',
    level: '全部',
    description: '从消费者到经营者的思维转变，创业心态建立',
    courses: ['消费者到经营者', '被动收入认知', '长期主义思维', '个人IP打造'],
    totalCourses: 4,
    completedCourses: 3,
    status: 'active',
    lastUpdate: '2026-07-22'
  }
];

// 短视频脚本库
const cwScriptData = [
  { id: 'sc_001', title: '30天营养训练营Day1-5脚本', category: '营养辅助食品', duration: '5集×3分钟', status: 'completed', lastUpdate: '2026-07-20', tags: ['#营养学', '#L1引流'] },
  { id: 'sc_002', title: '精油入门5集系列脚本', category: '精油与身体护理', duration: '5集×2分钟', status: 'completed', lastUpdate: '2026-07-18', tags: ['#精油芳疗', '#L1引流'] },
  { id: 'sc_003', title: '护肤成分党测评系列', category: '美妆护肤', duration: '8集×3分钟', status: 'in_progress', lastUpdate: '2026-07-22', tags: ['#美妆护肤', '#L1引流'] },
  { id: 'sc_004', title: '居家清洁好物推荐脚本', category: '居家清洁', duration: '3集×2分钟', status: 'completed', lastUpdate: '2026-07-15', tags: ['#居家生活', '#L1引流'] },
  { id: 'sc_005', title: '会员产品体验分享脚本', category: '综合', duration: '6集×3分钟', status: 'in_progress', lastUpdate: '2026-07-25', tags: ['#L2会员', '#产品体验'] },
  { id: 'sc_006', title: '经营者故事系列脚本', category: '综合', duration: '4集×5分钟', status: 'draft', lastUpdate: '2026-07-10', tags: ['#L3经营者', '#事业分享'] },
  { id: 'sc_007', title: '营养知识科普短视频脚本', category: '营养辅助食品', duration: '10集×1分钟', status: 'completed', lastUpdate: '2026-07-12', tags: ['#营养学', '#科普'] },
  { id: 'sc_008', title: '精油居家使用指南脚本', category: '精油与身体护理', duration: '6集×2分钟', status: 'completed', lastUpdate: '2026-07-08', tags: ['#精油芳疗', '#实用'] },
  { id: 'sc_009', title: '换品牌挑战系列脚本', category: '综合', duration: '5集×3分钟', status: 'draft', lastUpdate: '2026-07-05', tags: ['#L2会员', '#换品牌'] },
  { id: 'sc_010', title: '社群直播预热短视频', category: '综合', duration: '3集×1分钟', status: 'completed', lastUpdate: '2026-07-26', tags: ['#社群', '#直播预热'] },
  { id: 'sc_011', title: '新品上市种草脚本', category: '综合', duration: '2集×2分钟', status: 'in_progress', lastUpdate: '2026-07-27', tags: ['#新品', '#种草'] },
  { id: 'sc_012', title: '节日主题系列脚本', category: '综合', duration: '4集×2分钟', status: 'completed', lastUpdate: '2026-06-28', tags: ['#节日', '#主题'] },
  { id: 'sc_013', title: '产品对比测评脚本', category: '综合', duration: '3集×3分钟', status: 'in_progress', lastUpdate: '2026-07-24', tags: ['#测评', '#对比'] },
  { id: 'sc_014', title: '用户证言故事脚本', category: '综合', duration: '5集×2分钟', status: 'completed', lastUpdate: '2026-07-14', tags: ['#证言', '#故事'] },
  { id: 'sc_015', title: '秋冬护肤指南脚本', category: '美妆护肤', duration: '4集×2分钟', status: 'draft', lastUpdate: '2026-07-02', tags: ['#美妆护肤', '#季节'] }
];

// PPT大纲库
const cwOutlineData = [
  { id: 'ol_001', title: '绿茶片产品知识详解PPT大纲', level: 'L2', category: '营养辅助食品', slides: 24, status: 'completed', lastUpdate: '2026-07-20' },
  { id: 'ol_002', title: '精油入门培训课程PPT大纲', level: 'L3', category: '精油与身体护理', slides: 36, status: 'completed', lastUpdate: '2026-07-18' },
  { id: 'ol_003', title: '水贝娜护肤系列PPT大纲', level: 'L2', category: '美妆护肤', slides: 28, status: 'in_progress', lastUpdate: '2026-07-22' },
  { id: 'ol_004', title: '30天营养训练营课件大纲', level: 'L1', category: '营养辅助食品', slides: 30, status: 'completed', lastUpdate: '2026-07-15' },
  { id: 'ol_005', title: '奖金制度讲解PPT大纲', level: 'L3', category: '综合', slides: 20, status: 'completed', lastUpdate: '2026-07-10' },
  { id: 'ol_006', title: '社群运营SOP培训PPT大纲', level: 'L3', category: '综合', slides: 25, status: 'completed', lastUpdate: '2026-07-12' },
  { id: 'ol_007', title: '居家清洁产品PPT大纲', level: 'L2', category: '居家清洁', slides: 18, status: 'in_progress', lastUpdate: '2026-07-25' },
  { id: 'ol_008', title: '企业认知与品牌故事PPT大纲', level: 'L3', category: '综合', slides: 22, status: 'completed', lastUpdate: '2026-07-08' },
  { id: 'ol_009', title: '新人启航7天引导PPT大纲', level: 'L2', category: '综合', slides: 14, status: 'completed', lastUpdate: '2026-07-05' },
  { id: 'ol_010', title: '产品体验官月度计划PPT大纲', level: 'L2', category: '综合', slides: 16, status: 'draft', lastUpdate: '2026-07-03' },
  { id: 'ol_011', title: '换品牌认知PPT大纲', level: 'L2', category: '综合', slides: 12, status: 'completed', lastUpdate: '2026-06-28' },
  { id: 'ol_012', title: '团队建设PPT大纲', level: 'L3', category: '综合', slides: 20, status: 'draft', lastUpdate: '2026-07-01' },
  { id: 'ol_013', title: '自媒体运营实战PPT大纲（L3必修）', level: 'L3', category: '综合', slides: 32, status: 'completed', lastUpdate: '2026-07-26' },
  { id: 'ol_014', title: '数据复盘与目标管理PPT大纲（L3必修）', level: 'L3', category: '综合', slides: 28, status: 'in_progress', lastUpdate: '2026-07-27' },
  { id: 'ol_015', title: '团队领导力进阶PPT大纲（L3必修）', level: 'L3', category: '综合', slides: 30, status: 'in_progress', lastUpdate: '2026-07-27' }
];

// 逐字稿库
const cwFulltextData = [
  { id: 'ft_001', title: '新品上市发布会逐字稿', level: 'L2', category: '综合', wordCount: 8500, duration: '约25分钟', status: 'draft', lastUpdate: '2026-07-25' },
  { id: 'ft_002', title: '社群运营SOP培训逐字稿', level: 'L3', category: '综合', wordCount: 12000, duration: '约40分钟', status: 'completed', lastUpdate: '2026-07-20' },
  { id: 'ft_003', title: '精油入门培训逐字稿', level: 'L3', category: '精油与身体护理', wordCount: 15000, duration: '约50分钟', status: 'completed', lastUpdate: '2026-07-18' },
  { id: 'ft_004', title: '吃出健康来公益讲座逐字稿', level: 'L1', category: '营养辅助食品', wordCount: 9800, duration: '约30分钟', status: 'completed', lastUpdate: '2026-07-15' },
  { id: 'ft_005', title: '护肤体验课主持稿', level: 'L1', category: '美妆护肤', wordCount: 6200, duration: '约20分钟', status: 'completed', lastUpdate: '2026-07-12' },
  { id: 'ft_006', title: '奖金制度讲解逐字稿', level: 'L3', category: '综合', wordCount: 11000, duration: '约35分钟', status: 'completed', lastUpdate: '2026-07-10' },
  { id: 'ft_007', title: '30天营养训练营Day1开营逐字稿', level: 'L1', category: '营养辅助食品', wordCount: 4500, duration: '约15分钟', status: 'completed', lastUpdate: '2026-07-08' },
  { id: 'ft_008', title: '企业认知与品牌故事逐字稿', level: 'L3', category: '综合', wordCount: 13000, duration: '约45分钟', status: 'completed', lastUpdate: '2026-07-05' },
  { id: 'ft_009', title: '精油沙龙体验课逐字稿', level: 'L1', category: '精油与身体护理', wordCount: 7200, duration: '约25分钟', status: 'in_progress', lastUpdate: '2026-07-26' },
  { id: 'ft_010', title: '经营者内训·社群运营实战逐字稿', level: 'L3', category: '综合', wordCount: 14000, duration: '约45分钟', status: 'completed', lastUpdate: '2026-07-10' },
  { id: 'ft_011', title: '会员月度总结直播逐字稿', level: 'L2', category: '综合', wordCount: 5800, duration: '约20分钟', status: 'draft', lastUpdate: '2026-07-02' },
  { id: 'ft_012', title: '秋季新品品鉴会逐字稿', level: 'L2', category: '综合', wordCount: 6800, duration: '约22分钟', status: 'in_progress', lastUpdate: '2026-07-24' },
  { id: 'ft_013', title: '社区公益健康讲座逐字稿', level: 'L1', category: '营养辅助食品', wordCount: 8200, duration: '约28分钟', status: 'completed', lastUpdate: '2026-07-20' },
  { id: 'ft_014', title: '换品牌认知课逐字稿', level: 'L2', category: '综合', wordCount: 5500, duration: '约18分钟', status: 'completed', lastUpdate: '2026-06-30' },
  { id: 'ft_015', title: '产品体验官分享会逐字稿', level: 'L2', category: '综合', wordCount: 4800, duration: '约15分钟', status: 'completed', lastUpdate: '2026-07-14' },
  { id: 'ft_016', title: '团队建设活动主持稿', level: 'L3', category: '综合', wordCount: 5200, duration: '约18分钟', status: 'draft', lastUpdate: '2026-07-01' },
  { id: 'ft_017', title: '营养知识科普直播逐字稿', level: 'L1', category: '营养辅助食品', wordCount: 7500, duration: '约25分钟', status: 'completed', lastUpdate: '2026-07-16' },
  { id: 'ft_018', title: '精油居家使用指南逐字稿', level: 'L1', category: '精油与身体护理', wordCount: 6800, duration: '约22分钟', status: 'completed', lastUpdate: '2026-07-09' },
  { id: 'ft_019', title: '自媒体运营实战逐字稿（L3必修）', level: 'L3', category: '综合', wordCount: 13500, duration: '约45分钟', status: 'completed', lastUpdate: '2026-07-25' },
  { id: 'ft_020', title: '数据复盘与目标管理逐字稿（L3必修）', level: 'L3', category: '综合', wordCount: 12000, duration: '约40分钟', status: 'in_progress', lastUpdate: '2026-07-27' },
  { id: 'ft_021', title: '团队领导力进阶逐字稿（L3必修）', level: 'L3', category: '综合', wordCount: 14000, duration: '约45分钟', status: 'in_progress', lastUpdate: '2026-07-27' }
];

// 素材库
const cwMaterialsData = {
  categories: [
    { name: '产品图片', count: 48 },
    { name: '科普图片', count: 32 },
    { name: '视频素材', count: 28 },
    { name: '品牌LOGO', count: 8 },
    { name: '金句海报', count: 15 },
    { name: '数据图表', count: 12 },
    { name: '背景音乐', count: 6 },
    { name: '动画模板', count: 7 }
  ],
  totalItems: 156,
  recentlyAdded: [
    { title: '绿茶片产品高清图集', type: '产品图片', addedDate: '2026-07-28', format: 'PNG' },
    { title: '膳食纤维分类示意图', type: '科普图片', addedDate: '2026-07-27', format: 'SVG' },
    { title: '精油使用方法演示视频', type: '视频素材', addedDate: '2026-07-26', format: 'MP4' },
    { title: 'MelBeacon LOGO全套', type: '品牌LOGO', addedDate: '2026-07-25', format: 'AI' },
    { title: '营养知识金句海报-7月', type: '金句海报', addedDate: '2026-07-24', format: 'PNG' },
    { title: '转化漏斗数据图表', type: '数据图表', addedDate: '2026-07-23', format: 'SVG' }
  ]
};

// ========== 线下活动 - 补充数据 ==========

// 沙龙讲座
const salonActivities = [
  { id: 'sl_001', title: '精油体验沙龙·夏日特辑', type: '精油沙龙', date: '2026-08-03', venue: '体验馆A区', capacity: 30, registered: 22, status: 'upcoming', host: '芳疗师小A', fee: '免费' },
  { id: 'sl_002', title: '营养知识讲座·老年健康专场', type: '营养讲座', date: '2026-08-10', venue: '体验馆B区', capacity: 25, registered: 18, status: 'upcoming', host: '营养师小林', fee: '免费' },
  { id: 'sl_003', title: '护肤体验课·成分党聚会', type: '护肤体验', date: '2026-07-13', venue: '体验馆A区', capacity: 20, registered: 20, status: 'completed', host: '成分党小雅', fee: '免费' },
  { id: 'sl_004', title: '秋季新品品鉴会', type: '新品品鉴', date: '2026-09-05', venue: '体验馆A区', capacity: 40, registered: 0, status: 'planning', host: '待定', fee: '免费' },
  { id: 'sl_005', title: '精油DIY工作坊', type: '精油沙龙', date: '2026-08-17', venue: '体验馆B区', capacity: 15, registered: 8, status: 'upcoming', host: '芳疗师小A', fee: '材料费50元' },
  { id: 'sl_006', title: '夏季防晒护肤课', type: '护肤体验', date: '2026-07-06', venue: '体验馆A区', capacity: 20, registered: 18, status: 'completed', host: '成分党小雅', fee: '免费' },
  { id: 'sl_007', title: '营养早餐制作课', type: '营养讲座', date: '2026-08-24', venue: '体验馆B区', capacity: 20, registered: 5, status: 'upcoming', host: '营养师小林', fee: '材料费30元' },
  { id: 'sl_008', title: '居家清洁小妙招分享会', type: '生活分享', date: '2026-07-27', venue: '体验馆A区', capacity: 25, registered: 20, status: 'completed', host: '生活家老王', fee: '免费' },
  { id: 'sl_009', title: '精油与情绪管理讲座', type: '精油沙龙', date: '2026-09-14', venue: '体验馆B区', capacity: 30, registered: 0, status: 'planning', host: '芳疗师小A', fee: '免费' },
  { id: 'sl_010', title: '秋冬护肤换季课', type: '护肤体验', date: '2026-09-21', venue: '体验馆A区', capacity: 20, registered: 0, status: 'planning', host: '成分党小雅', fee: '免费' },
  { id: 'sl_011', title: '母婴营养专题讲座', type: '营养讲座', date: '2026-08-31', venue: '体验馆B区', capacity: 30, registered: 12, status: 'upcoming', host: '营养师Lily', fee: '免费' },
  { id: 'sl_012', title: '精油入门体验课（第8期）', type: '精油沙龙', date: '2026-07-20', venue: '体验馆A区', capacity: 25, registered: 25, status: 'completed', host: '芳疗师小A', fee: '免费' }
];

// 体验馆运营
const expCenterData = {
  info: {
    name: 'MelBeacon 体验馆',
    location: '市中心商业广场A座3楼',
    area: '120平方米',
    zones: ['A区-精油体验区', 'B区-营养讲座区', 'C区-护肤体验区', 'D区-产品展示区'],
    openDays: '周二至周日',
    openHours: '10:00-18:00',
    monthlyVisitors: 320,
    monthlyEvents: 8,
    conversionRate: '28%'
  },
  schedule: [
    { date: '2026-08-03', event: '精油体验沙龙·夏日特辑', zone: 'A区', time: '14:00-16:00', status: 'upcoming' },
    { date: '2026-08-10', event: '营养知识讲座·老年健康专场', zone: 'B区', time: '10:00-11:30', status: 'upcoming' },
    { date: '2026-08-15', event: '体验馆月度开放日', zone: '全馆', time: '10:00-18:00', status: 'upcoming' },
    { date: '2026-08-17', event: '精油DIY工作坊', zone: 'B区', time: '14:00-16:00', status: 'upcoming' },
    { date: '2026-08-24', event: '营养早餐制作课', zone: 'B区', time: '10:00-12:00', status: 'upcoming' },
    { date: '2026-08-31', event: '母婴营养专题讲座', zone: 'B区', time: '14:00-15:30', status: 'upcoming' }
  ],
  metrics: {
    totalEvents: 28,
    totalVisitors: 890,
    avgConversion: '26%',
    satisfaction: '92%',
    repeatVisit: '35%'
  }
};

// 社区公益
const communityActivities = [
  { id: 'cp_001', title: '社区公益讲座：吃出健康来', date: '2026-07-20', venue: '阳光社区活动中心', capacity: 80, registered: 65, status: 'completed', attendees: 58, topic: '营养知识科普' },
  { id: 'cp_002', title: '社区健康检测公益活动', date: '2026-08-25', venue: '待定', capacity: 100, registered: 0, status: 'planning', attendees: 0, topic: '健康检测' },
  { id: 'cp_003', title: '社区环保清洁分享', date: '2026-09-15', venue: '待定', capacity: 50, registered: 0, status: 'planning', attendees: 0, topic: '环保生活' },
  { id: 'cp_004', title: '社区精油体验日', date: '2026-08-08', venue: '幸福社区活动中心', capacity: 40, registered: 15, status: 'upcoming', attendees: 0, topic: '精油芳疗' },
  { id: 'cp_005', title: '社区营养早餐课', date: '2026-07-13', venue: '阳光社区活动中心', capacity: 30, registered: 28, status: 'completed', attendees: 25, topic: '营养知识科普' },
  { id: 'cp_006', title: '社区护肤知识分享', date: '2026-07-06', venue: '幸福社区活动中心', capacity: 30, registered: 26, status: 'completed', attendees: 24, topic: '美妆护肤' }
];

// 物料清单
const materialsChecklist = [
  { id: 'mc_001', name: '精油沙龙标准物料包', type: '精油沙龙', items: ['精油样品套装×6', '闻香纸×30', '扩香石×10', '签到表×1', '宣传册×30', '赠品小样×30'], lastUsed: '2026-07-20', status: 'complete' },
  { id: 'mc_002', name: '营养讲座标准物料包', type: '营养讲座', items: ['PPT投影×1', '麦克风×2', '营养宝典手册×30', '签到表×1', '体验产品×10', '问卷×30'], lastUsed: '2026-07-20', status: 'complete' },
  { id: 'mc_003', name: '护肤体验课标准物料包', type: '护肤体验', items: ['护肤样品套装×6', '化妆棉×50', '小镜子×20', '签到表×1', '成分对照表×20', '体验记录卡×20'], lastUsed: '2026-07-13', status: 'complete' },
  { id: 'mc_004', name: '社区公益讲座物料包', type: '社区公益', items: ['便携投影×1', '展架×2', '宣传单页×100', '签到表×1', '小礼品×50', '健康检测仪×2'], lastUsed: '2026-07-20', status: 'complete' },
  { id: 'mc_005', name: '新品品鉴会物料包', type: '新品品鉴', items: ['新品样品×20', '品鉴记录卡×40', '展示台×4', '签到表×1', '品牌展架×2', '伴手礼×40'], lastUsed: '--', status: 'preparing' },
  { id: 'mc_006', name: '精油DIY工作坊物料包', type: '精油沙龙', items: ['精油样品×15', '基础油×15', '空瓶×15', '滴管×15', '标签×15', '配方卡×15'], lastUsed: '--', status: 'preparing' },
  { id: 'mc_007', name: '体验馆开放日物料包', type: '体验馆运营', items: ['全馆展品检查', '引导牌×6', '宣传册×100', '签到台×1', '体验区物料×4', '赠品×50'], lastUsed: '--', status: 'preparing' },
  { id: 'mc_008', name: '经营者内训物料包', type: '内训', items: ['培训手册×15', '笔记本×15', '笔×15', '签到表×1', '投影×1', '白板×1'], lastUsed: '2026-07-10', status: 'complete' }
];

// 活动复盘
const reviewRecords = [
  { id: 'rv_001', title: '精油体验沙龙·夏日特辑·复盘', activityDate: '2026-08-03', reviewDate: '2026-08-04', attendees: 22, converted: 6, conversionRate: '27%', satisfaction: '95%', highlights: '精油DIY环节参与度高，新增体验官8人', improvements: '签到流程需优化，建议提前15分钟到场' },
  { id: 'rv_002', title: '社区公益讲座：吃出健康来·复盘', activityDate: '2026-07-20', reviewDate: '2026-07-21', attendees: 58, converted: 4, conversionRate: '7%', satisfaction: '90%', highlights: '社区反响热烈，后续可做系列讲座', improvements: '转化率偏低，需加强后续跟进话术培训' },
  { id: 'rv_003', title: '护肤体验课·成分党聚会·复盘', activityDate: '2026-07-13', reviewDate: '2026-07-14', attendees: 20, converted: 7, conversionRate: '35%', satisfaction: '98%', highlights: '成分对比环节最受欢迎，当场入会5人', improvements: '场地偏小，下次需预约B区' },
  { id: 'rv_004', title: '社区营养早餐课·复盘', activityDate: '2026-07-13', reviewDate: '2026-07-14', attendees: 25, converted: 3, conversionRate: '12%', satisfaction: '88%', highlights: '实操环节参与度高', improvements: '食材准备时间不足，需提前1小时到场' },
  { id: 'rv_005', title: '社区护肤知识分享·复盘', activityDate: '2026-07-06', reviewDate: '2026-07-07', attendees: 24, converted: 5, conversionRate: '21%', satisfaction: '92%', highlights: '现场互动充分，加微信18人', improvements: '产品体验环节时间偏短' },
  { id: 'rv_006', title: '经营者内训·社群运营实战·复盘', activityDate: '2026-07-10', reviewDate: '2026-07-11', attendees: 15, converted: 0, conversionRate: '--', satisfaction: '95%', highlights: '实战案例讲解效果好，3人提交了社群运营计划', improvements: '增加实操练习时间，减少理论讲解' }
];

// ========== 经营者培训 - 补充数据 ==========

// 考核管理
const examData = [
  { id: 'ex_001', title: '企业认知基础考核', level: 'D-D3', totalQuestions: 30, passingScore: 80, examinees: 24, passed: 20, passRate: '83%', lastDate: '2026-07-25', status: 'completed' },
  { id: 'ex_002', title: '精油产品知识考核', level: 'D3-D5', totalQuestions: 40, passingScore: 75, examinees: 12, passed: 9, passRate: '75%', lastDate: '2026-07-22', status: 'completed' },
  { id: 'ex_003', title: '社群运营SOP考核', level: 'D3+', totalQuestions: 25, passingScore: 80, examinees: 15, passed: 12, passRate: '80%', lastDate: '2026-07-20', status: 'completed' },
  { id: 'ex_004', title: '奖金制度理解考核', level: 'D5+', totalQuestions: 35, passingScore: 85, examinees: 8, passed: 6, passRate: '75%', lastDate: '2026-07-18', status: 'completed' },
  { id: 'ex_005', title: '自媒体运营实战考核', level: 'D-D8', totalQuestions: 30, passingScore: 75, examinees: 10, passed: 0, passRate: '--', lastDate: '2026-08-05', status: 'upcoming' },
  { id: 'ex_006', title: '合规知识必修考核', level: '全部', totalQuestions: 20, passingScore: 90, examinees: 45, passed: 43, passRate: '96%', lastDate: '2026-07-15', status: 'completed' },
  { id: 'ex_007', title: '产品经理初级认证', level: 'D3-D5', totalQuestions: 50, passingScore: 80, examinees: 5, passed: 0, passRate: '--', lastDate: '2026-08-10', status: 'upcoming' },
  { id: 'ex_008', title: '团队领导力评估', level: 'D8+', totalQuestions: 30, passingScore: 80, examinees: 4, passed: 0, passRate: '--', lastDate: '2026-08-15', status: 'upcoming' },
  { id: 'ex_009', title: '消费者直购系统理解考核', level: 'D-D3', totalQuestions: 25, passingScore: 80, examinees: 20, passed: 17, passRate: '85%', lastDate: '2026-07-10', status: 'completed' },
  { id: 'ex_010', title: '营养知识专业考核', level: 'D3-D5', totalQuestions: 40, passingScore: 75, examinees: 8, passed: 6, passRate: '75%', lastDate: '2026-07-12', status: 'completed' },
  { id: 'ex_011', title: '会员服务能力考核', level: 'D-D3', totalQuestions: 20, passingScore: 80, examinees: 18, passed: 15, passRate: '83%', lastDate: '2026-07-08', status: 'completed' },
  { id: 'ex_012', title: '转化漏斗分析考核', level: 'D5+', totalQuestions: 30, passingScore: 80, examinees: 6, passed: 4, passRate: '67%', lastDate: '2026-07-05', status: 'completed' }
];

// 晋升追踪
// @deprecated V4.2 第二阶段：已被 PROMOTION_TRACKING 替代，仅为兼容旧引用保留
const promotionData = [
  { id: 'pr_001', name: '宋**', currentRank: 'D3', targetRank: 'D5', progress: '65%', estimatedDate: '2026-09-15', status: 'on_track', mentor: '李**', keyMetric: '本月新增3名活跃会员' },
  { id: 'pr_002', name: '李**', currentRank: 'D5', targetRank: 'D8', progress: '40%', estimatedDate: '2026-12-01', status: 'on_track', mentor: '张**', keyMetric: '团队规模达12人' },
  { id: 'pr_003', name: '王**', currentRank: 'D', targetRank: 'D3', progress: '25%', estimatedDate: '2026-10-20', status: 'on_track', mentor: '宋**', keyMetric: '完成基础培训课程' },
  { id: 'pr_004', name: '赵**', currentRank: 'D8', targetRank: 'SD', progress: '55%', estimatedDate: '2026-11-30', status: 'on_track', mentor: '张**', keyMetric: '团队月度业绩达标' },
  { id: 'pr_005', name: '张**', currentRank: 'SD', targetRank: 'ED', progress: '30%', estimatedDate: '2027-03-01', status: 'at_risk', mentor: '周**', keyMetric: '需培养2名D5+经营者' },
  { id: 'pr_006', name: '周**', currentRank: 'ED', targetRank: 'ND', progress: '15%', estimatedDate: '2027-06-01', status: 'on_track', mentor: '--', keyMetric: '团队规模持续扩大' },
  { id: 'pr_007', name: '孙**', currentRank: 'D3', targetRank: 'D5', progress: '50%', estimatedDate: '2026-09-30', status: 'on_track', mentor: '李**', keyMetric: '社群运营能力认证通过' },
  { id: 'pr_008', name: '吴**', currentRank: 'D', targetRank: 'D3', progress: '10%', estimatedDate: '2026-11-15', status: 'at_risk', mentor: '宋**', keyMetric: '活跃度偏低，需加强跟进' }
];

// 团队建设
const teamBuildingData = [
  { id: 'tb_001', title: '7月团队建设活动·户外拓展', date: '2026-07-28', type: '户外拓展', participants: 15, status: 'completed', theme: '团队协作与信任建立', feedback: '4.8/5.0' },
  { id: 'tb_002', title: '8月月度团队复盘会', date: '2026-08-05', type: '复盘会议', participants: 12, status: 'upcoming', theme: '7月运营复盘+8月规划', feedback: '--' },
  { id: 'tb_003', title: '经营者读书会·第3期', date: '2026-08-12', type: '读书会', participants: 8, status: 'upcoming', theme: '《长期主义》共读分享', feedback: '--' }
];

// 培训日历
const trainingCalendarData = [
  { id: 'tc_001', title: '企业认知与品牌故事', date: '2026-08-03', time: '14:00-16:00', level: 'D-D3', attendees: 8, location: '线上', status: 'upcoming', instructor: '周**' },
  { id: 'tc_002', title: '产品经理初级课程·精油', date: '2026-08-05', time: '19:00-21:00', level: 'D3-D5', attendees: 5, location: '体验馆B区', status: 'upcoming', instructor: '芳疗师小A' },
  { id: 'tc_003', title: '社群运营全流程SOP', date: '2026-08-08', time: '14:00-17:00', level: 'D3+', attendees: 12, location: '线上', status: 'upcoming', instructor: '李**' },
  { id: 'tc_004', title: '自媒体运营实战（L3必修）', date: '2026-08-10', time: '10:00-12:00', level: 'D-D8', attendees: 10, location: '体验馆A区', status: 'upcoming', instructor: '张**' },
  { id: 'tc_005', title: '数据复盘与目标管理（L3必修）', date: '2026-08-17', time: '14:00-17:00', level: 'D5+', attendees: 8, location: '体验馆A区', status: 'upcoming', instructor: '周**' },
  { id: 'tc_006', title: '团队领导力进阶（L3必修）', date: '2026-08-22', time: '09:30-12:30', level: 'D8+', attendees: 6, location: '体验馆·南山店', status: 'upcoming', instructor: '周**' }
];

// ========== 运营中枢 - 补充数据 ==========

// 系统设置数据
const systemSettings = {
  general: {
    systemName: 'MelBeacon 灯塔系统',
    version: 'V1.0',
    timezone: 'Asia/Shanghai',
    language: '简体中文',
    lastBackup: '2026-07-28 03:00'
  },
  notifications: {
    pushEnabled: true,
    emailEnabled: false,
    dailyReport: true,
    weeklyReport: true,
    alertThreshold: '转化率下降5%以上'
  },
  autoSync: {
    enabled: true,
    frequency: '每小时',
    lastSync: '2026-07-28 10:30',
    cloudStorage: 'GitHub'
  }
};

// 用户管理数据（管理员可管理 — V4.0 更新）
const userAccounts = [
  { id: 'usr_001', username: 'admin', name: '系统管理员', role: 'admin', avatar: '🛡️', status: 'active', lastLogin: '2026-07-28 10:30', domain: null, teamId: null, isLead: true, isSDPlus: true },
  { id: 'usr_002', username: 'sdleader', name: 'SD+线下活动执行统筹', role: 'offline_executor', avatar: '👑', status: 'active', lastLogin: '2026-07-27 18:20', domain: 'offline', teamId: 'team-offline-01', isLead: false, isSDPlus: true },
  { id: 'usr_003', username: 'blogger', name: '自媒体团队主理人', role: 'blogger_lead', avatar: '📱', status: 'active', lastLogin: '2026-07-28 09:15', domain: 'social', teamId: 'team-social-01', isLead: true, isSDPlus: false },
  { id: 'usr_004', username: 'community', name: '社群运营主理人', role: 'community_lead', avatar: '💬', status: 'active', lastLogin: '2026-07-27 16:00', domain: 'community', teamId: 'team-comm-01', isLead: true, isSDPlus: false },
  { id: 'usr_005', username: 'offline', name: '线下活动负责人', role: 'offline_lead', avatar: '🎪', status: 'active', lastLogin: '2026-07-28 11:00', domain: 'offline', teamId: 'team-offline-01', isLead: true, isSDPlus: false },
  { id: 'usr_006', username: 'courseadmin', name: '课件管理员', role: 'course_admin', avatar: '📚', status: 'active', lastLogin: '2026-07-28 08:30', domain: 'hub', teamId: 'team-hub-01', isLead: false, isSDPlus: false },
  { id: 'usr_007', username: 'blogplanner', name: '内容策划', role: 'blogger_planner', avatar: '✍️', status: 'active', lastLogin: '2026-07-26 20:30', domain: 'social', teamId: 'team-social-01', isLead: false, isSDPlus: false },
  { id: 'usr_008', username: 'comminteract', name: '互动引导员', role: 'comm_interact', avatar: '🤝', status: 'active', lastLogin: '2026-07-28 08:45', domain: 'community', teamId: 'team-comm-01', isLead: false, isSDPlus: false },
  { id: 'usr_009', username: 'offlineexec', name: '活动执行统筹', role: 'offline_executor', avatar: '📋', status: 'active', lastLogin: '2026-07-27 14:00', domain: 'offline', teamId: 'team-offline-01', isLead: false, isSDPlus: false }
];

// ========== 侧边栏菜单数据 ==========
const sidebarMenuDev = [
  { id: 'tab-tasks', name: '任务计划', icon: '📋', badge: 31 },
  { id: 'tab-skills', name: 'Skills管理', icon: '🧩', badge: 6 },
  { id: 'tab-brand', name: '品牌合作', icon: '🤝', badge: 0 },
  { id: 'tab-admin', name: '后台管理', icon: '🛠️', badge: 0, admin: true },
  { id: 'tab-all', name: '全部入口', icon: '🔗', badge: 0 }
];

const sidebarMenuOps = [
  { id: 'tab-social', name: '自媒体运营', icon: '📱', badge: 0 },
  { id: 'tab-community', name: '社群运营', icon: '💬', badge: 0 },
  { id: 'tab-courseware', name: '课件制作', icon: '📚', badge: 0 },
  { id: 'tab-offline', name: '线下活动', icon: '🎪', badge: 0 },
  { id: 'tab-training', name: '经营者培训', icon: '🎓', badge: 0 },
  { id: 'tab-hub', name: '运营中枢', icon: '🏠', badge: 0 },
  { id: 'tab-team', name: '团队管理', icon: '👥', badge: 0 }
];

// ========== V4.0 新增：团队管理数据 ==========

// 团队列表数据
const teamData = [
  {
    id: 'team-social-01',
    name: '自媒体·营养学团队',
    domain: 'social',
    track: '营养学',
    leadId: 'usr_003',
    leadName: '自媒体团队主理人',
    memberCount: 4,
    totalFans: 17400,
    monthlyOutput: 28,
    conversionRate: '12%',
    contributionLevel: 'A',
    growthTrend: 'up',
    createdAt: '2026-05-01'
  },
  {
    id: 'team-social-02',
    name: '自媒体·精油芳疗团队',
    domain: 'social',
    track: '精油芳疗',
    leadId: 'usr_010',
    leadName: '精油博主主理人',
    memberCount: 3,
    totalFans: 8200,
    monthlyOutput: 18,
    conversionRate: '9%',
    contributionLevel: 'B',
    growthTrend: 'up',
    createdAt: '2026-06-01'
  },
  {
    id: 'team-comm-01',
    name: '社群运营·L1训练营团队',
    domain: 'community',
    track: 'L1训练营',
    leadId: 'usr_004',
    leadName: '社群运营主理人',
    memberCount: 6,
    totalMembers: 450,
    activeRate: '72%',
    retentionRate: '85%',
    conversionRate: '26%',
    contributionLevel: 'A',
    growthTrend: 'stable',
    createdAt: '2026-04-15'
  },
  {
    id: 'team-comm-02',
    name: '社群运营·L2会员社群团队',
    domain: 'community',
    track: 'L2会员社群',
    leadId: 'usr_011',
    leadName: '会员社群主理人',
    memberCount: 4,
    totalMembers: 234,
    activeRate: '65%',
    retentionRate: '90%',
    conversionRate: '18%',
    contributionLevel: 'B',
    growthTrend: 'up',
    createdAt: '2026-05-20'
  },
  {
    id: 'team-offline-01',
    name: '线下活动·体验馆A团队',
    domain: 'offline',
    track: '体验馆A',
    leadId: 'usr_005',
    leadName: '线下活动负责人',
    memberCount: 5,
    monthlyEvents: 8,
    monthlyVisitors: 320,
    conversionRate: '22%',
    satisfaction: '4.6',
    contributionLevel: 'B',
    growthTrend: 'up',
    createdAt: '2026-04-01'
  },
  {
    id: 'team-offline-02',
    name: '线下活动·社区公益团队',
    domain: 'offline',
    track: '社区公益',
    leadId: 'usr_012',
    leadName: '社区公益负责人',
    memberCount: 3,
    monthlyEvents: 4,
    monthlyVisitors: 150,
    conversionRate: '15%',
    satisfaction: '4.8',
    contributionLevel: 'C',
    growthTrend: 'stable',
    createdAt: '2026-06-15'
  },
  {
    id: 'team-hub-01',
    name: '运营中枢团队',
    domain: 'hub',
    track: '运营中枢',
    leadId: 'usr_013',
    leadName: '运营中枢负责人',
    memberCount: 5,
    taskCompletionRate: '95%',
    trafficPoolTotal: 300,
    monthlyReviews: 4,
    contributionLevel: 'A',
    growthTrend: 'stable',
    createdAt: '2026-03-01'
  },
  {
    id: 'team-exp-01',
    name: '体验馆·南山店团队',
    domain: 'exp_center',
    track: '南山体验馆',
    leadId: 'usr_014',
    leadName: '南山店长',
    memberCount: 4,
    monthlyVisitors: 280,
    experienceSessions: 45,
    purchaseRate: '35%',
    satisfaction: '4.7',
    contributionLevel: 'B',
    growthTrend: 'up',
    createdAt: '2026-04-20'
  }
];

// 团队成员详细数据
const teamMembersData = {
  'team-social-01': [
    { id: 'mem_001', username: 'blogger', name: '自媒体团队主理人', role: 'blogger_lead', avatar: '📱', status: 'active', joinedAt: '2026-05-01', contribution: 'A', notes: '团队源头' },
    { id: 'mem_002', username: 'blogplanner', name: '内容策划', role: 'blogger_planner', avatar: '✍️', status: 'active', joinedAt: '2026-05-10', contribution: 'A', notes: '选题能力强' },
    { id: 'mem_003', username: 'blogeditor', name: '视频剪辑', role: 'blogger_editor', avatar: '🎬', status: 'active', joinedAt: '2026-06-01', contribution: 'B', notes: '' },
    { id: 'mem_004', username: 'blogtraffic', name: '流量运营', role: 'blogger_traffic', avatar: '📊', status: 'active', joinedAt: '2026-06-15', contribution: 'B', notes: '' }
  ],
  'team-comm-01': [
    { id: 'mem_005', username: 'community', name: '社群运营主理人', role: 'community_lead', avatar: '💬', status: 'active', joinedAt: '2026-04-15', contribution: 'A', notes: '团队源头' },
    { id: 'mem_006', username: 'commcontent', name: '内容运营专员', role: 'comm_content', avatar: '📝', status: 'active', joinedAt: '2026-05-01', contribution: 'A', notes: '内容产出高' },
    { id: 'mem_007', username: 'comminteract', name: '互动引导员', role: 'comm_interact', avatar: '🤝', status: 'active', joinedAt: '2026-05-15', contribution: 'B', notes: '' },
    { id: 'mem_008', username: 'commqa', name: '答疑/产品顾问', role: 'comm_qa', avatar: '💡', status: 'active', joinedAt: '2026-06-01', contribution: 'B', notes: '' },
    { id: 'mem_009', username: 'commtracker', name: '打卡追踪员', role: 'comm_tracker', avatar: '✅', status: 'active', joinedAt: '2026-06-15', contribution: 'C', notes: '新人' },
    { id: 'mem_010', username: 'commonboarder', name: '新人引导员', role: 'comm_onboarder', avatar: '🌱', status: 'active', joinedAt: '2026-07-01', contribution: 'C', notes: '新人' }
  ],
  'team-offline-01': [
    { id: 'mem_011', username: 'offline', name: '线下活动负责人', role: 'offline_lead', avatar: '🎪', status: 'active', joinedAt: '2026-04-01', contribution: 'A', notes: '团队源头' },
    { id: 'mem_012', username: 'offlineplanner', name: '活动策划师', role: 'offline_planner', avatar: '📐', status: 'active', joinedAt: '2026-04-15', contribution: 'A', notes: '' },
    { id: 'mem_013', username: 'offlineexec', name: '活动执行统筹', role: 'offline_executor', avatar: '📋', status: 'active', joinedAt: '2026-05-01', contribution: 'B', notes: '' },
    { id: 'mem_014', username: 'offlinehost', name: '活动主持人', role: 'offline_host', avatar: '🎤', status: 'active', joinedAt: '2026-05-15', contribution: 'B', notes: '' },
    { id: 'mem_015', username: 'offlinereviewer', name: '活动复盘专员', role: 'offline_reviewer', avatar: '📊', status: 'active', joinedAt: '2026-06-01', contribution: 'C', notes: '新人' }
  ],
  'team-hub-01': [
    { id: 'mem_016', username: 'hublead', name: '运营中枢负责人', role: 'hub_lead', avatar: '🏛️', status: 'active', joinedAt: '2026-03-01', contribution: 'A', notes: '团队源头' },
    { id: 'mem_017', username: 'courseadmin', name: '课件管理员', role: 'course_admin', avatar: '📚', status: 'active', joinedAt: '2026-03-15', contribution: 'A', notes: '课件设计核心' },
    { id: 'mem_018', username: 'hubcoordinator', name: '会议培训协调员', role: 'hub_coordinator', avatar: '📅', status: 'active', joinedAt: '2026-04-01', contribution: 'B', notes: '' },
    { id: 'mem_019', username: 'hubmanager', name: '空间管家', role: 'hub_manager', avatar: '🏠', status: 'active', joinedAt: '2026-05-01', contribution: 'B', notes: '' },
    { id: 'mem_020', username: 'hubadmin', name: '综合行政支持', role: 'hub_admin', avatar: '📎', status: 'active', joinedAt: '2026-06-01', contribution: 'C', notes: '新人' }
  ]
};

// 市场数据（SD+领导者视图）
const marketData = {
  'market-A': {
    id: 'market-A',
    name: '市场A',
    leaderId: 'usr_002',
    leaderName: 'SD+市场领导者',
    totalTeams: 4,
    totalMembers: 18,
    totalFans: 25600,
    totalConsumers: 684,
    monthlyGrowth: '+12%',
    teams: [
      { id: 'team-social-01', name: '自媒体·营养学团队', domain: 'social', status: 'growing', monthlyGrowth: '+15%' },
      { id: 'team-comm-01', name: '社群运营·L1训练营团队', domain: 'community', status: 'stable', monthlyGrowth: '+8%' },
      { id: 'team-offline-01', name: '线下活动·体验馆A团队', domain: 'offline', status: 'growing', monthlyGrowth: '+12%' },
      { id: 'team-exp-01', name: '体验馆·南山店团队', domain: 'exp_center', status: 'growing', monthlyGrowth: '+10%' }
    ]
  }
};

// 晋升追踪数据（V4.0：从培训模块移至运营中枢）
// @deprecated V4.2 第二阶段：已被 PROMOTION_TRACKING 替代，仅为兼容旧引用保留
const promotionTrackingData = [
  { id: 'promo_001', name: '自媒体博主(营养学)', currentRank: 'D3', targetRank: 'D5', progress: '75%', nextMilestone: '团队人数达到5人', eta: '2026-09', status: 'on_track', domain: 'social' },
  { id: 'promo_002', name: '社群运营主理人', currentRank: 'D5', targetRank: 'D8', progress: '45%', nextMilestone: '会员数达到100', eta: '2026-11', status: 'on_track', domain: 'community' },
  { id: 'promo_003', name: '线下活动负责人', currentRank: 'D3', targetRank: 'D5', progress: '60%', nextMilestone: '完成3场线下活动', eta: '2026-10', status: 'on_track', domain: 'offline' },
  { id: 'promo_004', name: '精油博主', currentRank: 'D', targetRank: 'D3', progress: '30%', nextMilestone: '连续3个月消费达标', eta: '2026-12', status: 'at_risk', domain: 'social' },
  { id: 'promo_005', name: '会员社群主理人', currentRank: 'D5', targetRank: 'D8', progress: '55%', nextMilestone: '社群活跃度达到75%', eta: '2026-11', status: 'on_track', domain: 'community' },
  { id: 'promo_006', name: '社区公益负责人', currentRank: 'D3', targetRank: 'D5', progress: '40%', nextMilestone: '累计举办10场公益讲座', eta: '2027-01', status: 'on_track', domain: 'offline' },
  { id: 'promo_007', name: 'SD+市场领导者', currentRank: 'SD', targetRank: 'ED', progress: '20%', nextMilestone: '培育2个SD', eta: '2027-03', status: 'on_track', domain: null },
  { id: 'promo_008', name: '体验馆南山店长', currentRank: 'D', targetRank: 'D3', progress: '50%', nextMilestone: '月到访人数达到200', eta: '2026-10', status: 'on_track', domain: 'exp_center' }
];

// ========== V4.2 第二阶段：晋升追踪完整数据模型 ==========

/**
 * 阶衔定义（MelBeacon 灯塔系统 8 级阶衔体系）
 * 每个阶衔定义门槛条件、图标、晋升到下一阶的关键指标
 */
const RANK_DEFINITIONS = [
  {
    code: 'D',
    label: '顾客',
    icon: '🛒',
    level: 1,
    description: '注册会员，处于消费体验阶段',
    promotionCriteria: {
      consumption: '连续3个月消费达标',
      training: '完成基础培训课程',
      activity: '参与至少1次社群活动'
    }
  },
  {
    code: 'D3',
    label: '活跃会员',
    icon: '⭐',
    level: 2,
    description: '稳定消费且开始参与社群活动',
    promotionCriteria: {
      consumption: '月消费稳定达标',
      teamSize: '团队人数达到5人',
      training: '社群运营能力认证通过'
    }
  },
  {
    code: 'D5',
    label: '初级经营者',
    icon: '🌱',
    level: 3,
    description: '开始建立个人团队，具备基础经营能力',
    promotionCriteria: {
      teamSize: '团队规模达12人',
      performance: '团队月度业绩达标',
      training: '完成产品经理课程'
    }
  },
  {
    code: 'D8',
    label: '中级经营者',
    icon: '🌳',
    level: 4,
    description: '团队稳健运营，具备培养下属能力',
    promotionCriteria: {
      teamSize: '培育2名D5+经营者',
      performance: '团队连续3个月业绩达标',
      training: '完成团队领导力进阶课程'
    }
  },
  {
    code: 'SD',
    label: '高级经营者',
    icon: '🏆',
    level: 5,
    description: '跨团队运营，具备市场领导力',
    promotionCriteria: {
      teamSize: '培育2名D8+经营者',
      performance: '市场业绩连续6个月达标',
      training: '完成SD+必修课程'
    }
  },
  {
    code: 'SD+',
    label: '市场领导者',
    icon: '👑',
    level: 6,
    description: '市场全局视角，可查看市场内全部团队数据',
    promotionCriteria: {
      teamSize: '培育2名SD经营者',
      performance: '市场规模持续扩大',
      training: '完成市场战略与全局规划课程'
    }
  },
  {
    code: 'ED',
    label: '执行总监',
    icon: '💎',
    level: 7,
    description: '跨市场运营，参与公司战略决策',
    promotionCriteria: {
      teamSize: '培育3名SD+市场领导者',
      performance: '多市场业绩稳定增长',
      training: '完成高阶演讲与公众影响力课程'
    }
  },
  {
    code: 'ND',
    label: '全国总监',
    icon: '🌟',
    level: 8,
    description: '全国市场统筹，公司核心决策层',
    promotionCriteria: null // 最高阶，无晋升目标
  }
];

/**
 * 晋升追踪完整数据模型（V4.2 第二阶段）
 * 字段说明：
 *   - score: 多维评分（0-100），由 performance/teamSize/training/activity 四维加权
 *   - progress: 整体进度百分比（由 score 加权计算，非人工填写）
 *   - milestones: 晋升到目标阶衔所需的关键里程碑清单
 *   - history: 历次晋升记录
 */
const PROMOTION_TRACKING = [
  {
    id: 'pt_001',
    name: '宋**',
    avatar: '👩',
    currentRank: 'D3',
    targetRank: 'D5',
    domain: 'community',
    mentor: '李**',
    startedAt: '2026-04-01',
    estimatedDate: '2026-09-15',
    status: 'on_track',
    score: {
      performance: 70,
      teamSize: 60,
      training: 65,
      activity: 80
    },
    milestones: [
      { id: 'm1', title: '团队人数达到5人', target: 5, current: 4, completed: false, dueDate: '2026-08-30' },
      { id: 'm2', title: '月消费稳定达标', target: 3, current: 3, completed: true, dueDate: '2026-07-31' },
      { id: 'm3', title: '社群运营能力认证', target: 1, current: 1, completed: true, dueDate: '2026-06-15' }
    ],
    history: [
      { date: '2026-04-01', fromRank: 'D', toRank: 'D3', note: '完成基础培训，晋升为活跃会员' }
    ]
  },
  {
    id: 'pt_002',
    name: '李**',
    avatar: '👨',
    currentRank: 'D5',
    targetRank: 'D8',
    domain: 'community',
    mentor: '张**',
    startedAt: '2026-01-15',
    estimatedDate: '2026-12-01',
    status: 'on_track',
    score: { performance: 45, teamSize: 40, training: 50, activity: 60 },
    milestones: [
      { id: 'm1', title: '团队规模达12人', target: 12, current: 8, completed: false, dueDate: '2026-11-15' },
      { id: 'm2', title: '团队月度业绩达标', target: 3, current: 2, completed: false, dueDate: '2026-10-31' },
      { id: 'm3', title: '完成产品经理课程', target: 1, current: 1, completed: true, dueDate: '2026-05-20' }
    ],
    history: [
      { date: '2026-01-15', fromRank: 'D3', toRank: 'D5', note: '团队突破5人，晋升初级经营者' }
    ]
  },
  {
    id: 'pt_003',
    name: '王**',
    avatar: '👨',
    currentRank: 'D',
    targetRank: 'D3',
    domain: 'community',
    mentor: '宋**',
    startedAt: '2026-05-10',
    estimatedDate: '2026-10-20',
    status: 'on_track',
    score: { performance: 30, teamSize: 20, training: 25, activity: 40 },
    milestones: [
      { id: 'm1', title: '连续3个月消费达标', target: 3, current: 2, completed: false, dueDate: '2026-09-30' },
      { id: 'm2', title: '完成基础培训课程', target: 1, current: 1, completed: true, dueDate: '2026-06-30' },
      { id: 'm3', title: '参与至少1次社群活动', target: 1, current: 1, completed: true, dueDate: '2026-05-25' }
    ],
    history: []
  },
  {
    id: 'pt_004',
    name: '赵**',
    avatar: '👩',
    currentRank: 'D8',
    targetRank: 'SD',
    domain: 'offline',
    mentor: '张**',
    startedAt: '2025-11-01',
    estimatedDate: '2026-11-30',
    status: 'on_track',
    score: { performance: 60, teamSize: 55, training: 50, activity: 55 },
    milestones: [
      { id: 'm1', title: '培育2名D5+经营者', target: 2, current: 1, completed: false, dueDate: '2026-10-31' },
      { id: 'm2', title: '团队连续3个月业绩达标', target: 3, current: 3, completed: true, dueDate: '2026-08-31' },
      { id: 'm3', title: '完成团队领导力进阶课程', target: 1, current: 1, completed: true, dueDate: '2026-04-15' }
    ],
    history: [
      { date: '2025-11-01', fromRank: 'D5', toRank: 'D8', note: '团队规模突破12人，晋升中级经营者' }
    ]
  },
  {
    id: 'pt_005',
    name: '张**',
    avatar: '👨',
    currentRank: 'SD',
    targetRank: 'SD+',
    domain: null,
    mentor: '周**',
    startedAt: '2026-02-01',
    estimatedDate: '2027-03-01',
    status: 'at_risk',
    score: { performance: 35, teamSize: 25, training: 30, activity: 40 },
    milestones: [
      { id: 'm1', title: '培育2名D8+经营者', target: 2, current: 0, completed: false, dueDate: '2027-02-28' },
      { id: 'm2', title: '市场业绩连续6个月达标', target: 6, current: 3, completed: false, dueDate: '2027-01-31' },
      { id: 'm3', title: '完成SD+必修课程', target: 1, current: 0, completed: false, dueDate: '2026-12-31' }
    ],
    history: [
      { date: '2026-02-01', fromRank: 'D8', toRank: 'SD', note: '培育D8+经营者成功，晋升高级经营者' }
    ]
  },
  {
    id: 'pt_006',
    name: '周**',
    avatar: '👩',
    currentRank: 'ED',
    targetRank: 'ND',
    domain: null,
    mentor: '--',
    startedAt: '2025-06-01',
    estimatedDate: '2027-06-01',
    status: 'on_track',
    score: { performance: 20, teamSize: 15, training: 25, activity: 30 },
    milestones: [
      { id: 'm1', title: '培育3名SD+市场领导者', target: 3, current: 1, completed: false, dueDate: '2027-05-31' },
      { id: 'm2', title: '多市场业绩稳定增长', target: 4, current: 2, completed: false, dueDate: '2027-04-30' },
      { id: 'm3', title: '完成高阶演讲与公众影响力课程', target: 1, current: 0, completed: false, dueDate: '2026-12-31' }
    ],
    history: [
      { date: '2025-06-01', fromRank: 'SD+', toRank: 'ED', note: '培育SD+市场领导者成功，晋升执行总监' }
    ]
  },
  {
    id: 'pt_007',
    name: '孙**',
    avatar: '👨',
    currentRank: 'D3',
    targetRank: 'D5',
    domain: 'social',
    mentor: '李**',
    startedAt: '2026-03-20',
    estimatedDate: '2026-09-30',
    status: 'on_track',
    score: { performance: 55, teamSize: 50, training: 60, activity: 65 },
    milestones: [
      { id: 'm1', title: '团队人数达到5人', target: 5, current: 5, completed: true, dueDate: '2026-08-15' },
      { id: 'm2', title: '月消费稳定达标', target: 3, current: 3, completed: true, dueDate: '2026-07-31' },
      { id: 'm3', title: '社群运营能力认证', target: 1, current: 1, completed: true, dueDate: '2026-06-10' }
    ],
    history: [
      { date: '2026-03-20', fromRank: 'D', toRank: 'D3', note: '完成基础培训，晋升活跃会员' }
    ]
  },
  {
    id: 'pt_008',
    name: '吴**',
    avatar: '👩',
    currentRank: 'D',
    targetRank: 'D3',
    domain: 'social',
    mentor: '宋**',
    startedAt: '2026-06-01',
    estimatedDate: '2026-11-15',
    status: 'at_risk',
    score: { performance: 15, teamSize: 10, training: 20, activity: 25 },
    milestones: [
      { id: 'm1', title: '连续3个月消费达标', target: 3, current: 1, completed: false, dueDate: '2026-10-31' },
      { id: 'm2', title: '完成基础培训课程', target: 1, current: 0, completed: false, dueDate: '2026-09-30' },
      { id: 'm3', title: '参与至少1次社群活动', target: 1, current: 1, completed: true, dueDate: '2026-06-20' }
    ],
    history: []
  }
];

/**
 * 计算晋升整体进度（由多维评分加权得出，非人工填写）
 * 权重：业绩 40% + 团队规模 25% + 培训 20% + 活跃度 15%
 */
function calcPromotionProgress(score) {
  if (!score) return 0;
  const w = { performance: 0.4, teamSize: 0.25, training: 0.2, activity: 0.15 };
  return Math.round(
    (score.performance || 0) * w.performance +
    (score.teamSize || 0) * w.teamSize +
    (score.training || 0) * w.training +
    (score.activity || 0) * w.activity
  );
}

/**
 * 计算里程碑整体完成率
 */
function calcMilestoneCompletion(milestones) {
  if (!milestones || milestones.length === 0) return 0;
  const completed = milestones.filter(m => m.completed).length;
  return Math.round((completed / milestones.length) * 100);
}

/**
 * 根据 rank code 获取阶衔定义
 */
function getRankDefinition(rankCode) {
  return RANK_DEFINITIONS.find(r => r.code === rankCode) || null;
}

// ========== V4.2 第二阶段：委托管理数据模型 ==========

/**
 * 委托类型定义
 * 高阶经营者可将部分管理权限委托给下属，减轻管理负担
 */
const DELEGATION_TYPES = [
  { code: 'content_review', label: '内容审核', icon: '📝', desc: '代为审核下属提交的自媒体内容/社群话术' },
  { code: 'task_assignment', label: '任务分配', icon: '📋', desc: '代为分配团队任务、设定截止时间' },
  { code: 'data_review', label: '数据复盘', icon: '📊', desc: '代为查看团队周/月数据并生成复盘报告' },
  { code: 'training_mentor', label: '培训辅导', icon: '🎓', desc: '代为辅导下属培训课程、答疑解惑' },
  { code: 'meeting_represent', label: '会议代表', icon: '👥', desc: '代为参加特定会议、传达会议精神' },
  { code: 'traffic_allocation', label: '流量分配', icon: '🔀', desc: '代为调整团队内流量池分配权重' }
];

/**
 * 委托状态定义
 */
const DELEGATION_STATUS = {
  pending:   { text: '待接受', class: 'draft',     color: '#FF9800' },
  active:    { text: '进行中', class: 'active',    color: '#4CAF50' },
  paused:    { text: '已暂停', class: 'need_optimize', color: '#9E9E9E' },
  completed: { text: '已完成', class: 'completed', color: '#2196F3' },
  rejected:  { text: '已拒绝', class: 'rejected',  color: '#F44336' }
};

/**
 * 委托记录数据
 * delegator: 委托人（高阶经营者）
 * delegatee: 被委托人（接受委托的下属）
 * scope: 委托范围（哪些下属/团队在委托权限内）
 */
const DELEGATION_DATA = [
  {
    id: 'dlg_001',
    title: '社群内容审核委托',
    type: 'content_review',
    delegator: '张**',
    delegatorRank: 'SD',
    delegatee: '李**',
    delegateeRank: 'D5',
    scope: '社群运营团队（12人）',
    description: '因出差一周，将社群推送话术、互动回复的审核权临时委托给李**',
    startDate: '2026-07-25',
    endDate: '2026-08-01',
    status: 'active',
    progress: 60,
    tasksTotal: 15,
    tasksCompleted: 9,
    createdAt: '2026-07-22',
    notes: '审核标准参照《社群运营SOP》第3章，紧急事项请电话联系'
  },
  {
    id: 'dlg_002',
    title: '团队周报数据复盘',
    type: 'data_review',
    delegator: '周**',
    delegatorRank: 'ED',
    delegatee: '张**',
    delegateeRank: 'SD',
    scope: '跨市场（3个市场团队）',
    description: '每月第1周代为收集各市场团队周报，汇总形成月度复盘报告',
    startDate: '2026-07-01',
    endDate: '2026-12-31',
    status: 'active',
    progress: 75,
    tasksTotal: 12,
    tasksCompleted: 9,
    createdAt: '2026-06-25',
    notes: '复盘模板见知识库 KB-023，每月5号前完成上个月数据汇总'
  },
  {
    id: 'dlg_003',
    title: '新人培训辅导委托',
    type: 'training_mentor',
    delegator: '李**',
    delegatorRank: 'D5',
    delegatee: '宋**',
    delegateeRank: 'D3',
    scope: '本月新人（3人：王**、陈**、吴**）',
    description: '代为辅导本月新加入会员的基础培训课程答疑',
    startDate: '2026-07-15',
    endDate: '2026-08-15',
    status: 'active',
    progress: 40,
    tasksTotal: 9,
    tasksCompleted: 4,
    createdAt: '2026-07-12',
    notes: '新人课程清单见培训框架 TF-001，重点关注社群运营基础'
  },
  {
    id: 'dlg_004',
    title: '季度市场复盘会议代表',
    type: 'meeting_represent',
    delegator: '周**',
    delegatorRank: 'ED',
    delegatee: '赵**',
    delegateeRank: 'D8',
    scope: 'Q3季度市场复盘会议',
    description: '代为参加7月30日Q3季度市场复盘会议，传达会议精神',
    startDate: '2026-07-30',
    endDate: '2026-07-30',
    status: 'pending',
    progress: 0,
    tasksTotal: 1,
    tasksCompleted: 0,
    createdAt: '2026-07-20',
    notes: '会议地点：总部会议室A，时间：14:00-17:00，需准备团队汇报材料'
  },
  {
    id: 'dlg_005',
    title: '流量池临时调整委托',
    type: 'traffic_allocation',
    delegator: '张**',
    delegatorRank: 'SD',
    delegatee: '李**',
    delegateeRank: 'D5',
    scope: '社群+自媒体流量池（8月）',
    description: '8月出差期间，代为调整社群与自媒体流量池分配权重',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    status: 'pending',
    progress: 0,
    tasksTotal: 4,
    tasksCompleted: 0,
    createdAt: '2026-07-26',
    notes: '调整需符合《流量分配SOP》，每周一调整一次，调整后通知相关团队主理人'
  }
];

/**
 * 获取委托类型元数据
 */
function getDelegationType(typeCode) {
  return DELEGATION_TYPES.find(t => t.code === typeCode) || { code: typeCode, label: typeCode, icon: '📎', desc: '' };
}

/**
 * 获取委托状态元数据
 */
function getDelegationStatus(statusCode) {
  return DELEGATION_STATUS[statusCode] || { text: statusCode, class: 'draft', color: '#757575' };
}

// 团队活动数据（V4.0：原"团队建设"改名，改为参与式展示）
const teamActivityData = [
  { id: 'act_001', name: '户外拓展·团队凝聚力', type: '户外拓展', date: '2026-08-15', location: '南山公园', status: 'open', participants: 12, maxParticipants: 20, domain: 'all' },
  { id: 'act_002', name: '月度复盘会议', type: '复盘会议', date: '2026-08-01', location: '线上', status: 'upcoming', participants: 8, maxParticipants: 15, domain: 'all' },
  { id: 'act_003', name: '《经营者的12条原则》读书会', type: '读书会', date: '2026-08-10', location: '体验馆·南山店', status: 'open', participants: 6, maxParticipants: 12, domain: 'all' },
  { id: 'act_004', name: '自媒体团队内容共创会', type: '共创会', date: '2026-08-05', location: '线上', status: 'open', participants: 4, maxParticipants: 10, domain: 'social' },
  { id: 'act_005', name: '社群运营经验分享', type: '分享会', date: '2026-08-08', location: '线上', status: 'open', participants: 5, maxParticipants: 20, domain: 'community' }
];

// 角色看板指标数据（按角色类型差异化）
const dashboardMetricsByRole = {
  admin: [
    { id: 'metric_001', title: '全平台粉丝', value: '25,600', change: '+1,200', changeType: 'positive', icon: '👥' },
    { id: 'metric_002', title: '活跃会员数', value: '684', change: '+32', changeType: 'positive', icon: '👤' },
    { id: 'metric_003', title: '经营者总数', value: '45', change: '+3', changeType: 'positive', icon: '🏆' },
    { id: 'metric_004', title: '团队数量', value: '8', change: '+1', changeType: 'positive', icon: '👥' },
    { id: 'metric_005', title: '月转化率', value: '26%', change: '-2%', changeType: 'negative', icon: '📈' },
    { id: 'metric_006', title: '任务运行率', value: '95%', change: '+3%', changeType: 'positive', icon: '⚙️' }
  ],
  blogger_lead: [
    { id: 'metric_b1', title: '团队粉丝总量', value: '17,400', change: '+856', changeType: 'positive', icon: '👥' },
    { id: 'metric_b2', title: '本月内容产出', value: '28', change: '+5', changeType: 'positive', icon: '📝' },
    { id: 'metric_b3', title: '爆款率', value: '18%', change: '+3%', changeType: 'positive', icon: '🔥' },
    { id: 'metric_b4', title: '引流到社群', value: '45', change: '+8', changeType: 'positive', icon: '📈' }
  ],
  community_lead: [
    { id: 'metric_c1', title: '社群总成员', value: '450', change: '+28', changeType: 'positive', icon: '👥' },
    { id: 'metric_c2', title: '社群活跃率', value: '72%', change: '+5%', changeType: 'positive', icon: '📊' },
    { id: 'metric_c3', title: '会员留存率', value: '85%', change: '+2%', changeType: 'positive', icon: '💚' },
    { id: 'metric_c4', title: '转化率', value: '26%', change: '-2%', changeType: 'negative', icon: '📈' }
  ],
  offline_lead: [
    { id: 'metric_o1', title: '本月活动场次', value: '8', change: '+2', changeType: 'positive', icon: '🎪' },
    { id: 'metric_o2', title: '活动参与人数', value: '320', change: '+45', changeType: 'positive', icon: '👥' },
    { id: 'metric_o3', title: '活动转化率', value: '22%', change: '+3%', changeType: 'positive', icon: '📈' },
    { id: 'metric_o4', title: '满意度评分', value: '4.6', change: '+0.2', changeType: 'positive', icon: '⭐' }
  ],
  blogger: [
    { id: 'metric_pb1', title: '我的粉丝', value: '3,200', change: '+156', changeType: 'positive', icon: '👤' },
    { id: 'metric_pb2', title: '本月内容', value: '8', change: '+2', changeType: 'positive', icon: '📝' },
    { id: 'metric_pb3', title: '贡献评级', value: 'B', change: '→A', changeType: 'positive', icon: '⭐' }
  ],
  community: [
    { id: 'metric_pc1', title: '我的社群', value: '3', change: '--', changeType: 'stable', icon: '💬' },
    { id: 'metric_pc2', title: '互动次数', value: '156', change: '+23', changeType: 'positive', icon: '🤝' },
    { id: 'metric_pc3', title: '贡献评级', value: 'B', change: '→B', changeType: 'stable', icon: '⭐' }
  ],
  offline: [
    { id: 'metric_po1', title: '参与活动', value: '5', change: '+1', changeType: 'positive', icon: '🎪' },
    { id: 'metric_po2', title: '服务人数', value: '120', change: '+18', changeType: 'positive', icon: '👥' },
    { id: 'metric_po3', title: '贡献评级', value: 'C', change: '→B', changeType: 'positive', icon: '⭐' }
  ],
  sd_plus: [
    { id: 'metric_sd1', title: '市场总团队', value: '4', change: '+1', changeType: 'positive', icon: '👥' },
    { id: 'metric_sd2', title: '市场总成员', value: '18', change: '+3', changeType: 'positive', icon: '👤' },
    { id: 'metric_sd3', title: '市场月增长', value: '12%', change: '+2%', changeType: 'positive', icon: '📈' },
    { id: 'metric_sd4', title: '新经营者', value: '3', change: '+1', changeType: 'positive', icon: '🌱' }
  ],
  course_admin: [
    { id: 'metric_ca1', title: '课件总数', value: '23', change: '+3', changeType: 'positive', icon: '📚' },
    { id: 'metric_ca2', title: '本月新增', value: '3', change: '+1', changeType: 'positive', icon: '➕' },
    { id: 'metric_ca3', title: '培训覆盖率', value: '85%', change: '+5%', changeType: 'positive', icon: '📊' }
  ],
  hub: [
    { id: 'metric_ph1', title: '我的任务', value: '8', change: '+2', changeType: 'positive', icon: '📋' },
    { id: 'metric_ph2', title: '完成率', value: '92%', change: '+3%', changeType: 'positive', icon: '✅' },
    { id: 'metric_ph3', title: '贡献评级', value: 'B', change: '→B', changeType: 'stable', icon: '⭐' }
  ],
  exp: [
    { id: 'metric_pe1', title: '到访人数', value: '280', change: '+35', changeType: 'positive', icon: '👥' },
    { id: 'metric_pe2', title: '体验场次', value: '45', change: '+5', changeType: 'positive', icon: '🎯' },
    { id: 'metric_pe3', title: '购买转化', value: '35%', change: '+2%', changeType: 'positive', icon: '📈' }
  ]
};
