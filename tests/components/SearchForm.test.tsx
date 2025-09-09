import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchForm from '@/components/SearchForm';

// Mock useSettings hook
jest.mock('@/hooks/useSettings', () => ({
  useSettings: () => ({
    settings: {
      theme: 'light',
      language: 'ko',
    },
    isHydrated: true,
  }),
}));

describe('SearchForm', () => {
  const mockOnSearch = jest.fn();
  const defaultProps = {
    onSearch: mockOnSearch,
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  it('renders with default elements', () => {
    render(<SearchForm {...defaultProps} />);
    
    expect(screen.getByText('맞춤형 오픈소스 프로젝트 찾기')).toBeInTheDocument();
    expect(screen.getByText('프로그래밍 언어 선택')).toBeInTheDocument();
    expect(screen.getByText('기여 유형 선택')).toBeInTheDocument();
    expect(screen.getByText('추천 저장소 찾기')).toBeInTheDocument();
  });

  it('displays quick start presets', () => {
    render(<SearchForm {...defaultProps} />);
    
    expect(screen.getByText('🚀 JavaScript 초보자')).toBeInTheDocument();
    expect(screen.getByText('🐍 Python 문서화')).toBeInTheDocument();
    expect(screen.getByText('🛠️ 전체 버그 헌터')).toBeInTheDocument();
  });

  it('shows advanced filter toggle', async () => {
    const user = userEvent.setup();
    render(<SearchForm {...defaultProps} />);
    
    const advancedToggle = screen.getByText('고급 필터 옵션');
    await user.click(advancedToggle);
    
    expect(screen.getByText('언어 필터 모드')).toBeInTheDocument();
    expect(screen.getByText('포함 모드')).toBeInTheDocument();
    expect(screen.getByText('제외 모드')).toBeInTheDocument();
  });

  it('handles search form submission', async () => {
    const user = userEvent.setup();
    render(<SearchForm {...defaultProps} />);
    
    // Select languages
    const jsChip = screen.getByText('JavaScript');
    await user.click(jsChip);
    
    // Select contribution types
    const docType = screen.getByText('문서 작성');
    await user.click(docType);
    
    // Submit form
    const searchButton = screen.getByText('추천 저장소 찾기');
    await user.click(searchButton);
    
    expect(mockOnSearch).toHaveBeenCalledWith(
      {
        languages: ['JavaScript'],
        contributionTypes: ['documentation'],
      },
      undefined
    );
  });

  it('handles search with advanced filters', async () => {
    const user = userEvent.setup();
    render(<SearchForm {...defaultProps} />);
    
    // Select basic criteria
    const jsChip = screen.getByText('JavaScript');
    await user.click(jsChip);
    
    const docType = screen.getByText('문서 작성');
    await user.click(docType);
    
    // Open advanced filters
    const advancedToggle = screen.getByText('고급 필터 옵션');
    await user.click(advancedToggle);
    
    // Switch to exclude mode
    const excludeMode = screen.getByText('제외 모드');
    await user.click(excludeMode);
    
    // Select language to exclude
    const pythonChip = screen.getByText('Python');
    await user.click(pythonChip);
    
    // Submit form
    const searchButton = screen.getByText('추천 저장소 찾기');
    await user.click(searchButton);
    
    expect(mockOnSearch).toHaveBeenCalledWith(
      {
        languages: ['JavaScript'],
        contributionTypes: ['documentation'],
      },
      {
        searchMode: 'exclude',
        includedLanguages: [],
        excludedLanguages: ['Python'],
      }
    );
  });

  it('prevents submission when required fields are empty', async () => {
    const user = userEvent.setup();
    render(<SearchForm {...defaultProps} />);
    
    const searchButton = screen.getByText('추천 저장소 찾기');
    expect(searchButton).toBeDisabled();
    
    await user.click(searchButton);
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('shows validation message when fields are incomplete', () => {
    render(<SearchForm {...defaultProps} />);
    
    expect(screen.getByText('언어와 기여 유형을 각각 하나 이상 선택해주세요')).toBeInTheDocument();
  });

  it('displays loading state correctly', () => {
    render(<SearchForm {...defaultProps} isLoading={true} />);
    
    expect(screen.getByText('검색 중...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /검색 중/ })).toBeDisabled();
  });

  it('displays error message when provided', () => {
    const errorMessage = 'GitHub API rate limit exceeded';
    render(<SearchForm {...defaultProps} error={errorMessage} />);
    
    expect(screen.getByText('검색 중 오류가 발생했습니다')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('handles quick start preset selection', async () => {
    const user = userEvent.setup();
    render(<SearchForm {...defaultProps} />);
    
    const jsPreset = screen.getByText('🚀 JavaScript 초보자');
    await user.click(jsPreset);
    
    // Check if languages and types are selected
    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toHaveClass('border-blue-500');
      expect(screen.getByText('TypeScript')).toHaveClass('border-blue-500');
    });
  });

  it('toggles advanced filter mode correctly', async () => {
    const user = userEvent.setup();
    render(<SearchForm {...defaultProps} />);
    
    const advancedToggle = screen.getByText('고급 필터 옵션');
    
    // Open advanced filters
    await user.click(advancedToggle);
    expect(screen.getByText('언어 필터 모드')).toBeInTheDocument();
    
    // Close advanced filters
    await user.click(advancedToggle);
    expect(screen.queryByText('언어 필터 모드')).not.toBeInTheDocument();
  });

  it('updates filter mode description when switching modes', async () => {
    const user = userEvent.setup();
    render(<SearchForm {...defaultProps} />);
    
    // Open advanced filters
    const advancedToggle = screen.getByText('고급 필터 옵션');
    await user.click(advancedToggle);
    
    // Check initial description (include mode)
    expect(screen.getByText('선택한 언어만 검색 결과에 포함됩니다.')).toBeInTheDocument();
    
    // Switch to exclude mode
    const excludeMode = screen.getByText('제외 모드');
    await user.click(excludeMode);
    
    // Check updated description
    expect(screen.getByText('선택한 언어는 검색 결과에서 제외됩니다.')).toBeInTheDocument();
  });

  it('supports dark mode styling', () => {
    // Mock dark mode settings
    jest.mockImplementationOnce(() => ({
      useSettings: () => ({
        settings: { theme: 'dark' },
        isHydrated: true,
      }),
    }));
    
    render(<SearchForm {...defaultProps} />);
    
    const formContainer = screen.getByText('맞춤형 오픈소스 프로젝트 찾기').closest('div');
    expect(formContainer).toHaveClass('bg-gray-800');
  });

  it('prevents form submission during loading', async () => {
    const user = userEvent.setup();
    render(<SearchForm {...defaultProps} isLoading={true} />);
    
    // Try to submit form while loading
    const form = screen.getByRole('button', { name: /검색 중/ }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('handles keyboard navigation in form', async () => {
    const user = userEvent.setup();
    render(<SearchForm {...defaultProps} />);
    
    // Tab through form elements
    await user.tab();
    expect(screen.getByText('JavaScript')).toHaveFocus();
    
    // Select with Enter key
    await user.keyboard('{Enter}');
    expect(screen.getByText('JavaScript')).toHaveClass('border-blue-500');
  });
});