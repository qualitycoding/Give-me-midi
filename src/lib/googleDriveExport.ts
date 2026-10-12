import { ParsedGoogleDoc, PlanTask } from './types';

export interface ExportedGoogleDocArtifact {
  id: string;
  title: string;
  url: string;
}

export interface GoogleDriveExportResult {
  folderId: string;
  folderName: string;
  folderUrl: string;
  documents: ExportedGoogleDocArtifact[];
}

/**
 * Creates a folder in Google Drive
 */
async function createDriveFolder(folderName: string, accessToken: string): Promise<string> {
  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Failed to create Google Drive folder (${res.status})`
    );
  }

  const data = await res.json();
  return data.id;
}

/**
 * Creates a Google Doc, moves it into target folder, and writes content
 */
async function createAndPopulateDoc(
  title: string,
  content: string,
  folderId: string,
  accessToken: string
): Promise<ExportedGoogleDocArtifact> {
  // 1. Create blank Google Doc
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Failed to create Google Doc "${title}" (${createRes.status})`
    );
  }

  const docData = await createRes.json();
  const documentId = docData.documentId;

  // 2. Add to folder in Drive
  await fetch(
    `https://www.googleapis.com/drive/v3/files/${documentId}?addParents=${folderId}&enforceSingleParent=true`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  ).catch((e) => {
    console.warn('Could not move doc into folder, doc will remain at Drive root:', e);
  });

  // 3. Insert content text into Google Doc
  if (content && content.trim().length > 0) {
    await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: content,
            },
          },
        ],
      }),
    });
  }

  return {
    id: documentId,
    title,
    url: `https://docs.google.com/document/d/${documentId}/edit`,
  };
}

/**
 * Exports all project plan artifacts to a designated Google Drive folder
 */
export async function exportAllArtifactsToGoogleDrive(
  doc: ParsedGoogleDoc,
  tasks: PlanTask[],
  accessToken: string
): Promise<GoogleDriveExportResult> {
  const timestamp = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const folderName = `DocPlan - ${doc.title} [Artifacts ${timestamp}]`;

  // Step 1: Create Google Drive folder
  const folderId = await createDriveFolder(folderName, accessToken);
  const folderUrl = `https://drive.google.com/drive/folders/${folderId}`;

  const done = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const review = tasks.filter((t) => t.status === 'review').length;
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const completionRate = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
  const critical = tasks.filter((t) => t.priority === 'critical');
  const criticalDone = critical.filter((t) => t.status === 'done').length;

  // Artifact 1: Executive Status Brief
  let briefContent = `EXECUTIVE STATUS BRIEF & METRICS\n`;
  briefContent += `Plan Document: ${doc.title}\n`;
  briefContent += `Exported: ${new Date().toLocaleString()}\n`;
  briefContent += `Source Document ID: ${doc.documentId}\n\n`;
  briefContent += `==========================================\n`;
  briefContent += `EXECUTIVE SUMMARY\n`;
  briefContent += `==========================================\n`;
  briefContent += `• Overall Progress: ${completionRate}% (${done} of ${tasks.length} deliverables completed)\n`;
  briefContent += `• In Progress: ${inProgress} tasks active\n`;
  briefContent += `• In Review: ${review} tasks awaiting sign-off\n`;
  briefContent += `• Pending / Backlog: ${todo} tasks\n`;
  briefContent += `• Critical Blockers: ${critical.length - criticalDone} open of ${critical.length} total\n\n`;
  briefContent += `==========================================\n`;
  briefContent += `MILESTONES OVERVIEW\n`;
  briefContent += `==========================================\n`;
  for (const ms of doc.milestones) {
    const msTasks = tasks.filter((t) => ms.taskIds.includes(t.id));
    const msDone = msTasks.filter((t) => t.status === 'done').length;
    briefContent += `\n[${ms.status.toUpperCase()}] ${ms.title}\n`;
    if (ms.targetDate) briefContent += `Target Date: ${ms.targetDate}\n`;
    briefContent += `${ms.description}\n`;
    briefContent += `Completion: ${msDone}/${msTasks.length} tasks completed\n`;
  }

  // Artifact 2: Deliverables & Tasks Matrix
  let tasksContent = `DELIVERABLES & EXECUTION MATRIX\n`;
  tasksContent += `Project: ${doc.title}\n`;
  tasksContent += `Total Deliverables: ${tasks.length} | Completed: ${done} (${completionRate}%)\n\n`;
  for (const st of ['todo', 'in_progress', 'review', 'done'] as const) {
    const group = tasks.filter((t) => t.status === st);
    tasksContent += `\n==========================================\n`;
    tasksContent += `STAGE: ${st.toUpperCase().replace('_', ' ')} (${group.length} items)\n`;
    tasksContent += `==========================================\n\n`;
    for (const t of group) {
      tasksContent += `[${t.status === 'done' ? 'X' : ' '}] ${t.title}\n`;
      tasksContent += `   Priority: ${t.priority.toUpperCase()} | Section: ${t.sectionTitle || 'General'}\n`;
      if (t.assignee) tasksContent += `   Assignee: ${t.assignee}\n`;
      if (t.dueDate) tasksContent += `   Due Date: ${t.dueDate}\n`;
      if (t.description) tasksContent += `   Scope: ${t.description}\n`;
      if (t.notes) tasksContent += `   Notes: ${t.notes}\n`;
      if (t.subtasks && t.subtasks.length > 0) {
        tasksContent += `   Checklist Items:\n`;
        for (const sub of t.subtasks) {
          tasksContent += `     [${sub.completed ? 'X' : ' '}] ${sub.text}\n`;
        }
      }
      tasksContent += `\n`;
    }
  }

  // Artifact 3: Roadmap & Milestones Specification
  let roadmapContent = `PHASED ROADMAP & MILESTONES SPECIFICATION\n`;
  roadmapContent += `Project: ${doc.title}\n`;
  roadmapContent += `Total Milestones: ${doc.milestones.length}\n\n`;
  doc.milestones.forEach((ms, idx) => {
    const msTasks = tasks.filter((t) => ms.taskIds.includes(t.id));
    const msDone = msTasks.filter((t) => t.status === 'done').length;
    const pct = msTasks.length > 0 ? Math.round((msDone / msTasks.length) * 100) : 0;
    roadmapContent += `------------------------------------------\n`;
    roadmapContent += `PHASE ${idx + 1}: ${ms.title}\n`;
    roadmapContent += `Status: ${ms.status.toUpperCase()} (${pct}% Done)\n`;
    if (ms.targetDate) roadmapContent += `Target Completion: ${ms.targetDate}\n`;
    roadmapContent += `------------------------------------------\n`;
    roadmapContent += `${ms.description}\n\n`;
    roadmapContent += `Deliverables Checklist (${msDone}/${msTasks.length}):\n`;
    for (const t of msTasks) {
      roadmapContent += `• [${t.status === 'done' ? 'X' : ' '}] ${t.title} [${t.priority.toUpperCase()}]\n`;
    }
    roadmapContent += `\n\n`;
  });

  // Artifact 4: Plan Document Archive
  let archiveContent = `PLAN DOCUMENT ARCHIVE\n`;
  archiveContent += `Title: ${doc.title}\n`;
  archiveContent += `Document ID: ${doc.documentId}\n`;
  archiveContent += `Word Count: ${doc.wordCount} | Sections: ${doc.sections.length}\n\n`;
  archiveContent += `==========================================\n`;
  archiveContent += `FULL DOCUMENT TEXT CONTENT\n`;
  archiveContent += `==========================================\n\n`;
  archiveContent += doc.rawText || 'No raw text archived.';

  // Step 2: Create all 4 Google Docs inside the newly created Google Drive folder
  const artifacts: ExportedGoogleDocArtifact[] = [];

  const doc1 = await createAndPopulateDoc(
    `1. Executive Status Brief - ${doc.title}`,
    briefContent,
    folderId,
    accessToken
  );
  artifacts.push(doc1);

  const doc2 = await createAndPopulateDoc(
    `2. Deliverables & Execution Matrix - ${doc.title}`,
    tasksContent,
    folderId,
    accessToken
  );
  artifacts.push(doc2);

  const doc3 = await createAndPopulateDoc(
    `3. Roadmap & Milestones Specification - ${doc.title}`,
    roadmapContent,
    folderId,
    accessToken
  );
  artifacts.push(doc3);

  const doc4 = await createAndPopulateDoc(
    `4. Plan Document Archive - ${doc.title}`,
    archiveContent,
    folderId,
    accessToken
  );
  artifacts.push(doc4);

  return {
    folderId,
    folderName,
    folderUrl,
    documents: artifacts,
  };
}
