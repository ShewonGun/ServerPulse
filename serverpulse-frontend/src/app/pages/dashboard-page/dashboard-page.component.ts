import { Component, signal, OnInit, OnDestroy, PLATFORM_ID, Inject, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ServerCardComponent } from '../../shared/serverCard/server-card-component';
import { ServerDataService, ServerTemperatureData } from '../../services/server-data.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [ServerCardComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  // Current featured server (large card)
  featuredServerIndex = signal(0);
  
  // Pagination for small cards
  currentPage = signal(0);
  readonly itemsPerPage = 6;
  
  // Mobile view detection
  isMobileView = signal(false);
  
  // Array constructor for template
  protected readonly Array = Array;
  
  // Auto-rotation interval
  private rotationInterval?: any;

  // Get server data from shared service (only active servers)
  serverData = computed(() => this.serverDataService.serverData().filter(server => server.isActive !== false));

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private serverDataService: ServerDataService
  ) {}

  ngOnInit(): void {
    console.log('DashboardPage ngOnInit called');
    // Only run in browser environment
    if (isPlatformBrowser(this.platformId)) {
      // Check if mobile view
      this.checkMobileView();
      
      // Listen for window resize
      window.addEventListener('resize', () => this.checkMobileView());
      
      // Start auto-rotation every 5 seconds (only if not mobile)
      if (!this.isMobileView()) {
        console.log('Starting rotation...');
        this.startRotation();
      }
    }
  }

  ngOnDestroy(): void {
    // Only clean up in browser environment
    if (isPlatformBrowser(this.platformId)) {
      // Clear interval on component destruction
      if (this.rotationInterval) {
        clearInterval(this.rotationInterval);
      }
      
      // Remove resize listener
      window.removeEventListener('resize', () => this.checkMobileView());
    }
  }

  private checkMobileView(): void {
    // Only check in browser environment
    if (isPlatformBrowser(this.platformId)) {
      const wasMobile = this.isMobileView();
      const isMobile = window.innerWidth <= 768;
      this.isMobileView.set(isMobile);
      
      // Only change rotation state if mobile view status actually changed
      if (wasMobile !== isMobile) {
        console.log('View changed from', wasMobile ? 'mobile' : 'desktop', 'to', isMobile ? 'mobile' : 'desktop');
        
        if (isMobile) {
          // Switched to mobile - stop rotation
          if (this.rotationInterval) {
            console.log('Stopping rotation (mobile view)');
            clearInterval(this.rotationInterval);
            this.rotationInterval = undefined;
          }
        } else {
          // Switched to desktop - start rotation
          if (!this.rotationInterval) {
            console.log('Starting rotation (desktop view)');
            this.startRotation();
          }
        }
      }
    }
  }

  private startRotation(): void {
    console.log('startRotation called, existing interval:', this.rotationInterval);
    
    // Clear any existing interval first to prevent duplicates
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
    }
    
    this.rotationInterval = setInterval(() => {
      // Get current index and calculate next
      const data = this.serverData();
      let nextIndex = this.featuredServerIndex() + 1;
      
      // Wrap around to 0 if we've reached the end
      if (nextIndex >= data.length) {
        nextIndex = 0;
      }
      
      console.log('Rotation:', this.featuredServerIndex(), '→', nextIndex, 'Rack:', data[nextIndex].rackName);
      this.featuredServerIndex.set(nextIndex);
      
      // Reset to first page when featured card changes to avoid skipping cards
      this.currentPage.set(0);
    }, 5000); // 5 seconds
  }

  // Get the currently featured server
  get featuredServer(): ServerTemperatureData {
    return this.serverData()[this.featuredServerIndex()];
  }

  // Get the smaller cards (all except the featured one) with pagination
  get smallCards(): ServerTemperatureData[] {
    const data = this.serverData();
    // In mobile view, show all cards
    if (this.isMobileView()) {
      return data;
    }
    
    const allSmallCards = data.filter((_, index) => index !== this.featuredServerIndex());
    const startIndex = this.currentPage() * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return allSmallCards.slice(startIndex, endIndex);
  }

  // Get total number of pages for pagination
  get totalPages(): number {
    const allSmallCards = this.serverData().filter((_, index) => index !== this.featuredServerIndex());
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