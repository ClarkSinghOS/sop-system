import { Process, ProcessStep, Role } from '@/types/process';

// ============================================================
// ROLES
// ============================================================

const roles: Record<string, Role> = {
  marketingLead: {
    id: 'role-mkt-lead',
    name: 'Marketing Lead',
    department: 'Marketing',
    responsibilities: ['Campaign strategy', 'Content approval', 'Budget management'],
  },
  contentWriter: {
    id: 'role-content',
    name: 'Content Writer',
    department: 'Marketing',
    responsibilities: ['Blog posts', 'Landing pages', 'Email copy'],
  },
  seoSpecialist: {
    id: 'role-seo',
    name: 'SEO Specialist',
    department: 'Marketing',
    responsibilities: ['Keyword research', 'On-page SEO', 'Link building'],
  },
  designer: {
    id: 'role-design',
    name: 'Designer',
    department: 'Marketing',
    responsibilities: ['Graphics', 'Landing pages', 'Social assets'],
  },
  salesRep: {
    id: 'role-sales',
    name: 'Sales Representative',
    department: 'Sales',
    responsibilities: ['Lead follow-up', 'Demos', 'Closing'],
  },
  ceo: {
    id: 'role-ceo',
    name: 'CEO',
    department: 'Executive',
    responsibilities: ['Final approval', 'Strategy', 'Budget sign-off'],
  },
};

// ============================================================
// SHOREAGENTS MARKETING FLOW - COMPLETE PROCESS
// ============================================================

export const marketingFlowProcess: Process = {
  id: 'proc-mkt-001',
  processId: 'MKT-FLOW-001',
  name: 'ShoreAgents Marketing Flow',
  department: 'Marketing',
  
  status: 'active',
  version: '1.0',
  priority: 'high',
  
  description: 'End-to-end marketing process for acquiring new clients through content marketing, SEO, and lead nurturing. From keyword research to closed deal.',
  shortVersion: [
    '1. Research & Plan content strategy',
    '2. Create & Publish optimized content',
    '3. Nurture leads through funnel to close',
  ],
  purpose: 'Generate qualified leads for ShoreAgents through organic content marketing, convert them through the website, and hand off to sales for closing.',
  outcomes: [
    'New qualified leads in CRM',
    'Booked discovery calls',
    'Signed client contracts',
  ],
  
  owner: roles.marketingLead,
  involved: [roles.contentWriter, roles.seoSpecialist, roles.designer, roles.salesRep],
  targetAudience: 'Business owners looking to hire offshore staff',
  
  frequency: 'Continuous (weekly content cycles)',
  estimatedDuration: '4-6 weeks per content piece to conversion',
  
  triggers: ['Content calendar scheduled', 'New keyword opportunity identified'],
  triggeredBy: ['Quarterly planning', 'Competitor analysis'],
  relatedProcesses: ['SALES-QUAL-001', 'OPS-ONB-001'],
  
  kpis: [
    { name: 'Organic Traffic', target: '50,000/month', current: '32,000/month' },
    { name: 'Lead Conversion Rate', target: '3%', current: '2.1%' },
    { name: 'Cost Per Lead', target: '$25', current: '$38' },
    { name: 'Content Published', target: '12/month', current: '8/month' },
  ],
  
  createdAt: '2026-01-15',
  updatedAt: '2026-02-15',
  createdBy: 'stephen@stepten.io',
  tags: ['marketing', 'content', 'seo', 'lead-generation', 'critical'],
  
  steps: [
    // ============================================================
    // STEP A: KEYWORD RESEARCH
    // ============================================================
    {
      id: 'step-a',
      stepId: 'MKT-FLOW-001-A',
      name: 'Keyword Research & Topic Selection',
      type: 'task',
      
      shortDescription: 'Identify high-value keywords and select topics for content creation',
      longDescription: `Comprehensive keyword research process:

1. **Seed Keywords**: Start with core service terms (virtual assistant, offshore staff, BPO)
2. **Competitor Analysis**: Check what competitors rank for using Ahrefs/SEMrush
3. **Search Intent**: Categorize keywords by intent (informational, transactional, commercial)
4. **Difficulty Assessment**: Balance search volume against competition
5. **Topic Clustering**: Group related keywords into content pillars
6. **Prioritization**: Score and rank topics by potential impact

Output: Approved topic brief with target keywords, search volume, and content angle.`,
      
      whyItMatters: 'Without proper keyword research, content may never rank or attract the wrong audience. This step determines the entire ROI of the content marketing effort.',
      
      videos: [
        {
          id: 'vid-a-1',
          type: 'loom',
          url: 'https://www.loom.com/share/keyword-research-demo',
          embedUrl: 'https://www.loom.com/embed/keyword-research-demo',
          title: 'Keyword Research Walkthrough',
          duration: 480,
          chapters: [
            { time: 0, title: 'Introduction', description: 'Why keyword research matters' },
            { time: 60, title: 'Seed Keywords', description: 'Finding initial terms' },
            { time: 180, title: 'Competitor Analysis', description: 'Using Ahrefs' },
            { time: 300, title: 'Prioritization', description: 'Scoring system' },
          ],
        },
      ],
      
      screenshots: [
        {
          id: 'ss-a-1',
          url: '/screenshots/ahrefs-keyword-explorer.png',
          caption: 'Ahrefs Keyword Explorer - Finding search volume and difficulty',
          order: 1,
          annotations: [
            { x: 20, y: 30, width: 200, height: 50, type: 'highlight', content: 'Search volume here', color: '#10b981' },
            { x: 250, y: 30, width: 100, height: 50, type: 'highlight', content: 'KD score', color: '#f59e0b' },
          ],
        },
        {
          id: 'ss-a-2',
          url: '/screenshots/content-brief-template.png',
          caption: 'Content Brief Template - Fill this out for each approved topic',
          order: 2,
        },
      ],
      
      templates: [
        {
          id: 'tmpl-a-1',
          name: 'Keyword Research Spreadsheet',
          description: 'Track keywords, volumes, difficulty, and prioritization scores',
          fileUrl: 'https://docs.google.com/spreadsheets/d/xxx',
          fileType: 'sheet',
        },
        {
          id: 'tmpl-a-2',
          name: 'Content Brief Template',
          description: 'Standard brief format for approved topics',
          fileUrl: 'https://docs.google.com/document/d/xxx',
          fileType: 'doc',
        },
      ],
      
      checklist: {
        id: 'cl-a',
        title: 'Keyword Research Checklist',
        items: [
          { id: 'cl-a-1', text: 'Generate seed keyword list (20+ terms)', required: true, order: 1 },
          { id: 'cl-a-2', text: 'Run competitor gap analysis', required: true, order: 2, helpText: 'Use Ahrefs Content Gap tool' },
          { id: 'cl-a-3', text: 'Categorize by search intent', required: true, order: 3 },
          { id: 'cl-a-4', text: 'Check current rankings (avoid cannibalization)', required: true, order: 4 },
          { id: 'cl-a-5', text: 'Score and prioritize top 10 topics', required: true, order: 5 },
          { id: 'cl-a-6', text: 'Get Marketing Lead approval', required: true, order: 6 },
          { id: 'cl-a-7', text: 'Create content brief', required: true, order: 7 },
        ],
        completionCriteria: 'Approved content brief with target keyword, supporting keywords, and content angle',
      },
      
      toolsUsed: [
        { id: 'tool-ahrefs', name: 'Ahrefs', icon: 'ahrefs', url: 'https://ahrefs.com', category: 'software', accessLevel: 'Team account' },
        { id: 'tool-semrush', name: 'SEMrush', icon: 'semrush', url: 'https://semrush.com', category: 'software', accessLevel: 'Backup tool' },
        { id: 'tool-sheets', name: 'Google Sheets', icon: 'sheets', url: 'https://sheets.google.com', category: 'software' },
      ],
      
      ownership: {
        owner: roles.seoSpecialist,
        involved: [roles.marketingLead, roles.contentWriter],
        escalateTo: roles.marketingLead,
        notifyOnComplete: [roles.contentWriter],
      },
      
      timing: {
        estimatedDuration: '4-6 hours',
        estimatedMinutes: 300,
        slaHours: 24,
        bestTimeToStart: 'Monday morning for weekly planning',
      },
      
      commonMistakes: [
        {
          id: 'cm-a-1',
          title: 'Chasing high-volume keywords only',
          description: 'Targeting only high-volume keywords with intense competition, ignoring long-tail opportunities',
          howToFix: 'Include a mix of head terms and long-tail keywords. Look for KD < 30 with volume > 200.',
          warningSignals: ['All target keywords have KD > 50', 'No rankings after 3 months'],
          preventionTips: ['Set KD limits in your scoring criteria', 'Include "low competition" as a factor'],
        },
        {
          id: 'cm-a-2',
          title: 'Ignoring search intent',
          description: 'Writing informational content for transactional keywords or vice versa',
          howToFix: 'Check SERP results for each keyword. Match the dominant content type.',
          warningSignals: ['High bounce rate', 'Low time on page', 'Poor conversion'],
        },
      ],
      
      automationLevel: 'partial',
      automationAnalysis: {
        currentState: 'semi_automated',
        targetState: 'semi_automated',
        automationType: 'ai_assisted',
        blockers: ['Human judgment needed for final topic selection'],
        effortToAutomate: 'medium',
        toolsRequired: ['Ahrefs API', 'GPT-4 for brief generation'],
        estimatedSavingsPerMonth: '10 hours',
      },
      
      aiDefinition: {
        inputs: ['seed_keywords', 'competitor_urls', 'existing_content_urls'],
        outputs: ['keyword_list', 'content_brief'],
        actions: [
          { action: 'fetch_keyword_data', params: { source: 'ahrefs_api' } },
          { action: 'analyze_competitors', params: { depth: 'top_20' } },
          { action: 'generate_brief', template: 'content_brief_v2' },
        ],
        conditions: {
          requiredBefore: [],
          timeout: '24h',
          onTimeout: 'notify_marketing_lead',
        },
        next: [
          { condition: 'brief_approved == true', goto: 'MKT-FLOW-001-B' },
          { condition: 'brief_approved == false', goto: 'MKT-FLOW-001-A', retryCount: 2 },
        ],
      },
      
      examples: [
        {
          id: 'ex-a-1',
          title: 'Successful long-tail discovery',
          scenario: 'Found "hire virtual assistant philippines" (KD 25, Vol 1,200) instead of targeting "virtual assistant" (KD 80, Vol 50,000)',
          outcome: 'Ranked #3 in 6 weeks, generating 400 visits/month and 12 leads',
          isPositive: true,
        },
        {
          id: 'ex-a-2',
          title: 'Wrong intent mismatch',
          scenario: 'Targeted "virtual assistant salary" with a service page instead of informational content',
          outcome: 'Page never ranked. Had to rewrite as salary guide, then ranked #5',
          isPositive: false,
          relatedMistake: 'cm-a-2',
        },
      ],
      
      triggersProcesses: ['MKT-FLOW-001-B'],
      position: { x: 0, y: 0 },
    },
    
    // ============================================================
    // STEP B: CONTENT CREATION
    // ============================================================
    {
      id: 'step-b',
      stepId: 'MKT-FLOW-001-B',
      name: 'Content Creation & Writing',
      type: 'task',
      
      shortDescription: 'Write comprehensive, SEO-optimized content based on the approved brief',
      longDescription: `Content creation process following the approved brief:

1. **Outline**: Create detailed H2/H3 structure based on SERP analysis
2. **Research**: Gather data, stats, quotes from authoritative sources
3. **Draft**: Write first draft focusing on comprehensiveness
4. **SEO Optimization**: Add keywords naturally, optimize meta tags
5. **Internal Linking**: Connect to existing relevant content
6. **Visuals**: Request graphics, screenshots, diagrams
7. **Review**: Self-edit for clarity, flow, and accuracy

Word count target: 2,000-3,500 words for pillar content, 1,200-1,800 for supporting.`,
      
      whyItMatters: 'Content quality directly impacts rankings, engagement, and conversions. A well-written piece can generate leads for years. A poor one wastes the entire effort.',
      
      videos: [
        {
          id: 'vid-b-1',
          type: 'loom',
          url: 'https://www.loom.com/share/content-writing-process',
          embedUrl: 'https://www.loom.com/embed/content-writing-process',
          title: 'Content Writing Standards',
          duration: 720,
          chapters: [
            { time: 0, title: 'The Brief', description: 'Understanding your assignment' },
            { time: 120, title: 'Outlining', description: 'Structure that ranks' },
            { time: 300, title: 'Writing', description: 'Voice and style guide' },
            { time: 480, title: 'SEO', description: 'On-page optimization' },
            { time: 600, title: 'Review', description: 'Quality checklist' },
          ],
        },
      ],
      
      templates: [
        {
          id: 'tmpl-b-1',
          name: 'Content Outline Template',
          description: 'Standard H2/H3 structure with keyword placement',
          fileUrl: 'https://docs.google.com/document/d/outline',
          fileType: 'doc',
        },
        {
          id: 'tmpl-b-2',
          name: 'Style Guide',
          description: 'ShoreAgents brand voice and writing standards',
          fileUrl: 'https://docs.google.com/document/d/style',
          fileType: 'doc',
        },
      ],
      
      checklist: {
        id: 'cl-b',
        title: 'Content Creation Checklist',
        items: [
          { id: 'cl-b-1', text: 'Create outline matching SERP structure', required: true, order: 1 },
          { id: 'cl-b-2', text: 'Research and cite 3+ authoritative sources', required: true, order: 2 },
          { id: 'cl-b-3', text: 'Write first draft (min word count)', required: true, order: 3 },
          { id: 'cl-b-4', text: 'Include target keyword in H1, intro, and 2+ H2s', required: true, order: 4 },
          { id: 'cl-b-5', text: 'Add 3+ internal links to existing content', required: true, order: 5 },
          { id: 'cl-b-6', text: 'Write meta title (50-60 chars) and description (150-160 chars)', required: true, order: 6 },
          { id: 'cl-b-7', text: 'Request graphics from designer', required: false, order: 7 },
          { id: 'cl-b-8', text: 'Self-review using quality checklist', required: true, order: 8 },
          { id: 'cl-b-9', text: 'Run through Grammarly/Hemingway', required: true, order: 9 },
        ],
        completionCriteria: 'Draft ready for editorial review with all SEO elements in place',
      },
      
      toolsUsed: [
        { id: 'tool-docs', name: 'Google Docs', icon: 'docs', url: 'https://docs.google.com', category: 'software' },
        { id: 'tool-surfer', name: 'Surfer SEO', icon: 'surfer', url: 'https://surferseo.com', category: 'software', notes: 'For content optimization scoring' },
        { id: 'tool-grammarly', name: 'Grammarly', icon: 'grammarly', url: 'https://grammarly.com', category: 'software' },
      ],
      
      ownership: {
        owner: roles.contentWriter,
        involved: [roles.seoSpecialist, roles.designer],
        escalateTo: roles.marketingLead,
        notifyOnComplete: [roles.marketingLead, roles.seoSpecialist],
      },
      
      timing: {
        estimatedDuration: '2-3 days',
        estimatedMinutes: 960,
        slaHours: 72,
        dependencies: ['MKT-FLOW-001-A'],
      },
      
      commonMistakes: [
        {
          id: 'cm-b-1',
          title: 'Keyword stuffing',
          description: 'Forcing keywords unnaturally, harming readability',
          howToFix: 'Use Surfer SEO for keyword density. Read aloud - if it sounds weird, rewrite.',
          warningSignals: ['Surfer score > 80 but reads poorly', 'Repeated exact phrases'],
        },
        {
          id: 'cm-b-2',
          title: 'Thin content',
          description: 'Not going deep enough, missing subtopics competitors cover',
          howToFix: 'Check "People Also Ask" and competitor H2s. Cover all angles.',
          warningSignals: ['Word count under target', 'Missing H2s from brief'],
        },
      ],
      
      automationLevel: 'partial',
      automationAnalysis: {
        currentState: 'manual',
        targetState: 'semi_automated',
        automationType: 'ai_assisted',
        blockers: ['Brand voice requires human touch', 'Facts need verification'],
        effortToAutomate: 'high',
        toolsRequired: ['GPT-4', 'Surfer SEO API'],
        estimatedSavingsPerMonth: '20 hours with AI first draft',
      },
      
      aiDefinition: {
        inputs: ['content_brief', 'style_guide', 'competitor_content'],
        outputs: ['draft_content', 'meta_tags'],
        actions: [
          { action: 'generate_outline', params: { style: 'comprehensive' } },
          { action: 'write_draft', params: { model: 'gpt-4', tone: 'professional_friendly' } },
          { action: 'optimize_seo', params: { tool: 'surfer' } },
        ],
        conditions: {
          requiredBefore: ['MKT-FLOW-001-A'],
          timeout: '72h',
          onTimeout: 'escalate_to_marketing_lead',
        },
        next: [
          { condition: 'draft_complete == true', goto: 'MKT-FLOW-001-C' },
        ],
      },
      
      triggersProcesses: ['MKT-FLOW-001-C'],
      position: { x: 0, y: 200 },
    },
    
    // ============================================================
    // STEP C: EDITORIAL REVIEW
    // ============================================================
    {
      id: 'step-c',
      stepId: 'MKT-FLOW-001-C',
      name: 'Editorial Review & Approval',
      type: 'decision',
      
      shortDescription: 'Review content for quality, accuracy, and brand alignment',
      longDescription: `Editorial review ensures content meets ShoreAgents standards before publication.

**Review Criteria:**
- Factual accuracy (all claims verified)
- Brand voice consistency
- SEO optimization complete
- No competitor mentions or sensitive content
- Graphics and visuals approved
- Internal links working
- CTA placement correct

**Approval Levels:**
- Standard content: Marketing Lead
- Homepage/pricing: CEO approval required
- Case studies: Client approval needed`,
      
      whyItMatters: 'Published content represents the brand. One factual error or off-brand piece can damage credibility. Review catches issues before they go live.',
      
      decision: {
        question: 'Does the content meet all quality standards?',
        branches: [
          {
            id: 'branch-c-1',
            condition: 'quality_score >= 85 && no_blockers',
            conditionReadable: 'Quality score 85+ and no blocking issues',
            targetStepId: 'MKT-FLOW-001-D',
            probability: 70,
          },
          {
            id: 'branch-c-2',
            condition: 'quality_score < 85 || has_blockers',
            conditionReadable: 'Needs revision (quality issues or blockers)',
            targetStepId: 'MKT-FLOW-001-B',
            probability: 25,
            notes: 'Provide specific feedback for revision',
          },
          {
            id: 'branch-c-3',
            condition: 'major_issues',
            conditionReadable: 'Major issues - needs complete rewrite or different approach',
            targetStepId: 'MKT-FLOW-001-A',
            probability: 5,
            notes: 'Rare - usually means brief was wrong',
          },
        ],
      },
      
      checklist: {
        id: 'cl-c',
        title: 'Editorial Review Checklist',
        items: [
          { id: 'cl-c-1', text: 'Verify all factual claims with sources', required: true, order: 1 },
          { id: 'cl-c-2', text: 'Check brand voice consistency', required: true, order: 2 },
          { id: 'cl-c-3', text: 'Verify SEO elements (title, meta, keywords)', required: true, order: 3 },
          { id: 'cl-c-4', text: 'Test all internal links', required: true, order: 4 },
          { id: 'cl-c-5', text: 'Review graphics/visuals', required: false, order: 5 },
          { id: 'cl-c-6', text: 'Check CTA placement and copy', required: true, order: 6 },
          { id: 'cl-c-7', text: 'Run plagiarism check', required: true, order: 7 },
          { id: 'cl-c-8', text: 'Final approval sign-off', required: true, order: 8 },
        ],
      },
      
      ownership: {
        owner: roles.marketingLead,
        involved: [roles.contentWriter, roles.seoSpecialist],
        escalateTo: roles.ceo,
      },
      
      timing: {
        estimatedDuration: '2-4 hours',
        estimatedMinutes: 180,
        slaHours: 24,
        dependencies: ['MKT-FLOW-001-B'],
      },
      
      automationLevel: 'partial',
      automationAnalysis: {
        currentState: 'manual',
        targetState: 'semi_automated',
        blockers: ['Final approval requires human judgment'],
        effortToAutomate: 'medium',
        toolsRequired: ['Automated checklist', 'Link checker', 'Plagiarism API'],
      },
      
      position: { x: 0, y: 400 },
    },
    
    // ============================================================
    // STEP D: PUBLISH
    // ============================================================
    {
      id: 'step-d',
      stepId: 'MKT-FLOW-001-D',
      name: 'Publish & Index',
      type: 'task',
      
      shortDescription: 'Publish content to website and submit for search indexing',
      longDescription: `Publication process:

1. **CMS Upload**: Add content to WordPress/CMS
2. **Final Preview**: Check formatting, images, links on staging
3. **Publish**: Set live with correct date/time
4. **Index Request**: Submit to Google Search Console
5. **Social Share**: Post to social channels
6. **Team Notification**: Alert team of new content

**Timing:**
- Best days: Tuesday, Wednesday, Thursday
- Best times: 9am or 2pm (audience timezone)
- Avoid: Mondays, Fridays, weekends`,
      
      whyItMatters: 'Proper publication ensures content is discoverable. Missing indexing or broken formatting wastes all prior effort.',
      
      checklist: {
        id: 'cl-d',
        title: 'Publication Checklist',
        items: [
          { id: 'cl-d-1', text: 'Upload to CMS with correct formatting', required: true, order: 1 },
          { id: 'cl-d-2', text: 'Set featured image and alt text', required: true, order: 2 },
          { id: 'cl-d-3', text: 'Configure URL slug (match target keyword)', required: true, order: 3 },
          { id: 'cl-d-4', text: 'Set category and tags', required: true, order: 4 },
          { id: 'cl-d-5', text: 'Preview and test all links', required: true, order: 5 },
          { id: 'cl-d-6', text: 'Publish post', required: true, order: 6 },
          { id: 'cl-d-7', text: 'Submit URL to Google Search Console', required: true, order: 7 },
          { id: 'cl-d-8', text: 'Share to social channels', required: false, order: 8 },
          { id: 'cl-d-9', text: 'Notify team in Slack', required: false, order: 9 },
        ],
      },
      
      toolsUsed: [
        { id: 'tool-wp', name: 'WordPress', url: 'https://shoreagents.com/wp-admin', category: 'software' },
        { id: 'tool-gsc', name: 'Google Search Console', url: 'https://search.google.com/search-console', category: 'software' },
        { id: 'tool-buffer', name: 'Buffer', url: 'https://buffer.com', category: 'software', notes: 'Social scheduling' },
      ],
      
      ownership: {
        owner: roles.contentWriter,
        involved: [roles.seoSpecialist],
        notifyOnComplete: [roles.marketingLead, roles.salesRep],
      },
      
      timing: {
        estimatedDuration: '30-60 minutes',
        estimatedMinutes: 45,
        bestTimeToStart: 'Tuesday-Thursday, 9am or 2pm',
        dependencies: ['MKT-FLOW-001-C'],
      },
      
      automationLevel: 'full',
      automationAnalysis: {
        currentState: 'semi_automated',
        targetState: 'automated',
        automationType: 'trigger_based',
        effortToAutomate: 'low',
        toolsRequired: ['WordPress API', 'GSC API', 'Zapier'],
        estimatedSavingsPerMonth: '5 hours',
      },
      
      position: { x: 0, y: 600 },
    },
    
    // ============================================================
    // STEP E: MONITOR & OPTIMIZE
    // ============================================================
    {
      id: 'step-e',
      stepId: 'MKT-FLOW-001-E',
      name: 'Monitor Performance & Optimize',
      type: 'parallel',
      
      shortDescription: 'Track rankings, traffic, and conversions; optimize based on data',
      longDescription: `Ongoing monitoring and optimization:

**Week 1-2:**
- Check indexing status
- Monitor initial rankings
- Track early traffic

**Week 3-4:**
- Analyze user behavior (time on page, bounce rate)
- Check if ranking for target keywords
- Identify quick-win optimizations

**Month 2+:**
- Compare against KPIs
- Update content if rankings plateau
- Add new sections based on "People Also Ask"
- Build internal links from new content

**Optimization Triggers:**
- Ranking stuck at positions 8-15 → Add content, improve structure
- High bounce rate → Improve intro, add visuals
- Low conversions → Test different CTAs`,
      
      whyItMatters: 'Content that ranks #11 vs #3 has 10x traffic difference. Ongoing optimization turns good content into great results.',
      
      videos: [
        {
          id: 'vid-e-1',
          type: 'loom',
          url: 'https://www.loom.com/share/seo-monitoring',
          embedUrl: 'https://www.loom.com/embed/seo-monitoring',
          title: 'Monthly SEO Review Process',
          duration: 600,
        },
      ],
      
      checklist: {
        id: 'cl-e',
        title: 'Monthly Optimization Checklist',
        items: [
          { id: 'cl-e-1', text: 'Check ranking positions for target keywords', required: true, order: 1 },
          { id: 'cl-e-2', text: 'Review traffic and engagement metrics', required: true, order: 2 },
          { id: 'cl-e-3', text: 'Analyze conversion rate', required: true, order: 3 },
          { id: 'cl-e-4', text: 'Identify optimization opportunities', required: true, order: 4 },
          { id: 'cl-e-5', text: 'Update content if needed', required: false, order: 5 },
          { id: 'cl-e-6', text: 'Document learnings', required: true, order: 6 },
        ],
      },
      
      toolsUsed: [
        { id: 'tool-ahrefs2', name: 'Ahrefs', url: 'https://ahrefs.com', category: 'software' },
        { id: 'tool-ga', name: 'Google Analytics', url: 'https://analytics.google.com', category: 'software' },
        { id: 'tool-gsc2', name: 'Google Search Console', url: 'https://search.google.com/search-console', category: 'software' },
      ],
      
      ownership: {
        owner: roles.seoSpecialist,
        involved: [roles.contentWriter, roles.marketingLead],
      },
      
      timing: {
        estimatedDuration: 'Ongoing (2-4 hours/month per piece)',
        dependencies: ['MKT-FLOW-001-D'],
      },
      
      automationLevel: 'partial',
      automationAnalysis: {
        currentState: 'manual',
        targetState: 'semi_automated',
        automationType: 'scheduled',
        effortToAutomate: 'medium',
        toolsRequired: ['Automated rank tracking', 'Alert system'],
      },
      
      position: { x: 0, y: 800 },
    },
    
    // ============================================================
    // STEP F: LEAD CAPTURE
    // ============================================================
    {
      id: 'step-f',
      stepId: 'MKT-FLOW-001-F',
      name: 'Lead Capture & CRM Entry',
      type: 'automated',
      
      shortDescription: 'Capture visitor information through forms and add to CRM',
      longDescription: `Lead capture touchpoints:

**On-Page:**
- Exit intent popups
- Inline forms (gated content)
- Chat widget (Maya AI)
- Quote calculator
- Free consultation CTA

**Form Fields:**
- Required: Name, Email, Company
- Optional: Phone, Company size, Hiring timeline

**CRM Flow:**
- Form submission → Webhook → HubSpot
- Lead score calculated automatically
- Assigned to sales rep based on rules
- Welcome email triggered

**Lead Scoring:**
- +20: Downloaded resource
- +30: Requested quote
- +50: Booked call
- +10: Multiple page views
- -10: Generic email domain`,
      
      whyItMatters: 'Content without capture is just education for competitors. Every visitor should have a path to become a lead.',
      
      integrations: [
        {
          id: 'int-f-1',
          name: 'HubSpot CRM',
          type: 'webhook',
          endpoint: 'https://api.hubspot.com/crm/v3/objects/contacts',
          dataFlow: 'outbound',
        },
        {
          id: 'int-f-2',
          name: 'Maya AI Chat',
          type: 'native',
          dataFlow: 'bidirectional',
        },
      ],
      
      ownership: {
        owner: roles.marketingLead,
        involved: [roles.salesRep],
        notifyOnComplete: [roles.salesRep],
      },
      
      timing: {
        estimatedDuration: 'Automatic (< 1 minute)',
      },
      
      automationLevel: 'full',
      
      triggersProcesses: ['MKT-FLOW-001-G'],
      position: { x: 0, y: 1000 },
    },
    
    // ============================================================
    // STEP G: LEAD NURTURE
    // ============================================================
    {
      id: 'step-g',
      stepId: 'MKT-FLOW-001-G',
      name: 'Lead Nurturing Sequence',
      type: 'automated',
      
      shortDescription: 'Automated email sequence to warm leads until sales-ready',
      longDescription: `Email nurture sequence:

**Day 0:** Welcome + requested resource
**Day 2:** Value email (helpful tip)
**Day 5:** Case study / social proof
**Day 8:** Soft CTA (book a call)
**Day 12:** Final push + special offer

**Triggers to exit sequence:**
- Booked a call → Move to sales sequence
- Unsubscribed → Remove from automation
- No engagement after 30 days → Cold list

**Segmentation:**
- By company size
- By industry
- By intent level
- By content consumed`,
      
      ownership: {
        owner: roles.marketingLead,
        involved: [],
      },
      
      timing: {
        estimatedDuration: '12-30 days (automated)',
      },
      
      automationLevel: 'full',
      
      triggersProcesses: ['MKT-FLOW-001-H'],
      position: { x: 0, y: 1200 },
    },
    
    // ============================================================
    // STEP H: SALES HANDOFF
    // ============================================================
    {
      id: 'step-h',
      stepId: 'MKT-FLOW-001-H',
      name: 'Sales Handoff & Discovery Call',
      type: 'human_task',
      
      shortDescription: 'Qualified lead handed to sales for discovery call',
      longDescription: `Sales handoff process:

**Qualification Criteria:**
- Lead score > 50
- Company size > 5 employees
- Clear hiring intent signal
- Valid business email

**Handoff Package:**
- Lead profile and history
- Content consumed
- Form submissions
- Chat transcripts
- Lead score breakdown

**Sales Action:**
- Review lead profile
- Personalize outreach
- Book discovery call
- Run qualification call
- Determine next steps`,
      
      whyItMatters: 'The moment of handoff is critical. Poor handoffs lose warm leads. Good handoffs close deals.',
      
      ownership: {
        owner: roles.salesRep,
        involved: [roles.marketingLead],
        escalateTo: roles.ceo,
      },
      
      timing: {
        estimatedDuration: '30-60 minutes per lead',
        slaHours: 4,
        bestTimeToStart: 'Within 5 minutes of booking',
      },
      
      automationLevel: 'none',
      
      triggersProcesses: ['SALES-QUAL-001'],
      position: { x: 0, y: 1400 },
    },
    
    // ============================================================
    // MILESTONE: CONVERSION
    // ============================================================
    {
      id: 'step-m',
      stepId: 'MKT-FLOW-001-M',
      name: 'Client Conversion',
      type: 'milestone',
      
      shortDescription: 'Lead converted to paying client',
      longDescription: 'Marketing objective achieved. Lead has signed contract and becomes a client. Handoff to Operations for onboarding.',
      
      ownership: {
        owner: roles.salesRep,
        involved: [roles.marketingLead, roles.ceo],
      },
      
      timing: {
        estimatedDuration: 'N/A - milestone',
      },
      
      automationLevel: 'none',
      
      triggersProcesses: ['OPS-ONB-001'],
      position: { x: 0, y: 1600 },
    },
  ],
};

export default marketingFlowProcess;
