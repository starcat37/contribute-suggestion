export type Language = 'ko' | 'en' | 'zh';

export interface Translations {
  // Header
  appTitle: string;
  appDescription: string;
  aiPowered: string;
  settings: string;
  
  // Search Form
  selectLanguages: string;
  selectContributionTypes: string;
  searchButton: string;
  
  // Quick Start
  quickStart: string;
  quickStartDescription: string;
  frontendDevelopment: string;
  backendDevelopment: string;
  mobileApp: string;
  dataScience: string;
  devOps: string;
  gameEngine: string;
  
  // Contribution Types
  contributionTypes: {
    'good-first-issue': string;
    'documentation': string;
    'translation': string;
    'bug-fix': string;
    'testing': string;
    'design': string;
    'feature-request': string;
    'code-review': string;
  };
  
  // Results
  searchResults: string;
  repositoriesFound: string;
  loadMore: string;
  noResults: string;
  newSearch: string;
  
  // Repository Details
  stars: string;
  forks: string;
  issues: string;
  lastUpdated: string;
  createdAt: string;
  language: string;
  license: string;
  
  // Settings Modal
  settingsModal: {
    title: string;
    githubToken: string;
    githubTokenDescription: string;
    createToken: string;
    tokenPlaceholder: string;
    save: string;
    saving: string;
    validating: string;
    remove: string;
    validToken: string;
    invalidToken: string;
    theme: string;
    light: string;
    dark: string;
    language: string;
    programmingLanguages: string;
    includeMode: string;
    excludeMode: string;
    includeModeDescription: string;
    excludeModeDescription: string;
    includedLanguages: string;
    excludedLanguages: string;
    resetSettings: string;
    resetConfirm: string;
  };
  
  // Common
  close: string;
  confirm: string;
  cancel: string;
  loading: string;
  error: string;
}

export const translations: Record<Language, Translations> = {
  ko: {
    appTitle: '오픈소스 기여 추천',
    appDescription: 'GitHub 오픈소스 프로젝트에 기여하고 싶지만 어디서부터 시작해야 할지 모르는 개발자들을 위한',
    aiPowered: 'AI 기반 맞춤형 저장소 추천 시스템',
    settings: '설정',
    
    selectLanguages: '프로그래밍 언어 선택',
    selectContributionTypes: '기여 유형 선택',
    searchButton: '검색',
    
    quickStart: '빠른 시작',
    quickStartDescription: '관심 분야를 선택하여 빠르게 시작하세요',
    frontendDevelopment: '프론트엔드 개발',
    backendDevelopment: '백엔드 개발',
    mobileApp: '모바일 앱',
    dataScience: '데이터 사이언스',
    devOps: 'DevOps',
    gameEngine: '게임 엔진',
    
    contributionTypes: {
      'good-first-issue': '첫 기여하기',
      'documentation': '문서 작성',
      'translation': '번역',
      'bug-fix': '버그 수정',
      'testing': '테스트',
      'design': '디자인',
      'feature-request': '기능 요청',
      'code-review': '코드 리뷰',
    },
    
    searchResults: '검색 결과',
    repositoriesFound: '개의 저장소를 찾았습니다',
    loadMore: '더 많은 저장소 보기',
    noResults: '검색 결과가 없습니다',
    newSearch: '새로운 검색',
    
    stars: '스타',
    forks: '포크',
    issues: '이슈',
    lastUpdated: '마지막 업데이트',
    createdAt: '생성일',
    language: '언어',
    license: '라이선스',
    
    settingsModal: {
      title: '설정',
      githubToken: 'GitHub 토큰',
      githubTokenDescription: 'GitHub Personal Access Token을 설정하면 API 사용량 제한을 늘리고 더 많은 저장소 정보를 제공받을 수 있습니다.',
      createToken: '토큰 생성하기',
      tokenPlaceholder: 'ghp_xxxxxxxxxxxxxxxxxxxx',
      save: '저장',
      saving: '저장 중...',
      validating: '검증 중...',
      remove: '제거',
      validToken: '유효한 토큰',
      invalidToken: '유효하지 않은 토큰',
      theme: '테마',
      light: '라이트',
      dark: '다크',
      language: '언어 설정',
      programmingLanguages: '프로그래밍 언어 설정',
      includeMode: '포함 모드',
      excludeMode: '제외 모드',
      includeModeDescription: '선택한 언어만 검색 결과에 포함됩니다.',
      excludeModeDescription: '선택한 언어는 검색 결과에서 제외됩니다.',
      includedLanguages: '포함된 언어',
      excludedLanguages: '제외된 언어',
      resetSettings: '설정 초기화',
      resetConfirm: '모든 설정을 초기화하시겠습니까?',
    },
    
    close: '닫기',
    confirm: '확인',
    cancel: '취소',
    loading: '로딩 중...',
    error: '오류',
  },
  
  en: {
    appTitle: 'Open Source Contribution Finder',
    appDescription: 'For developers who want to contribute to GitHub open source projects but don\'t know where to start',
    aiPowered: 'AI-powered personalized repository recommendation system',
    settings: 'Settings',
    
    selectLanguages: 'Select Programming Languages',
    selectContributionTypes: 'Select Contribution Types',
    searchButton: 'Search',
    
    quickStart: 'Quick Start',
    quickStartDescription: 'Choose your area of interest to get started quickly',
    frontendDevelopment: 'Frontend Development',
    backendDevelopment: 'Backend Development',
    mobileApp: 'Mobile App',
    dataScience: 'Data Science',
    devOps: 'DevOps',
    gameEngine: 'Game Engine',
    
    contributionTypes: {
      'good-first-issue': 'Good First Issue',
      'documentation': 'Documentation',
      'translation': 'Translation',
      'bug-fix': 'Bug Fix',
      'testing': 'Testing',
      'design': 'Design',
      'feature-request': 'Feature Request',
      'code-review': 'Code Review',
    },
    
    searchResults: 'Search Results',
    repositoriesFound: 'repositories found',
    loadMore: 'Load More Repositories',
    noResults: 'No results found',
    newSearch: 'New Search',
    
    stars: 'Stars',
    forks: 'Forks',
    issues: 'Issues',
    lastUpdated: 'Last Updated',
    createdAt: 'Created',
    language: 'Language',
    license: 'License',
    
    settingsModal: {
      title: 'Settings',
      githubToken: 'GitHub Token',
      githubTokenDescription: 'Setting up a GitHub Personal Access Token will increase API rate limits and provide more repository information.',
      createToken: 'Create Token',
      tokenPlaceholder: 'ghp_xxxxxxxxxxxxxxxxxxxx',
      save: 'Save',
      saving: 'Saving...',
      validating: 'Validating...',
      remove: 'Remove',
      validToken: 'Valid token',
      invalidToken: 'Invalid token',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      language: 'Language Settings',
      programmingLanguages: 'Programming Language Settings',
      includeMode: 'Include Mode',
      excludeMode: 'Exclude Mode',
      includeModeDescription: 'Only selected languages will be included in search results.',
      excludeModeDescription: 'Selected languages will be excluded from search results.',
      includedLanguages: 'Included languages',
      excludedLanguages: 'Excluded languages',
      resetSettings: 'Reset Settings',
      resetConfirm: 'Are you sure you want to reset all settings?',
    },
    
    close: 'Close',
    confirm: 'Confirm',
    cancel: 'Cancel',
    loading: 'Loading...',
    error: 'Error',
  },
  
  zh: {
    appTitle: '开源贡献推荐',
    appDescription: '为想要贡献GitHub开源项目但不知从何开始的开发者提供',
    aiPowered: 'AI驱动的个性化仓库推荐系统',
    settings: '设置',
    
    selectLanguages: '选择编程语言',
    selectContributionTypes: '选择贡献类型',
    searchButton: '搜索',
    
    quickStart: '快速开始',
    quickStartDescription: '选择您感兴趣的领域快速开始',
    frontendDevelopment: '前端开发',
    backendDevelopment: '后端开发',
    mobileApp: '移动应用',
    dataScience: '数据科学',
    devOps: 'DevOps',
    gameEngine: '游戏引擎',
    
    contributionTypes: {
      'good-first-issue': '新手友好',
      'documentation': '文档编写',
      'translation': '翻译',
      'bug-fix': '错误修复',
      'testing': '测试',
      'design': '设计',
      'feature-request': '功能请求',
      'code-review': '代码审查',
    },
    
    searchResults: '搜索结果',
    repositoriesFound: '个仓库',
    loadMore: '加载更多仓库',
    noResults: '未找到结果',
    newSearch: '新搜索',
    
    stars: '星标',
    forks: '分支',
    issues: '问题',
    lastUpdated: '最后更新',
    createdAt: '创建时间',
    language: '语言',
    license: '许可证',
    
    settingsModal: {
      title: '设置',
      githubToken: 'GitHub 令牌',
      githubTokenDescription: '设置 GitHub 个人访问令牌将增加 API 速率限制并提供更多仓库信息。',
      createToken: '创建令牌',
      tokenPlaceholder: 'ghp_xxxxxxxxxxxxxxxxxxxx',
      save: '保存',
      saving: '保存中...',
      validating: '验证中...',
      remove: '删除',
      validToken: '有效令牌',
      invalidToken: '无效令牌',
      theme: '主题',
      light: '浅色',
      dark: '深色',
      language: '语言设置',
      programmingLanguages: '编程语言设置',
      includeMode: '包含模式',
      excludeMode: '排除模式',
      includeModeDescription: '只有选定的语言会包含在搜索结果中。',
      excludeModeDescription: '选定的语言将从搜索结果中排除。',
      includedLanguages: '包含的语言',
      excludedLanguages: '排除的语言',
      resetSettings: '重置设置',
      resetConfirm: '您确定要重置所有设置吗？',
    },
    
    close: '关闭',
    confirm: '确认',
    cancel: '取消',
    loading: '加载中...',
    error: '错误',
  },
};