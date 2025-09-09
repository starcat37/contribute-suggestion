import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContributionTypeSelector from '../ContributionTypeSelector'

describe('ContributionTypeSelector', () => {
  const mockOnTypeChange = jest.fn()
  const defaultProps = {
    selectedTypes: [],
    onTypeChange: mockOnTypeChange,
  }

  beforeEach(() => {
    mockOnTypeChange.mockClear()
  })

  test('renders contribution type selector with title', () => {
    render(<ContributionTypeSelector {...defaultProps} />)
    expect(screen.getByText('기여 유형 선택')).toBeInTheDocument()
  })

  test('displays selection count', () => {
    render(<ContributionTypeSelector {...defaultProps} />)
    expect(screen.getByText('0/4개 선택됨')).toBeInTheDocument()
  })

  test('renders all contribution type options', () => {
    render(<ContributionTypeSelector {...defaultProps} />)
    
    expect(screen.getByText('문서 개선')).toBeInTheDocument()
    expect(screen.getByText('번역')).toBeInTheDocument()
    expect(screen.getByText('버그 수정')).toBeInTheDocument()
    expect(screen.getByText('기능 구현')).toBeInTheDocument()
    expect(screen.getByText('테스트 작성')).toBeInTheDocument()
    expect(screen.getByText('코드 리팩토링')).toBeInTheDocument()
    expect(screen.getByText('초보자 이슈')).toBeInTheDocument()
  })

  test('shows descriptions for each contribution type', () => {
    render(<ContributionTypeSelector {...defaultProps} />)
    
    expect(screen.getByText('문서화, README 개선, 주석 추가')).toBeInTheDocument()
    expect(screen.getByText('다국어 지원, 문서 번역')).toBeInTheDocument()
    expect(screen.getByText('버그 리포트 및 수정')).toBeInTheDocument()
  })

  test('shows keywords for each contribution type', () => {
    render(<ContributionTypeSelector {...defaultProps} />)
    
    expect(screen.getByText('documentation')).toBeInTheDocument()
    expect(screen.getByText('i18n')).toBeInTheDocument()
    expect(screen.getByText('bug')).toBeInTheDocument()
  })

  test('calls onTypeChange when type is selected', async () => {
    const user = userEvent.setup()
    render(<ContributionTypeSelector {...defaultProps} />)
    
    const documentationType = screen.getByRole('button', { name: /문서 개선/ })
    await user.click(documentationType)
    
    expect(mockOnTypeChange).toHaveBeenCalledWith(['documentation'])
  })

  test('calls onTypeChange when type is deselected', async () => {
    const user = userEvent.setup()
    const props = {
      ...defaultProps,
      selectedTypes: ['documentation', 'translation']
    }
    render(<ContributionTypeSelector {...props} />)
    
    const documentationType = screen.getByRole('button', { name: /문서 개선/ })
    await user.click(documentationType)
    
    expect(mockOnTypeChange).toHaveBeenCalledWith(['translation'])
  })

  test('shows selected state styling', () => {
    const props = {
      ...defaultProps,
      selectedTypes: ['documentation']
    }
    render(<ContributionTypeSelector {...props} />)
    
    const documentationType = screen.getByRole('button', { name: /문서 개선/ })
    expect(documentationType).toHaveClass('border-blue-500', 'bg-blue-50')
  })

  test('shows checkboxes for selected types', () => {
    const props = {
      ...defaultProps,
      selectedTypes: ['documentation', 'translation']
    }
    render(<ContributionTypeSelector {...props} />)
    
    // Check that selected items have checkmarks
    const checkmarks = document.querySelectorAll('[data-testid="check-icon"], svg[class*="text-white"]')
    expect(checkmarks.length).toBeGreaterThan(0)
  })

  test('disables types when max selection reached', () => {
    const props = {
      ...defaultProps,
      selectedTypes: ['documentation', 'translation', 'bug-fix', 'feature'],
      maxSelections: 4
    }
    render(<ContributionTypeSelector {...props} />)
    
    const testingType = screen.getByRole('button', { name: /테스트 작성/ })
    expect(testingType).toBeDisabled()
  })

  test('shows max selection warning', () => {
    const props = {
      ...defaultProps,
      selectedTypes: ['documentation', 'translation', 'bug-fix', 'feature'],
      maxSelections: 4
    }
    render(<ContributionTypeSelector {...props} />)
    
    expect(screen.getByText(/최대 선택 수에 도달했습니다/)).toBeInTheDocument()
  })

  test('shows selection guide', () => {
    render(<ContributionTypeSelector {...defaultProps} />)
    
    expect(screen.getByText('💡 선택 가이드')).toBeInTheDocument()
    expect(screen.getByText(/초보자 이슈.*처음 오픈소스에 기여하시는 분께 추천/)).toBeInTheDocument()
  })

  test('shows icons for each contribution type', () => {
    render(<ContributionTypeSelector {...defaultProps} />)
    
    // Check that all contribution types have icons
    const typeButtons = screen.getAllByRole('button', { name: /문서 개선|번역|버그 수정|기능 구현|테스트 작성|코드 리팩토링|초보자 이슈/ })
    expect(typeButtons.length).toBe(7)
    
    // Check that icons are present (Lucide icons render as SVG)
    const icons = document.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(7) // At least one icon per type
  })

  test('respects custom maxSelections prop', () => {
    const props = {
      ...defaultProps,
      maxSelections: 3
    }
    render(<ContributionTypeSelector {...props} />)
    
    expect(screen.getByText('0/3개 선택됨')).toBeInTheDocument()
  })

  test('allows selection up to max limit', async () => {
    const user = userEvent.setup()
    render(<ContributionTypeSelector {...defaultProps} />)
    
    const types = ['문서 개선', '번역', '버그 수정', '기능 구현']
    
    for (const type of types) {
      const typeButton = screen.getByRole('button', { name: new RegExp(type) })
      await user.click(typeButton)
    }
    
    expect(mockOnTypeChange).toHaveBeenCalledTimes(4)
  })

  test('shows hover states for unselected types', () => {
    render(<ContributionTypeSelector {...defaultProps} />)
    
    const documentationType = screen.getByRole('button', { name: /문서 개선/ })
    expect(documentationType).toHaveClass('hover:border-gray-300', 'hover:shadow-sm')
  })

  test('shows keyword truncation when more than 3 keywords', () => {
    render(<ContributionTypeSelector {...defaultProps} />)
    
    // Find contribution types that have more than 3 keywords
    const plusIndicators = screen.getAllByText(/^\+\d+$/)
    expect(plusIndicators.length).toBeGreaterThan(0)
  })
})