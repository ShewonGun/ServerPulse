import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/Navbar/navbar-component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, DashboardPageComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('serverpulse-frontend');
}
