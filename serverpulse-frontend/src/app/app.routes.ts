import { Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { DetailsPageComponent } from './pages/details-page/details-page.component';

export const routes: Routes = [
  { path: '', component: DashboardPageComponent },
  { path: 'details', component: DetailsPageComponent },
  { path: '**', redirectTo: '' }
];
