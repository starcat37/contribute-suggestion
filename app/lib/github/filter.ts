import { Repository, SearchFilters, ContributionType } from '@/types';
import { CONTRIBUTION_TYPES } from '@/types';

export class RepositoryFilter {
  
  /**
   * Filter repositories based on various criteria
   */
  static filterRepositories(repositories: Repository[], filters: SearchFilters): Repository[] {
    return repositories.filter(repo => {
      // Language filtering
      if (!this.matchesLanguageFilter(repo, filters.languages)) {
        return false;
      }

      // Contribution type filtering
      if (!this.matchesContributionTypes(repo, filters.contributionTypes)) {
        return false;
      }

      // Additional quality checks
      if (!this.passesQualityChecks(repo)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Check if repository matches selected languages
   */
  private static matchesLanguageFilter(repo: Repository, selectedLanguages: string[]): boolean {
    if (selectedLanguages.length === 0) {
      return true; // No language filter applied
    }

    // Check primary language
    if (repo.language && selectedLanguages.includes(repo.language)) {
      return true;
    }

    // Check all languages used in the repository
    if (repo.languages) {
      const repoLanguages = Object.keys(repo.languages);
      return selectedLanguages.some(lang => 
        repoLanguages.some(repoLang => 
          repoLang.toLowerCase() === lang.toLowerCase()
        )
      );
    }

    return false;
  }

  /**
   * Check if repository matches contribution types
   */
  private static matchesContributionTypes(repo: Repository, selectedTypes: string[]): boolean {
    if (selectedTypes.length === 0) {
      return true; // No contribution type filter applied
    }

    return selectedTypes.some(typeId => {
      const contributionType = CONTRIBUTION_TYPES.find(ct => ct.id === typeId);
      if (!contributionType) return false;

      return this.repositorySupportsContributionType(repo, contributionType);
    });
  }

  /**
   * Check if repository supports a specific contribution type
   */
  private static repositorySupportsContributionType(repo: Repository, contributionType: ContributionType): boolean {
    const { keywords, id } = contributionType;
    
    // Create searchable text from repository
    const searchableText = this.createSearchableText(repo);

    // Special handling for specific contribution types
    switch (id) {
      case 'good-first-issue':
        return this.hasGoodFirstIssues(repo) || this.containsKeywords(searchableText, keywords);
      
      case 'documentation':
        return this.hasDocumentationOpportunities(repo) || this.containsKeywords(searchableText, keywords);
      
      case 'translation':
        return this.hasTranslationOpportunities(repo) || this.containsKeywords(searchableText, keywords);
      
      case 'bug-fix':
        return this.hasBugFixOpportunities(repo) || this.containsKeywords(searchableText, keywords);
      
      case 'testing':
        return this.hasTestingOpportunities(repo) || this.containsKeywords(searchableText, keywords);
      
      default:
        return this.containsKeywords(searchableText, keywords);
    }
  }

  /**
   * Create searchable text from repository data
   */
  private static createSearchableText(repo: Repository): string {
    const parts = [
      repo.description || '',
      repo.topics?.join(' ') || '',
      repo.name,
      repo.full_name
    ];
    
    return parts.join(' ').toLowerCase();
  }

  /**
   * Check if text contains any of the keywords
   */
  private static containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword.toLowerCase()));
  }

  /**
   * Check if repository has good first issues
   */
  private static hasGoodFirstIssues(repo: Repository): boolean {
    return (repo.good_first_issues_count && repo.good_first_issues_count > 0) ||
           this.hasGoodFirstIssueLabels(repo);
  }

  /**
   * Check for good first issue related content
   */
  private static hasGoodFirstIssueLabels(repo: Repository): boolean {
    const searchableText = this.createSearchableText(repo);
    const goodFirstIssueKeywords = [
      'good first issue', 'good-first-issue', 'beginner', 'newcomer', 
      'easy', 'starter', 'first-timers-only'
    ];
    
    return this.containsKeywords(searchableText, goodFirstIssueKeywords);
  }

  /**
   * Check if repository has documentation opportunities
   */
  private static hasDocumentationOpportunities(repo: Repository): boolean {
    const topics = repo.topics || [];
    const docTopics = ['documentation', 'docs', 'wiki', 'readme', 'guide', 'tutorial'];
    
    return topics.some(topic => docTopics.includes(topic.toLowerCase()));
  }

  /**
   * Check if repository has translation opportunities
   */
  private static hasTranslationOpportunities(repo: Repository): boolean {
    const topics = repo.topics || [];
    const translationTopics = ['i18n', 'internationalization', 'localization', 'translation', 'locale'];
    
    return topics.some(topic => translationTopics.includes(topic.toLowerCase()));
  }

  /**
   * Check if repository has bug fix opportunities
   */
  private static hasBugFixOpportunities(repo: Repository): boolean {
    // Repositories with open issues are more likely to have bugs to fix
    return repo.has_issues && repo.open_issues_count > 0;
  }

  /**
   * Check if repository has testing opportunities
   */
  private static hasTestingOpportunities(repo: Repository): boolean {
    const searchableText = this.createSearchableText(repo);
    const testingKeywords = ['test', 'testing', 'coverage', 'ci', 'continuous integration'];
    
    return this.containsKeywords(searchableText, testingKeywords);
  }

  /**
   * Quality checks for repositories
   */
  private static passesQualityChecks(repo: Repository): boolean {
    // Skip archived repositories (if property exists)
    if ('archived' in repo && repo.archived) return false;
    
    // Skip disabled repositories (if property exists)
    if ('disabled' in repo && repo.disabled) return false;
    
    // Prefer repositories with some activity
    if (repo.stargazers_count === 0 && repo.forks_count === 0) return false;
    
    // Check for recent activity (within last 2 years)
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const lastUpdate = new Date(repo.updated_at);
    
    if (lastUpdate < twoYearsAgo) return false;
    
    return true;
  }

  /**
   * Sort repositories by relevance score
   */
  static sortByRelevance(repositories: Repository[]): Repository[] {
    return repositories.sort((a, b) => {
      const scoreA = a.score || 0;
      const scoreB = b.score || 0;
      
      if (scoreA !== scoreB) {
        return scoreB - scoreA; // Higher scores first
      }
      
      // If scores are equal, sort by stars
      return b.stargazers_count - a.stargazers_count;
    });
  }

  /**
   * Get unique languages from repositories
   */
  static extractLanguages(repositories: Repository[]): string[] {
    const languageSet = new Set<string>();
    
    repositories.forEach(repo => {
      if (repo.language) {
        languageSet.add(repo.language);
      }
      
      if (repo.languages) {
        Object.keys(repo.languages).forEach(lang => languageSet.add(lang));
      }
    });
    
    return Array.from(languageSet).sort();
  }

  /**
   * Get repository statistics
   */
  static getRepositoryStats(repositories: Repository[]) {
    const stats = {
      totalRepositories: repositories.length,
      averageStars: 0,
      averageForks: 0,
      languages: {} as { [key: string]: number },
      contributionTypes: {} as { [key: string]: number },
      hasContributingGuide: 0,
      hasGoodFirstIssues: 0,
    };

    if (repositories.length === 0) return stats;

    let totalStars = 0;
    let totalForks = 0;

    repositories.forEach(repo => {
      totalStars += repo.stargazers_count;
      totalForks += repo.forks_count;
      
      // Count languages
      if (repo.language) {
        stats.languages[repo.language] = (stats.languages[repo.language] || 0) + 1;
      }
      
      // Count additional features
      if (repo.has_contributing_guide) {
        stats.hasContributingGuide++;
      }
      
      if (repo.good_first_issues_count && repo.good_first_issues_count > 0) {
        stats.hasGoodFirstIssues++;
      }
    });

    stats.averageStars = Math.round(totalStars / repositories.length);
    stats.averageForks = Math.round(totalForks / repositories.length);

    return stats;
  }
}