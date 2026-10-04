import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Task, TaskPriority, TaskStatus } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-detail',
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './task-detail.component.html',
})
export class TaskDetailComponent implements OnInit {

  private readonly taskService = inject(TaskService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  task = signal<Task | null>(null);
  loading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    const id = this.getTaskId();

    this.loading.set(true);

    this.taskService.getById(id).subscribe({
      next: (task) => {
        this.task.set(task);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Tâche introuvable.');
        this.loading.set(false);
      },
    });
  }

  private getTaskId(): number {
    const id = this.route.snapshot.paramMap.get('id');
    return Number(id);
  }

  goBack(): void {
    this.router.navigate(['/']);
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

}