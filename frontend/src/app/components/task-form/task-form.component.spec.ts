import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskFormComponent } from './task-form.component';
import { Task } from '../../models/task.model';

const EXISTING_TASK: Task = {
  id: 7,
  title: 'Tâche existante',
  description: 'Description existante',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  createdAt: '2026-10-04T21:14:02.662546Z',
};

describe('TaskFormComponent', () => {
  let fixture: ComponentFixture<TaskFormComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('affiche les valeurs par défaut en mode création', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nouvelle tâche');
    expect(fixture.componentInstance.form.getRawValue()).toEqual({
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
    });
  });

  it('pré-remplit le formulaire en mode édition', () => {
    fixture.componentRef.setInput('task', EXISTING_TASK);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Modifier la tâche');
    expect(fixture.componentInstance.form.getRawValue()).toEqual({
      title: 'Tâche existante',
      description: 'Description existante',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
    });
  });

  it('refuse un formulaire invalide et affiche le message', () => {
    fixture.detectChanges();

    fixture.componentInstance.onSubmit();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Le titre est obligatoire');
    httpMock.expectNone('/api/tasks');
  });

  it('bascule la bordure du titre en rouge quand le champ est invalide', () => {
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('#title') as HTMLInputElement;
    expect(input.className).toContain('border-slate-300');

    fixture.componentInstance.onSubmit();
    fixture.detectChanges();

    expect(input.className).toContain('border-rose-400');
    expect(input.className).not.toContain('border-slate-300');
  });

  it('envoie un POST et émet saved en mode création', () => {
    fixture.detectChanges();

    fixture.componentInstance.form.setValue({
      title: 'Nouvelle tâche',
      description: 'Détails',
      status: 'TODO',
      priority: 'MEDIUM',
    });

    let savedEmitted = false;
    fixture.componentInstance.saved.subscribe(() => (savedEmitted = true));

    fixture.componentInstance.onSubmit();

    const request = httpMock.expectOne('/api/tasks');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      title: 'Nouvelle tâche',
      description: 'Détails',
      status: 'TODO',
      priority: 'MEDIUM',
    });

    request.flush(EXISTING_TASK);
    expect(savedEmitted).toBe(true);
    httpMock.verify();
  });

  it('envoie un PUT sur /api/tasks/{id} en mode édition', () => {
    fixture.componentRef.setInput('task', EXISTING_TASK);
    fixture.detectChanges();

    fixture.componentInstance.form.patchValue({ title: 'Titre modifié' });
    fixture.componentInstance.onSubmit();

    const request = httpMock.expectOne('/api/tasks/7');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      title: 'Titre modifié',
      description: 'Description existante',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
    });

    request.flush(EXISTING_TASK);
    httpMock.verify();
  });

  it('affiche un message d’erreur si l’API échoue', () => {
    fixture.detectChanges();

    fixture.componentInstance.form.patchValue({ title: 'Nouvelle tâche' });
    fixture.componentInstance.onSubmit();

    httpMock
      .expectOne('/api/tasks')
      .flush('Erreur', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Une erreur est survenue.');
    expect(fixture.componentInstance.submitting()).toBe(false);
  });

  it('ferme la modale au clic sur l’overlay', () => {
    fixture.detectChanges();

    let cancelledEmitted = false;
    fixture.componentInstance.cancelled.subscribe(() => (cancelledEmitted = true));

    const overlay = fixture.nativeElement.querySelector('[role="dialog"]');
    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(cancelledEmitted).toBe(true);
  });

  it('ne ferme pas la modale au clic dans le formulaire', () => {
    fixture.detectChanges();

    let cancelledEmitted = false;
    fixture.componentInstance.cancelled.subscribe(() => (cancelledEmitted = true));

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(cancelledEmitted).toBe(false);
  });

  it('ferme la modale avec la touche Échap', () => {
    fixture.detectChanges();

    let cancelledEmitted = false;
    fixture.componentInstance.cancelled.subscribe(() => (cancelledEmitted = true));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(cancelledEmitted).toBe(true);
  });

  it('émet cancelled quand on annule', () => {
    fixture.detectChanges();

    let cancelledEmitted = false;
    fixture.componentInstance.cancelled.subscribe(() => (cancelledEmitted = true));

    fixture.componentInstance.onCancel();

    expect(cancelledEmitted).toBe(true);
    httpMock.verify();
  });
});