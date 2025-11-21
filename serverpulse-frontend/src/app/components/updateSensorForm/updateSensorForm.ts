// update-sensor-form.component.ts
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-update-sensor-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './updateSensorForm.html',
  styleUrls: ['./updateSensorForm.scss']
})
export class UpdateSensorFormComponent implements OnInit {
  @Input() sensorId: string = '';
  @Input() sensorName: string = '';
  @Input() minValue: number = 0;
  @Input() maxValue: number = 0;
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() updateSensor = new EventEmitter<{ id: string; name: string; min: number; max: number }>();

  sensorData = {
    id: '',
    name: '',
    min: null as number | null,
    max: null as number | null
  };

  ngOnInit(): void {
    // Load existing data when component initializes
    this.sensorData = {
      id: this.sensorId,
      name: this.sensorName,
      min: this.minValue,
      max: this.maxValue
    };
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      console.log('Updated Sensor Data:', this.sensorData);
      this.updateSensor.emit({
        id: this.sensorData.id,
        name: this.sensorData.name,
        min: this.sensorData.min!,
        max: this.sensorData.max!
      });
      this.closeModal.emit();
    }
  }

  onCancel(): void {
    this.closeModal.emit();
  }

  onBackdropClick(): void {
    this.closeModal.emit();
  }

  onModalClick(event: Event): void {
    event.stopPropagation();
  }

  isFormValid(): boolean {
    return !!(
      this.sensorData.name.trim() &&
      this.sensorData.min !== null &&
      this.sensorData.max !== null &&
      this.sensorData.min < this.sensorData.max
    );
  }
}
