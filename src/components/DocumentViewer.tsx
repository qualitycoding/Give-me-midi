import React, { useState } from 'react';
import { ParsedGoogleDoc, PlanTask } from '../lib/types';
import {
  FileText,
  ListOrdered,
  Table,
  CheckCircle2,
  Circle,
  ExternalLink,
  Copy,
  Check,
  Hash,
  Layers,
  Sparkles,
  Bookmark
} from 'lucide-react';

interface DocumentViewerProps {
  doc: ParsedGoogleDoc;
  onAddTaskFromDoc: (text: string, sectionTitle: string) => void;
  onOpenTaskModal: (task: PlanTask) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  doc,
  onAddTaskFromDoc,
  onOpenTaskModal,
}) => {
  const [activeSectionId, setActiveSectionId] = useState<string>(doc.sections[0]?.id || '');
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [docSearch, setDocSearch] = useState('');

  const filteredSections = docSearch.trim()
    ? doc.sections.filter(
        (s) =>
          s.title.toLowerCase().includes(docSearch.toLowerCase()) ||
          s.content.some((c) => c.toLowerCase().includes(docSearch.toLowerCase())) ||
          s.tasks.some((t) => t.title.toLowerCase().includes(docSearch.toLowerCase()))
      )
    : doc.sections;

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(doc.rawText);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900">{doc.title}</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
              ID: {doc.documentId.slice(0, 10)}...
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
            <span>{doc.sections.length} Sections</span>
            <span>•</span>
            <span>{doc.tasks.length} Action Items Extracted</span>
            <span>•</span>
            <span>{doc.wordCount.toLocaleString()} Words</span>
            {doc.tableCount > 0 && (
              <>
                <span>•</span>
                <span>{doc.tableCount} Tables</span>
              </>
            )}
            {doc.revisionId && (
              <>
                <span>•</span>
                <span className="font-mono text-[11px]">Rev {doc.revisionId.slice(0, 8)}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-xs">
            <button
              onClick={() => setViewMode('formatted')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'formatted'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Formatted Plan
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'raw'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Raw Document Text
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search document..."
              value={docSearch}
              onChange={(e) => setDocSearch(e.target.value)}
              className="pl-3 pr-7 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white w-40 sm:w-48"
            />
            {docSearch && (
              <button
                type="button"
                onClick={() => setDocSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <a
            href={`https://docs.google.com/document/d/${doc.documentId}/edit`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <span>Open in Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {viewMode === 'raw' ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Document Text Export
            </span>
            <button
              onClick={handleCopyRaw}
              className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              {copiedRaw ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedRaw ? 'Copied' : 'Copy Full Text'}</span>
            </button>
          </div>
          <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed max-h-[600px] overflow-y-auto bg-slate-50 p-4 rounded-lg border border-slate-200">
            {doc.rawText || 'No text extracted from document.'}
          </pre>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Table of Contents sidebar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 lg:sticky lg:top-24">
            <div className="flex items-center space-x-2 pb-3 mb-3 border-b border-slate-100 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Bookmark className="w-4 h-4 text-blue-600" />
              <span>Table of Contents</span>
            </div>
            <nav className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
              {filteredSections.map((section, idx) => {
                const isActive = activeSectionId === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSectionId(section.id);
                      const el = document.getElementById(section.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600 pl-2'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate pr-2">
                      {idx + 1}. {section.title}
                    </span>
                    {section.tasks.length > 0 && (
                      <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {section.tasks.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Document Content reader */}
          <div className="lg:col-span-3 space-y-6">
            {filteredSections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    {section.title}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    H{section.level} Section
                  </span>
                </div>

                {/* Section Content Paragraphs */}
                <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                  {section.content.map((paragraph, pIdx) => {
                    const isTable = paragraph.startsWith('[Table');
                    if (isTable) {
                      return (
                        <div
                          key={pIdx}
                          className="bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-x-auto text-xs font-mono"
                        >
                          <div className="flex items-center gap-1.5 font-bold text-slate-600 mb-2">
                            <Table className="w-3.5 h-3.5" />
                            <span>Document Table Data</span>
                          </div>
                          <pre className="whitespace-pre text-slate-700">{paragraph}</pre>
                        </div>
                      );
                    }
                    return (
                      <div
                        key={pIdx}
                        className="group flex items-start justify-between gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <p className="flex-1">{paragraph}</p>
                        <button
                          onClick={() => onAddTaskFromDoc(paragraph, section.title)}
                          className="opacity-0 group-hover:opacity-100 shrink-0 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 bg-white border border-blue-200 rounded shadow-2xs transition-all"
                          title="Extract as actionable task in execution board"
                        >
                          + Turn into Task
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Associated Tasks in this section */}
                {section.tasks.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Plan Action Items ({section.tasks.length})</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {section.tasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => onOpenTaskModal(task)}
                          className="flex items-start space-x-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-2xs cursor-pointer transition-all"
                        >
                          {task.status === 'done' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs font-medium leading-tight ${
                                task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'
                              }`}
                            >
                              {task.title}
                            </p>
                            <span className="text-[10px] text-slate-500 capitalize">
                              Status: {task.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
