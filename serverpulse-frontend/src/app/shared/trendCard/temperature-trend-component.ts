import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

export interface TemperatureTrendData {
  date: Date;
  temperature: number;
}

@Component({
  selector: 'app-temperature-trend',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './temperature-trend-component.html',
  styleUrls: ['./temperature-trend-component.scss']
})
export class TemperatureTrendComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() data: TemperatureTrendData[] = [];
  @Input() title: string = '14-DAY TEMPERATURE TREND';
  @Input() days: number = 14;
  
  private chart?: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    // If no data provided, generate sample data for 14 days
    if (this.data.length === 0) {
      this.data = this.generateSampleData();
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.createChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  /**
   * Generate sample temperature data for testing
   */
  private generateSampleData(): TemperatureTrendData[] {
    const data: TemperatureTrendData[] = [];
    const today = new Date();
    
    for (let i = this.days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate temperature between 20°C and 28°C with wave pattern
      const baseTemp = 24;
      const variation = Math.sin(i * 0.5) * 3 + Math.random() * 2;
      const temperature = Math.round((baseTemp + variation) * 10) / 10;
      
      data.push({ date, temperature });
    }
    
    return data;
  }

  /**
   * Create the Chart.js chart with custom styling
   */
  private async createChart(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !this.chartCanvas) return;

    // Dynamic import of Chart.js to avoid SSR issues
    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Prepare data for Chart.js
    const labels = this.data.map(d => this.formatDate(d.date));
    const temperatures = this.data.map(d => d.temperature);

    // Create gradient for the area fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0, 255, 136, 0.5)');
    gradient.addColorStop(0.3, 'rgba(0, 255, 136, 0.3)');
    gradient.addColorStop(0.7, 'rgba(0, 255, 136, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');

    const config: any = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Temperature',
          data: temperatures,
          borderColor: '#00ff88',
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4, // Smooth curves
          pointRadius: 0, // Hide points
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#00ff88',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#00ff88',
            bodyColor: '#ffffff',
            borderColor: '#00ff88',
            borderWidth: 2,
            padding: 16,
            displayColors: false,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 16,
              weight: 'bold'
            },
            callbacks: {
              title: (context: any) => {
                return context[0].label;
              },
              label: (context: any) => {
                return `${context.parsed.y}°C`;
              }
            }
          }
        },
        scales: {
          x: {
            display: false, // Hide x-axis
            grid: {
              display: false
            }
          },
          y: {
            display: false, // Hide y-axis
            grid: {
              display: false
            },
            beginAtZero: false
          }
        },
        layout: {
          padding: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  /**
   * Update chart with new data
   */
  updateChart(newData: TemperatureTrendData[]): void {
    if (!this.chart) return;

    this.data = newData;
    const labels = newData.map(d => this.formatDate(d.date));
    const temperatures = newData.map(d => d.temperature);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = temperatures;
    this.chart.update('active');
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  }

  /**
   * Get temperature statistics
   */
  get statistics() {
    if (this.data.length === 0) {
      return { min: 0, max: 0, avg: 0, current: 0 };
    }

    const temperatures = this.data.map(d => d.temperature);
    const min = Math.min(...temperatures);
    const max = Math.max(...temperatures);
    const avg = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const current = temperatures[temperatures.length - 1];

    return {
      min: Math.round(min * 10) / 10,
      max: Math.round(max * 10) / 10,
      avg: Math.round(avg * 10) / 10,
      current: Math.round(current * 10) / 10
    };
  }
}