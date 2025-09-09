import { renderHook } from '@testing-library/react';
import { useTranslation } from '@/hooks/useTranslation';

// Mock useSettings hook
jest.mock('@/hooks/useSettings', () => ({
  useSettings: jest.fn(),
}));

describe('useTranslation', () => {
  const mockUseSettings = jest.mocked(require('@/hooks/useSettings').useSettings);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns Korean translations by default', () => {
    mockUseSettings.mockReturnValue({
      settings: { language: 'ko' },
      isHydrated: true,
    });

    const { result } = renderHook(() => useTranslation());

    expect(result.current.language).toBe('ko');
    expect(result.current.t.appTitle).toBe('오픈소스 기여 추천');
    expect(result.current.t.searchButton).toBe('검색');
    expect(result.current.t.settings).toBe('설정');
  });

  it('returns English translations when language is en', () => {
    mockUseSettings.mockReturnValue({
      settings: { language: 'en' },
      isHydrated: true,
    });

    const { result } = renderHook(() => useTranslation());

    expect(result.current.language).toBe('en');
    expect(result.current.t.appTitle).toBe('Open Source Contribution Finder');
    expect(result.current.t.searchButton).toBe('Search');
    expect(result.current.t.settings).toBe('Settings');
  });

  it('returns Chinese translations when language is zh', () => {
    mockUseSettings.mockReturnValue({
      settings: { language: 'zh' },
      isHydrated: true,
    });

    const { result } = renderHook(() => useTranslation());

    expect(result.current.language).toBe('zh');
    expect(result.current.t.appTitle).toBe('开源贡献推荐');
    expect(result.current.t.searchButton).toBe('搜索');
    expect(result.current.t.settings).toBe('设置');
  });

  it('falls back to Korean during SSR', () => {
    mockUseSettings.mockReturnValue({
      settings: { language: 'en' },
      isHydrated: false, // Not hydrated yet
    });

    const { result } = renderHook(() => useTranslation());

    expect(result.current.language).toBe('en');
    // Should return Korean translations during SSR to prevent hydration mismatch
    expect(result.current.t.appTitle).toBe('오픈소스 기여 추천');
  });

  it('includes all contribution type translations', () => {
    mockUseSettings.mockReturnValue({
      settings: { language: 'ko' },
      isHydrated: true,
    });

    const { result } = renderHook(() => useTranslation());

    expect(result.current.t.contributionTypes['good-first-issue']).toBe('첫 기여하기');
    expect(result.current.t.contributionTypes['documentation']).toBe('문서 작성');
    expect(result.current.t.contributionTypes['translation']).toBe('번역');
    expect(result.current.t.contributionTypes['bug-fix']).toBe('버그 수정');
    expect(result.current.t.contributionTypes['testing']).toBe('테스트');
    expect(result.current.t.contributionTypes['design']).toBe('디자인');
    expect(result.current.t.contributionTypes['feature-request']).toBe('기능 요청');
    expect(result.current.t.contributionTypes['code-review']).toBe('코드 리뷰');
  });

  it('includes all settings modal translations', () => {
    mockUseSettings.mockReturnValue({
      settings: { language: 'ko' },
      isHydrated: true,
    });

    const { result } = renderHook(() => useTranslation());

    const settingsModal = result.current.t.settingsModal;
    
    expect(settingsModal.title).toBe('설정');
    expect(settingsModal.githubToken).toBe('GitHub 토큰');
    expect(settingsModal.theme).toBe('테마');
    expect(settingsModal.light).toBe('라이트');
    expect(settingsModal.dark).toBe('다크');
    expect(settingsModal.language).toBe('언어 설정');
    expect(settingsModal.save).toBe('저장');
    expect(settingsModal.cancel).toBeUndefined(); // Not in Korean translations
    expect(settingsModal.resetSettings).toBe('설정 초기화');
  });

  it('handles unsupported language gracefully', () => {
    mockUseSettings.mockReturnValue({
      settings: { language: 'fr' as any }, // Unsupported language
      isHydrated: true,
    });

    const { result } = renderHook(() => useTranslation());

    // Should fall back to Korean
    expect(result.current.t.appTitle).toBe('오픈소스 기여 추천');
  });

  it('includes common UI text translations', () => {
    mockUseSettings.mockReturnValue({
      settings: { language: 'en' },
      isHydrated: true,
    });

    const { result } = renderHook(() => useTranslation());

    expect(result.current.t.loading).toBe('Loading...');
    expect(result.current.t.error).toBe('Error');
    expect(result.current.t.close).toBe('Close');
    expect(result.current.t.confirm).toBe('Confirm');
    expect(result.current.t.cancel).toBe('Cancel');
  });

  it('includes search-related translations', () => {
    mockUseSettings.mockReturnValue({
      settings: { language: 'ko' },
      isHydrated: true,
    });

    const { result } = renderHook(() => useTranslation());

    expect(result.current.t.selectLanguages).toBe('프로그래밍 언어 선택');
    expect(result.current.t.selectContributionTypes).toBe('기여 유형 선택');
    expect(result.current.t.searchResults).toBe('검색 결과');
    expect(result.current.t.repositoriesFound).toBe('개의 저장소를 찾았습니다');
    expect(result.current.t.loadMore).toBe('더 많은 저장소 보기');
    expect(result.current.t.noResults).toBe('검색 결과가 없습니다');
    expect(result.current.t.newSearch).toBe('새로운 검색');
  });

  it('includes repository-related translations', () => {
    mockUseSettings.mockReturnValue({
      settings: { language: 'en' },
      isHydrated: true,
    });

    const { result } = renderHook(() => useTranslation());

    expect(result.current.t.stars).toBe('Stars');
    expect(result.current.t.forks).toBe('Forks');
    expect(result.current.t.issues).toBe('Issues');
    expect(result.current.t.lastUpdated).toBe('Last Updated');
    expect(result.current.t.createdAt).toBe('Created');
    expect(result.current.t.language).toBe('Language');
    expect(result.current.t.license).toBe('License');
  });

  it('includes quick start translations', () => {
    mockUseSettings.mockReturnValue({
      settings: { language: 'zh' },
      isHydrated: true,
    });

    const { result } = renderHook(() => useTranslation());

    expect(result.current.t.quickStart).toBe('快速开始');
    expect(result.current.t.quickStartDescription).toBe('选择您感兴趣的领域快速开始');
    expect(result.current.t.frontendDevelopment).toBe('前端开发');
    expect(result.current.t.backendDevelopment).toBe('后端开发');
    expect(result.current.t.mobileApp).toBe('移动应用');
    expect(result.current.t.dataScience).toBe('数据科学');
    expect(result.current.t.devOps).toBe('DevOps');
    expect(result.current.t.gameEngine).toBe('游戏引擎');
  });

  it('memoizes translations correctly', () => {
    mockUseSettings.mockReturnValue({
      settings: { language: 'ko' },
      isHydrated: true,
    });

    const { result, rerender } = renderHook(() => useTranslation());
    const firstTranslations = result.current.t;

    // Rerender without changing language
    rerender();
    const secondTranslations = result.current.t;

    // Should be the same object due to memoization
    expect(firstTranslations).toBe(secondTranslations);
  });

  it('updates translations when language changes', () => {
    mockUseSettings.mockReturnValue({
      settings: { language: 'ko' },
      isHydrated: true,
    });

    const { result, rerender } = renderHook(() => useTranslation());
    expect(result.current.t.appTitle).toBe('오픈소스 기여 추천');

    // Change language
    mockUseSettings.mockReturnValue({
      settings: { language: 'en' },
      isHydrated: true,
    });

    rerender();
    expect(result.current.t.appTitle).toBe('Open Source Contribution Finder');
  });

  it('updates translations when hydration status changes', () => {
    // Start with not hydrated
    mockUseSettings.mockReturnValue({
      settings: { language: 'en' },
      isHydrated: false,
    });

    const { result, rerender } = renderHook(() => useTranslation());
    expect(result.current.t.appTitle).toBe('오픈소스 기여 추천'); // Korean fallback

    // Hydration complete
    mockUseSettings.mockReturnValue({
      settings: { language: 'en' },
      isHydrated: true,
    });

    rerender();
    expect(result.current.t.appTitle).toBe('Open Source Contribution Finder'); // English
  });
});