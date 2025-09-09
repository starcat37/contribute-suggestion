import { Octokit } from '@octokit/rest';

export class GitHubClient {
  private octokit: Octokit;
  private rateLimitRemaining: number = 5000;
  private rateLimitReset: number = 0;

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token || process.env.GITHUB_TOKEN,
      throttle: {
        onRateLimit: (retryAfter: number, options: any) => {
          console.warn(`GitHub API rate limit hit. Retrying after ${retryAfter} seconds.`);
          return true; // Retry once
        },
        onSecondaryRateLimit: (retryAfter: number, options: any) => {
          console.warn(`GitHub API secondary rate limit hit. Retrying after ${retryAfter} seconds.`);
          return false; // Don't retry for secondary rate limit
        },
      },
    });
  }

  async searchRepositories(query: string, options: {
    sort?: 'stars' | 'forks' | 'help-wanted-issues' | 'updated';
    order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  } = {}) {
    try {
      const response = await this.octokit.rest.search.repos({
        q: query,
        sort: options.sort || 'stars',
        order: options.order || 'desc',
        per_page: options.per_page || 30,
        page: options.page || 1,
      });

      this.updateRateLimit(response);
      return response.data;
    } catch (error) {
      console.error('Error searching repositories:', error);
      throw error;
    }
  }

  async getRepositoryLanguages(owner: string, repo: string) {
    try {
      const response = await this.octokit.rest.repos.listLanguages({
        owner,
        repo,
      });

      this.updateRateLimit(response);
      return response.data;
    } catch (error) {
      console.error(`Error getting languages for ${owner}/${repo}:`, error);
      return {};
    }
  }

  async getRepositoryContents(owner: string, repo: string, path: string) {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });

      this.updateRateLimit(response);
      return response.data;
    } catch (error) {
      // File doesn't exist
      return null;
    }
  }

  async checkContributingGuide(owner: string, repo: string): Promise<boolean> {
    const possiblePaths = [
      'CONTRIBUTING.md',
      'CONTRIBUTING',
      '.github/CONTRIBUTING.md',
      'docs/CONTRIBUTING.md',
      'docs/contributing.md',
      'contributing.md'
    ];

    for (const path of possiblePaths) {
      const content = await this.getRepositoryContents(owner, repo, path);
      if (content) {
        return true;
      }
    }

    return false;
  }

  async getReadmeContent(owner: string, repo: string): Promise<string | null> {
    const possiblePaths = [
      'README.md',
      'README',
      'readme.md',
      'readme',
      'Readme.md'
    ];

    for (const path of possiblePaths) {
      try {
        const content = await this.getRepositoryContents(owner, repo, path);
        if (content && !Array.isArray(content) && 'content' in content) {
          // Decode base64 content
          return Buffer.from(content.content, 'base64').toString('utf-8');
        }
      } catch (error) {
        // Continue to next path
        continue;
      }
    }

    return null;
  }

  async getRepositoryIssues(owner: string, repo: string, options: {
    state?: 'open' | 'closed' | 'all';
    labels?: string;
    sort?: 'created' | 'updated' | 'comments';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  } = {}) {
    try {
      const response = await this.octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: options.state || 'open',
        labels: options.labels,
        sort: options.sort || 'created',
        direction: options.direction || 'desc',
        per_page: options.per_page || 30,
        page: options.page || 1,
      });

      this.updateRateLimit(response);
      return response.data;
    } catch (error) {
      console.error(`Error getting issues for ${owner}/${repo}:`, error);
      return [];
    }
  }

  async getGoodFirstIssues(owner: string, repo: string) {
    return this.getRepositoryIssues(owner, repo, {
      state: 'open',
      labels: 'good first issue,good-first-issue,beginner-friendly,easy',
      per_page: 10
    });
  }

  async getRepositoryDetails(owner: string, repo: string) {
    try {
      const response = await this.octokit.rest.repos.get({
        owner,
        repo,
      });

      this.updateRateLimit(response);
      return response.data;
    } catch (error) {
      console.error(`Error getting repository details for ${owner}/${repo}:`, error);
      throw error;
    }
  }

  getRateLimitStatus() {
    return {
      remaining: this.rateLimitRemaining,
      reset: new Date(this.rateLimitReset * 1000),
    };
  }

  private updateRateLimit(response: any) {
    if (response.headers) {
      const remaining = response.headers['x-ratelimit-remaining'];
      const reset = response.headers['x-ratelimit-reset'];
      
      if (remaining !== undefined) {
        this.rateLimitRemaining = parseInt(remaining, 10);
      }
      if (reset !== undefined) {
        this.rateLimitReset = parseInt(reset, 10);
      }
    }
  }

  // Helper method to create search queries
  static buildSearchQuery(filters: {
    languages?: string[];
    minStars?: number;
    maxStars?: number;
    hasIssues?: boolean;
    license?: string[];
    topics?: string[];
    good_first_issues?: boolean;
  }): string {
    const queryParts: string[] = [];

    // Language filters
    if (filters.languages && filters.languages.length > 0) {
      const languageQuery = filters.languages.map(lang => `language:${lang.toLowerCase()}`).join(' OR ');
      queryParts.push(`(${languageQuery})`);
    }

    // Star count filters
    if (filters.minStars !== undefined) {
      queryParts.push(`stars:>=${filters.minStars}`);
    }
    if (filters.maxStars !== undefined) {
      queryParts.push(`stars:<=${filters.maxStars}`);
    }

    // Issues filter
    if (filters.hasIssues) {
      queryParts.push('has:issues');
    }

    // License filters
    if (filters.license && filters.license.length > 0) {
      const licenseQuery = filters.license.map(license => `license:${license.toLowerCase()}`).join(' OR ');
      queryParts.push(`(${licenseQuery})`);
    }

    // Topics filters
    if (filters.topics && filters.topics.length > 0) {
      filters.topics.forEach(topic => {
        queryParts.push(`topic:${topic}`);
      });
    }

    // Good first issues
    if (filters.good_first_issues) {
      queryParts.push('good-first-issues:>0');
    }

    // Default filters for better results
    queryParts.push('is:public');
    queryParts.push('archived:false');

    return queryParts.join(' ');
  }
}

// Singleton instance
let gitHubClientInstance: GitHubClient | null = null;

export function getGitHubClient(token?: string): GitHubClient {
  if (!gitHubClientInstance || token) {
    gitHubClientInstance = new GitHubClient(token);
  }
  return gitHubClientInstance;
}