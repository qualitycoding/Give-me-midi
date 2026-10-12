import React, { useState } from 'react';
import { ParsedGoogleDoc, PlanTask } from '../lib/types';
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Copy,
  Check,
  ShieldAlert,
  Layers,
  Sparkles,
  TrendingUp,
  FileCheck,
  Printer,
  FileSpreadsheet,
  FolderPlus
} from 'lucide-react';

interface AnalyticsViewProps {
  doc: ParsedGoogleDoc;
  tasks: PlanTask[];
  onOpenExportDocsModal?: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  doc,
  tasks,
  onOpenExportDocsModal,
}) => {
  const [copiedMd, setCopiedMd] = useState(false);

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const review = tasks.filter((t) => t.status === 'review').length;
  const todo = tasks.filter((t) => t.status === 'todo').length;

  const critical = tasks.filter((t) => t.priority === 'critical');
  const criticalDone = critical.filter((t) => t.status === 'done').length;

  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  const generateMarkdownReport = () => {
    let md = `# Plan Execution Status: ${doc.title}\n\n`;
    md += `**Document ID:** \`${doc.documentId}\`\n`;
    md += `**Generated:** ${new Date().toLocaleString()}\n`;
    md += `**Overall Progress:** ${completionRate}% (${done}/${total} Completed)\n\n`;

    md += `## Executive Summary\n`;
    md += `- Completed Tasks: ${done}\n`;
    md += `- In Progress: ${inProgress}\n`;
    md += `- In Review: ${review}\n`;
    md += `- Pending / Backlog: ${todo}\n`;
    md += `- Critical Items: ${criticalDone}/${critical.length} Resolved\n\n`;

    md += `## Milestones Status\n`;
    for (const ms of doc.milestones) {
      const msTasks = tasks.filter((t) => ms.taskIds.includes(t.id));
      const msDone = msTasks.filter((t) => t.status === 'done').length;
      md += `### ${ms.title} (${ms.status.toUpperCase()})\n`;
      md += `${ms.description}\n`;
      md += `Progress: ${msDone}/${msTasks.length} tasks completed\n\n`;
    }

    md += `## Action Items by Status\n`;
    for (const st of ['todo', 'in_progress', 'review', 'done'] as const) {
      const group = tasks.filter((t) => t.status === st);
      md += `### ${st.toUpperCase()} (${group.length})\n`;
      for (const t of group) {
        md += `- [${t.status === 'done' ? 'x' : ' '}] **[${t.priority.toUpperCase()}]** ${t.title}${
          t.assignee ? ` (@${t.assignee})` : ''
        }\n`;
      }
      md += `\n`;
    }

    return md;
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownReport();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plan-execution-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const data = {
      documentId: doc.documentId,
      title: doc.title,
      exportedAt: new Date().toISOString(),
      completionRate,
      tasks,
      milestones: doc.milestones,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plan-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    const headers = ['Task ID', 'Deliverable Title', 'Status', 'Priority', 'Assignee', 'Target Date', 'Section', 'Description'];
    const rows = tasks.map((t) => [
      `"${t.id}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${t.status.toUpperCase()}"`,
      `"${t.priority.toUpperCase()}"`,
      `"${(t.assignee || '').replace(/"/g, '""')}"`,
      `"${t.dueDate || ''}"`,
      `"${(t.sectionTitle || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plan-deliverables-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdownReport();
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Overall Completion</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{completionRate}%</span>
            <span className="text-xs text-slate-500">of total deliverables</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-emerald-600">{done}</span>
            <span className="text-xs text-slate-500">/ {total} tasks</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">Verified and done</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>In Progress</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-blue-600">{inProgress}</span>
            <span className="text-xs text-slate-500">active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">Under execution</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>In Review</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-purple-600">{review}</span>
            <span className="text-xs text-slate-500">review</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">Awaiting sign-off</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Critical Priority</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-rose-600">{critical.length - criticalDone}</span>
            <span className="text-xs text-slate-500">unresolved</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">{criticalDone} of {critical.length} finished</p>
        </div>
      </div>

      {/* Two columns: Risk & Priority breakdown + Export toolkit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority & Risk Assessment */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Priority Distribution & Blockers</span>
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Critical Priority', list: tasks.filter((t) => t.priority === 'critical'), color: 'bg-rose-500' },
              { label: 'High Priority', list: tasks.filter((t) => t.priority === 'high'), color: 'bg-amber-500' },
              { label: 'Medium Priority', list: tasks.filter((t) => t.priority === 'medium'), color: 'bg-blue-500' },
              { label: 'Low Priority', list: tasks.filter((t) => t.priority === 'low'), color: 'bg-slate-400' },
            ].map((pGroup) => {
              const pDone = pGroup.list.filter((t) => t.status === 'done').length;
              const pct = pGroup.list.length > 0 ? Math.round((pDone / pGroup.list.length) * 100) : 0;
              return (
                <div key={pGroup.label} className="p-3 bg-slate-50 rounded-lg space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{pGroup.label}</span>
                    <span className="text-slate-500">
                      {pDone} / {pGroup.list.length} completed ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className={`${pGroup.color} h-full rounded-full`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Export & Report center */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Download className="w-4 h-4 text-blue-600" />
              <span>Export & Stakeholder Reporting</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Export your plan execution status to share with stakeholders or integrate into project tracking systems.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {onOpenExportDocsModal && (
              <button
                onClick={onOpenExportDocsModal}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50/70 hover:from-blue-100/70 hover:to-indigo-100/70 transition-all text-xs font-bold text-blue-900 group shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FolderPlus className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-blue-950 font-bold">Export All Artifacts to Google Docs Folder</span>
                    <p className="text-[11px] text-blue-700/80 font-normal mt-0.5">
                      Creates a dedicated Google Drive folder with all 4 project documents
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 text-[11px] font-semibold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  Export
                </span>
              </button>
            )}

            <button
              onClick={handleDownloadMarkdown}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors text-xs font-semibold text-slate-800 group"
            >
              <div className="flex items-center space-x-2.5">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <div className="text-left">
                  <span>Download Markdown Status Report</span>
                  <p className="text-[11px] text-slate-400 font-normal">
                    Complete executive report with summary and tasks
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            </button>

            <button
              onClick={handleDownloadJSON}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors text-xs font-semibold text-slate-800 group"
            >
              <div className="flex items-center space-x-2.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <div className="text-left">
                  <span>Download Plan Data (JSON)</span>
                  <p className="text-[11px] text-slate-400 font-normal">
                    Structured data model for programmatic sync
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </button>

            <button
              onClick={handleDownloadCSV}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors text-xs font-semibold text-slate-800 group"
            >
              <div className="flex items-center space-x-2.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <div className="text-left">
                  <span>Download Tasks Spreadsheet (CSV)</span>
                  <p className="text-[11px] text-slate-400 font-normal">
                    Compatible with Google Sheets and Excel
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
            </button>

            <button
              onClick={() => window.print()}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors text-xs font-semibold text-slate-800 group"
            >
              <div className="flex items-center space-x-2.5">
                <Printer className="w-4 h-4 text-emerald-600" />
                <div className="text-left">
                  <span>Print / Save as PDF Executive Brief</span>
                  <p className="text-[11px] text-slate-400 font-normal">
                    Clean, presentation-ready layout for stakeholders
                  </p>
                </div>
              </div>
              <Printer className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-800"
            >
              <div className="flex items-center space-x-2.5">
                {copiedMd ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <div className="text-left">
                  <span>{copiedMd ? 'Report Copied to Clipboard!' : 'Copy Summary to Clipboard'}</span>
                  <p className="text-[11px] text-slate-400 font-normal">
                    Quickly paste into email, Slack, or documents
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
