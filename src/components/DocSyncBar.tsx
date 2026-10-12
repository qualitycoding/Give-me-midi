import React, { useState } from 'react';
import { RefreshCw, Link2, AlertCircle, CheckCircle, Info, ExternalLink, Sparkles } from 'lucide-react';
import { DEFAULT_DOC_URL } from '../lib/googleDocs';

interface DocSyncBarProps {
  currentDocUrl: string;
  onSync: (docUrl: string) => void;
  isSyncing: boolean;
  lastSyncedAt?: string;
  syncError?: string | null;
  hasToken: boolean;
  onLogin: () => void;
  onResetDefault: () => void;
  isDemoMode: boolean;
}

export const DocSyncBar: React.FC<DocSyncBarProps> = ({
  currentDocUrl,
  onSync,
  isSyncing,
  lastSyncedAt,
  syncError,
  hasToken,
  onLogin,
  onResetDefault,
  isDemoMode,
}) => {
  const [inputUrl, setInputUrl] = useState(currentDocUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onSync(inputUrl.trim());
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* URL Input and Action */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          <div className="relative flex-1 min-w-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Link2 className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste Google Docs URL or Document ID..."
              className="block w-full pl-9 pr-24 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono"
            />
            {inputUrl !== DEFAULT_DOC_URL && (
              <button
                type="button"
                onClick={() => {
                  setInputUrl(DEFAULT_DOC_URL);
                  onResetDefault();
                }}
                className="absolute inset-y-0 right-2 my-auto px-2 py-0.5 text-[11px] text-blue-600 hover:text-blue-800 font-medium h-fit"
              >
                Reset Default
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSyncing}
              className={`inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                isSyncing
                  ? 'bg-blue-400 text-white cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white hover:shadow'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync from Docs'}</span>
            </button>
          </div>
        </form>

        {/* Status / Notice alerts */}
        {syncError ? (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-semibold text-amber-800">Sync Notice</p>
              <p className="text-amber-700">{syncError}</p>
              {!hasToken && (
                <div className="pt-1">
                  <button
                    onClick={onLogin}
                    className="inline-flex items-center space-x-1 font-semibold text-blue-700 hover:text-blue-900 underline"
                  >
                    <span>Click here to sign in with your Google account</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : isDemoMode ? (
          <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Plan Workspace Loaded:</strong> Ready to track, execute, and breakdown your plan deliverables. Sign in with Google to live-sync changes directly from your Google Doc.
              </span>
            </div>
            {!hasToken && (
              <button
                onClick={onLogin}
                className="text-xs font-semibold px-2.5 py-1 bg-white border border-blue-300 rounded shadow-xs text-blue-700 hover:bg-blue-50 transition-colors"
              >
                Sign in with Google
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Live Google Docs integration active</span>
            </div>
            {lastSyncedAt && (
              <span>Last synced: {new Date(lastSyncedAt).toLocaleTimeString()}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
