import { ParsedGoogleDoc } from './types';
import { DEFAULT_DOC_ID } from './googleDocs';

export const SAMPLE_PLAN: ParsedGoogleDoc = {
  documentId: DEFAULT_DOC_ID,
  title: 'Engineering Implementation & Strategic Roadmap',
  revisionId: 'rev-live-942',
  wordCount: 1680,
  tableCount: 2,
  lastSyncedAt: new Date().toISOString(),
  rawText: `Executive Implementation Strategy

1. Core Architecture & Security Foundations
- Configure Google Workspace OAuth with documents.readonly scope
- Implement secure in-memory token lifecycle manager
- Establish Google Docs structural element parser
- Implement resilient fallback for iframe storage partitioning

2. Execution Engine & Tracking Suite
- Deliver interactive Kanban execution board with subtask checklists
- Develop dynamic Milestone roadmap and progress tracking
- Implement executive analytics and risk mitigation matrix
- Enable customizable task annotations, assignees, and target dates

3. Quality Assurance & Production Release
- Validate live Google Docs API synchronization across environments
- Export execution progress to Markdown & JSON formats
- Optimize load times and responsive viewport constraints
- End-to-end verification and user sign-off`,
  sections: [
    {
      id: 'section-1',
      title: '1. Architecture & Security Foundations',
      level: 1,
      content: [
        'Establish core authentication protocols and API integration layers for Google Workspace services.',
        'Ensure token safety by utilizing ephemeral in-memory token states without persisting credentials to unencrypted browser storage.',
      ],
      tasks: [
        {
          id: 'task-1',
          title: 'Configure Google Workspace OAuth with documents.readonly scope',
          description: 'Enable authorized retrieval of Google Docs plans and deliverables.',
          status: 'done',
          priority: 'critical',
          sectionId: 'section-1',
          sectionTitle: '1. Architecture & Security Foundations',
          assignee: 'Lead Engineer',
          dueDate: '2026-10-15',
          tags: ['Security', 'OAuth'],
          notes: 'Completed via Google Workspace OAuth setup flow.',
          subtasks: [
            { id: 'sub-1-1', text: 'Define minimum read-only scopes', completed: true },
            { id: 'sub-1-2', text: 'Generate OAuth client configuration', completed: true },
            { id: 'sub-1-3', text: 'Verify user consent workflow', completed: true },
          ],
        },
        {
          id: 'task-2',
          title: 'Implement in-memory token lifecycle manager',
          description: 'Guard credentials against storage leaks by adhering strictly to in-memory caching.',
          status: 'done',
          priority: 'high',
          sectionId: 'section-1',
          sectionTitle: '1. Architecture & Security Foundations',
          assignee: 'Security Architect',
          dueDate: '2026-10-16',
          tags: ['Security', 'Auth'],
          notes: 'Hooked into inMemoryPersistence with automated token clearing on logout.',
          subtasks: [
            { id: 'sub-2-1', text: 'Implement in-memory token cache store', completed: true },
            { id: 'sub-2-2', text: 'Add token expiration and logout cleanup', completed: true },
            { id: 'sub-2-3', text: 'Integrate Google Identity Services fallback', completed: true },
          ],
        },
        {
          id: 'task-3',
          title: 'Establish Google Docs API parser for structural document elements',
          description: 'Convert headings, bullet points, tables, and paragraphs into actionable plan items.',
          status: 'done',
          priority: 'high',
          sectionId: 'section-1',
          sectionTitle: '1. Architecture & Security Foundations',
          assignee: 'Frontend Engineer',
          dueDate: '2026-10-18',
          tags: ['API', 'Parser'],
          notes: 'Parses paragraph styles, bullet items, table cells, and revisions.',
          subtasks: [
            { id: 'sub-3-1', text: 'Parse heading hierarchy (H1-H4)', completed: true },
            { id: 'sub-3-2', text: 'Extract action items from bullet lists', completed: true },
            { id: 'sub-3-3', text: 'Parse structured table rows and cells', completed: true },
          ],
        },
      ],
    },
    {
      id: 'section-2',
      title: '2. Execution Engine & Tracking Suite',
      level: 1,
      content: [
        'Deliver a high-velocity dashboard allowing teams to interactively prioritize, track, and complete plan items.',
        'Provide multi-dimensional views including Kanban, Document View, Timeline Roadmap, and Executive Metrics.',
      ],
      tasks: [
        {
          id: 'task-4',
          title: 'Interactive Kanban Execution Board',
          description: 'Categorize plan tasks across Backlog, In Progress, Review, and Done with drag & click controls.',
          status: 'done',
          priority: 'high',
          sectionId: 'section-2',
          sectionTitle: '2. Execution Engine & Tracking Suite',
          assignee: 'Product Engineer',
          dueDate: '2026-10-20',
          tags: ['UI', 'Kanban'],
          notes: 'Equipped with subtasks, priority filters, and quick status advances.',
          subtasks: [
            { id: 'sub-4-1', text: 'Build 4-stage column workflow', completed: true },
            { id: 'sub-4-2', text: 'Implement quick stage advance controls', completed: true },
            { id: 'sub-4-3', text: 'Add nested checklist progress badges', completed: true },
          ],
        },
        {
          id: 'task-5',
          title: 'Dynamic Milestone & Roadmap Timeline',
          description: 'Visualize plan phases, target dates, and completion percentages in real-time.',
          status: 'in_progress',
          priority: 'medium',
          sectionId: 'section-2',
          sectionTitle: '2. Execution Engine & Tracking Suite',
          assignee: 'UI/UX Designer',
          dueDate: '2026-10-22',
          tags: ['Roadmap', 'Milestones'],
          subtasks: [
            { id: 'sub-5-1', text: 'Phase progress percentage calculation', completed: true },
            { id: 'sub-5-2', text: 'Target deadline calendar integration', completed: true },
            { id: 'sub-5-3', text: 'Direct deliverable status toggle from roadmap', completed: false },
          ],
        },
        {
          id: 'task-6',
          title: 'Executive Analytics & Risk Matrix Breakdown',
          description: 'Calculate velocity, task distribution, and risk mitigation priorities.',
          status: 'in_progress',
          priority: 'medium',
          sectionId: 'section-2',
          sectionTitle: '2. Execution Engine & Tracking Suite',
          assignee: 'Analytics Lead',
          dueDate: '2026-10-25',
          tags: ['Analytics', 'Reporting'],
          subtasks: [
            { id: 'sub-6-1', text: 'Overall completion gauge calculation', completed: true },
            { id: 'sub-6-2', text: 'Priority risk distribution chart', completed: true },
            { id: 'sub-6-3', text: 'Automated executive summary generator', completed: true },
          ],
        },
      ],
    },
    {
      id: 'section-3',
      title: '3. Quality Assurance & Production Release',
      level: 1,
      content: [
        'End-to-end verification of Google Docs syncing, token refresh behavior, and cross-platform responsiveness.',
        'Production readiness check, error recovery, and user documentation.',
      ],
      tasks: [
        {
          id: 'task-7',
          title: 'Validate Google Docs live API synchronization with live accounts',
          description: 'Test document fetching using Google sign-in credentials on multiple documents.',
          status: 'in_progress',
          priority: 'critical',
          sectionId: 'section-3',
          sectionTitle: '3. Quality Assurance & Production Release',
          assignee: 'QA Lead',
          dueDate: '2026-10-28',
          tags: ['QA', 'Integration'],
          subtasks: [
            { id: 'sub-7-1', text: 'Test Firebase popup authentication', completed: true },
            { id: 'sub-7-2', text: 'Test Google Identity Services fallback', completed: true },
            { id: 'sub-7-3', text: 'Verify document parsing on target document ID', completed: false },
          ],
        },
        {
          id: 'task-8',
          title: 'Export execution progress to Markdown & JSON formats',
          description: 'Enable stakeholder updates and sync back to team wikis or reports.',
          status: 'done',
          priority: 'low',
          sectionId: 'section-3',
          sectionTitle: '3. Quality Assurance & Production Release',
          assignee: 'DevOps',
          dueDate: '2026-10-30',
          tags: ['Export', 'Reports'],
          subtasks: [
            { id: 'sub-8-1', text: 'Markdown report export generator', completed: true },
            { id: 'sub-8-2', text: 'JSON structured plan dataset export', completed: true },
            { id: 'sub-8-3', text: 'Clipboard instant copy support', completed: true },
          ],
        },
      ],
    },
  ],
  tasks: [], // populated below
  milestones: [
    {
      id: 'ms-1',
      title: 'Phase 1: Architecture & Foundations',
      status: 'completed',
      targetDate: '2026-10-18',
      description: 'Setup Google Workspace API connection, token security, and core data pipelines.',
      taskIds: ['task-1', 'task-2', 'task-3'],
    },
    {
      id: 'ms-2',
      title: 'Phase 2: Execution Engine & Features',
      status: 'in_progress',
      targetDate: '2026-10-25',
      description: 'Kanban board, milestone roadmap, interactive task status transitions, and analytics.',
      taskIds: ['task-4', 'task-5', 'task-6'],
    },
    {
      id: 'ms-3',
      title: 'Phase 3: QA & Production Release',
      status: 'in_progress',
      targetDate: '2026-10-30',
      description: 'End-to-end verification, reporting exports, and final deployment.',
      taskIds: ['task-7', 'task-8'],
    },
  ],
};

// Flatten tasks
SAMPLE_PLAN.tasks = SAMPLE_PLAN.sections.flatMap((s) => s.tasks);
