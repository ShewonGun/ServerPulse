import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar-component.html',
  styleUrls: ['./navbar-component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentTime: string = '';
  currentDate: string = '';
  
  private timeSubscription?: Subscription;

  ngOnInit(): void {
    // Initialize time immediately
    this.updateDateTime();
    
    // Update time every second
    this.timeSubscription = interval(1000).subscribe(() => {
      this.updateDateTime();
    });
  }

  ngOnDestroy(): void {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
  }

  /**
   * Update current date and time
   */
  private updateDateTime(): void {
    const now = new Date();
    
    // Format time as HH:MM:SS
    this.currentTime = this.formatTime(now);
    
    // Format date as "Day, Month DD, YYYY"
    this.currentDate = this.formatDate(now);
  }

  /**
   * Format time as HH:MM
   */
  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  }

  /**
   * Format date as "Nov 4, 2025"
   */
  private formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    return date.toLocaleDateString('en-US', options);
  }
}