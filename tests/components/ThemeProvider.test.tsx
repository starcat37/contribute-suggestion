import { render } from '@testing-library/react';
import { ThemeProvider } from '@/components/ThemeProvider';

// Mock useSettings hook
jest.mock('@/hooks/useSettings', () => ({
  useSettings: jest.fn(() => ({
    settings: {
      theme: 'light',
      language: 'ko',
    },
    isHydrated: true,
  })),
}));

describe('ThemeProvider', () => {
  const mockAddEventListener = jest.fn();
  const mockRemoveEventListener = jest.fn();
  const mockDispatchEvent = jest.fn();
  const mockClassList = {
    remove: jest.fn(),
    add: jest.fn(),
  };

  beforeEach(() => {
    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    // Mock document.documentElement
    Object.defineProperty(document, 'documentElement', {
      value: {
        classList: mockClassList,
        lang: '',
      },
      writable: true,
    });

    // Mock window events
    Object.defineProperty(window, 'addEventListener', {
      value: mockAddEventListener,
      writable: true,
    });
    
    Object.defineProperty(window, 'removeEventListener', {
      value: mockRemoveEventListener,
      writable: true,
    });
    
    Object.defineProperty(window, 'dispatchEvent', {
      value: mockDispatchEvent,
      writable: true,
    });

    jest.clearAllMocks();
  });

  it('renders children correctly', () => {
    const TestChild = () => <div>Test Child</div>;
    const { getByText } = render(
      <ThemeProvider>
        <TestChild />
      </ThemeProvider>
    );

    expect(getByText('Test Child')).toBeInTheDocument();
  });

  it('applies initial theme from localStorage on mount', () => {
    const mockGetItem = jest.fn(() => JSON.stringify({
      theme: 'dark',
      language: 'en'
    }));
    window.localStorage.getItem = mockGetItem;

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );

    expect(mockGetItem).toHaveBeenCalledWith('app-settings');
    expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark');
    expect(mockClassList.add).toHaveBeenCalledWith('dark');
    expect(document.documentElement.lang).toBe('en');
  });

  it('applies default settings when localStorage is empty', () => {
    const mockGetItem = jest.fn(() => null);
    window.localStorage.getItem = mockGetItem;

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );

    expect(mockClassList.add).toHaveBeenCalledWith('light');
    expect(document.documentElement.lang).toBe('ko');
  });

  it('handles localStorage parsing errors gracefully', () => {
    const mockGetItem = jest.fn(() => 'invalid json');
    window.localStorage.getItem = mockGetItem;
    
    // Spy on console.warn to verify error handling
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );

    expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to load saved settings:', expect.any(Error));
    expect(mockClassList.add).toHaveBeenCalledWith('light');
    expect(document.documentElement.lang).toBe('ko');

    consoleWarnSpy.mockRestore();
  });

  it('updates theme and language when settings change', () => {
    const mockUseSettings = require('@/hooks/useSettings').useSettings;
    
    // Initial render with light theme
    mockUseSettings.mockReturnValue({
      settings: { theme: 'light', language: 'ko' },
      isHydrated: true,
    });

    const { rerender } = render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );

    // Change to dark theme
    mockUseSettings.mockReturnValue({
      settings: { theme: 'dark', language: 'en' },
      isHydrated: true,
    });

    rerender(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );

    expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark');
    expect(mockClassList.add).toHaveBeenCalledWith('dark');
    expect(document.documentElement.lang).toBe('en');
    expect(mockDispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'theme-changed',
        detail: { theme: 'dark', language: 'en' }
      })
    );
  });

  it('does not apply changes before hydration', () => {
    const mockUseSettings = require('@/hooks/useSettings').useSettings;
    
    mockUseSettings.mockReturnValue({
      settings: { theme: 'dark', language: 'en' },
      isHydrated: false, // Not hydrated yet
    });

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );

    // Should not apply theme changes before hydration
    expect(mockDispatchEvent).not.toHaveBeenCalled();
  });

  it('handles server-side rendering correctly', () => {
    // Mock window as undefined (SSR environment)
    const originalWindow = global.window;
    delete (global as any).window;

    expect(() => {
      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      );
    }).not.toThrow();

    // Restore window
    global.window = originalWindow;
  });

  it('dispatches custom theme-changed event with correct details', () => {
    const mockUseSettings = require('@/hooks/useSettings').useSettings;
    
    mockUseSettings.mockReturnValue({
      settings: { theme: 'dark', language: 'ja' },
      isHydrated: true,
    });

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );

    expect(mockDispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'theme-changed',
        detail: { theme: 'dark', language: 'ja' }
      })
    );
  });
});