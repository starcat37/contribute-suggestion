import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LanguageSelector from '@/components/LanguageSelector';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe('LanguageSelector', () => {
  const mockOnLanguageChange = jest.fn();
  const defaultProps = {
    selectedLanguages: [],
    onLanguageChange: mockOnLanguageChange,
  };

  beforeEach(() => {
    mockOnLanguageChange.mockClear();
  });

  it('renders with default props', () => {
    render(<LanguageSelector {...defaultProps} />);
    
    expect(screen.getByText('프로그래밍 언어 선택')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('언어를 검색하세요...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(
      <LanguageSelector 
        {...defaultProps} 
        placeholder="검색할 언어를 선택하세요" 
      />
    );
    
    expect(screen.getByPlaceholderText('검색할 언어를 선택하세요')).toBeInTheDocument();
  });

  it('displays popular language chips', () => {
    render(<LanguageSelector {...defaultProps} />);
    
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Java')).toBeInTheDocument();
    expect(screen.getByText('Go')).toBeInTheDocument();
    expect(screen.getByText('Rust')).toBeInTheDocument();
  });

  it('handles language selection', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector {...defaultProps} />);
    
    const jsChip = screen.getByText('JavaScript');
    await user.click(jsChip);
    
    expect(mockOnLanguageChange).toHaveBeenCalledWith(['JavaScript']);
  });

  it('handles language deselection', async () => {
    const user = userEvent.setup();
    render(
      <LanguageSelector 
        {...defaultProps} 
        selectedLanguages={['JavaScript']} 
      />
    );
    
    const jsChip = screen.getByText('JavaScript');
    await user.click(jsChip);
    
    expect(mockOnLanguageChange).toHaveBeenCalledWith([]);
  });

  it('respects maxSelections limit', async () => {
    const user = userEvent.setup();
    render(
      <LanguageSelector 
        {...defaultProps} 
        selectedLanguages={['JavaScript', 'Python']}
        maxSelections={2}
      />
    );
    
    const tsChip = screen.getByText('TypeScript');
    await user.click(tsChip);
    
    // Should not call onLanguageChange when max is reached
    expect(mockOnLanguageChange).not.toHaveBeenCalled();
  });

  it('shows selection count', () => {
    render(
      <LanguageSelector 
        {...defaultProps} 
        selectedLanguages={['JavaScript', 'Python']}
        maxSelections={5}
      />
    );
    
    expect(screen.getByText('2/5개 선택됨')).toBeInTheDocument();
  });

  it('supports search functionality', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('언어를 검색하세요...');
    await user.type(searchInput, 'script');
    
    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector {...defaultProps} />);
    
    const jsChip = screen.getByText('JavaScript');
    jsChip.focus();
    
    await user.keyboard('{Enter}');
    expect(mockOnLanguageChange).toHaveBeenCalledWith(['JavaScript']);
  });

  it('displays selected languages with correct styling', () => {
    render(
      <LanguageSelector 
        {...defaultProps} 
        selectedLanguages={['JavaScript']} 
      />
    );
    
    const jsChip = screen.getByText('JavaScript');
    expect(jsChip).toHaveClass('border-blue-500', 'bg-blue-50');
  });

  it('filters languages based on search term', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('언어를 검색하세요...');
    await user.type(searchInput, 'Python');
    
    await waitFor(() => {
      expect(screen.getByText('Python')).toBeInTheDocument();
      expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
    });
  });

  it('shows "no results" message when search has no matches', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('언어를 검색하세요...');
    await user.type(searchInput, 'nonexistent');
    
    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
    });
  });

  it('clears search when escape is pressed', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('언어를 검색하세요...');
    await user.type(searchInput, 'Python');
    await user.keyboard('{Escape}');
    
    expect(searchInput).toHaveValue('');
  });

  it('supports all 24 programming languages', () => {
    render(<LanguageSelector {...defaultProps} />);
    
    const expectedLanguages = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
      'PHP', 'Ruby', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl',
      'Haskell', 'Erlang', 'Clojure', 'F#', 'Dart', 'Elixir', 'Lua', 'Shell'
    ];
    
    expectedLanguages.forEach(lang => {
      expect(screen.getByText(lang)).toBeInTheDocument();
    });
  });
});