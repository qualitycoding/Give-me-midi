import { ParsedGoogleDoc, PlanSection, PlanTask, PlanMilestone } from './types';

export const DEFAULT_DOC_URL = 'https://docs.google.com/document/d/1qcdMf3Yb92iIUoh4N_-O0XLKqsyUUQxJ9J_or8QyavU/edit?usp=drivesdk';
export const DEFAULT_DOC_ID = '1qcdMf3Yb92iIUoh4N_-O0XLKqsyUUQxJ9J_or8QyavU';

export function extractDocumentId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  // If it's already an ID
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

export async function fetchGoogleDocument(
  docId: string,
  accessToken: string
): Promise<ParsedGoogleDoc> {
  const cleanId = extractDocumentId(docId);
  const response = await fetch(`https://docs.googleapis.com/v1/documents/${cleanId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    let errorMessage = `Failed to fetch document (${response.status}: ${response.statusText})`;
    try {
      const errJson = await response.json();
      if (errJson?.error?.message) {
        errorMessage = errJson.error.message;
      }
    } catch {
      // ignore
    }

    if (response.status === 403) {
      throw new Error(
        `Permission Denied (403): The Google account does not have read access to this document. Ensure that the doc is shared with your signed-in Google account.`
      );
    } else if (response.status === 404) {
      throw new Error(
        `Document Not Found (404): No document found with ID "${cleanId}". Check the document URL or ID.`
      );
    } else if (response.status === 401) {
      throw new Error(
        `Authentication Expired (401): Please sign in again with your Google account to refresh credentials.`
      );
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return parseGoogleDocResponse(cleanId, data);
}

export function parseGoogleDocResponse(documentId: string, docData: any): ParsedGoogleDoc {
  const title = docData.title || 'Untitled Plan Document';
  const revisionId = docData.revisionId;
  const contentArray: any[] = docData.body?.content || [];

  const sections: PlanSection[] = [];
  const tasks: PlanTask[] = [];
  const allParagraphs: string[] = [];
  let tableCount = 0;

  let currentSection: PlanSection = {
    id: 'section-overview',
    title: 'Overview & Goals',
    level: 1,
    content: [],
    tasks: [],
  };

  let taskIdCounter = 1;

  for (const item of contentArray) {
    if (item.table) {
      tableCount++;
      // Parse table rows
      const tableRows = item.table.tableRows || [];
      const tableLines: string[] = [];
      for (const row of tableRows) {
        const cells = (row.tableCells || []).map((cell: any) => {
          let cellText = '';
          for (const c of cell.content || []) {
            if (c.paragraph) {
              cellText += c.paragraph.elements?.map((e: any) => e.textRun?.content || '').join('') || '';
            }
          }
          return cellText.trim().replace(/\n+/g, ' ');
        });
        if (cells.length > 0 && cells.some((c: string) => c.length > 0)) {
          tableLines.push(cells.join(' | '));
        }
      }
      if (tableLines.length > 0) {
        currentSection.content.push(`[Table with ${tableRows.length} rows]:\n` + tableLines.join('\n'));
      }
      continue;
    }

    if (!item.paragraph) continue;

    const elements = item.paragraph.elements || [];
    const text = elements
      .map((el: any) => el.textRun?.content || '')
      .join('')
      .trim();

    if (!text) continue;

    allParagraphs.push(text);

    const style = item.paragraph.paragraphStyle?.namedStyleType || 'NORMAL_TEXT';
    const isBullet = Boolean(item.paragraph.bullet);

    if (style.startsWith('HEADING_') || style === 'TITLE') {
      // Save current section if it has content or tasks
      if (currentSection.content.length > 0 || currentSection.tasks.length > 0) {
        sections.push(currentSection);
      }

      const levelNum = style.startsWith('HEADING_')
        ? parseInt(style.replace('HEADING_', ''), 10) || 2
        : 1;

      currentSection = {
        id: `section-${sections.length + 1}`,
        title: text,
        level: levelNum,
        content: [],
        tasks: [],
      };
      continue;
    }

    // Check if paragraph looks like a task / action item
    const isTaskCandidate =
      isBullet ||
      /^[-*•]\s*(\[[ xX]\])?/.test(text) ||
      /^(TODO|Task|Action|Phase|Step\s*\d|Milestone):/i.test(text) ||
      /^(implement|build|create|set up|design|test|deploy|migrate|integrate|review|configure)\b/i.test(text);

    if (isTaskCandidate && text.length > 5 && text.length < 240) {
      const cleanTaskTitle = text
        .replace(/^[-*•]\s*(\[[ xX]\]\s*)?/, '')
        .replace(/^(TODO|Task|Action):\s*/i, '')
        .trim();

      const isCompleted = /^[-*•]\s*\[[xX]\]/.test(text);
      const isCritical = /urgent|critical|priority|security|auth|blocker/i.test(cleanTaskTitle);
      const isHigh = /deploy|database|api|architecture|schema/i.test(cleanTaskTitle);

      const task: PlanTask = {
        id: `task-${taskIdCounter++}`,
        title: cleanTaskTitle,
        description: `Extracted from section: "${currentSection.title}"`,
        status: isCompleted ? 'done' : 'todo',
        priority: isCritical ? 'critical' : isHigh ? 'high' : 'medium',
        sectionId: currentSection.id,
        sectionTitle: currentSection.title,
        originText: text,
      };

      currentSection.tasks.push(task);
      tasks.push(task);
    } else {
      currentSection.content.push(text);
    }
  }

  // Push the last section
  if (currentSection.content.length > 0 || currentSection.tasks.length > 0) {
    sections.push(currentSection);
  }

  // Generate Milestones from Top Headings or detected phases
  const milestones: PlanMilestone[] = [];
  const majorSections = sections.filter((s) => s.level <= 2);

  if (majorSections.length > 0) {
    majorSections.forEach((sec, idx) => {
      const relatedTasks = tasks.filter((t) => t.sectionId === sec.id);
      const allDone = relatedTasks.length > 0 && relatedTasks.every((t) => t.status === 'done');
      const anyProgress = relatedTasks.some((t) => t.status === 'in_progress' || t.status === 'done');

      milestones.push({
        id: `ms-${idx + 1}`,
        title: sec.title,
        status: allDone ? 'completed' : anyProgress ? 'in_progress' : 'pending',
        description: sec.content[0] || `Execution phase covering ${relatedTasks.length} plan deliverables.`,
        taskIds: relatedTasks.map((t) => t.id),
      });
    });
  } else {
    // Group into 3 standard milestones if no major sections
    const chunkSize = Math.max(1, Math.ceil(tasks.length / 3));
    const phases = ['Foundation & Setup', 'Core Implementation', 'Verification & Deployment'];
    phases.forEach((pTitle, idx) => {
      const pTasks = tasks.slice(idx * chunkSize, (idx + 1) * chunkSize);
      milestones.push({
        id: `ms-${idx + 1}`,
        title: pTitle,
        status: idx === 0 ? 'in_progress' : 'pending',
        description: `Phase ${idx + 1} execution milestone`,
        taskIds: pTasks.map((t) => t.id),
      });
    });
  }

  const rawText = allParagraphs.join('\n\n');
  const wordCount = rawText ? rawText.split(/\s+/).filter(Boolean).length : 0;

  return {
    documentId,
    title,
    revisionId,
    sections,
    tasks,
    milestones,
    rawText,
    tableCount,
    wordCount,
    lastSyncedAt: new Date().toISOString(),
  };
}
