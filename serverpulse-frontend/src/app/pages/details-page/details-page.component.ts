import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RackCardComponent } from '../../shared/detailsCard/detailsCard';
import { ServerDataService } from '../../services/server-data.service';
import { AddSensorFormComponent } from '../../components/addSensorForm/addSensorForm';
import { UpdateSensorFormComponent } from '../../components/updateSensorForm/updateSensorForm';

@Component({
  selector: 'app-details-page',
  standalone: true,
  imports: [CommonModule, RackCardComponent, AddSensorFormComponent, UpdateSensorFormComponent],
  templateUrl: './details-page.component.html',
  styleUrls: ['./details-page.component.scss']
})
export class DetailsPageComponent {
  showAddModal = false;
  showEditModal = signal(false);
  editingSensor = signal<{ rackId: string; rackName: string; minValue: number; maxValue: number } | null>(null);

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

  onSubmitSensor(data: { id: string; name: string; min: number; max: number }): void {
    console.log('New sensor:', data);
    // TODO: Add logic to add new sensor to service
  }

  onEditCard(data: { rackId: string; rackName: string; minValue: number; maxValue: number }): void {
    this.editingSensor.set(data);
    this.showEditModal.set(true);
  }

  onCloseEditModal(): void {
    this.showEditModal.set(false);
    this.editingSensor.set(null);
  }

  onUpdateSensor(data: { id: string; name: string; min: number; max: number }): void {
    console.log('Update sensor:', data);
    this.serverDataService.updateServerData(data.name, { 
      minTemp: data.min, 
      maxTemp: data.max 
    });
    this.onCloseEditModal();
  }
}
