import { Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { DetailsPageComponent } from './pages/details-page/details-page.component';
import { LoginComponent } from './pages/login-page/login';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardPageComponent, canActivate: [authGuard] },
  { path: 'details', component: DetailsPageComponent, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: 'login' }
];
