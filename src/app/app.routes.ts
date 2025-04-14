import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { HomePageComponent } from './features/home/pages/home-page/home-page.component';
import { authGuard, noAuthGuard } from './features/auth/guards/auth.guard';
import { CreateEventComponent } from './features/events/pages/create-event/create-event.component';
import { MyEventsComponent } from './features/events/pages/my-events/my-events.component';
import { ProfilePageComponent } from './features/profile/pages/profile-page/profile-page.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: HomePageComponent
      },
      {
        path: 'auth',
        canActivate: [noAuthGuard],
        children: [
          {
            path: 'login',
            loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent)
          },
          {
            path: 'register',
            loadComponent: () => import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent)
          },
          {
            path: '',
            redirectTo: 'login',
            pathMatch: 'full'
          }
        ]
      },
      {
        path: 'create-event',
        canActivate: [authGuard],
        component: CreateEventComponent
      },
      {
        path: 'my-events',
        canActivate: [authGuard],
        component: MyEventsComponent
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        component: ProfilePageComponent
      },
      {
        path: '**',
        redirectTo: ''
      }
    ]
  }
];