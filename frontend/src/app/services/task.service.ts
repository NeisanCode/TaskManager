import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/tasks';

  getAll(): Observable<Task[]> {
    return this.http.get<Task[]>(this.baseUrl);
  }

}