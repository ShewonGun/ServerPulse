// rack-card.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServerDataService } from '../../services/server-data.service';

@Component({
  selector: 'app-rack-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detailsCard.html',
  styleUrls: ['./detailsCard.scss']
})
export class RackCardComponent implements OnInit, OnDestroy {
  @Input() rackName: string = 'Rack A1';
  @Input() rackId: string = 'ID332281';
  @Input() minValue: number = 22;
  @Input() maxValue: number = 30;
  @Input() isActive: boolean = true;
  
  @Output() editCard = new EventEmitter<{ rackId: string; rackName: string; minValue: number; maxValue: number }>();
  @Output() deleteCard = new EventEmitter<string>();

  showDeleteConfirm = false;
  showToggleConfirm = false;
  pendingActiveStatus = false;

  constructor(
    private serverDataService: ServerDataService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    // Ensure body scroll is restored if component is destroyed while modal is open
    if (this.showDeleteConfirm || this.showToggleConfirm) {
      this.document.body.style.overflow = '';
    }
  }

  onToggleClick(): void {
    // Store the intended new status (opposite of current)
    this.pendingActiveStatus = !this.isActive;
    this.showToggleConfirm = true;
    this.document.body.style.overflow = 'hidden';
  }

  confirmToggle(): void {
    console.log('Toggle confirmed:', this.pendingActiveStatus ? 'Activating' : 'Deactivating', this.rackName);
    this.isActive = this.pendingActiveStatus;
    this.serverDataService.updateServerStatus(this.rackName, this.isActive);
    this.showToggleConfirm = false;
    this.document.body.style.overflow = '';
  }

  cancelToggle(): void {
    console.log('Toggle cancelled');
    this.showToggleConfirm = false;
    this.document.body.style.overflow = '';
  }

  onToggleBackdropClick(): void {
    this.cancelToggle();
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
    console.log('Delete clicked - showing confirmation');
    this.showDeleteConfirm = true;
    this.document.body.style.overflow = 'hidden';
  }

  confirmDelete(): void {
    console.log('Delete confirmed for:', this.rackName);
    this.showDeleteConfirm = false;
    this.document.body.style.overflow = '';
    this.deleteCard.emit(this.rackName);
  }

  cancelDelete(): void {
    console.log('Delete cancelled');
    this.showDeleteConfirm = false;
    this.document.body.style.overflow = '';
  }

  onConfirmBackdropClick(): void {
    this.cancelDelete();
  }

  onConfirmModalClick(event: Event): void {
    event.stopPropagation();
  }
}