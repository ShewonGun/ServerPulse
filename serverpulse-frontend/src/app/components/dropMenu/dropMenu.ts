import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-drop-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dropMenu.html',
  styleUrls: ['./dropMenu.scss']
})
export class DropMenuComponent {
  isDropdownOpen: boolean = false;
  userName: string = 'Shewon Gunarathne';
  userRole: string = 'Administrator';

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }
}
