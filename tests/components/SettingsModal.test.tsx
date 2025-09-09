import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsModal from '@/components/SettingsModal';

// Mock hooks
jest.mock('@/hooks/useSettings', () => ({
  useSettings: () => ({
    settings: {
      githubToken: undefined,
      theme: 'light',
      language: 'ko',
    },
    setGithubToken: jest.fn(),
    removeGithubToken: jest.fn(),
    setTheme: jest.fn(),
    setLanguage: jest.fn(),
    resetSettings: jest.fn(),
    isTokenValid: null,
    isValidating: false,
  }),
}));

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: {
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
        resetSettings: '설정 초기화',
        resetConfirm: '모든 설정을 초기화하시겠습니까?',
      },
    },
  }),
}));

describe('SettingsModal', () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders modal when isOpen is true', () => {
    render(<SettingsModal {...defaultProps} />);
    
    expect(screen.getByText('설정')).toBeInTheDocument();
    expect(screen.getByText('GitHub 토큰')).toBeInTheDocument();
    expect(screen.getByText('테마')).toBeInTheDocument();
    expect(screen.getByText('언어 설정')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<SettingsModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('설정')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<SettingsModal {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders GitHub token section', () => {
    render(<SettingsModal {...defaultProps} />);
    
    expect(screen.getByText('GitHub Personal Access Token을 설정하면')).toBeInTheDocument();
    expect(screen.getByText('토큰 생성하기')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ghp_xxxxxxxxxxxxxxxxxxxx')).toBeInTheDocument();
  });

  it('handles GitHub token input', async () => {
    const user = userEvent.setup();
    render(<SettingsModal {...defaultProps} />);
    
    const tokenInput = screen.getByPlaceholderText('ghp_xxxxxxxxxxxxxxxxxxxx');
    await user.type(tokenInput, 'ghp_test_token');
    
    expect(tokenInput).toHaveValue('ghp_test_token');
  });

  it('toggles token visibility', async () => {
    const user = userEvent.setup();
    render(<SettingsModal {...defaultProps} />);
    
    const tokenInput = screen.getByPlaceholderText('ghp_xxxxxxxxxxxxxxxxxxxx');
    const toggleButton = screen.getByRole('button', { name: /eye/i });
    
    // Initially password type
    expect(tokenInput).toHaveAttribute('type', 'password');
    
    // Click to show
    await user.click(toggleButton);
    expect(tokenInput).toHaveAttribute('type', 'text');
    
    // Click to hide
    await user.click(toggleButton);
    expect(tokenInput).toHaveAttribute('type', 'password');
  });

  it('renders theme selection buttons', () => {
    render(<SettingsModal {...defaultProps} />);
    
    expect(screen.getByText('라이트')).toBeInTheDocument();
    expect(screen.getByText('다크')).toBeInTheDocument();
  });

  it('handles theme selection', async () => {
    const mockSetTheme = jest.fn();
    jest.mocked(require('@/hooks/useSettings').useSettings).mockReturnValue({
      settings: { theme: 'light', language: 'ko' },
      setTheme: mockSetTheme,
      setLanguage: jest.fn(),
      resetSettings: jest.fn(),
      isTokenValid: null,
      isValidating: false,
    });

    const user = userEvent.setup();
    render(<SettingsModal {...defaultProps} />);
    
    const darkButton = screen.getByText('다크');
    await user.click(darkButton);
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('renders language selection', () => {
    render(<SettingsModal {...defaultProps} />);
    
    expect(screen.getByText('🇰🇷')).toBeInTheDocument(); // Korean flag
    expect(screen.getByText('🇺🇸')).toBeInTheDocument(); // US flag  
    expect(screen.getByText('🇨🇳')).toBeInTheDocument(); // Chinese flag
    expect(screen.getByText('한국어')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('中文')).toBeInTheDocument();
  });

  it('handles language selection', async () => {
    const mockSetLanguage = jest.fn();
    jest.mocked(require('@/hooks/useSettings').useSettings).mockReturnValue({
      settings: { theme: 'light', language: 'ko' },
      setTheme: jest.fn(),
      setLanguage: mockSetLanguage,
      resetSettings: jest.fn(),
      isTokenValid: null,
      isValidating: false,
    });

    const user = userEvent.setup();
    render(<SettingsModal {...defaultProps} />);
    
    const englishButton = screen.getByText('English');
    await user.click(englishButton);
    
    expect(mockSetLanguage).toHaveBeenCalledWith('en');
  });

  it('shows token validation status', () => {
    jest.mocked(require('@/hooks/useSettings').useSettings).mockReturnValue({
      settings: { githubToken: 'test_token' },
      isTokenValid: true,
      isValidating: false,
      setTheme: jest.fn(),
      setLanguage: jest.fn(),
      resetSettings: jest.fn(),
    });

    render(<SettingsModal {...defaultProps} />);
    
    expect(screen.getByText('유효한 토큰')).toBeInTheDocument();
  });

  it('shows invalid token status', () => {
    jest.mocked(require('@/hooks/useSettings').useSettings).mockReturnValue({
      settings: { githubToken: 'invalid_token' },
      isTokenValid: false,
      isValidating: false,
      setTheme: jest.fn(),
      setLanguage: jest.fn(),
      resetSettings: jest.fn(),
    });

    render(<SettingsModal {...defaultProps} />);
    
    expect(screen.getByText('유효하지 않은 토큰')).toBeInTheDocument();
  });

  it('shows validating state', () => {
    jest.mocked(require('@/hooks/useSettings').useSettings).mockReturnValue({
      settings: {},
      isTokenValid: null,
      isValidating: true,
      setTheme: jest.fn(),
      setLanguage: jest.fn(),
      resetSettings: jest.fn(),
    });

    render(<SettingsModal {...defaultProps} />);
    
    expect(screen.getByText('검증 중...')).toBeInTheDocument();
  });

  it('shows remove button when token exists', () => {
    jest.mocked(require('@/hooks/useSettings').useSettings).mockReturnValue({
      settings: { githubToken: 'existing_token' },
      removeGithubToken: jest.fn(),
      isTokenValid: null,
      isValidating: false,
      setTheme: jest.fn(),
      setLanguage: jest.fn(),
      resetSettings: jest.fn(),
    });

    render(<SettingsModal {...defaultProps} />);
    
    expect(screen.getByText('제거')).toBeInTheDocument();
  });

  it('handles settings reset with confirmation', async () => {
    const mockResetSettings = jest.fn();
    jest.mocked(require('@/hooks/useSettings').useSettings).mockReturnValue({
      settings: {},
      resetSettings: mockResetSettings,
      isTokenValid: null,
      isValidating: false,
      setTheme: jest.fn(),
      setLanguage: jest.fn(),
    });

    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    const user = userEvent.setup();
    render(<SettingsModal {...defaultProps} />);
    
    const resetButton = screen.getByText('설정 초기화');
    await user.click(resetButton);
    
    expect(window.confirm).toHaveBeenCalledWith('모든 설정을 초기화하시겠습니까?');
    expect(mockResetSettings).toHaveBeenCalled();
  });

  it('cancels reset when confirmation is declined', async () => {
    const mockResetSettings = jest.fn();
    jest.mocked(require('@/hooks/useSettings').useSettings).mockReturnValue({
      settings: {},
      resetSettings: mockResetSettings,
      isTokenValid: null,
      isValidating: false,
      setTheme: jest.fn(),
      setLanguage: jest.fn(),
    });

    // Mock window.confirm to return false
    window.confirm = jest.fn(() => false);

    const user = userEvent.setup();
    render(<SettingsModal {...defaultProps} />);
    
    const resetButton = screen.getByText('설정 초기화');
    await user.click(resetButton);
    
    expect(mockResetSettings).not.toHaveBeenCalled();
  });

  it('disables save button when token is empty', () => {
    render(<SettingsModal {...defaultProps} />);
    
    const saveButton = screen.getByText('저장');
    expect(saveButton).toBeDisabled();
  });

  it('handles modal close on backdrop click', async () => {
    const user = userEvent.setup();
    render(<SettingsModal {...defaultProps} />);
    
    const backdrop = screen.getByText('설정').closest('.fixed');
    if (backdrop) {
      await user.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('prevents close when clicking on modal content', async () => {
    const user = userEvent.setup();
    render(<SettingsModal {...defaultProps} />);
    
    const modalContent = screen.getByText('GitHub 토큰').closest('.bg-white');
    if (modalContent) {
      await user.click(modalContent);
      expect(mockOnClose).not.toHaveBeenCalled();
    }
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<SettingsModal {...defaultProps} />);
    
    // Tab should navigate through interactive elements
    await user.tab();
    expect(screen.getByPlaceholderText('ghp_xxxxxxxxxxxxxxxxxxxx')).toHaveFocus();
    
    await user.tab();
    expect(screen.getByText('저장')).toHaveFocus();
  });

  it('renders save settings button with proper styling', () => {
    render(<SettingsModal {...defaultProps} />);
    
    expect(screen.getByText('⚡ 설정 저장 및 적용')).toBeInTheDocument();
    expect(screen.getByText('설정을 저장하고 페이지를 새로고침하여 모든 변경사항을 적용합니다.')).toBeInTheDocument();
  });

  it('handles save and refresh functionality', async () => {
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });

    // Mock localStorage
    const mockSetItem = jest.fn();
    Object.defineProperty(window, 'localStorage', {
      value: { setItem: mockSetItem },
      writable: true,
    });

    jest.mocked(require('@/hooks/useSettings').useSettings).mockReturnValue({
      settings: { githubToken: 'test_token', theme: 'dark', language: 'en' },
      isTokenValid: null,
      isValidating: false,
      setTheme: jest.fn(),
      setLanguage: jest.fn(),
      resetSettings: jest.fn(),
    });

    const user = userEvent.setup();
    render(<SettingsModal {...defaultProps} />);
    
    const saveButton = screen.getByText('⚡ 설정 저장 및 적용');
    await user.click(saveButton);
    
    expect(mockSetItem).toHaveBeenCalledWith('app-settings', JSON.stringify({
      githubToken: 'test_token',
      theme: 'dark',
      language: 'en'
    }));
    expect(mockReload).toHaveBeenCalled();
  });

  it('renders 12 language options in dropdown', () => {
    render(<SettingsModal {...defaultProps} />);
    
    // Check for some of the 12 languages
    expect(screen.getByText('🇰🇷 한국어')).toBeInTheDocument();
    expect(screen.getByText('🇺🇸 English')).toBeInTheDocument();
    expect(screen.getByText('🇨🇳 中文')).toBeInTheDocument();
    expect(screen.getByText('🇯🇵 日本語')).toBeInTheDocument();
    expect(screen.getByText('🇪🇸 Español')).toBeInTheDocument();
    expect(screen.getByText('🇫🇷 Français')).toBeInTheDocument();
  });

  it('shows language support notice for unsupported languages', () => {
    jest.mocked(require('@/hooks/useSettings').useSettings).mockReturnValue({
      settings: { theme: 'light', language: 'es' }, // Spanish - not fully supported
      setTheme: jest.fn(),
      setLanguage: jest.fn(),
      resetSettings: jest.fn(),
      isTokenValid: null,
      isValidating: false,
    });

    render(<SettingsModal {...defaultProps} />);
    
    expect(screen.getByText('⚠️ This language is not fully supported yet.')).toBeInTheDocument();
    expect(screen.getByText('Currently supported: 한국어, English, 中文')).toBeInTheDocument();
  });

  it('applies DOM changes immediately for theme selection', async () => {
    // Mock document.documentElement
    const mockClassList = {
      remove: jest.fn(),
      add: jest.fn(),
    };
    Object.defineProperty(document, 'documentElement', {
      value: { classList: mockClassList },
      writable: true,
    });

    const user = userEvent.setup();
    render(<SettingsModal {...defaultProps} />);
    
    const darkButton = screen.getByText('다크');
    await user.click(darkButton);
    
    expect(mockClassList.remove).toHaveBeenCalledWith('light');
    expect(mockClassList.add).toHaveBeenCalledWith('dark');
  });

  it('applies DOM changes immediately for language selection', async () => {
    // Mock document.documentElement
    const mockDocumentElement = { lang: '' };
    Object.defineProperty(document, 'documentElement', {
      value: mockDocumentElement,
      writable: true,
    });

    // Mock custom event dispatch
    const mockDispatchEvent = jest.fn();
    Object.defineProperty(window, 'dispatchEvent', {
      value: mockDispatchEvent,
      writable: true,
    });

    const user = userEvent.setup();
    render(<SettingsModal {...defaultProps} />);
    
    const languageSelect = screen.getByDisplayValue('🇰🇷 한국어');
    await user.selectOptions(languageSelect, 'en');
    
    expect(mockDocumentElement.lang).toBe('en');
  });

  it('handles reset with token input clearing', async () => {
    const mockResetSettings = jest.fn();
    jest.mocked(require('@/hooks/useSettings').useSettings).mockReturnValue({
      settings: { githubToken: 'existing_token' },
      resetSettings: mockResetSettings,
      isTokenValid: null,
      isValidating: false,
      setTheme: jest.fn(),
      setLanguage: jest.fn(),
    });

    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    const user = userEvent.setup();
    render(<SettingsModal {...defaultProps} />);
    
    // First add some text to token input
    const tokenInput = screen.getByPlaceholderText('ghp_xxxxxxxxxxxxxxxxxxxx');
    await user.type(tokenInput, 'new_token');
    
    const resetButton = screen.getByText('🔄 설정 초기화');
    await user.click(resetButton);
    
    expect(mockResetSettings).toHaveBeenCalled();
    expect(tokenInput).toHaveValue(''); // Should be cleared
  });
});