import { Component, Input, OnInit, OnDestroy, PLATFORM_ID, Inject, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

export interface TemperatureHistoryPoint {
  date: Date;
  temperature: number;
}

export interface ServerTemperatureData {
  rackName: string;
  currentTemp: number;
  minTemp: number;
  maxTemp: number;
  unit?: 'celsius' | 'fahrenheit'; // Optional, defaults to celsius
  temperatureHistory?: TemperatureHistoryPoint[]; // 14-day history
}

@Component({
  selector: 'app-server-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './server-card-component.html',
  styleUrls: ['./server-card-component.scss']
})
export class ServerCardComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() data!: ServerTemperatureData;
  @Input() showChart: boolean = true; // Control whether to show the trend chart
  @ViewChild('trendChart', { static: false }) trendChart?: ElementRef<HTMLCanvasElement>;
  
  // Gauge animation properties
  gaugeProgress: number = 0;
  private animationFrame?: number;
  
  // Chart instance to properly destroy and recreate
  private chartInstance?: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    // Ensure gauge has valid data before proceeding
    if (!this.data || this.data.currentTemp === undefined || this.data.minTemp === undefined || this.data.maxTemp === undefined) {
      console.error(`Invalid data for ${this.data?.rackName || 'unknown'}:`, this.data);
      return;
    }
    
    if (isPlatformBrowser(this.platformId)) {
      // Always set gauge progress immediately to ensure it displays
      this.gaugeProgress = this.gaugePercentage;
      
      // Only animate for featured cards in desktop view
      // Mobile view and small cards get immediate display
      if (this.showChart && window.innerWidth > 768) {
        // Reset and animate for featured card on desktop
        this.gaugeProgress = 0;
        setTimeout(() => this.animateGauge(), 100);
      }
    } else {
      // For SSR, set progress directly without animation
      this.gaugeProgress = this.gaugePercentage;
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    // Destroy chart instance if it exists
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // When data changes, update the gauge animation and recreate chart if needed
    if (changes['data'] && !changes['data'].firstChange) {
      // Update gauge immediately for responsive feel
      if (isPlatformBrowser(this.platformId)) {
        // Cancel any existing animation first
        if (this.animationFrame) {
          cancelAnimationFrame(this.animationFrame);
          this.animationFrame = undefined;
        }
        
        // For fast rotation, update immediately without animation
        this.gaugeProgress = this.gaugePercentage;
      } else {
        this.gaugeProgress = this.gaugePercentage;
      }
      
      // Recreate chart with new data if chart is shown
      if (this.showChart && this.trendChart) {
        console.log(`Recreating chart for ${changes['data'].currentValue.rackName}`);
        setTimeout(() => {
          if (isPlatformBrowser(this.platformId)) {
            this.createTrendChart();
          }
        }, 150);
      }
    }

    // When showChart changes from false to true, ensure gauge is set and create the chart
    if (changes['showChart']) {
      if (isPlatformBrowser(this.platformId)) {
        // Ensure gauge progress is set when showChart changes
        this.gaugeProgress = this.gaugePercentage;
        
        // If chart is now shown, create it
        if (changes['showChart'].currentValue === true) {
          // Delay chart creation slightly to ensure DOM is ready
          setTimeout(() => {
            if (this.trendChart) {
              this.createTrendChart();
            }
          }, 100);
        }
      }
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && this.showChart) {
      this.createTrendChart();
    }
  }

  /**
   * Calculate average temperature (midpoint between min and max)
   */
  get avgTemp(): number {
    return Math.round((this.data.minTemp + this.data.maxTemp) / 2);
  }

  /**
   * Automatically determine status based on current temperature position
   */
  get status(): 'normal' | 'warning' | 'critical' {
    const temp = this.data.currentTemp;
    const min = this.data.minTemp;
    const max = this.data.maxTemp;
    const range = max - min;
    const safeZoneEnd = min + (range * 0.5); // 50% of range is safe (green)
    
    if (temp <= safeZoneEnd) {
      return 'normal';      // Green zone - safe
    } else if (temp <= max) {
      return 'warning';     // Yellow zone - approaching max
    } else {
      return 'critical';    // Red zone - exceeded max
    }
  }

  /**
   * Calculate gauge percentage based on actual temperature range
   */
  get gaugePercentage(): number {
    // Validate input data
    if (!this.data || this.data.maxTemp === undefined || this.data.minTemp === undefined || this.data.currentTemp === undefined) {
      console.error(`Invalid data for gauge calculation:`, this.data);
      return 0;
    }
    
    const tempRange = this.data.maxTemp - this.data.minTemp;
    
    // Handle invalid ranges
    if (tempRange <= 0) {
      console.error(`Invalid temperature range for ${this.data.rackName}: min=${this.data.minTemp}, max=${this.data.maxTemp}`);
      return 0;
    }
    
    const currentOffset = Math.max(0, this.data.currentTemp - this.data.minTemp);
    const percentage = (currentOffset / tempRange) * 100;
    const result = Math.min(150, Math.max(0, percentage)); // Allow up to 150% for exceeded temps
    
    return result;
  }

  /**
   * Get status color based on automatically determined status
   */
  get statusColor(): string {
    const currentStatus = this.status;
    
    if (currentStatus === 'critical') {
      return '#ff4444'; // Red - critical/exceeded max
    } else if (currentStatus === 'warning') {
      return '#ffaa00'; // Yellow/Orange - approaching max
    }
    return '#00ff88'; // Green - safe zone
  }

  /**
   * Get unique gradient ID for this component instance
   */
  get gradientId(): string {
    return `tempGradient_${this.data.rackName.replace(/\s+/g, '_')}`;
  }

  /**
   * Get gradient URL based on dynamic gradient ID
   */
  get gradientUrl(): string {
    return `url(#${this.gradientId})`;
  }

  /**
   * Enhanced gradient zone calculations for smooth transitions
   */
  get greenZoneEnd(): number {
    return 25; // Pure green zone ends at 25%
  }

  get greenToYellowStart(): number {
    return 30; // Green-to-yellow transition starts at 30%
  }

  get greenToYellowEnd(): number {
    return 45; // Green-to-yellow transition ends at 45%
  }

  get yellowZoneStart(): number {
    return 50; // Pure yellow zone starts at 50%
  }

  get yellowZoneEnd(): number {
    return 65; // Pure yellow zone ends at 65%
  }

  get yellowToRedStart(): number {
    return 70; // Yellow-to-red transition starts at 70%
  }

  get yellowToRedMid(): number {
    return 80; // Yellow-to-red transition midpoint at 80%
  }

  get yellowToRedEnd(): number {
    return 90; // Yellow-to-red transition ends at 90%
  }

  // Keep the legacy safeZoneEnd for backward compatibility
  get safeZoneEnd(): number {
    return this.greenZoneEnd;
  }

  /**
   * Get semicircle arc length
   */
  get semicircleLength(): number {
    const radius = 80; // radius for the semicircle
    return Math.PI * radius; // Half circumference for semicircle
  }

  /**
   * Calculate stroke dash offset for semicircular gauge animation
   */
  get strokeDashoffset(): number {
    const arcLength = 251.33; // Semicircle length (π * 80)
    
    // Safety check: if gaugeProgress is undefined/null/NaN, use gaugePercentage directly
    let progress = this.gaugeProgress;
    if (progress === undefined || progress === null || isNaN(progress)) {
      console.warn(`${this.data.rackName}: Invalid gaugeProgress (${progress}), using gaugePercentage (${this.gaugePercentage})`);
      progress = this.gaugePercentage;
      this.gaugeProgress = progress; // Fix the invalid state
    }
    
    progress = Math.min(100, progress); // Cap at 100% for visual
    const offset = arcLength - (progress / 100) * arcLength;
    
    return offset;
  }

  /**
   * Animate gauge from 0 to target percentage
   */
  private animateGauge(): void {
    if (!isPlatformBrowser(this.platformId)) {
      // For SSR, set progress directly without animation
      this.gaugeProgress = this.gaugePercentage;
      return;
    }

    const startPercentage = this.gaugeProgress; // Start from current position
    const targetPercentage = this.gaugePercentage;
    const duration = 300; // Fast animation for quick data changes
    const startTime = performance.now();

    console.log(`Animating gauge from ${startPercentage}% to ${targetPercentage}% for ${this.data.rackName}`);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      // Interpolate from start to target
      const currentProgress = startPercentage + (targetPercentage - startPercentage) * easeOutCubic;
      this.gaugeProgress = currentProgress;

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        // Ensure we end up exactly at the target
        this.gaugeProgress = targetPercentage;
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  /**
   * Get temperature unit symbol
   */
  get unitSymbol(): string {
    return (this.data.unit || 'celsius') === 'fahrenheit' ? '°F' : '°C';
  }

  /**
   * Get unit display text
   */
  get unitText(): string {
    return (this.data.unit || 'celsius') === 'fahrenheit' ? 'FAHRENHEIT' : 'CELSIUS';
  }

  /**
   * Create mini temperature trend chart for this server
   */
  private async createTrendChart(): Promise<void> {
    if (!this.trendChart || !isPlatformBrowser(this.platformId)) return;

    // Destroy existing chart if it exists
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    try {
      // Dynamic import of Chart.js only in browser
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      const ctx = this.trendChart.nativeElement.getContext('2d');
      if (!ctx) return;

      // Generate or use provided temperature history
      const historyData = this.data.temperatureHistory || this.generateTemperatureHistory();
      
      // Prepare chart data
      const labels = historyData.map(point => {
        const date = new Date(point.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      });
      
      const temperatures = historyData.map(point => point.temperature);

      // Create gradient that matches the gauge colors based on status
      const gradient = ctx.createLinearGradient(0, 0, 0, 80);
      
      // Match the exact colors from the temperature gauge
      if (this.status === 'critical') {
        gradient.addColorStop(0, '#ff444460'); // Red with transparency
        gradient.addColorStop(1, '#ff444410');
      } else if (this.status === 'warning') {
        gradient.addColorStop(0, '#ffaa0060'); // Yellow with transparency  
        gradient.addColorStop(1, '#ffaa0010');
      } else {
        gradient.addColorStop(0, '#00ff8860'); // Green with transparency
        gradient.addColorStop(1, '#00ff8810');
      }

      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Temperature',
            data: temperatures,
            borderColor: this.status === 'critical' ? '#ff4444' : 
                        this.status === 'warning' ? '#ffaa00' : '#00ff88',
            backgroundColor: gradient,
            borderWidth: 2,
            fill: true,
            tension: 0.4, // Smooth curves
            pointRadius: 0, // Hide points for cleaner look
            pointHoverRadius: 4,
            pointHoverBackgroundColor: this.status === 'critical' ? '#ff4444' : 
                                     this.status === 'warning' ? '#ffaa00' : '#00ff88',
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              displayColors: false,
              backgroundColor: '#1a1a1a',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: this.statusColor,
              borderWidth: 1,
              callbacks: {
                label: (context: any) => `${context.parsed.y}°C`
              }
            }
          },
          scales: {
            x: {
              display: false, // Hide x-axis for mini chart
            },
            y: {
              display: false, // Hide y-axis for mini chart
              min: this.data.minTemp - 2,
              max: this.data.maxTemp + 2,
            }
          },
          interaction: {
            intersect: false,
            mode: 'index'
          }
        }
      });
    } catch (error) {
      console.warn('Failed to load Chart.js for trend chart:', error);
    }
  }

  /**
   * Generate sample temperature history for the past 14 days
   */
  private generateTemperatureHistory(): TemperatureHistoryPoint[] {
    const history: TemperatureHistoryPoint[] = [];
    const currentTemp = this.data.currentTemp;
    const minTemp = this.data.minTemp;
    const maxTemp = this.data.maxTemp;
    
    // Generate 14 days of data
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate temperature with some variation around current temp
      // but staying mostly within the min/max range
      const baseTemp = currentTemp + (Math.random() - 0.5) * 6; // ±3°C variation
      const temperature = Math.max(minTemp - 1, Math.min(maxTemp + 1, baseTemp));
      
      history.push({
        date,
        temperature: Math.round(temperature * 10) / 10 // Round to 1 decimal
      });
    }
    
    return history;
  }
}