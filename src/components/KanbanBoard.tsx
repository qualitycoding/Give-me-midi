import React, { useState } from 'react';
import { PlanTask, TaskStatus, TaskPriority } from '../lib/types';
import {
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  MoreVertical,
  User,
  Calendar,
  Filter,
  Search,
  Tag,
  Square
} from 'lucide-react';

interface KanbanBoardProps {
  tasks: PlanTask[];
  onUpdateTask: (task: PlanTask) => void;
  onAddTask: (task: Omit<PlanTask, 'id'>) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenTaskModal: (task: PlanTask) => void;
}

const COLUMNS: { id: TaskStatus; label: string; bg: string; border: string; badge: string }[] = [
  { id: 'todo', label: 'To Do / Backlog', bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-200 text-slate-700' },
  { id: 'in_progress', label: 'In Progress', bg: 'bg-blue-50/50', border: 'border-blue-200', badge: 'bg-blue-200 text-blue-800' },
  { id: 'review', label: 'In Review', bg: 'bg-purple-50/50', border: 'border-purple-200', badge: 'bg-purple-200 text-purple-800' },
  { id: 'done', label: 'Completed', bg: 'bg-emerald-50/50', border: 'border-emerald-200', badge: 'bg-emerald-200 text-emerald-800' },
];

const PRIORITY_BADGES: Record<TaskPriority, { label: string; class: string }> = {
  critical: { label: 'Critical', class: 'bg-rose-100 text-rose-700 border-rose-200' },
  high: { label: 'High', class: 'bg-amber-100 text-amber-800 border-amber-200' },
  medium: { label: 'Medium', class: 'bg-blue-100 text-blue-700 border-blue-200' },
  low: { label: 'Low', class: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onUpdateTask,
  onAddTask,
  onDeleteTask,
  onOpenTaskModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('todo');

  const uniqueAssignees = Array.from(
    new Set(tasks.map((t) => t.assignee).filter(Boolean) as string[])
  );

  const handleQuickAdd = (status: TaskStatus) => {
    if (!newTaskTitle.trim()) return;
    onAddTask({
      title: newTaskTitle.trim(),
      description: 'Custom plan item',
      status,
      priority: 'medium',
      assignee: 'Lead Engineer',
    });
    setNewTaskTitle('');
    setIsAdding(false);
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignee?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || t.assignee === assigneeFilter;
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  const moveTask = (task: PlanTask, nextStatus: TaskStatus) => {
    onUpdateTask({ ...task, status: nextStatus });
  };

  const toggleTaskDone = (task: PlanTask) => {
    const nextStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    onUpdateTask({ ...task, status: nextStatus });
  };

  return (
    <div className="space-y-4">
      {/* Controls & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search plan tasks, assignees, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5" />
            <span>Priority:</span>
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Assignee filter */}
          {uniqueAssignees.length > 0 && (
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Assignees</option>
              {uniqueAssignees.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Quick Add Modal Bar */}
      {isAdding && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-center gap-2 animate-fadeIn">
          <input
            type="text"
            placeholder="Enter plan item title..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd(newTaskStatus)}
            autoFocus
            className="flex-1 w-full px-3 py-1.5 text-xs bg-white border border-blue-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={newTaskStatus}
              onChange={(e) => setNewTaskStatus(e.target.value as TaskStatus)}
              className="text-xs bg-white border border-blue-300 rounded-lg px-2.5 py-1.5 text-slate-700"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Completed</option>
            </select>
            <button
              onClick={() => handleQuickAdd(newTaskStatus)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium"
            >
              Add
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-2.5 py-1.5 text-slate-600 hover:text-slate-800 rounded-lg text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              className={`flex flex-col rounded-xl border ${col.border} ${col.bg} p-3 min-h-[500px]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">
                    {col.label}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${col.badge}`}>
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Task Cards List */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-320px)] pr-0.5">
                {colTasks.length === 0 ? (
                  <div className="h-28 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                    <span>No tasks in this stage</span>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const pMeta = PRIORITY_BADGES[task.priority];
                    return (
                      <div
                        key={task.id}
                        className="group bg-white rounded-lg p-3 border border-slate-200 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer relative"
                        onClick={() => onOpenTaskModal(task)}
                      >
                        {/* Header with Priority, Section, and Quick Complete */}
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span
                            className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded border ${pMeta.class}`}
                          >
                            {task.priority === 'critical' && <Flame className="w-2.5 h-2.5 mr-1" />}
                            {pMeta.label}
                          </span>
                          
                          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => toggleTaskDone(task)}
                              title={task.status === 'done' ? 'Mark uncompleted' : 'Mark completed'}
                              className="p-1 rounded text-slate-400 hover:text-emerald-600 transition-colors"
                            >
                              {task.status === 'done' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className={`text-xs font-semibold leading-snug line-clamp-2 mb-1.5 ${
                          task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}>
                          {task.title}
                        </h4>

                        {/* Description */}
                        {task.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 mb-2">
                            {task.description}
                          </p>
                        )}

                        {/* Subtasks Progress Badge if available */}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="mb-2 flex items-center space-x-1.5 text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 w-fit">
                            <span className="font-medium text-slate-700">
                              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                            </span>
                            <span>checklist items</span>
                          </div>
                        )}

                        {/* Metadata row */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                          <div className="flex items-center space-x-2">
                            {task.assignee && (
                              <span className="flex items-center gap-1 text-slate-600 font-medium">
                                <User className="w-3 h-3 text-slate-400" />
                                <span className="truncate max-w-[80px]">{task.assignee}</span>
                              </span>
                            )}
                            {task.dueDate && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <Calendar className="w-3 h-3" />
                                <span>{task.dueDate.slice(5)}</span>
                              </span>
                            )}
                          </div>

                          {/* Quick advance button */}
                          <div
                            className="flex items-center space-x-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {col.id !== 'todo' && (
                              <button
                                onClick={() => {
                                  const prevMap: Record<TaskStatus, TaskStatus> = {
                                    in_progress: 'todo',
                                    review: 'in_progress',
                                    done: 'review',
                                    todo: 'todo',
                                  };
                                  moveTask(task, prevMap[col.id]);
                                }}
                                title="Move back"
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                              >
                                ←
                              </button>
                            )}
                            {col.id !== 'done' && (
                              <button
                                onClick={() => {
                                  const nextMap: Record<TaskStatus, TaskStatus> = {
                                    todo: 'in_progress',
                                    in_progress: 'review',
                                    review: 'done',
                                    done: 'done',
                                  };
                                  moveTask(task, nextMap[col.id]);
                                }}
                                title="Move forward"
                                className="p-1 hover:bg-blue-50 rounded text-slate-400 hover:text-blue-600"
                              >
                                →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
