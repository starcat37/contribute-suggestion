import { ReadmeAnalysis } from '@/types';

export class ReadmeAnalyzer {
  
  /**
   * Analyzes README content to determine if the project welcomes contributions
   */
  async analyzeReadmeForContributions(readmeContent: string): Promise<ReadmeAnalysis> {
    const analysis: ReadmeAnalysis = {
      isContributionFriendly: false,
      contributionScore: 0,
      reasons: [],
      contributionTypes: [],
      hasContributingSection: false,
      hasIssuesSection: false,
      hasLicense: false
    };

    if (!readmeContent || readmeContent.trim().length < 100) {
      analysis.reasons.push('README is too short or missing');
      return analysis;
    }

    const content = readmeContent.toLowerCase();
    
    // Check for contribution-related keywords and sections
    analysis.contributionScore = this.calculateContributionScore(content, analysis);
    analysis.isContributionFriendly = analysis.contributionScore > 0.3;

    return analysis;
  }

  /**
   * Uses AI API to analyze README content more intelligently
   * This is a placeholder for actual AI API integration
   */
  async analyzeWithAI(readmeContent: string): Promise<ReadmeAnalysis> {
    try {
      // For now, use rule-based analysis
      // TODO: Integrate with actual AI service (OpenAI, Claude, etc.)
      const ruleBasedAnalysis = await this.analyzeReadmeForContributions(readmeContent);
      
      // Enhanced analysis with AI-like intelligence
      const aiEnhancedAnalysis = this.enhanceWithAILogic(readmeContent, ruleBasedAnalysis);
      
      return aiEnhancedAnalysis;
    } catch (error) {
      console.error('AI analysis failed, falling back to rule-based:', error);
      return this.analyzeReadmeForContributions(readmeContent);
    }
  }

  private calculateContributionScore(content: string, analysis: ReadmeAnalysis): number {
    let score = 0;
    const maxScore = 10;

    // Direct contribution indicators (high weight)
    const contributionKeywords = [
      'contribute', 'contributing', 'contribution', 'contributors',
      'pull request', 'pr', 'issue', 'bug report',
      'help wanted', 'good first issue', 'beginner friendly',
      'open source', 'community', 'volunteer'
    ];

    const foundKeywords = contributionKeywords.filter(keyword => 
      content.includes(keyword)
    );
    
    if (foundKeywords.length > 0) {
      score += Math.min(foundKeywords.length * 0.5, 3);
      analysis.reasons.push(`Found ${foundKeywords.length} contribution-related keywords`);
    }

    // Section headers indicating contribution support
    const contributionSections = [
      'contributing', 'contribution', 'how to contribute',
      'getting involved', 'development', 'building',
      'setup', 'installation for developers'
    ];

    contributionSections.forEach(section => {
      if (content.includes(`## ${section}`) || content.includes(`# ${section}`)) {
        score += 1;
        analysis.hasContributingSection = true;
        analysis.reasons.push(`Has '${section}' section`);
      }
    });

    // Issue/bug reporting sections
    const issueSections = [
      'issues', 'bug report', 'reporting bugs', 'feedback',
      'support', 'help'
    ];

    issueSections.forEach(section => {
      if (content.includes(`## ${section}`) || content.includes(`# ${section}`)) {
        score += 0.5;
        analysis.hasIssuesSection = true;
        analysis.reasons.push(`Has '${section}' section`);
      }
    });

    // License mention (indicates serious project)
    if (content.includes('license') || content.includes('mit') || 
        content.includes('apache') || content.includes('gpl')) {
      score += 0.5;
      analysis.hasLicense = true;
      analysis.reasons.push('Has license information');
    }

    // Development setup instructions
    const devKeywords = [
      'npm install', 'yarn install', 'pip install',
      'docker', 'setup', 'development environment',
      'local development', 'build from source'
    ];

    const foundDevKeywords = devKeywords.filter(keyword => content.includes(keyword));
    if (foundDevKeywords.length > 0) {
      score += 1;
      analysis.reasons.push('Has development setup instructions');
    }

    // Code of conduct mention
    if (content.includes('code of conduct') || content.includes('conduct')) {
      score += 0.5;
      analysis.reasons.push('Has code of conduct');
    }

    // Badges indicating active project
    const badges = ['badge', 'shield', 'build status', 'coverage', 'version'];
    const foundBadges = badges.filter(badge => content.includes(badge));
    if (foundBadges.length > 0) {
      score += 0.5;
      analysis.reasons.push('Has project status badges');
    }

    // Detect contribution types based on content
    this.detectContributionTypes(content, analysis);

    return Math.min(score / maxScore, 1);
  }

  private detectContributionTypes(content: string, analysis: ReadmeAnalysis): void {
    const typePatterns = {
      'bug-fix': [
        // Direct mentions
        'bug', 'fix', 'issue', 'error', 'problem', 'debug',
        // Sections that suggest bug reporting
        'report bug', 'bug report', 'reporting issues', 'found a bug',
        'troubleshooting', 'known issues', 'issue tracker'
      ],
      'feature': [
        // Feature development
        'feature', 'enhancement', 'improvement', 'new feature',
        'feature request', 'roadmap', 'planned features',
        // Development-oriented language
        'implement', 'add support', 'extend', 'build'
      ],
      'documentation': [
        // Documentation types
        'docs', 'documentation', 'readme', 'wiki', 'guide', 'tutorial',
        'api documentation', 'user guide', 'developer guide',
        // Documentation needs
        'documentation needed', 'docs needed', 'help with docs',
        'improve documentation', 'doc improvements'
      ],
      'testing': [
        // Testing types
        'test', 'testing', 'spec', 'coverage', 'qa', 'quality assurance',
        'unit test', 'integration test', 'e2e test', 'automated testing',
        // Testing needs
        'need tests', 'test coverage', 'add tests', 'testing help wanted'
      ],
      'translation': [
        // Internationalization
        'translation', 'i18n', 'internationalization', 'locale', 'language',
        'translate', 'localization', 'multilingual',
        // Translation needs
        'help translate', 'translation needed', 'add language support'
      ],
      'refactoring': [
        // Code improvement
        'refactor', 'cleanup', 'optimization', 'performance', 'code quality',
        'modernize', 'improve code', 'code review', 'technical debt',
        'architecture', 'restructure'
      ],
      'good-first-issue': [
        // Beginner-friendly indicators
        'beginner', 'good first issue', 'easy', 'starter', 'newcomer',
        'first time', 'new contributor', 'help wanted', 'beginner friendly',
        'contribution welcome', 'easy pick', 'low hanging fruit'
      ]
    };

    // Score-based detection for more accurate matching
    Object.entries(typePatterns).forEach(([type, patterns]) => {
      let score = 0;
      let matchedPatterns: string[] = [];
      
      patterns.forEach(pattern => {
        const regex = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = content.match(regex);
        if (matches) {
          score += matches.length;
          matchedPatterns.push(pattern);
        }
      });
      
      // Include type if it has significant presence
      if (score >= 1 || (score > 0 && matchedPatterns.length > 1)) {
        analysis.contributionTypes.push(type);
      }
    });

    // Special detection for implicit contribution opportunities
    this.detectImplicitContributionNeeds(content, analysis);
  }

  private detectImplicitContributionNeeds(content: string, analysis: ReadmeAnalysis): void {
    // Look for signs that suggest contribution opportunities
    const needsPatterns = {
      'documentation': [
        'todo', 'work in progress', 'wip', 'coming soon',
        'not yet implemented', 'placeholder', 'stub'
      ],
      'feature': [
        'planned', 'roadmap', 'future', 'wishlist',
        'would like to', 'hoping to add', 'considering'
      ],
      'testing': [
        'untested', 'no tests yet', 'testing needed',
        'manual testing', 'needs verification'
      ],
      'bug-fix': [
        'known bug', 'limitation', 'workaround',
        'current issues', 'not working', 'broken'
      ]
    };

    Object.entries(needsPatterns).forEach(([type, patterns]) => {
      const hasNeed = patterns.some(pattern => content.toLowerCase().includes(pattern));
      if (hasNeed && !analysis.contributionTypes.includes(type)) {
        analysis.contributionTypes.push(type);
        analysis.reasons.push(`Detected potential need for ${type} contributions`);
      }
    });
  }

  private enhanceWithAILogic(readmeContent: string, baseAnalysis: ReadmeAnalysis): ReadmeAnalysis {
    // Enhanced logic that mimics AI analysis
    const enhanced = { ...baseAnalysis };
    
    // Analyze tone and language
    const content = readmeContent.toLowerCase();
    
    // Enhanced welcoming language detection
    const welcomingPhrases = [
      'welcome', 'invite', 'encourage', 'love to hear',
      'contributions are welcome', 'we welcome', 'feel free',
      'please contribute', 'join us', 'get involved',
      'help wanted', 'looking for contributors', 'seeking help'
    ];

    const foundWelcomingPhrases = welcomingPhrases.filter(phrase => 
      content.includes(phrase)
    );

    if (foundWelcomingPhrases.length > 0) {
      enhanced.contributionScore = Math.min(enhanced.contributionScore + 0.2, 1);
      enhanced.reasons.push('Uses welcoming language for contributors');
    }

    // Check for detailed contribution instructions
    if (content.includes('fork') && content.includes('pull request') && 
        content.includes('clone')) {
      enhanced.contributionScore = Math.min(enhanced.contributionScore + 0.15, 1);
      enhanced.reasons.push('Has detailed contribution workflow');
    }

    // Early-stage project indicators (positive signals)
    this.analyzeEarlyStageIndicators(content, enhanced);

    // Penalty for discouraging language
    const discouragingPhrases = [
      'no contributions', 'not accepting', 'closed to contributions',
      'maintainers only', 'internal use only', 'private project'
    ];

    const foundDiscouraging = discouragingPhrases.filter(phrase => 
      content.includes(phrase)
    );

    if (foundDiscouraging.length > 0) {
      enhanced.contributionScore = Math.max(enhanced.contributionScore - 0.3, 0);
      enhanced.reasons.push('Contains discouraging language');
      enhanced.isContributionFriendly = false;
    }

    // Re-evaluate contribution friendliness with enhanced score
    enhanced.isContributionFriendly = enhanced.contributionScore > 0.3;

    return enhanced;
  }

  private analyzeEarlyStageIndicators(content: string, analysis: ReadmeAnalysis): void {
    // Signs of an active, growing project
    const growthIndicators = [
      // Ambition and vision
      'vision', 'goal', 'mission', 'aims to', 'will become',
      'plan to', 'working towards', 'building',
      
      // Active development signals
      'in development', 'actively maintained', 'regular updates',
      'frequent commits', 'ongoing work',
      
      // Community building
      'community', 'team', 'contributors', 'collaborators',
      'growing project', 'early adopters',
      
      // Seeking help indicators
      'help needed', 'looking for', 'seeking', 'volunteers',
      'maintainers wanted', 'co-maintainers'
    ];

    const foundGrowthIndicators = growthIndicators.filter(indicator => 
      content.includes(indicator)
    );

    if (foundGrowthIndicators.length > 2) {
      analysis.contributionScore = Math.min(analysis.contributionScore + 0.15, 1);
      analysis.reasons.push('Shows signs of active, growing project seeking contributors');
    }

    // Innovation and uniqueness indicators
    const innovationIndicators = [
      'novel', 'new approach', 'innovative', 'unique', 'different',
      'alternative to', 'better than', 'solves', 'addresses',
      'experimental', 'cutting-edge', 'modern'
    ];

    const foundInnovationIndicators = innovationIndicators.filter(indicator => 
      content.includes(indicator)
    );

    if (foundInnovationIndicators.length > 1) {
      analysis.contributionScore = Math.min(analysis.contributionScore + 0.1, 1);
      analysis.reasons.push('Appears to be innovative or unique project');
    }

    // Passion project indicators
    const passionIndicators = [
      'passionate', 'love', 'excited', 'enthusiastic',
      'personal project', 'side project', 'hobby',
      'weekend project', 'created because'
    ];

    const foundPassionIndicators = passionIndicators.filter(indicator => 
      content.includes(indicator)
    );

    if (foundPassionIndicators.length > 0) {
      analysis.contributionScore = Math.min(analysis.contributionScore + 0.05, 1);
      analysis.reasons.push('Appears to be a passion project with engaged maintainer');
    }

    // Learning opportunity indicators
    const learningIndicators = [
      'learning', 'beginner', 'tutorial', 'educational',
      'step by step', 'learn by doing', 'practice',
      'example', 'demo', 'showcase'
    ];

    const foundLearningIndicators = learningIndicators.filter(indicator => 
      content.includes(indicator)
    );

    if (foundLearningIndicators.length > 1) {
      // Add learning-friendly contribution type
      if (!analysis.contributionTypes.includes('good-first-issue')) {
        analysis.contributionTypes.push('good-first-issue');
      }
      analysis.reasons.push('Appears to be educational/learning-friendly project');
    }
  }
}

// Singleton instance
let analyzerInstance: ReadmeAnalyzer | null = null;

export function getReadmeAnalyzer(): ReadmeAnalyzer {
  if (!analyzerInstance) {
    analyzerInstance = new ReadmeAnalyzer();
  }
  return analyzerInstance;
}