import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-drop-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dropMenu.html',
  styleUrls: ['./dropMenu.scss']
})
export class DropMenuComponent implements OnInit {
  isDropdownOpen: boolean = false;
  userName: string = '';
  userRole: string = '';
  isAdmin: boolean = false;

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    // Only access localStorage in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserData();
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    
    // Refresh user data when opening dropdown
    if (this.isDropdownOpen && isPlatformBrowser(this.platformId)) {
      this.loadUserData();
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  private loadUserData(): void {
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        this.userName = currentUser.email || '';
        this.userRole = currentUser.role || '';
        // Strict check: only Administrator role gets admin access
        this.isAdmin = currentUser.role === 'Administrator';
        console.log('User role:', currentUser.role, 'isAdmin:', this.isAdmin);
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
  }

  logout(): void {
    this.closeDropdown();
    // Clear user session
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
    this.router.navigate(['/login']);
  }
}
