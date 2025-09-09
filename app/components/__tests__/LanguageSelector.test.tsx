import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LanguageSelector from '../LanguageSelector'

describe('LanguageSelector', () => {
  const mockOnLanguageChange = jest.fn()
  const defaultProps = {
    selectedLanguages: [],
    onLanguageChange: mockOnLanguageChange,
  }

  beforeEach(() => {
    mockOnLanguageChange.mockClear()
  })

  test('renders language selector with title', () => {
    render(<LanguageSelector {...defaultProps} />)
    expect(screen.getByText('프로그래밍 언어 선택')).toBeInTheDocument()
  })

  test('displays selection count', () => {
    render(<LanguageSelector {...defaultProps} />)
    expect(screen.getByText('0/5개 선택됨')).toBeInTheDocument()
  })

  test('shows selected languages', () => {
    const props = {
      ...defaultProps,
      selectedLanguages: ['JavaScript', 'Python']
    }
    render(<LanguageSelector {...props} />)
    
    expect(screen.getByDisplayValue('JavaScript')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Python')).toBeInTheDocument()
    expect(screen.getByText('2/5개 선택됨')).toBeInTheDocument()
  })

  test('calls onLanguageChange when popular language chip is clicked', async () => {
    const user = userEvent.setup()
    render(<LanguageSelector {...defaultProps} />)
    
    const javascriptChip = screen.getByText('JavaScript')
    await user.click(javascriptChip)
    
    expect(mockOnLanguageChange).toHaveBeenCalledWith(['JavaScript'])
  })

  test('removes language when remove button is clicked', async () => {
    const user = userEvent.setup()
    const props = {
      ...defaultProps,
      selectedLanguages: ['JavaScript', 'Python']
    }
    render(<LanguageSelector {...props} />)
    
    const removeButtons = screen.getAllByRole('button', { name: /Remove/ })
    await user.click(removeButtons[0])
    
    expect(mockOnLanguageChange).toHaveBeenCalledWith(['Python'])
  })

  test('shows search input placeholder', () => {
    render(<LanguageSelector {...defaultProps} />)
    expect(screen.getByPlaceholderText('언어 검색 또는 아래에서 선택...')).toBeInTheDocument()
  })

  test('filters languages based on search input', async () => {
    const user = userEvent.setup()
    render(<LanguageSelector {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('언어 검색 또는 아래에서 선택...')
    await user.type(searchInput, 'Java')
    await user.click(searchInput) // Focus to show dropdown
    
    await waitFor(() => {
      expect(screen.getByText('Java')).toBeInTheDocument()
      expect(screen.getByText('JavaScript')).toBeInTheDocument()
    })
  })

  test('adds language from search dropdown', async () => {
    const user = userEvent.setup()
    render(<LanguageSelector {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('언어 검색 또는 아래에서 선택...')
    await user.type(searchInput, 'Python')
    await user.click(searchInput)
    
    await waitFor(() => {
      const pythonOption = screen.getByText('Python')
      user.click(pythonOption)
    })
    
    await waitFor(() => {
      expect(mockOnLanguageChange).toHaveBeenCalledWith(['Python'])
    })
  })

  test('shows max selection warning when limit reached', () => {
    const props = {
      ...defaultProps,
      selectedLanguages: ['JavaScript', 'Python', 'Java', 'Go', 'Rust'],
      maxSelections: 5
    }
    render(<LanguageSelector {...props} />)
    
    expect(screen.getByText(/최대 5개의 언어까지 선택할 수 있습니다/)).toBeInTheDocument()
  })

  test('disables language chips when max selection reached', () => {
    const props = {
      ...defaultProps,
      selectedLanguages: ['JavaScript', 'Python', 'Java', 'Go', 'Rust'],
      maxSelections: 5
    }
    render(<LanguageSelector {...props} />)
    
    const typescriptChip = screen.getByText('TypeScript')
    expect(typescriptChip.closest('button')).toBeDisabled()
  })

  test('disables search input when max selection reached', () => {
    const props = {
      ...defaultProps,
      selectedLanguages: ['JavaScript', 'Python', 'Java', 'Go', 'Rust'],
      maxSelections: 5
    }
    render(<LanguageSelector {...props} />)
    
    const searchInput = screen.getByPlaceholderText('언어 검색 또는 아래에서 선택...')
    expect(searchInput).toBeDisabled()
  })

  test('handles enter key in search input', async () => {
    const user = userEvent.setup()
    render(<LanguageSelector {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('언어 검색 또는 아래에서 선택...')
    await user.type(searchInput, 'Python')
    await user.keyboard('{Enter}')
    
    expect(mockOnLanguageChange).toHaveBeenCalledWith(['Python'])
  })

  test('clears search input after selection', async () => {
    const user = userEvent.setup()
    render(<LanguageSelector {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('언어 검색 또는 아래에서 선택...')
    await user.type(searchInput, 'Python')
    await user.keyboard('{Enter}')
    
    expect(searchInput).toHaveValue('')
  })

  test('shows language color indicators', () => {
    const props = {
      ...defaultProps,
      selectedLanguages: ['JavaScript']
    }
    render(<LanguageSelector {...props} />)
    
    // Check if color indicators are present (divs with background colors)
    const colorIndicators = document.querySelectorAll('[style*="background-color"]')
    expect(colorIndicators.length).toBeGreaterThan(0)
  })

  test('respects custom maxSelections prop', () => {
    const props = {
      ...defaultProps,
      maxSelections: 3
    }
    render(<LanguageSelector {...props} />)
    
    expect(screen.getByText('0/3개 선택됨')).toBeInTheDocument()
  })
})