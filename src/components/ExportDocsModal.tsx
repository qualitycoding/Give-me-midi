import React, { useState } from 'react';
import {
  FolderPlus,
  FileText,
  ExternalLink,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
  FolderCheck,
  ShieldCheck
} from 'lucide-react';
import { GoogleDriveExportResult } from '../lib/googleDriveExport';

interface ExportDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExport: () => Promise<GoogleDriveExportResult>;
  docTitle: string;
}

export const ExportDocsModal: React.FC<ExportDocsModalProps> = ({
  isOpen,
  onClose,
  onConfirmExport,
  docTitle,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<GoogleDriveExportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const res = await onConfirmExport();
      setResult(res);
    } catch (err: any) {
      console.error('Export error:', err);
      setError(err.message || 'Failed to export artifacts to Google Drive.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      setResult(null);
      setError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Export Artifacts to Google Docs Folder
              </h3>
              <p className="text-[11px] text-slate-500">Google Drive & Docs Workspace Export</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isExporting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {result ? (
            /* Success State */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-emerald-800">
                    Artifacts Successfully Exported!
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Created dedicated folder <strong>"{result.folderName}"</strong> in your Google Drive with all 4 project documents.
                  </p>
                </div>
              </div>

              {/* Primary Link: Open Folder */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <FolderCheck className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-800">Google Drive Project Folder</span>
                    <p className="text-[11px] text-slate-500">Contains all created Google Docs</p>
                  </div>
                </div>
                <a
                  href={result.folderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                >
                  <span>Open Folder in Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Created Google Docs List */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Exported Google Docs ({result.documents.length})
                </span>
                <div className="space-y-1.5">
                  {result.documents.map((d, i) => (
                    <a
                      key={d.id}
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="text-xs font-medium text-slate-800 truncate group-hover:text-blue-600">
                          {d.title}
                        </span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Confirmation State */
            <div className="space-y-4">
              <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                <p className="text-sm font-medium text-slate-800">
                  Are you sure you want to export all project artifacts into a new Google Docs folder in your Google Drive?
                </p>
                <p>
                  This operation will create a folder named <strong>"DocPlan - {docTitle} [Artifacts]"</strong> containing four newly formatted Google Docs:
                </p>
              </div>

              {/* Artifacts Breakdown */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                  <div>
                    <span className="font-semibold text-slate-800">Executive Status Brief & Metrics</span>
                    <p className="text-[11px] text-slate-500">Progress rate, milestone velocity, and critical blockers.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                  <div>
                    <span className="font-semibold text-slate-800">Deliverables & Execution Matrix</span>
                    <p className="text-[11px] text-slate-500">Complete task registry organized by stage with subtask checklists and assignees.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                  <div>
                    <span className="font-semibold text-slate-800">Roadmap & Milestones Specification</span>
                    <p className="text-[11px] text-slate-500">Phased delivery schedule, target dates, and deliverables per phase.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">4</span>
                  <div>
                    <span className="font-semibold text-slate-800">Plan Document Archive</span>
                    <p className="text-[11px] text-slate-500">Full structured text and table backup from the original plan.</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold">Export Failed:</span> {error}
                  </div>
                </div>
              )}

              {/* Confirmation Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Authorized via Google Workspace API</span>
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isExporting}
                    className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={isExporting}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs transition-colors disabled:opacity-70 cursor-pointer"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Creating Folder & Docs...</span>
                      </>
                    ) : (
                      <>
                        <FolderPlus className="w-3.5 h-3.5" />
                        <span>Confirm & Export to Drive</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
