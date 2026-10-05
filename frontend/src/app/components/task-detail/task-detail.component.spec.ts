import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { TaskDetailComponent } from './task-detail.component';
import { Task } from '../../models/task.model';

const TASK: Task = {
  id: 7,
  title: 'Tâche détaillée',
  description: 'Une description complète',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  createdAt: '2026-10-04T21:14:02.662546Z',
};

describe('TaskDetailComponent', () => {
  let fixture: ComponentFixture<TaskDetailComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '7' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('charge la tâche depuis l’id de la route', async () => {
    fixture.detectChanges();

    const request = httpMock.expectOne('/api/tasks/7');
    expect(request.request.method).toBe('GET');

    request.flush(TASK);
    await fixture.whenStable();
    fixture.detectChanges();

    const html: string = fixture.nativeElement.innerHTML;
    expect(html).toContain('Tâche détaillée');
    expect(html).toContain('Une description complète');
    expect(html).toContain('En cours');
    expect(html).toContain('Haute');
    expect(html).toContain('04/10/2026');
    httpMock.verify();
  });

  it('affiche un message d’erreur si la tâche est introuvable', async () => {
    fixture.detectChanges();

    httpMock
      .expectOne('/api/tasks/7')
      .flush('Introuvable', { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Tâche introuvable.');
    httpMock.verify();
  });

  it('traduit les statuts et priorités en français', () => {
    const component = fixture.componentInstance;

    expect(component.statusLabel('DONE')).toBe('Terminé');
    expect(component.priorityLabel('MEDIUM')).toBe('Moyenne');
  });
});