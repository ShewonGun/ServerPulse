import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
  currentDay: string = '';
  currentMonth: string = '';
  currentYear: string = '';
  
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
   * Format time as H H : M M (with spaces between each character)
   */
  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    const timeString = `${hours}:${minutes}`;
    return timeString.split('').join(' ');
  }

  /**
   * Format date as "N o v     4 ,   2 0 2 5" (with more space between month and day)
   */
  private formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    const formattedDate = date.toLocaleDateString('en-US', options);
    // Split by comma to separate "Nov 4" from "2025"
    const parts = formattedDate.split(', ');
    if (parts.length === 2) {
      // Add more spaces between month and day, and spaces between all characters in year
      const monthDayWithExtraSpace = parts[0].replace(' ', '                '); // 16 spaces between Nov and 5
      const monthDaySpaced = monthDayWithExtraSpace.split('').join(' ');
      const yearSpaced = parts[1].split('').join(' ');
      return `${monthDaySpaced} , ${yearSpaced}`;
    }
    return formattedDate.split('').join(' ');
  }
}