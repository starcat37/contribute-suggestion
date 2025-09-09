import { renderHook, act, waitFor } from '@testing-library/react';
import { useSettings } from '@/hooks/useSettings';

// Mock useLocalStorage
jest.mock('@/hooks/useRepositorySearch', () => ({
  useLocalStorage: jest.fn(() => [
    { theme: 'light', language: 'ko' }, // initial value
    jest.fn(), // setter
    jest.fn(), // remover
  ]),
}));

// Mock fetch for GitHub API validation
global.fetch = jest.fn();

describe('useSettings', () => {
  const mockSetSettings = jest.fn();
  const mockRemoveSettings = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(require('@/hooks/useRepositorySearch').useLocalStorage).mockReturnValue([
      { theme: 'light', language: 'ko' },
      mockSetSettings,
      mockRemoveSettings,
    ]);
  });

  it('returns default settings', () => {
    const { result } = renderHook(() => useSettings());

    expect(result.current.settings).toEqual({
      theme: 'light',
      language: 'ko',
    });
    expect(result.current.isHydrated).toBe(false); // Initially false
  });

  it('becomes hydrated after mount', async () => {
    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.isHydrated).toBe(true);
    });
  });

  it('validates GitHub token successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    const { result } = renderHook(() => useSettings());

    let validationResult;
    await act(async () => {
      validationResult = await result.current.validateToken('valid_token');
    });

    expect(validationResult).toBe(true);
    expect(result.current.isTokenValid).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith('https://api.github.com/user', {
      headers: {
        'Authorization': 'Bearer valid_token',
        'Accept': 'application/vnd.github.v3+json',
      },
    });
  });

  it('handles invalid GitHub token', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    const { result } = renderHook(() => useSettings());

    let validationResult;
    await act(async () => {
      validationResult = await result.current.validateToken('invalid_token');
    });

    expect(validationResult).toBe(false);
    expect(result.current.isTokenValid).toBe(false);
  });

  it('handles network error during token validation', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useSettings());

    let validationResult;
    await act(async () => {
      validationResult = await result.current.validateToken('token');
    });

    expect(validationResult).toBe(false);
    expect(result.current.isTokenValid).toBe(false);
  });

  it('sets GitHub token after validation', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await result.current.setGithubToken('valid_token');
    });

    expect(mockSetSettings).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  it('does not set invalid GitHub token', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await result.current.setGithubToken('invalid_token');
    });

    // Should not update settings for invalid token
    expect(mockSetSettings).not.toHaveBeenCalled();
  });

  it('removes GitHub token', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.removeGithubToken();
    });

    expect(mockSetSettings).toHaveBeenCalledWith(expect.any(Function));
  });

  it('updates theme and applies to DOM', () => {
    // Mock document.documentElement
    Object.defineProperty(document, 'documentElement', {
      value: {
        classList: {
          remove: jest.fn(),
          add: jest.fn(),
        },
      },
      writable: true,
    });

    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(mockSetSettings).toHaveBeenCalled();
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('light', 'dark');
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
  });

  it('updates language setting', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.setLanguage('en');
    });

    expect(mockSetSettings).toHaveBeenCalledWith(expect.any(Function));
  });

  it('resets all settings', () => {
    // Mock document.documentElement for theme reset
    Object.defineProperty(document, 'documentElement', {
      value: {
        classList: {
          remove: jest.fn(),
          add: jest.fn(),
        },
      },
      writable: true,
    });

    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.resetSettings();
    });

    expect(mockRemoveSettings).toHaveBeenCalled();
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('light');
  });

  it('validates token on settings change', async () => {
    const mockValidateToken = jest.fn().mockResolvedValue(true);
    
    // Mock the hook to have a GitHub token
    jest.mocked(require('@/hooks/useRepositorySearch').useLocalStorage).mockReturnValue([
      { theme: 'light', language: 'ko', githubToken: 'test_token' },
      mockSetSettings,
      mockRemoveSettings,
    ]);

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.isTokenValid).toBe(true);
    });
  });

  it('sets validating state during token validation', async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100))
    );

    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.validateToken('test_token');
    });

    expect(result.current.isValidating).toBe(true);

    await waitFor(() => {
      expect(result.current.isValidating).toBe(false);
    });
  });

  it('returns empty token validation for empty string', async () => {
    const { result } = renderHook(() => useSettings());

    let validationResult;
    await act(async () => {
      validationResult = await result.current.validateToken('');
    });

    expect(validationResult).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns empty token validation for whitespace', async () => {
    const { result } = renderHook(() => useSettings());

    let validationResult;
    await act(async () => {
      validationResult = await result.current.validateToken('   ');
    });

    expect(validationResult).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('applies theme to DOM on settings change', async () => {
    // Mock document.documentElement
    Object.defineProperty(document, 'documentElement', {
      value: {
        classList: {
          remove: jest.fn(),
          add: jest.fn(),
        },
      },
      writable: true,
    });

    // Mock settings with dark theme
    jest.mocked(require('@/hooks/useRepositorySearch').useLocalStorage).mockReturnValue([
      { theme: 'dark', language: 'ko' },
      mockSetSettings,
      mockRemoveSettings,
    ]);

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.isHydrated).toBe(true);
    });

    // Should apply dark theme after hydration
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('light', 'dark');
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
  });

  it('prevents DOM manipulation during SSR', () => {
    // Mock window as undefined (SSR environment)
    const originalWindow = global.window;
    delete (global as any).window;

    Object.defineProperty(document, 'documentElement', {
      value: {
        classList: {
          remove: jest.fn(),
          add: jest.fn(),
        },
      },
      writable: true,
    });

    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.setTheme('dark');
    });

    // Should not manipulate DOM during SSR
    expect(document.documentElement.classList.remove).not.toHaveBeenCalled();

    // Restore window
    global.window = originalWindow;
  });
});