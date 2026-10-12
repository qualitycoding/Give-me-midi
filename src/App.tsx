import React, { useState, useEffect, useCallback } from 'react';
import { initAuth, googleSignIn, logout, getAccessToken, AppUser } from './lib/firebase';
import { fetchGoogleDocument, DEFAULT_DOC_URL, DEFAULT_DOC_ID, extractDocumentId } from './lib/googleDocs';
import { SAMPLE_PLAN } from './lib/samplePlan';
import { ParsedGoogleDoc, PlanTask, PlanMilestone, TaskStatus } from './lib/types';
import { Navbar } from './components/Navbar';
import { DocSyncBar } from './components/DocSyncBar';
import { KanbanBoard } from './components/KanbanBoard';
import { DocumentViewer } from './components/DocumentViewer';
import { RoadmapView } from './components/RoadmapView';
import { AnalyticsView } from './components/AnalyticsView';
import { TaskModal } from './components/TaskModal';
import { ExportDocsModal } from './components/ExportDocsModal';
import { exportAllArtifactsToGoogleDrive } from './lib/googleDriveExport';
import {
  Kanban,
  FileText,
  Milestone,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

const LOCAL_STORAGE_TASKS_KEY = 'docplan_custom_tasks_v1';

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [currentDocUrl, setCurrentDocUrl] = useState<string>(DEFAULT_DOC_URL);
  const [docData, setDocData] = useState<ParsedGoogleDoc>(SAMPLE_PLAN);
  const [tasks, setTasks] = useState<PlanTask[]>(SAMPLE_PLAN.tasks);
  const [milestones, setMilestones] = useState<PlanMilestone[]>(SAMPLE_PLAN.milestones);

  const [activeTab, setActiveTab] = useState<'board' | 'document' | 'roadmap' | 'analytics'>('board');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Modal state
  const [selectedTask, setSelectedTask] = useState<PlanTask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [isExportDocsModalOpen, setIsExportDocsModalOpen] = useState<boolean>(false);

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setHasToken(Boolean(token));
      },
      () => {
        setUser(null);
        setHasToken(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Load saved local task overrides if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTasks(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save tasks to local storage whenever they change
  const saveTasks = useCallback((updatedTasks: PlanTask[]) => {
    setTasks(updatedTasks);
    try {
      localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(updatedTasks));
    } catch {
      // Ignore
    }
  }, []);

  // Handle Sign In with Google
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setSyncError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setHasToken(true);
        // Automatically attempt to sync document after sign-in
        await syncDocWithToken(currentDocUrl, result.accessToken);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      let msg = err.message || 'Failed to sign in with Google.';
      if (msg.includes('auth/network-request-failed') || msg.includes('network-request-failed')) {
        msg = 'Connection to Google Auth was interrupted. Please ensure pop-ups are allowed and try clicking Sign In again.';
      } else if (msg.includes('popup-closed-by-user')) {
        msg = 'Sign-in window was closed before completing authorization.';
      }
      setSyncError(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setHasToken(false);
  };

  // Sync document function
  const syncDocWithToken = async (urlOrId: string, token: string) => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const cleanId = extractDocumentId(urlOrId);
      const parsedDoc = await fetchGoogleDocument(cleanId, token);
      setDocData(parsedDoc);
      saveTasks(parsedDoc.tasks);
      setMilestones(parsedDoc.milestones);
      setIsDemoMode(false);
    } catch (err: any) {
      console.error('Document sync error:', err);
      setSyncError(
        err.message || 'Could not fetch document. Please verify access permissions.'
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSync = async (urlOrId: string) => {
    setCurrentDocUrl(urlOrId);
    const token = await getAccessToken();
    if (!token) {
      setSyncError(
        'Google authentication is required to access Google Docs. Please sign in with your Google account.'
      );
      handleLogin();
      return;
    }
    await syncDocWithToken(urlOrId, token);
  };

  const handleResetDefault = () => {
    setCurrentDocUrl(DEFAULT_DOC_URL);
    setDocData(SAMPLE_PLAN);
    saveTasks(SAMPLE_PLAN.tasks);
    setMilestones(SAMPLE_PLAN.milestones);
    setIsDemoMode(true);
    setSyncError(null);
  };

  // Task actions
  const handleUpdateTask = (updatedTask: PlanTask) => {
    const next = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    saveTasks(next);
  };

  const handleAddTask = (newTaskData: Omit<PlanTask, 'id'>) => {
    const newTask: PlanTask = {
      ...newTaskData,
      id: `task-${Date.now()}`,
    };
    saveTasks([newTask, ...tasks]);
  };

  const handleDeleteTask = (taskId: string) => {
    const next = tasks.filter((t) => t.id !== taskId);
    saveTasks(next);
  };

  const handleAddTaskFromDoc = (text: string, sectionTitle: string) => {
    const newTask: PlanTask = {
      id: `task-${Date.now()}`,
      title: text.slice(0, 100),
      description: text,
      status: 'todo',
      priority: 'medium',
      sectionTitle,
    };
    saveTasks([newTask, ...tasks]);
    setActiveTab('board');
  };

  const handleUpdateMilestoneStatus = (
    milestoneId: string,
    newStatus: 'pending' | 'in_progress' | 'completed'
  ) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === milestoneId ? { ...m, status: newStatus } : m))
    );
  };

  const handleConfirmExportDocs = async () => {
    let token = await getAccessToken();
    if (!token) {
      const res = await googleSignIn();
      if (!res?.accessToken) {
        throw new Error('Google authorization is required to create Drive folders and Docs.');
      }
      token = res.accessToken;
      setUser(res.user);
      setHasToken(true);
    }
    return await exportAllArtifactsToGoogleDrive(docData, tasks, token);
  };

  const openTaskModal = (task: PlanTask) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  // Calculations for tab badges
  const completedCount = tasks.filter((t) => t.status === 'done').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const completionPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased">
      {/* Top Navbar */}
      <Navbar
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        hasLiveToken={hasToken}
        docTitle={docData.title}
        docId={docData.documentId}
        onExportArtifacts={() => setIsExportDocsModalOpen(true)}
      />

      {/* Sync bar for Google Docs URL */}
      <DocSyncBar
        currentDocUrl={currentDocUrl}
        onSync={handleManualSync}
        isSyncing={isSyncing}
        lastSyncedAt={docData.lastSyncedAt}
        syncError={syncError}
        hasToken={hasToken}
        onLogin={handleLogin}
        onResetDefault={handleResetDefault}
        isDemoMode={isDemoMode}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('board')}
              className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'board'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Execution Board</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  activeTab === 'board' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tasks.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('document')}
              className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'document'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Plan Document</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  activeTab === 'document' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {docData.sections.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('roadmap')}
              className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'roadmap'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Milestone className="w-4 h-4" />
              <span>Milestones & Roadmap</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  activeTab === 'roadmap' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {milestones.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Executive Analytics</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  activeTab === 'analytics'
                    ? 'bg-blue-700 text-white'
                    : 'bg-emerald-100 text-emerald-800 font-bold'
                }`}
              >
                {completionPercent}%
              </span>
            </button>
          </div>

          {/* Quick stats pills */}
          <div className="hidden lg:flex items-center space-x-3 text-xs text-slate-600">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Done: <strong>{completedCount}</strong></span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Active: <strong>{inProgressCount}</strong></span>
            </span>
            <span className="text-slate-300">|</span>
            <span>Total: <strong>{tasks.length}</strong></span>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'board' && (
          <KanbanBoard
            tasks={tasks}
            onUpdateTask={handleUpdateTask}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onOpenTaskModal={openTaskModal}
          />
        )}

        {activeTab === 'document' && (
          <DocumentViewer
            doc={docData}
            onAddTaskFromDoc={handleAddTaskFromDoc}
            onOpenTaskModal={openTaskModal}
          />
        )}

        {activeTab === 'roadmap' && (
          <RoadmapView
            milestones={milestones}
            tasks={tasks}
            onUpdateMilestoneStatus={handleUpdateMilestoneStatus}
            onOpenTaskModal={openTaskModal}
            onToggleTaskStatus={(task) =>
              handleUpdateTask({ ...task, status: task.status === 'done' ? 'in_progress' : 'done' })
            }
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            doc={docData}
            tasks={tasks}
            onOpenExportDocsModal={() => setIsExportDocsModalOpen(true)}
          />
        )}
      </main>

      {/* Task Edit Modal */}
      {isTaskModalOpen && selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}

      {/* Export to Google Docs Folder Modal */}
      <ExportDocsModal
        isOpen={isExportDocsModalOpen}
        onClose={() => setIsExportDocsModalOpen(false)}
        onConfirmExport={handleConfirmExportDocs}
        docTitle={docData.title}
      />
    </div>
  );
}
