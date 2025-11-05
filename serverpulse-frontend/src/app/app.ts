import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ServerCardComponent, ServerTemperatureData } from './shared/serverCard/server-card-component';
import { NavbarComponent } from './shared/Navbar/navbar-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ServerCardComponent, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('serverpulse-frontend');
  
  // Current featured server (large card)
  featuredServerIndex = signal(0);
  
  // Pagination for small cards
  currentPage = signal(0);
  readonly itemsPerPage = 6;
  
  // Array constructor for template
  protected readonly Array = Array;
  
  // Auto-rotation interval
  private rotationInterval?: any;
  
  // Sample server data - Multiple servers for 3-column grid layout
  serverData: ServerTemperatureData[] = [
    {
      rackName: 'Rack 01',
      currentTemp: 22,        // Safe zone (green)
      minTemp: 15,
      maxTemp: 35,
      unit: 'celsius'
    },
    {
      rackName: 'Rack 02', 
      currentTemp: 28,        // Warning zone (yellow) 
      minTemp: 20,
      maxTemp: 35,
      unit: 'celsius'
    },
    {
      rackName: 'Rack 03',
      currentTemp: 42,        // Critical zone (red) - exceeded max
      minTemp: 25,
      maxTemp: 40,
      unit: 'celsius'
    },
    {
      rackName: 'Rack 04',
      currentTemp: 19,        // Safe zone (green)
      minTemp: 15,
      maxTemp: 30,
      unit: 'celsius'
    },
    {
      rackName: 'Rack 05',
      currentTemp: 33,        // Warning zone (yellow)
      minTemp: 20,
      maxTemp: 35,
      unit: 'celsius'
    },
    {
      rackName: 'Rack 06',
      currentTemp: 38,        // Critical zone (red)
      minTemp: 22,
      maxTemp: 35,
      unit: 'celsius'
    },
    {
      rackName: 'Rack 07',
      currentTemp: 25,        // Safe zone (green)
      minTemp: 18,
      maxTemp: 32,
      unit: 'celsius'
    },
    {
      rackName: 'Rack 08',
      currentTemp: 35,        // Warning zone (yellow)
      minTemp: 20,
      maxTemp: 38,
      unit: 'celsius'
    },
    {
      rackName: 'Rack 09',
      currentTemp: 41,        // Critical zone (red)
      minTemp: 22,
      maxTemp: 40,
      unit: 'celsius'
    },
    {
      rackName: 'Rack 10',
      currentTemp: 21,        // Safe zone (green)
      minTemp: 16,
      maxTemp: 30,
      unit: 'celsius'
    }
  ];

  ngOnInit(): void {
    // Start auto-rotation every 5 seconds
    this.startRotation();
  }

  ngOnDestroy(): void {
    // Clear interval on component destruction
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
    }
  }

  private startRotation(): void {
    this.rotationInterval = setInterval(() => {
      const currentIndex = this.featuredServerIndex();
      const nextIndex = (currentIndex + 1) % this.serverData.length;
      this.featuredServerIndex.set(nextIndex);
    }, 5000); // 5 seconds
  }

  // Get the currently featured server
  get featuredServer(): ServerTemperatureData {
    return this.serverData[this.featuredServerIndex()];
  }

  // Get the smaller cards (all except the featured one) with pagination
  get smallCards(): ServerTemperatureData[] {
    const allSmallCards = this.serverData.filter((_, index) => index !== this.featuredServerIndex());
    const startIndex = this.currentPage() * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return allSmallCards.slice(startIndex, endIndex);
  }

  // Get total number of pages for pagination
  get totalPages(): number {
    const allSmallCards = this.serverData.filter((_, index) => index !== this.featuredServerIndex());
    return Math.ceil(allSmallCards.length / this.itemsPerPage);
  }

  // Navigate to next page
  nextPage(): void {
    const maxPage = this.totalPages - 1;
    if (this.currentPage() < maxPage) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  // Navigate to previous page
  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  // Go to specific page
  goToPage(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex < this.totalPages) {
      this.currentPage.set(pageIndex);
    }
  }

  // Check if there are more pages
  get hasNextPage(): boolean {
    return this.currentPage() < this.totalPages - 1;
  }

  get hasPreviousPage(): boolean {
    return this.currentPage() > 0;
  }

  // Track function for better change detection
  trackByServerName(index: number, server: ServerTemperatureData): string {
    return server.rackName;
  }
}
