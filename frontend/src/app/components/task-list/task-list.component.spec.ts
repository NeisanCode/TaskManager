import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

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
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('affiche le spinner puis les tâches reçues', async () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.animate-pulse')).toBeTruthy();

    httpMock.expectOne(req => req.url === '/api/tasks').flush(TASKS);
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
      .expectOne(req => req.url === '/api/tasks')
      .flush('Erreur serveur', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toContain('Impossible de charger les tâches.');
    httpMock.verify();
  });

  it('affiche le message quand il n’y a aucune tâche', async () => {
    fixture.detectChanges();
    httpMock.expectOne(req => req.url === '/api/tasks').flush([]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toContain('Aucune tâche pour le moment');
    expect(fixture.nativeElement.innerHTML).toContain('Commencez par créer votre première tâche.');
    httpMock.verify();
  });

  it('n’affiche pas les squelettes quand on change le statut', async () => {
    fixture.detectChanges();
    httpMock.expectOne(req => req.url === '/api/tasks').flush(TASKS);
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.cycleStatus(TASKS[0]);

    // le rechargement ne doit pas remplacer la liste par des squelettes
    expect(fixture.componentInstance.loading()).toBe(false);
    expect(fixture.nativeElement.querySelector('.animate-pulse')).toBeFalsy();
    expect(fixture.nativeElement.querySelectorAll('article').length).toBe(2);

    const cycleGet = httpMock.expectOne('/api/tasks/1');
    expect(cycleGet.request.method).toBe('GET');
    cycleGet.flush(TASKS[0]);

    const cyclePut = httpMock.expectOne('/api/tasks/1');
    expect(cyclePut.request.method).toBe('PUT');
    cyclePut.flush({ ...TASKS[0], status: 'DONE' });

    httpMock.expectOne(req => req.url === '/api/tasks').flush(TASKS);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('article').length).toBe(2);
    httpMock.verify();
  });

  it('calcule le statut suivant pour le bouton de cycle', () => {
    const component = fixture.componentInstance;

    expect(component.nextStatus('TODO')).toBe('IN_PROGRESS');
    expect(component.nextStatus('IN_PROGRESS')).toBe('DONE');
    expect(component.nextStatus('DONE')).toBe('TODO');
  });

  it('envoie un GET puis un PUT complet pour changer le statut', async () => {
    fixture.detectChanges();
    httpMock.expectOne(req => req.url === '/api/tasks').flush(TASKS);
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.cycleStatus(TASKS[0]);

    const getRequest = httpMock.expectOne('/api/tasks/1');
    expect(getRequest.request.method).toBe('GET');
    getRequest.flush(TASKS[0]);

    const putRequest = httpMock.expectOne('/api/tasks/1');
    expect(putRequest.request.method).toBe('PUT');
    expect(putRequest.request.body).toEqual({
      title: 'Reviser Spring Boot',
      description: 'Relire les bases JPA',
      status: 'DONE',
      priority: 'HIGH',
    });

    putRequest.flush({ ...TASKS[0], status: 'DONE' });
    httpMock.expectOne(req => req.url === '/api/tasks').flush([{ ...TASKS[0], status: 'DONE' }]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.tasks().length).toBe(1);
    httpMock.verify();
  });

  it('supprime la tâche après confirmation', async () => {
    fixture.detectChanges();
    httpMock.expectOne(req => req.url === '/api/tasks').flush(TASKS);
    await fixture.whenStable();
    fixture.detectChanges();

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    fixture.componentInstance.deleteTask(TASKS[0]);

    const deleteRequest = httpMock.expectOne('/api/tasks/1');
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null);

    httpMock.expectOne(req => req.url === '/api/tasks').flush([TASKS[1]]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.tasks().length).toBe(1);
    confirmSpy.mockRestore();
    httpMock.verify();
  });

  it('ne supprime rien si la confirmation est refusée', () => {
    fixture.detectChanges();
    httpMock.expectOne(req => req.url === '/api/tasks').flush(TASKS);

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    fixture.componentInstance.deleteTask(TASKS[0]);

    httpMock.expectNone('/api/tasks/1');
    confirmSpy.mockRestore();
  });

  it('n’ouvre qu’un seul menu à la fois', () => {
    fixture.componentInstance.toggleMenu(1);
    expect(fixture.componentInstance.openMenuTaskId()).toBe(1);

    fixture.componentInstance.toggleMenu(2);
    expect(fixture.componentInstance.openMenuTaskId()).toBe(2);

    fixture.componentInstance.toggleMenu(2);
    expect(fixture.componentInstance.openMenuTaskId()).toBeNull();
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