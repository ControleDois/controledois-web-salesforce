import { Routes } from '@angular/router';
import { AdminComponent } from './modules/admin/admin.component';
import { AuthResolver } from './shared/resolvers/auth.resolver';
import { AuthComponent } from './modules/auth/auth.component';
import { AuthGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./modules/admin/admin.routes').then((c) => c.routes)
      }
    ],
    resolve: {data: AuthResolver},
  },
  {
    path: 'auth',
    component: AuthComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./modules/auth/auth.routes').then((c) => c.routes)
      }
    ],
    canActivate: [AuthGuard],
  }
];
