import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Task, TaskPriority, TaskRequest, TaskStatus } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './task-form.component.html',
})
export class TaskFormComponent implements OnInit {

  @Input() task: Task | null = null;

  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly formBuilder = inject(FormBuilder);
  private readonly taskService = inject(TaskService);

  form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    status: ['TODO' as TaskStatus, Validators.required],
    priority: ['MEDIUM' as TaskPriority, Validators.required],
  });

  submitting = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    if (this.task) {
      this.form.patchValue({
        title: this.task.title,
        description: this.task.description ?? '',
        status: this.task.status,
        priority: this.task.priority,
      });
    }
  }

  isEditMode(): boolean {
    return this.task !== null;
  }

  isInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field !== null && field.invalid && field.touched;
  }

  fieldBorderClass(fieldName: string): string {
    return this.isInvalid(fieldName) ? 'border-rose-400' : 'border-slate-300';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    const request: TaskRequest = this.form.getRawValue();

    const saveResult = this.task
      ? this.taskService.update(this.task.id, request)
      : this.taskService.create(request);

    saveResult.subscribe({
      next: () => {
        this.submitting.set(false);
        this.saved.emit();
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('Une erreur est survenue.');
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.onCancel();
  }

}