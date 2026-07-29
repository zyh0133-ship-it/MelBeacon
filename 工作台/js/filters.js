/**
 * MelBeacon 灯塔系统工作台 - 筛选交互逻辑
 * 负责多维筛选、自定义赛道、视图切换等
 */

const Filters = {
  // 当前选中的筛选条件
  state: {
    social: {
      platform: 'all',
      domain: '全部',
      track: '全部',
      format: '全部',
      timeRange: '全部',
      status: '全部',
      sortBy: '推荐度'
    },
    courseware: { level: '全部', category: '全部', format: '全部', status: '全部', priority: '全部' },
    offline: { type: '全部', status: '全部', time: '全部', venue: '全部' },
    training: { level: '全部', status: '全部' }
  },

  // 自定义赛道列表
  customTracks: [],

  /**
   * 初始化筛选交互
   */
  init() {
    this.bindFilterTags();
    this.bindCustomTrack();
    this.bindViewToggle();
  },

  /**
   * 通用：给选择器同时绑定 click + touchend
   */
  _on(selector, handler) {
    const wrap = (e) => {
      if (!e.target.closest(selector)) return;
      if (e.type === 'touchend') e.preventDefault();
      handler.call(this, e);
    };
    document.addEventListener('click', wrap);
    document.addEventListener('touchend', wrap, { passive: false });
  },

  /**
   * 绑定筛选标签点击事件（事件委托，V4.5 加 touchend 双通道）
   */
  bindFilterTags() {
    this._on('.filter-tag:not(.add-custom)', (e) => {
      const tag = e.target.closest('.filter-tag');
      const filterArea = tag.closest('.filter-area');
      if (!filterArea) return;

      const row = tag.closest('.filter-row');
      const dimension = row.dataset.dimension;
      const value = tag.dataset.value;

      // 取消同行其他标签的激活
      row.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
      tag.classList.add('active');

      // 更新状态
      const activeTab = App.state.activeTab;
      if (activeTab === 'tab-social' && this.state.social[dimension] !== undefined) {
        this.state.social[dimension] = value;
      } else if (activeTab === 'tab-courseware' && this.state.courseware[dimension] !== undefined) {
        this.state.courseware[dimension] = value;
      } else if (activeTab === 'tab-offline' && this.state.offline[dimension] !== undefined) {
        this.state.offline[dimension] = value;
      } else if (activeTab === 'tab-training' && this.state.training[dimension] !== undefined) {
        this.state.training[dimension] = value;
      }

      // 重新渲染卡片
      this.applyFilters();
    });
  },

  /**
   * 绑定自定义赛道添加功能（V4.5 加 touchend）
   */
  bindCustomTrack() {
    this._on('.add-custom', () => {
      const input = document.getElementById('custom-track-input');
      if (input) {
        input.classList.add('show');
        const textInput = input.querySelector('input');
        if (textInput) textInput.focus();
      }
    });

    this._on('#add-track-btn', () => {
      const input = document.getElementById('custom-track-name');
      if (!input) return;
      const value = input.value.trim();
      if (value) {
        this.addCustomTrack(value);
        input.value = '';
        const wrap = document.getElementById('custom-track-input');
        if (wrap) wrap.classList.remove('show');
      }
    });

    // 回车提交
    document.addEventListener('keypress', (e) => {
      if (e.target.id === 'custom-track-name' && e.key === 'Enter') {
        const btn = document.getElementById('add-track-btn');
        if (btn) btn.click();
      }
    });
  },

  /**
   * 添加自定义赛道
   */
  addCustomTrack(name) {
    // 去重
    if (filterDimensions.tracks.includes(name) || this.customTracks.includes(name)) {
      App.showToast('该赛道已存在');
      return;
    }
    this.customTracks.push(name);

    // 更新筛选维度
    filterDimensions.tracks.push(name);

    // 重新渲染赛道筛选行
    this.renderTrackFilter();

    App.showToast(`赛道"${name}"已添加`);
  },

  /**
   * 渲染赛道筛选行
   */
  renderTrackFilter() {
    const trackRow = document.querySelector('[data-dimension="track"]');
    if (!trackRow) return;

    const tagsContainer = trackRow.querySelector('.filter-tags');
    const html = filterDimensions.tracks.map((t, i) => `
      <span class="filter-tag ${t === this.state.social.track ? 'active' : ''}" data-value="${t}">${t}</span>
    `).join('') + `
      <span class="filter-tag add-custom">+ 自定义赛道</span>
      <span class="custom-track-input" id="custom-track-input">
        <input type="text" id="custom-track-name" placeholder="赛道名称">
        <button id="add-track-btn">添加</button>
      </span>
    `;
    tagsContainer.innerHTML = html;
  },

  /**
   * 绑定视图切换（V4.5 加 touchend 双通道）
   */
  bindViewToggle() {
    this._on('.view-toggle button', (e) => {
      const btn = e.target.closest('button');
      const toggle = btn.closest('.view-toggle');
      if (!toggle) return;
      toggle.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const view = btn.dataset.view;
      // 找到同标签页下最近的 card-grid（不是整个文档第一个）
      const tabContent = btn.closest('.tab-content');
      const grid = tabContent
        ? (tabContent.querySelector('.card-grid') || document.querySelector('.card-grid'))
        : document.querySelector('.card-grid');
      if (grid) {
        if (view === 'list') {
          grid.classList.add('list-view');
        } else {
          grid.classList.remove('list-view');
        }
      }
    });
  },

  /**
   * 应用筛选条件并重新渲染卡片
   */
  applyFilters() {
    const activeTab = App.state.activeTab;
    if (activeTab === 'tab-social') {
      this.filterSocialCards();
    } else if (activeTab === 'tab-courseware') {
      this.filterCoursewareCards();
    } else if (activeTab === 'tab-offline') {
      this.filterOfflineCards();
    } else if (activeTab === 'tab-training') {
      this.filterTrainingCards();
    }
  },

  /**
   * 筛选自媒体内容卡片
   */
  filterSocialCards() {
    const { platform, domain, track, format, status, sortBy } = this.state.social;
    let cards = [...socialMediaCards];

    // 平台筛选
    if (platform !== 'all') {
      cards = cards.filter(c => c.platform === platform);
    }
    // 领域筛选
    if (domain !== '全部') {
      cards = cards.filter(c => c.domain === domain);
    }
    // 赛道筛选
    if (track !== '全部') {
      cards = cards.filter(c => c.track === track);
    }
    // 形式筛选
    if (format !== '全部') {
      cards = cards.filter(c => c.format === format);
    }
    // 状态筛选
    if (status !== '全部') {
      const statusMap = { '待发布': 'pending', '已发布': 'published', '监测中': 'monitoring', '需优化': 'need_optimize' };
      cards = cards.filter(c => c.status === statusMap[status]);
    }

    // 排序
    this.sortSocialCards(cards, sortBy);

    // 渲染
    App.renderSocialCards(cards);
  },

  /**
   * 排序自媒体卡片
   */
  sortSocialCards(cards, sortBy) {
    switch (sortBy) {
      case '播放量':
        cards.sort((a, b) => b.views - a.views);
        break;
      case '互动量':
        cards.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
        break;
      case '涨粉率':
        cards.sort((a, b) => parseFloat(b.followerGrowth) - parseFloat(a.followerGrowth));
        break;
      case '发布时间':
        cards.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
        break;
      case '推荐度':
      default:
        cards.sort((a, b) => b.score - a.score);
    }
  },

  /**
   * 筛选课件卡片
   */
  filterCoursewareCards() {
    const { level, category, format, status, priority } = this.state.courseware;
    let cards = [...coursewareCards];

    if (level !== '全部') cards = cards.filter(c => c.level === level);
    if (category !== '全部') cards = cards.filter(c => c.category === category);
    if (format !== '全部') cards = cards.filter(c => c.format === format);
    if (status !== '全部') {
      const map = { '已完成': 'completed', '进行中': 'in_progress', '草稿': 'draft' };
      cards = cards.filter(c => c.status === map[status]);
    }
    if (priority !== '全部') cards = cards.filter(c => c.priority === priority);

    App.renderCoursewareCards(cards);
  },

  /**
   * 筛选线下活动卡片
   */
  filterOfflineCards() {
    const { type, status, time } = this.state.offline;
    let cards = [...activityCards];

    if (type !== '全部') cards = cards.filter(c => c.type === type);
    if (status !== '全部') {
      const map = { '即将开始': 'upcoming', '已完成': 'completed', '策划中': 'planning' };
      cards = cards.filter(c => c.status === map[status]);
    }

    App.renderActivityCards(cards);
  },

  /**
   * 筛选培训课程卡片
   */
  filterTrainingCards() {
    const { level, status } = this.state.training;
    let cards = [...trainingCourses];

    if (level !== '全部') cards = cards.filter(c => c.level === level);
    if (status !== '全部') {
      const map = { '进行中': 'active', '已完结': 'completed', '筹备中': 'planned' };
      cards = cards.filter(c => c.status === map[status]);
    }

    // 重新渲染课程列表（仅更新 #training-mine-cards 内的内容）
    const container = document.getElementById('training-mine-cards');
    if (!container) return;

    const statusMap = {
      active: { text: '进行中', class: 'active' },
      completed: { text: '已完结', class: 'completed' },
      planned: { text: '筹备中', class: 'pending' }
    };

    if (cards.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><h3>暂无匹配课程</h3></div>`;
      return;
    }

    container.innerHTML = `
      <div class="card-grid">
        ${cards.map(c => `
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
    `;
  },

  /**
   * 重置某个标签页的筛选状态
   */
  reset(tabId) {
    if (tabId === 'tab-social') {
      this.state.social = {
        platform: 'all', domain: '全部', track: '全部', format: '全部',
        timeRange: '全部', status: '全部', sortBy: '推荐度'
      };
    } else if (tabId === 'tab-courseware') {
      this.state.courseware = { level: '全部', category: '全部', format: '全部', status: '全部', priority: '全部' };
    }
  }
};
