import { Injectable, signal } from '@angular/core';

export interface ServerTemperatureData {
  rackName: string;
  currentTemp: number;
  minTemp: number;
  maxTemp: number;
  unit: 'celsius' | 'fahrenheit';
  rackId?: string;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ServerDataService {
  private readonly STORAGE_KEY = 'serverpulse_server_data';

  // Default server data
  private defaultServerData: ServerTemperatureData[] = [
    {
      rackName: 'Rack 01',
      rackId: 'ID332281',
      currentTemp: 22,
      minTemp: 15,
      maxTemp: 35,
      unit: 'celsius',
      isActive: true
    },
    {
      rackName: 'Rack 02',
      rackId: 'ID332282',
      currentTemp: 28,
      minTemp: 20,
      maxTemp: 35,
      unit: 'celsius',
      isActive: true
    },
    {
      rackName: 'Rack 03',
      rackId: 'ID332283',
      currentTemp: 42,
      minTemp: 25,
      maxTemp: 40,
      unit: 'celsius',
      isActive: false
    },
    {
      rackName: 'Rack 04',
      rackId: 'ID332284',
      currentTemp: 19,
      minTemp: 15,
      maxTemp: 30,
      unit: 'celsius',
      isActive: true
    },
    {
      rackName: 'Rack 05',
      rackId: 'ID332285',
      currentTemp: 33,
      minTemp: 20,
      maxTemp: 35,
      unit: 'celsius',
      isActive: true
    },
    {
      rackName: 'Rack 06',
      rackId: 'ID332286',
      currentTemp: 38,
      minTemp: 22,
      maxTemp: 35,
      unit: 'celsius',
      isActive: true
    },
    {
      rackName: 'Rack 07',
      rackId: 'ID332287',
      currentTemp: 25,
      minTemp: 18,
      maxTemp: 32,
      unit: 'celsius',
      isActive: true
    },
    {
      rackName: 'Rack 08',
      rackId: 'ID332288',
      currentTemp: 35,
      minTemp: 20,
      maxTemp: 38,
      unit: 'celsius',
      isActive: true
    },
    {
      rackName: 'Rack 09',
      rackId: 'ID332289',
      currentTemp: 41,
      minTemp: 22,
      maxTemp: 40,
      unit: 'celsius',
      isActive: false
    },
    {
      rackName: 'Rack 10',
      rackId: 'ID332290',
      currentTemp: 21,
      minTemp: 16,
      maxTemp: 30,
      unit: 'celsius',
      isActive: true
    }
  ];

  // Shared server data with signals for reactivity
  private serverDataSignal = signal<ServerTemperatureData[]>(this.loadFromStorage());

  // Public read-only signal
  serverData = this.serverDataSignal.asReadonly();

  constructor() {
    // Initialize from localStorage or use defaults
    const storedData = this.loadFromStorage();
    if (storedData.length > 0) {
      this.serverDataSignal.set(storedData);
    }
  }

  // Load data from localStorage
  private loadFromStorage(): ServerTemperatureData[] {
    if (typeof window === 'undefined') {
      return this.defaultServerData;
    }
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    return this.defaultServerData;
  }

  // Save data to localStorage
  private saveToStorage(data: ServerTemperatureData[]): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Update a server's active status
  updateServerStatus(rackName: string, isActive: boolean): void {
    this.serverDataSignal.update(data => {
      const updated = data.map(server => 
        server.rackName === rackName 
          ? { ...server, isActive } 
          : server
      );
      this.saveToStorage(updated);
      return updated;
    });
  }

  // Update server temperature data
  updateServerData(rackName: string, updates: Partial<ServerTemperatureData>): void {
    this.serverDataSignal.update(data => {
      const updated = data.map(server => 
        server.rackName === rackName 
          ? { ...server, ...updates } 
          : server
      );
      this.saveToStorage(updated);
      return updated;
    });
  }

  // Delete a server
  deleteServer(rackName: string): void {
    this.serverDataSignal.update(data => {
      const updated = data.filter(server => server.rackName !== rackName);
      this.saveToStorage(updated);
      return updated;
    });
  }
}
