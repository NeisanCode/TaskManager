import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskListComponent } from './task-list.component';
import { Task } from '../../models/task.model';

const TASKS: Task[] = [
  {
    id: 1,
    title: 'Reviser Spring Boot',
    description: 'Relire les bases JPA',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    createdAt: '2026-10-04T21:14:02.662546Z',
  },
  {
    id: 2,
    title: 'Ecrire le README',
    description: null,
    status: 'TODO',
    priority: 'LOW',
    createdAt: '2026-10-04T22:00:00.000000Z',
  },
];

describe('TaskListComponent', () => {
  let fixture: ComponentFixture<TaskListComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('affiche le spinner puis les tâches reçues', async () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.animate-pulse')).toBeTruthy();

    httpMock.expectOne('/api/tasks').flush(TASKS);
    await fixture.whenStable();
    fixture.detectChanges();

    const html: string = fixture.nativeElement.innerHTML;
    expect(html).toContain('Reviser Spring Boot');
    expect(html).toContain('En cours');
    expect(html).toContain('Haute');
    expect(html).toContain('À faire');
    expect(html).toContain('Basse');
    expect(fixture.nativeElement.querySelector('.animate-pulse')).toBeFalsy();
    expect(fixture.nativeElement.querySelectorAll('article').length).toBe(2);
    httpMock.verify();
  });

  it('affiche le message d’erreur si l’API échoue', async () => {
    fixture.detectChanges();
    httpMock
      .expectOne('/api/tasks')
      .flush('Erreur serveur', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toContain('Impossible de charger les tâches.');
    httpMock.verify();
  });

  it('affiche le message quand il n’y a aucune tâche', async () => {
    fixture.detectChanges();
    httpMock.expectOne('/api/tasks').flush([]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toContain('Aucune tâche pour le moment');
    expect(fixture.nativeElement.innerHTML).toContain('Commencez par créer votre première tâche.');
    httpMock.verify();
  });

  it('traduit les statuts et priorités en français', () => {
    const component = fixture.componentInstance;

    expect(component.statusLabel('TODO')).toBe('À faire');
    expect(component.statusLabel('IN_PROGRESS')).toBe('En cours');
    expect(component.statusLabel('DONE')).toBe('Terminé');

    expect(component.priorityLabel('LOW')).toBe('Basse');
    expect(component.priorityLabel('MEDIUM')).toBe('Moyenne');
    expect(component.priorityLabel('HIGH')).toBe('Haute');
  });
});