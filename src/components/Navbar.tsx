import React from 'react';
import { AppUser } from '../lib/firebase';
import { GoogleSignInButton } from './GoogleSignInButton';
import { FileText, LogOut, CheckCircle2, ShieldCheck, Sparkles, ExternalLink, FolderPlus } from 'lucide-react';

interface NavbarProps {
  user: AppUser | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  hasLiveToken: boolean;
  docTitle: string;
  docId: string;
  onExportArtifacts?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  hasLiveToken,
  docTitle,
  docId,
  onExportArtifacts,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">DocPlan</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Executor
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block truncate max-w-xs md:max-w-md">
                Plan: <span className="font-medium text-slate-700">{docTitle}</span>
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-3">
            {/* Export Artifacts to Google Docs Folder */}
            {onExportArtifacts && (
              <button
                onClick={onExportArtifacts}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors shadow-2xs"
                title="Export all artifacts into a Google Docs folder"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Export to Drive Folder</span>
              </button>
            )}

            {/* Direct Link to Google Doc */}
            <a
              href={`https://docs.google.com/document/d/${docId}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 border border-slate-200 transition-colors"
              title="Open document in Google Docs"
            >
              <span>Open in Google Docs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Sync / Token indicator */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
              {hasLiveToken ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-emerald-700">Google Docs API Connected</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-amber-800">Auth Required for Live Doc</span>
                </>
              )}
            </div>

            {/* Auth controls */}
            {user ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
                <div className="flex items-center space-x-2">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full border border-slate-300"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center">
                      {(user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="hidden lg:block text-left text-xs">
                    <p className="font-medium text-slate-800 truncate max-w-[130px]">
                      {user.displayName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate max-w-[130px]">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign out of Google"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <GoogleSignInButton
                onClick={onLogin}
                loading={isLoggingIn}
                label="Sign in to Sync Plan"
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
