import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TaskService } from './task.service';
import { Task } from '../models/task.model';

const EXISTING_TASK: Task = {
  id: 7,
  title: 'Tâche existante',
  description: 'Description existante',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  createdAt: '2026-10-04T21:14:02.662546Z',
};

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('construit les paramètres de filtre et de tri', () => {
    let received: Task[] = [];
    service
      .getFiltered({
        search: 'café',
        status: 'DONE',
        priority: null,
        sortBy: 'title',
        sortDir: 'asc',
      })
      .subscribe((tasks) => (received = tasks));

    const request = httpMock.expectOne((req) => req.url === '/api/tasks');
    expect(request.request.params.get('search')).toBe('café');
    expect(request.request.params.get('status')).toBe('DONE');
    expect(request.request.params.get('priority')).toBeNull();
    expect(request.request.params.get('sortBy')).toBe('title');
    expect(request.request.params.get('sortDir')).toBe('asc');

    request.flush([EXISTING_TASK]);
    expect(received).toEqual([EXISTING_TASK]);
  });

  it('envoie un PUT complet après un GET pour changer un statut', () => {
    let received: Task | undefined;
    service.updateStatus(7, 'DONE').subscribe((task) => (received = task));

    httpMock.expectOne('/api/tasks/7').flush(EXISTING_TASK);

    const putRequest = httpMock.expectOne('/api/tasks/7');
    expect(putRequest.request.method).toBe('PUT');
    expect(putRequest.request.body).toEqual({
      title: 'Tâche existante',
      description: 'Description existante',
      status: 'DONE',
      priority: 'HIGH',
    });

    putRequest.flush({ ...EXISTING_TASK, status: 'DONE' });
    expect(received?.status).toBe('DONE');
  });
});