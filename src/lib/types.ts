export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface PlanTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  sectionId?: string;
  sectionTitle?: string;
  assignee?: string;
  dueDate?: string;
  tags?: string[];
  notes?: string;
  originText?: string;
  subtasks?: SubTask[];
}

export interface PlanSection {
  id: string;
  title: string;
  level: number; // 1 for H1, 2 for H2, etc.
  content: string[];
  tasks: PlanTask[];
}

export interface PlanMilestone {
  id: string;
  title: string;
  targetDate?: string;
  status: 'pending' | 'in_progress' | 'completed';
  description: string;
  taskIds: string[];
}

export interface ParsedGoogleDoc {
  documentId: string;
  title: string;
  revisionId?: string;
  sections: PlanSection[];
  tasks: PlanTask[];
  milestones: PlanMilestone[];
  rawText: string;
  tableCount: number;
  wordCount: number;
  lastSyncedAt: string;
}
