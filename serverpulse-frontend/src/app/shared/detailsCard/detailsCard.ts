// rack-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServerDataService } from '../../services/server-data.service';

@Component({
  selector: 'app-rack-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detailsCard.html',
  styleUrls: ['./detailsCard.scss']
})
export class RackCardComponent {
  @Input() rackName: string = 'Rack A1';
  @Input() rackId: string = 'ID332281';
  @Input() minValue: number = 22;
  @Input() maxValue: number = 30;
  @Input() isActive: boolean = true;
  
  @Output() editCard = new EventEmitter<{ rackId: string; rackName: string; minValue: number; maxValue: number }>();

  constructor(private serverDataService: ServerDataService) {}

  onToggleActive(): void {
    console.log('Active status:', this.isActive);
    this.serverDataService.updateServerStatus(this.rackName, this.isActive);
  }

  onEdit(): void {
    console.log('Edit clicked');
    this.editCard.emit({
      rackId: this.rackId,
      rackName: this.rackName,
      minValue: this.minValue,
      maxValue: this.maxValue
    });
  }

  onDelete(): void {
    console.log('Delete clicked');
  }
}