export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
}

export interface TaskRequest {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
}

export type TaskSortField = 'createdAt' | 'title' | 'priority' | 'status';

export type TaskSortDirection = 'asc' | 'desc';

export interface TaskFilters {
  search: string;
  status: TaskStatus | null;
  priority: TaskPriority | null;
  sortBy: TaskSortField;
  sortDir: TaskSortDirection;
}