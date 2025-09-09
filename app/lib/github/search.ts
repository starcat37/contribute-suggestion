import { GitHubClient } from './client';
import { Repository, SearchFilters, RepositoryScore } from '@/types';
import { CONTRIBUTION_TYPES } from '@/types';
import { getReadmeAnalyzer } from '../ai/readme-analyzer';
import { ReadmeAnalysis } from '@/types';

export class RepositorySearchService {
  private client: GitHubClient;
  private currentSearchLanguages: string[] = [];

  constructor(client: GitHubClient) {
    this.client = client;
  }

  async searchRepositories(filters: SearchFilters, userSettings?: { searchMode: 'include' | 'exclude', includedLanguages: string[], excludedLanguages: string[] }) {
    const { languages, contributionTypes, page = 1, limit = 30 } = filters;
    
    // Store current search languages for scoring
    this.currentSearchLanguages = languages;

    // Build GitHub search query
    const searchQuery = this.buildSearchQuery(languages, contributionTypes);
    
    try {
      // Search multiple pages to get more diverse results
      const maxPages = Math.min(Math.ceil(limit / 30), 3); // Search up to 3 pages
      const searchPromises = [];
      
      for (let currentPage = page; currentPage < page + maxPages; currentPage++) {
        searchPromises.push(
          this.client.searchRepositories(searchQuery, {
            sort: currentPage === 1 ? 'stars' : 'updated', // Mix sorting strategies
            order: 'desc',
            per_page: 30,
            page: currentPage
          })
        );
      }

      // Wait for all searches to complete
      const searchResults = await Promise.all(searchPromises);
      
      // Combine all results
      const allItems = searchResults.flatMap(result => result.items);
      const totalCount = searchResults[0]?.total_count || 0;
      
      // Remove duplicates by repository ID
      const uniqueItems = Array.from(
        new Map(allItems.map(repo => [repo.id, repo])).values()
      );

      // Enhance repositories with additional data (but limit concurrent requests)
      const enhancedRepositories = await this.enhanceRepositoriesBatch(
        uniqueItems.slice(0, Math.min(uniqueItems.length, limit)), 
        contributionTypes,
        userSettings
      );

      // Filter and sort by relevance score (very lenient)
      const scoredRepositories = enhancedRepositories
        .filter(repo => repo.score && repo.score > 0.05) // Even more lenient
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, limit); // Final limit

      return {
        repositories: scoredRepositories,
        totalCount: totalCount,
        page: page
      };
    } catch (error) {
      console.error('Search failed:', error);
      throw new Error('GitHub API search failed');
    }
  }

  private buildSearchQuery(languages: string[], contributionTypes: string[]): string {
    const queryParts: string[] = [];

    // Language filter - use first language only for GitHub API, filter others in post-processing
    // GitHub API has issues with complex OR queries, so keep it simple
    if (languages.length > 0) {
      queryParts.push(`language:${languages[0].toLowerCase()}`);
    }

    // Very minimal basic filters - only the essentials
    queryParts.push('is:public');
    queryParts.push('archived:false');
    
    // Much more lenient activity filter (2 years instead of 1)
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    queryParts.push(`pushed:>=${twoYearsAgo.toISOString().split('T')[0]}`);

    // DRASTICALLY SIMPLIFY: Don't add contribution type filters at GitHub level
    // Instead, let our AI-based scoring handle everything
    // This allows ALL repositories to be considered, then we score them afterward
    
    return queryParts.join(' ');
  }

  private filterRepositoriesByLanguageSettings(
    repositories: Repository[], 
    userSettings?: { searchMode: 'include' | 'exclude', includedLanguages: string[], excludedLanguages: string[] }
  ): Repository[] {
    if (!userSettings) return repositories;

    const { searchMode, includedLanguages, excludedLanguages } = userSettings;
    
    return repositories.filter(repo => {
      // Get all languages for this repository
      const repoLanguages = new Set<string>();
      
      // Add primary language
      if (repo.language) {
        repoLanguages.add(repo.language.toLowerCase());
      }
      
      // Add all languages from languages object
      if (repo.languages) {
        Object.keys(repo.languages).forEach(lang => {
          repoLanguages.add(lang.toLowerCase());
        });
      }

      if (searchMode === 'include') {
        // Include mode: repository must have at least one included language
        if (includedLanguages.length === 0) return true; // No filter
        return includedLanguages.some(lang => repoLanguages.has(lang.toLowerCase()));
      } else {
        // Exclude mode: repository must not have any excluded language
        if (excludedLanguages.length === 0) return true; // No filter
        return !excludedLanguages.some(lang => repoLanguages.has(lang.toLowerCase()));
      }
    });
  }

  private async enhanceRepositoriesBatch(repos: any[], contributionTypes: string[], userSettings?: { searchMode: 'include' | 'exclude', includedLanguages: string[], excludedLanguages: string[] }): Promise<Repository[]> {
    // Process repositories in smaller batches to avoid rate limiting
    const batchSize = 5;
    const batches = [];
    
    for (let i = 0; i < repos.length; i += batchSize) {
      batches.push(repos.slice(i, i + batchSize));
    }
    
    const results = [];
    
    for (const batch of batches) {
      // Process batch with some delay between batches
      const batchPromises = batch.map(repo => this.enhanceRepository(repo, contributionTypes));
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Extract successful results
      const successfulResults = batchResults
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<Repository>).value);
      
      results.push(...successfulResults);
      
      // Small delay between batches to be nice to GitHub API
      if (batches.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return this.filterRepositoriesByLanguageSettings(results, userSettings);
  }

  private async enhanceRepository(repo: any, contributionTypes: string[]): Promise<Repository> {
    const [owner, name] = repo.full_name.split('/');
    
    try {
      // Get additional repository data in parallel
      const [languages, hasContributing, goodFirstIssues, readmeContent] = await Promise.all([
        this.client.getRepositoryLanguages(owner, name),
        this.client.checkContributingGuide(owner, name),
        this.client.getGoodFirstIssues(owner, name),
        this.client.getReadmeContent(owner, name)
      ]);

      // Analyze README for contribution friendliness
      let readmeAnalysis: ReadmeAnalysis | null = null;
      if (readmeContent) {
        const analyzer = getReadmeAnalyzer();
        readmeAnalysis = await analyzer.analyzeWithAI(readmeContent);
      }

      // Calculate relevance score with README analysis
      const score = this.calculateScore(
        repo, 
        languages, 
        contributionTypes, 
        hasContributing, 
        goodFirstIssues, 
        readmeAnalysis,
        this.currentSearchLanguages
      );

      return {
        ...repo,
        languages,
        has_contributing_guide: hasContributing,
        good_first_issues_count: goodFirstIssues.length,
        readme_analysis: readmeAnalysis,
        score
      };
    } catch (error) {
      console.error(`Failed to enhance repository ${repo.full_name}:`, error);
      
      // Return basic repo info with decent fallback score
      const fallbackScore = this.calculateBasicScore(repo, contributionTypes);
      
      return {
        ...repo,
        languages: {},
        has_contributing_guide: false,
        good_first_issues_count: 0,
        readme_analysis: null,
        score: fallbackScore
      };
    }
  }

  private calculateBasicScore(repo: any, contributionTypes: string[]): number {
    // Fallback scoring based on basic repository info only
    let score = 0.3; // Start with decent baseline
    
    // Recent activity boost
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceUpdate <= 30) score += 0.2;
    else if (daysSinceUpdate <= 90) score += 0.1;
    
    // Star-based boost (but not too dominant)
    if (repo.stargazers_count > 0) {
      score += Math.min(Math.log10(repo.stargazers_count) / 10, 0.2);
    }
    
    // Description quality
    if (repo.description && repo.description.length > 20) {
      score += 0.1;
    }
    
    // Has issues (indicates active development)
    if (repo.open_issues_count > 0) {
      score += 0.1;
    }
    
    // Has topics (indicates well-maintained)
    if (repo.topics && repo.topics.length > 0) {
      score += 0.1;
    }
    
    return Math.min(score, 1);
  }

  private calculateScore(
    repo: any,
    languages: { [key: string]: number },
    contributionTypes: string[],
    hasContributing: boolean,
    goodFirstIssues: any[],
    readmeAnalysis: ReadmeAnalysis | null = null,
    selectedLanguages?: string[]
  ): number {
    const scores: RepositoryScore = {
      languageMatch: 0,
      contributionTypeMatch: 0,
      activity: 0,
      beginnerFriendly: 0,
      total: 0
    };

    // Determine project maturity level
    const projectMaturity = this.calculateProjectMaturity(repo);

    // Language matching score (0-1)
    scores.languageMatch = this.calculateLanguageMatchScore(repo, selectedLanguages || [], languages);

    // Contribution type matching score (0-1)
    scores.contributionTypeMatch = this.calculateContributionTypeScore(repo, contributionTypes, goodFirstIssues);

    // Activity score based on recent updates and stars (0-1) - weighted by maturity
    scores.activity = this.calculateActivityScore(repo, projectMaturity);

    // Beginner friendly score (0-1) - weighted by maturity
    scores.beginnerFriendly = this.calculateBeginnerFriendlyScore(repo, hasContributing, goodFirstIssues, readmeAnalysis, projectMaturity);

    // Maturity-based weighted scoring
    const weights = this.getMaturityBasedWeights(projectMaturity);
    let totalScore = (
      scores.languageMatch * weights.language +
      scores.contributionTypeMatch * weights.contributionType +
      scores.activity * weights.activity +
      scores.beginnerFriendly * weights.beginnerFriendly
    );

    // README analysis boost - larger for early-stage projects
    if (readmeAnalysis?.isContributionFriendly) {
      const readmeBoostMultiplier = projectMaturity === 'early-stage' ? 0.15 : 0.1;
      const readmeBoost = readmeAnalysis.contributionScore * readmeBoostMultiplier;
      totalScore += readmeBoost;
    }

    scores.total = totalScore;

    return Math.min(Math.max(scores.total, 0), 1);
  }

  private calculateLanguageMatchScore(repo: any, selectedLanguages: string[], repoLanguages: { [key: string]: number }): number {
    if (selectedLanguages.length === 0) return 0.8; // Default score if no languages specified
    
    const primaryLanguage = repo.language?.toLowerCase();
    const repoLanguageNames = Object.keys(repoLanguages).map(lang => lang.toLowerCase());
    const selectedLanguagesLower = selectedLanguages.map(lang => lang.toLowerCase());
    
    let score = 0;
    
    // Check primary language match
    if (primaryLanguage && selectedLanguagesLower.includes(primaryLanguage)) {
      score += 0.8; // High score for primary language match
    }
    
    // Check secondary languages
    const secondaryMatches = repoLanguageNames.filter(lang => 
      selectedLanguagesLower.includes(lang) && lang !== primaryLanguage
    );
    
    if (secondaryMatches.length > 0) {
      score += 0.4; // Bonus for secondary language matches
    }
    
    // If no exact match, check for related languages
    if (score === 0) {
      const relatedMatches = this.checkRelatedLanguages(selectedLanguagesLower, primaryLanguage, repoLanguageNames);
      if (relatedMatches > 0) {
        score += 0.3; // Lower score for related languages
      }
    }
    
    return Math.min(score, 1);
  }
  
  private checkRelatedLanguages(selectedLanguages: string[], primaryLanguage?: string, repoLanguages: string[] = []): number {
    const relatedLanguageGroups = [
      ['javascript', 'typescript', 'node.js'],
      ['python', 'python3'],
      ['java', 'kotlin', 'scala'],
      ['c', 'c++', 'cpp'],
      ['c#', 'csharp', 'f#'],
      ['ruby', 'rails'],
      ['php', 'laravel'],
      ['swift', 'objective-c'],
      ['rust', 'go', 'zig'],
    ];
    
    let matches = 0;
    
    for (const group of relatedLanguageGroups) {
      const hasSelectedFromGroup = selectedLanguages.some(lang => group.includes(lang));
      const hasRepoFromGroup = (primaryLanguage && group.includes(primaryLanguage)) ||
                               repoLanguages.some(lang => group.includes(lang));
      
      if (hasSelectedFromGroup && hasRepoFromGroup) {
        matches++;
      }
    }
    
    return matches;
  }

  private calculateContributionTypeScore(repo: any, contributionTypes: string[], goodFirstIssues: any[]): number {
    let score = 0;
    const maxScore = contributionTypes.length;

    contributionTypes.forEach(type => {
      const contributionType = CONTRIBUTION_TYPES.find(ct => ct.id === type);
      if (!contributionType) return;

      // Check if repository matches this contribution type
      const keywords = contributionType.keywords;
      const repoText = `${repo.description || ''} ${repo.topics?.join(' ') || ''}`.toLowerCase();
      
      const matchesKeywords = keywords.some(keyword => repoText.includes(keyword.toLowerCase()));
      
      if (matchesKeywords) {
        score += 1;
      }

      // Special handling for good-first-issue
      if (type === 'good-first-issue' && goodFirstIssues.length > 0) {
        score += 1;
      }
    });

    return maxScore > 0 ? score / maxScore : 0;
  }

  private calculateProjectMaturity(repo: any): 'early-stage' | 'growing' | 'mature' {
    const stars = repo.stargazers_count || 0;
    const forks = repo.forks_count || 0;
    const ageInDays = Math.floor((new Date().getTime() - new Date(repo.created_at).getTime()) / (1000 * 60 * 60 * 24));
    
    // Early stage: New projects with potential
    if (stars < 50 && ageInDays < 365) {
      return 'early-stage';
    }
    
    // Growing: Projects gaining traction
    if (stars < 500 || ageInDays < 730) {
      return 'growing';
    }
    
    // Mature: Established projects
    return 'mature';
  }

  private getMaturityBasedWeights(maturity: 'early-stage' | 'growing' | 'mature') {
    switch (maturity) {
      case 'early-stage':
        return {
          language: 0.2,
          contributionType: 0.2,
          activity: 0.35,      // Recent activity is crucial
          beginnerFriendly: 0.25 // README quality matters more
        };
      case 'growing':
        return {
          language: 0.25,
          contributionType: 0.3,
          activity: 0.25,
          beginnerFriendly: 0.2
        };
      case 'mature':
        return {
          language: 0.3,
          contributionType: 0.3,
          activity: 0.15,      // Less dependent on recent activity  
          beginnerFriendly: 0.25 // Established contribution systems
        };
    }
  }

  private calculateActivityScore(repo: any, maturity?: 'early-stage' | 'growing' | 'mature'): number {
    const now = new Date();
    const updatedAt = new Date(repo.updated_at);
    const daysSinceUpdate = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
    
    // Base activity score from recency
    let activityScore = 0;
    if (daysSinceUpdate <= 7) activityScore = 1.0;
    else if (daysSinceUpdate <= 30) activityScore = 0.8;
    else if (daysSinceUpdate <= 90) activityScore = 0.6;
    else if (daysSinceUpdate <= 365) activityScore = 0.4;
    else activityScore = 0.2;

    // Maturity-based adjustments
    if (maturity === 'early-stage') {
      // For early-stage projects, recent activity is extremely important
      // Penalize heavily if no recent activity
      if (daysSinceUpdate > 30) {
        activityScore *= 0.5;
      }
      
      // Small boost for consistent development (even if not popular yet)
      const commitFrequencyBoost = Math.min(repo.forks_count / 5, 0.2);
      activityScore += commitFrequencyBoost;
    } else {
      // Boost score based on stars (popularity indicator) for mature projects
      const starsBoost = Math.min(repo.stargazers_count / 1000, 0.3);
      activityScore += starsBoost;
    }
    
    return Math.min(Math.max(activityScore, 0), 1);
  }

  private calculateBeginnerFriendlyScore(
    repo: any, 
    hasContributing: boolean, 
    goodFirstIssues: any[],
    readmeAnalysis: ReadmeAnalysis | null = null,
    maturity?: 'early-stage' | 'growing' | 'mature'
  ): number {
    let score = 0;

    // Has contributing guide
    if (hasContributing) score += 0.4;

    // Has good first issues
    if (goodFirstIssues.length > 0) score += 0.4;

    // Has comprehensive documentation (topics include docs/documentation)
    const topics = repo.topics || [];
    if (topics.some((topic: string) => ['documentation', 'docs', 'tutorial', 'guide'].includes(topic.toLowerCase()))) {
      score += 0.1;
    }

    // README analysis bonus (adjusted by project maturity)
    if (readmeAnalysis) {
      // For early-stage projects, README quality is more critical
      const readmeWeight = maturity === 'early-stage' ? 1.5 : 1.0;
      
      // Direct contribution friendliness from README
      if (readmeAnalysis.isContributionFriendly) {
        score += 0.3 * readmeWeight;
      }
      
      // Specific README sections that help beginners
      if (readmeAnalysis.hasContributingSection) score += 0.1 * readmeWeight;
      if (readmeAnalysis.hasIssuesSection) score += 0.1 * readmeWeight;
      
      // Match contribution types mentioned in README
      const readmeTypes = readmeAnalysis.contributionTypes;
      if (readmeTypes.includes('good-first-issue')) score += 0.1;
    }

    // Maturity-specific adjustments
    if (maturity === 'early-stage') {
      // Early-stage projects with welcoming language get a boost
      if (readmeAnalysis?.reasons.some(reason => 
        reason.includes('welcoming') || reason.includes('contribution workflow')
      )) {
        score += 0.2;
      }
      
      // Smaller projects might be more approachable
      if (repo.stargazers_count < 20 && repo.forks_count < 10) {
        score += 0.1;
      }
    } else if (maturity === 'mature') {
      // Mature projects need established systems
      if (!hasContributing && !goodFirstIssues.length) {
        score *= 0.8; // Slight penalty
      }
    }

    return Math.min(score, 1);
  }
}

export function createSearchService(githubToken?: string): RepositorySearchService {
  const client = new GitHubClient(githubToken);
  return new RepositorySearchService(client);
}