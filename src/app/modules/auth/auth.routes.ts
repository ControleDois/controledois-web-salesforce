import { Routes } from '@angular/router';
import { SigninComponent } from './pages/signin/signin.component';
import { SlideComponent } from './pages/slide/slide.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'slide',
    pathMatch: 'full'
  },
  {
    path: 'slide',
    component: SlideComponent
  },
  {
    path: 'signin',
    component: SigninComponent
  }
];
