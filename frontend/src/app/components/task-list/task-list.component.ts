import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  Task,
  TaskFilters,
  TaskPriority,
  TaskSortDirection,
  TaskSortField,
  TaskStatus,
} from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { ThemeService } from '../../services/theme.service';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-list',
  imports: [CommonModule, DatePipe, RouterLink, TaskFormComponent],
  templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit {

  private readonly taskService = inject(TaskService);
  protected readonly themeService = inject(ThemeService);

  tasks = signal<Task[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  searchText = signal('');
  statusFilter = signal<TaskStatus | null>(null);
  priorityFilter = signal<TaskPriority | null>(null);
  sortField = signal<TaskSortField>('createdAt');
  sortDirection = signal<TaskSortDirection>('desc');

  showForm = signal(false);
  selectedTask = signal<Task | null>(null);
  openMenuTaskId = signal<number | null>(null);
  loadedOnce = signal(false);

  ngOnInit(): void {
    this.loadTasks();
  }

  private loadTasks(): void {
    // Skeletons only on the very first load. Showing them on every refresh
    // would collapse the list and expand it again: visible layout jump.
    this.loading.set(!this.loadedOnce());
    // Skeletons only on the very first load. Showing them on every refresh
    // would collapse the list and expand it again: visible layout jump.
    this.loading.set(!this.loadedOnce());
    this.errorMessage.set('');

    this.taskService.getFiltered(this.currentFilters()).subscribe({
      next: (result) => {
        this.tasks.set(result);
        this.loadedOnce.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.loadedOnce.set(true);
        this.errorMessage.set('Impossible de charger les tâches.');
        this.loading.set(false);
      },
    });
  }

  currentFilters(): TaskFilters {
    return {
      search: this.searchText(),
      status: this.statusFilter(),
      priority: this.priorityFilter(),
      sortBy: this.sortField(),
      sortDir: this.sortDirection(),
    };
  }

  onSearchChange(search: string): void {
    this.searchText.set(search);
    this.loadTasks();
  }

  onStatusChange(status: string): void {
    this.statusFilter.set(status === '' ? null : (status as TaskStatus));
    this.loadTasks();
  }

  onPriorityChange(priority: string): void {
    this.priorityFilter.set(priority === '' ? null : (priority as TaskPriority));
    this.loadTasks();
  }

  onSortFieldChange(sortBy: string): void {
    this.sortField.set(sortBy as TaskSortField);
    this.loadTasks();
  }

  toggleSortDirection(): void {
    const newDirection: TaskSortDirection =
      this.sortDirection() === 'asc' ? 'desc' : 'asc';

    this.sortDirection.set(newDirection);
    this.loadTasks();
  }

  hasActiveFilters(): boolean {
    return (
      this.searchText() !== '' ||
      this.statusFilter() !== null ||
      this.priorityFilter() !== null
    );
  }

  clearFilters(): void {
    this.searchText.set('');
    this.statusFilter.set(null);
    this.priorityFilter.set(null);
    this.loadTasks();
  }

  openCreateForm(): void {
    this.selectedTask.set(null);
    this.showForm.set(true);
  }

  openEditForm(task: Task): void {
    this.selectedTask.set(task);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.selectedTask.set(null);
  }

  nextStatus(status: TaskStatus): TaskStatus {
    if (status === 'TODO') {
      return 'IN_PROGRESS';
    }
    if (status === 'IN_PROGRESS') {
      return 'DONE';
    }
    return 'TODO';
  }

  cycleStatus(task: Task): void {
    const newStatus = this.nextStatus(task.status);

    this.taskService.updateStatus(task.id, newStatus).subscribe({
      next: () => this.loadTasks(),
      error: () => {
        this.errorMessage.set('Impossible de changer le statut.');
      },
    });
  }

  toggleMenu(taskId: number): void {
    if (this.openMenuTaskId() === taskId) {
      this.openMenuTaskId.set(null);
    } else {
      this.openMenuTaskId.set(taskId);
    }
  }

  closeMenu(): void {
    this.openMenuTaskId.set(null);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeMenu();
  }

  deleteTask(task: Task): void {
    const isConfirmed = window.confirm(
      'Supprimer la tâche "' + task.title + '" ?'
    );

    if (!isConfirmed) {
      return;
    }

    this.taskService.delete(task.id).subscribe({
      next: () => this.loadTasks(),
      error: () => {
        this.errorMessage.set('Impossible de supprimer la tâche.');
      },
    });
  }

  onSaved(): void {
    this.closeForm();
    this.loadTasks();
  }

  statusLabel(status: TaskStatus): string {
    switch (status) {
      case 'TODO':
        return 'À faire';
      case 'IN_PROGRESS':
        return 'En cours';
      case 'DONE':
        return 'Terminé';
    }
  }

  statusBadgeClass(status: TaskStatus): string {
    switch (status) {
      case 'TODO':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
      case 'DONE':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
    }
  }

  priorityLabel(priority: TaskPriority): string {
    switch (priority) {
      case 'LOW':
        return 'Basse';
      case 'MEDIUM':
        return 'Moyenne';
      case 'HIGH':
        return 'Haute';
    }
  }

  priorityBadgeClass(priority: TaskPriority): string {
    switch (priority) {
      case 'LOW':
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
      case 'HIGH':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300';
    }
  }

  priorityAccentClass(priority: TaskPriority): string {
    switch (priority) {
      case 'LOW':
        return 'bg-slate-300 dark:bg-slate-600';
      case 'MEDIUM':
        return 'bg-amber-400 dark:bg-amber-500';
      case 'HIGH':
        return 'bg-rose-400 dark:bg-rose-500';
    }
  }

}