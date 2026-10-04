import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { Task, TaskPriority, TaskStatus } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
<<<<<<< Updated upstream
=======
import { ThemeService } from '../../services/theme.service';
import { TaskFormComponent } from '../task-form/task-form.component';
>>>>>>> Stashed changes

@Component({
  selector: 'app-task-list',
  imports: [CommonModule, DatePipe],
  templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit {

  private readonly taskService = inject(TaskService);
  protected readonly themeService = inject(ThemeService);

  tasks = signal<Task[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loading.set(true);

    this.taskService.getAll().subscribe({
      next: (result) => {
        this.tasks.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossible de charger les tâches.');
        this.loading.set(false);
      },
    });
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
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
      case 'DONE':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
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
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
      case 'HIGH':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300';
    }
  }

  priorityAccentClass(priority: TaskPriority): string {
    switch (priority) {
      case 'LOW':
        return 'bg-slate-300';
      case 'MEDIUM':
        return 'bg-amber-400';
      case 'HIGH':
        return 'bg-rose-400';
    }
  }

}