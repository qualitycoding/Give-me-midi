import React from 'react';
import { PlanMilestone, PlanTask } from '../lib/types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Flag,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckSquare,
  Square
} from 'lucide-react';

interface RoadmapViewProps {
  milestones: PlanMilestone[];
  tasks: PlanTask[];
  onUpdateMilestoneStatus: (milestoneId: string, status: 'pending' | 'in_progress' | 'completed') => void;
  onOpenTaskModal: (task: PlanTask) => void;
  onToggleTaskStatus?: (task: PlanTask) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  milestones,
  tasks,
  onUpdateMilestoneStatus,
  onOpenTaskModal,
  onToggleTaskStatus,
}) => {
  return (
    <div className="space-y-6">
      {/* Top summary card */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plan Execution Roadmap</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Strategic Phases & Milestones
          </h2>
          <p className="text-sm text-blue-100/90 leading-relaxed">
            Track implementation progress across key milestones extracted from your document plan. Monitor deliverables, completion rates, and target dates.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10 pointer-events-none">
          <Flag className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Milestones Timeline */}
      <div className="space-y-4">
        {milestones.map((ms, index) => {
          const msTasks = tasks.filter((t) => ms.taskIds.includes(t.id));
          const completedTasks = msTasks.filter((t) => t.status === 'done');
          const progressPercent =
            msTasks.length > 0 ? Math.round((completedTasks.length / msTasks.length) * 100) : 0;

          const isCompleted = ms.status === 'completed' || (msTasks.length > 0 && progressPercent === 100);
          const isInProgress = ms.status === 'in_progress' || (progressPercent > 0 && progressPercent < 100);

          return (
            <div
              key={ms.id}
              className={`bg-white rounded-xl border transition-all p-5 shadow-2xs ${
                isCompleted
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : isInProgress
                  ? 'border-blue-300 ring-1 ring-blue-100'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isInProgress
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : `0${index + 1}`}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-slate-900 text-base">{ms.title}</h3>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isInProgress
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-xl">{ms.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {ms.targetDate && (
                    <div className="text-right text-xs">
                      <span className="text-slate-400 block">Target Date</span>
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {ms.targetDate}
                      </span>
                    </div>
                  )}

                  {/* Manual milestone status switcher */}
                  <select
                    value={ms.status}
                    onChange={(e) =>
                      onUpdateMilestoneStatus(
                        ms.id,
                        e.target.value as 'pending' | 'in_progress' | 'completed'
                      )
                    }
                    className="text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Set Pending</option>
                    <option value="in_progress">Set In Progress</option>
                    <option value="completed">Set Completed</option>
                  </select>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>
                    Deliverables: {completedTasks.length} of {msTasks.length} Done
                  </span>
                  <span className="font-bold text-slate-800">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Checklist items in milestone */}
              {msTasks.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {msTasks.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200/60 text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (onToggleTaskStatus) {
                            onToggleTaskStatus(t);
                          }
                        }}
                        className="text-slate-500 hover:text-blue-600 mr-2 shrink-0 p-0.5"
                        title={t.status === 'done' ? 'Mark In Progress' : 'Mark Done'}
                      >
                        {t.status === 'done' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenTaskModal(t)}
                        className="text-left flex-1 truncate"
                      >
                        <span className={t.status === 'done' ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}>
                          {t.title}
                        </span>
                      </button>

                      {t.subtasks && t.subtasks.length > 0 && (
                        <span className="ml-1 text-[10px] text-slate-400 font-mono shrink-0">
                          {t.subtasks.filter((s) => s.completed).length}/{t.subtasks.length}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
