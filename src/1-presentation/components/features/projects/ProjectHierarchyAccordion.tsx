/**
 * Project Hierarchy Accordion Component
 * Sprint 8 Extension: Displays project structure with sub-projects and tasks
 *
 * Features:
 * - Collapsible sub-projects
 * - Progress tracking
 * - Mode-based actions (admin/consultant/company)
 * - Task management
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/presentation/components/ui/atoms/collapsible';
import {
  FolderKanban,
  ChevronDown,
  Edit,
  Plus,
  CheckCircle2,
  XCircle,
  UserPlus,
  Eye,
  MessageCircle,
  Calendar,
  ListTodo,
  ArrowUp,
  ArrowDown,
  Trash2,
} from 'lucide-react';
import { Checkbox } from '@/presentation/components/ui/atoms/checkbox';
import { cn } from '@/presentation/lib/utils';
import { SubProjectWithTasksDTO, TaskDTO } from '@/application/dto/project-hierarchy.dto';

// =====================================================
// TYPES
// =====================================================

export interface ProjectHierarchyAccordionProps {
  projectId: string;
  subProjects: SubProjectWithTasksDTO[];
  mode: 'admin' | 'consultant' | 'company';

  // Admin features
  editable?: boolean;
  reorderable?: boolean;
  onSubProjectEdit?: (subProject: SubProjectWithTasksDTO) => void;
  onSubProjectView?: (subProject: SubProjectWithTasksDTO) => void;
  onSubProjectDelete?: (subProjectId: string) => void;
  onSubProjectMoveUp?: (subProjectId: string) => void;
  onSubProjectMoveDown?: (subProjectId: string) => void;
  onTaskEdit?: (task: TaskDTO) => void;
  onTaskCreate?: (subProjectId: string) => void;
  onTaskView?: (task: TaskDTO) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskMoveUp?: (taskId: string) => void;
  onTaskMoveDown?: (taskId: string) => void;
  onTaskDates?: (taskId: string) => void;

  // Consultant features
  assignable?: boolean;
  approvable?: boolean;
  onTaskAssign?: (taskId: string) => void;
  onTaskApprove?: (taskId: string) => void;
  onTaskReject?: (taskId: string) => void;

  // Company features
  completable?: boolean;
  onTaskComplete?: (taskId: string) => void;
  onTaskQuestion?: (taskId: string) => void;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'done':
    case 'completed':
      return 'default';
    case 'in_progress':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    todo: 'Yapılacak',
    in_progress: 'Devam Ediyor',
    review: 'İncelemede',
    done: 'Tamamlandı',
    cancelled: 'İptal',
    planning: 'Planlama',
    active: 'Aktif',
    on_hold: 'Beklemede',
    completed: 'Tamamlandı',
  };
  return labels[status] || status;
};

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'urgent':
      return 'border-red-300 text-red-700 dark:border-red-700 dark:text-red-400';
    case 'high':
      return 'border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-400';
    case 'medium':
      return 'border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400';
    case 'low':
      return 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-400';
    default:
      return '';
  }
};

const getPriorityLabel = (priority: string): string => {
  const labels: Record<string, string> = {
    urgent: 'Acil',
    high: 'Yüksek',
    medium: 'Orta',
    low: 'Düşük',
  };
  return labels[priority] || priority;
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// =====================================================
// TASK ITEM COMPONENT
// =====================================================

interface TaskItemProps
  extends Pick<
    ProjectHierarchyAccordionProps,
    | 'mode'
    | 'editable'
    | 'reorderable'
    | 'assignable'
    | 'approvable'
    | 'completable'
    | 'onTaskEdit'
    | 'onTaskAssign'
    | 'onTaskApprove'
    | 'onTaskReject'
    | 'onTaskComplete'
    | 'onTaskDelete'
    | 'onTaskMoveUp'
    | 'onTaskMoveDown'
    | 'onTaskView'
    | 'onTaskQuestion'
    | 'onTaskDates'
  > {
  task: TaskDTO;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

function TaskItem({ task, mode, ...props }: TaskItemProps) {
  const [isPending, setIsPending] = useState(false);

  const runMaybePromise = async (value: void | Promise<void> | undefined) => {
    if (value && typeof (value as Promise<void>).then === 'function') {
      await (value as Promise<void>);
    }
  };

  const isAdminMode = mode === 'admin';
  const isEditable = Boolean(props.editable && isAdminMode);
  const isReorderable = Boolean(props.reorderable && isEditable);
  const canMoveUp = Boolean(props.canMoveUp);
  const canMoveDown = Boolean(props.canMoveDown);

  const handleTaskComplete = async () => {
    if (!props.onTaskComplete || task.status === 'done') return;
    setIsPending(true);
    try {
      await runMaybePromise(props.onTaskComplete(task.id));
    } finally {
      setIsPending(false);
    }
  };

  const handleTaskMoveUp = async () => {
    if (!props.onTaskMoveUp || !isReorderable || !canMoveUp) return;
    setIsPending(true);
    try {
      await runMaybePromise(props.onTaskMoveUp(task.id));
    } finally {
      setIsPending(false);
    }
  };

  const handleTaskMoveDown = async () => {
    if (!props.onTaskMoveDown || !isReorderable || !canMoveDown) return;
    setIsPending(true);
    try {
      await runMaybePromise(props.onTaskMoveDown(task.id));
    } finally {
      setIsPending(false);
    }
  };

  const handleTaskDelete = async () => {
    if (!props.onTaskDelete || !isEditable) return;
    setIsPending(true);
    try {
      await runMaybePromise(props.onTaskDelete(task.id));
    } finally {
      setIsPending(false);
    }
  };

  const handleTaskAssign = async () => {
    if (!props.onTaskAssign) return;
    setIsPending(true);
    try {
      await runMaybePromise(props.onTaskAssign(task.id));
    } finally {
      setIsPending(false);
    }
  };

  const handleTaskApprove = async () => {
    if (!props.onTaskApprove) return;
    setIsPending(true);
    try {
      await runMaybePromise(props.onTaskApprove(task.id));
    } finally {
      setIsPending(false);
    }
  };

  const handleTaskReject = async () => {
    if (!props.onTaskReject) return;
    setIsPending(true);
    try {
      await runMaybePromise(props.onTaskReject(task.id));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="p-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Checkbox + Title + Badges */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {mode === 'company' && props.completable && (
            <div className="mt-0.5">
              <Checkbox
                checked={task.status === 'done' || task.status === 'review'}
                disabled={task.status === 'done' || task.status === 'review' || isPending}
                onCheckedChange={() => {
                  if (!isPending && task.status !== 'done' && task.status !== 'review') {
                    handleTaskComplete();
                  }
                }}
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  'font-medium text-gray-900 dark:text-white',
                  task.status === 'done' && 'line-through text-gray-500 dark:text-gray-400'
                )}
              >
                {task.title}
              </span>

              {/* Status Badge */}
              <Badge variant="outline" className="text-xs">
                {getStatusLabel(task.status)}
              </Badge>

              {/* Priority Badge */}
              {task.priority && (
                <Badge variant="outline" className={cn('text-xs', getPriorityColor(task.priority))}>
                  {getPriorityLabel(task.priority)}
                </Badge>
              )}

              {/* Due Date */}
              {task.dueDate && (
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(task.dueDate)}
                </span>
              )}

              {/* Assigned To */}
              {task.assignedToName && (
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <UserPlus className="w-3 h-3" />
                  {task.assignedToName}
                </span>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Admin: Edit button */}
          {isEditable && (
            <>
              {isReorderable && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    disabled={isPending || !canMoveUp}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleTaskMoveUp();
                    }}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    disabled={isPending || !canMoveDown}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleTaskMoveDown();
                    }}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </>
              )}

              {props.onTaskEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={(event) => {
                    event.stopPropagation();
                    props.onTaskEdit?.(task);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}

              {props.onTaskDates && (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={(event) => {
                    event.stopPropagation();
                    props.onTaskDates?.(task.id);
                  }}
                  title="Firma bazlı tarih ataması"
                >
                  <Calendar className="w-4 h-4" />
                </Button>
              )}

              {props.onTaskDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  disabled={isPending}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleTaskDelete();
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </>
          )}

          {/* Consultant: Assign/Approve buttons */}
          {mode === 'consultant' && (
            <>
              {props.assignable && task.status === 'todo' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="shadow-none"
                  disabled={isPending}
                  onClick={handleTaskAssign}
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Ata
                </Button>
              )}

              {props.approvable && task.status === 'review' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 shadow-none"
                    disabled={isPending}
                    onClick={handleTaskApprove}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Onayla
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 shadow-none"
                    disabled={isPending}
                    onClick={handleTaskReject}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reddet
                  </Button>
                </>
              )}
            </>
          )}

          {/* Company: Complete/Question buttons */}
          {mode === 'company' && (
            <>
              {props.completable && task.status !== 'done' && task.status !== 'review' && (
                <Button
                  size="sm"
                  variant="default"
                  className="shadow-sm"
                  disabled={isPending}
                  onClick={handleTaskComplete}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Tamamla
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                className="shadow-none"
                disabled={isPending}
                onClick={() => props.onTaskQuestion?.(task.id)}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Soru Sor
              </Button>
            </>
          )}

          {/* View Details (all modes) */}
          {props.onTaskView && (
            <Button
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={(event) => {
                event.stopPropagation();
                props.onTaskView?.(task);
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function ProjectHierarchyAccordion({
  subProjects,
  mode,
  ...props
}: ProjectHierarchyAccordionProps) {
  if (subProjects.length === 0) {
    return (
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardContent className="p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <FolderKanban className="w-6 h-6 text-gray-400" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Henüz alt proje yok</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Bu projede henüz alt proje oluşturulmamış.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {subProjects.map((subProject, index) => {
        const { tasks, stats, progress } = subProject;
        const isFirst = index === 0;
        const isLast = index === subProjects.length - 1;

        return (
          <Collapsible key={subProject.id} defaultOpen>
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-3 flex-1 text-left min-w-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg px-2 py-1"
                    >
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg shrink-0">
                        <FolderKanban className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {subProject.name}
                        </h3>
                        {subProject.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                            {subProject.description}
                          </p>
                        )}
                      </div>
                    </button>
                  </CollapsibleTrigger>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden md:flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 min-w-12 text-right">
                        {Math.round(progress)}%
                      </span>
                    </div>

                    <Badge variant="outline" className="font-medium hidden md:inline-flex">
                      {stats.completedTasks}/{stats.totalTasks} görev
                    </Badge>

                    <Badge variant={getStatusVariant(subProject.status)} className="font-medium">
                      {getStatusLabel(subProject.status)}
                    </Badge>

                    {mode === 'admin' && props.editable && (
                      <div className="flex items-center gap-2">
                        {props.reorderable && (
                          <>
                            {props.onSubProjectMoveUp && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                                disabled={isFirst}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  props.onSubProjectMoveUp?.(subProject.id);
                                }}
                              >
                                <ArrowUp className="w-4 h-4" />
                              </Button>
                            )}
                            {props.onSubProjectMoveDown && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                                disabled={isLast}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  props.onSubProjectMoveDown?.(subProject.id);
                                }}
                              >
                                <ArrowDown className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                        )}

                        {props.onTaskCreate && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="shadow-none"
                            onClick={(event) => {
                              event.stopPropagation();
                              props.onTaskCreate?.(subProject.id);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Görev Ekle
                          </Button>
                        )}

                        {props.onSubProjectEdit && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(event) => {
                              event.stopPropagation();
                              props.onSubProjectEdit?.(subProject);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}

                        {props.onSubProjectDelete && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            onClick={(event) => {
                              event.stopPropagation();
                              props.onSubProjectDelete?.(subProject.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}

                        {props.onSubProjectView && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(event) => {
                              event.stopPropagation();
                              props.onSubProjectView?.(subProject);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )}

                    <CollapsibleTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="p-2 data-[state=open]:rotate-180 transition-transform"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
              </CardHeader>

              <CollapsibleContent>
                <CardContent className="pt-0 pb-4">
                  {tasks.length === 0 ? (
                    <div className="ml-8 text-center py-8 text-gray-500 dark:text-gray-400">
                      <ListTodo className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Bu alt projede henüz görev yok.</p>
                      {mode === 'admin' && props.editable && props.onTaskCreate && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-4"
                          onClick={() => props.onTaskCreate?.(subProject.id)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Görev Ekle
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {stats.totalTasks} görev | {stats.completedTasks} tamamlandı
                        </p>
                        {mode === 'admin' && props.editable && props.onTaskCreate && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="shadow-none"
                            onClick={() => props.onTaskCreate?.(subProject.id)}
                          >
                            <Plus className="w-4 h-4 mr-1" /> Görev Ekle
                          </Button>
                        )}
                      </div>

                      {tasks.map((task, taskIndex) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          mode={mode}
                          canMoveUp={taskIndex > 0}
                          canMoveDown={taskIndex < tasks.length - 1}
                          {...props}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
}
