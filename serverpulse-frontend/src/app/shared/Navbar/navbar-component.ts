import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { DropMenuComponent } from '../../components/dropMenu/dropMenu';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, DropMenuComponent],
  templateUrl: './navbar-component.html',
  styleUrls: ['./navbar-component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentTime: string = '';
  currentDate: string = '';
  currentDay: string = '';
  currentMonth: string = '';
  currentYear: string = '';
  period: string = '';
  
  private timeSubscription?: Subscription;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Initialize time immediately
    this.updateDateTime();
    
    // Update time every second
    this.timeSubscription = interval(1000).subscribe(() => {
      this.updateDateTime();
      this.cdr.detectChanges(); // Manually trigger change detection
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
    
    // Format date components for digital display
    this.currentDay = now.getDate().toString().padStart(2, '0');
    this.currentMonth = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    this.currentYear = now.getFullYear().toString().slice(-2); // Last 2 digits of year
    
    // Keep the original formatted date for backup
    this.currentDate = this.formatDate(now);
  }

  /**
   * Format time as HH:MM in 12-hour format
   */
  private formatTime(date: Date): string {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    this.period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert to 12-hour format
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  /**
   * Format date as "Nov 21, 2025"
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