import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RackCardComponent } from '../../shared/detailsCard/detailsCard';
import { ServerDataService } from '../../services/server-data.service';

@Component({
  selector: 'app-details-page',
  standalone: true,
  imports: [CommonModule, RackCardComponent],
  templateUrl: './details-page.component.html',
  styleUrls: ['./details-page.component.scss']
})
export class DetailsPageComponent {
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
}
