import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, switchMap } from 'rxjs';

import { Task, TaskFilters, TaskRequest, TaskStatus } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/tasks';

  getFiltered(filters: TaskFilters): Observable<Task[]> {
    let params = new HttpParams()
      .set('sortBy', filters.sortBy)
      .set('sortDir', filters.sortDir);

    if (filters.search !== '') {
      params = params.set('search', filters.search);
    }

    if (filters.status !== null) {
      params = params.set('status', filters.status);
    }

    if (filters.priority !== null) {
      params = params.set('priority', filters.priority);
    }

    return this.http.get<Task[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${id}`);
  }

  create(request: TaskRequest): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, request);
  }

  update(id: number, request: TaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  updateStatus(id: number, status: TaskStatus): Observable<Task> {
    const request: TaskRequest = {
      title: '',
      description: '',
      status: status,
      priority: 'MEDIUM',
    };

    return this.getById(id).pipe(
      switchMap((task) => {
        request.title = task.title;
        request.description = task.description ?? '';
        request.priority = task.priority;

        return this.update(id, request);
      })
    );
  }

}