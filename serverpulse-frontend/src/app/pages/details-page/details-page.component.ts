import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RackCardComponent } from '../../shared/detailsCard/detailsCard';
import { ServerDataService } from '../../services/server-data.service';
import { AddSensorFormComponent } from '../../components/addSensorForm/addSensorForm';

@Component({
  selector: 'app-details-page',
  standalone: true,
  imports: [CommonModule, RackCardComponent, AddSensorFormComponent],
  templateUrl: './details-page.component.html',
  styleUrls: ['./details-page.component.scss']
})
export class DetailsPageComponent {
  showAddModal = false;

  // Get server data from shared service
  racks = computed(() => 
    this.serverDataService.serverData().map(server => ({
      rackName: server.rackName,
      rackId: server.rackId || 'N/A',
      minValue: server.minTemp,
      maxValue: server.maxTemp,
      isActive: server.isActive ?? true
    }))
  );

  constructor(private serverDataService: ServerDataService) {}

  onAddCard(): void {
    this.showAddModal = true;
  }

  onCloseModal(): void {
    this.showAddModal = false;
  }

  onSubmitSensor(data: { name: string; min: number; max: number }): void {
    console.log('New sensor:', data);
    // TODO: Add logic to add new sensor to service
  }
}
