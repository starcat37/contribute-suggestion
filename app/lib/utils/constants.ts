export const GITHUB_API_BASE_URL = 'https://api.github.com'

export const SEARCH_DEFAULTS = {
  MIN_STARS: 10,
  MAX_RESULTS_PER_PAGE: 30,
  DEFAULT_PAGE_SIZE: 10,
  CACHE_TTL: 15 * 60 * 1000, // 15 minutes
}

export const SCORE_WEIGHTS = {
  LANGUAGE_MATCH: 0.3,
  CONTRIBUTION_TYPE_MATCH: 0.3,
  ACTIVITY: 0.2,
  BEGINNER_FRIENDLY: 0.2,
}

export const GITHUB_SEARCH_QUALIFIERS = {
  MIN_STARS: 'stars:>10',
  HAS_ISSUES: 'has:issues',
  GOOD_FIRST_ISSUES: 'good-first-issues:>0',
  UPDATED_RECENTLY: `pushed:>${new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`, // Last year
  OPEN_SOURCE_LICENSES: 'license:mit OR license:apache-2.0 OR license:bsd-3-clause OR license:gpl'
}

export const BEGINNER_FRIENDLY_INDICATORS = [
  'good-first-issue',
  'beginner',
  'easy',
  'starter',
  'first-timers-only',
  'up-for-grabs',
  'help-wanted'
]

export const ACTIVITY_INDICATORS = {
  RECENT_COMMIT_DAYS: 30,
  MIN_RECENT_COMMITS: 5,
  HEALTHY_ISSUE_RESPONSE_HOURS: 72
}