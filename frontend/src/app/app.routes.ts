import { Routes } from '@angular/router';

import { TaskDetailComponent } from './components/task-detail/task-detail.component';
import { TaskListComponent } from './components/task-list/task-list.component';

export const routes: Routes = [
  { path: '', component: TaskListComponent },
  { path: 'tasks/:id', component: TaskDetailComponent },
];