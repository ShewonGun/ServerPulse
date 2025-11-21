// add-sensor-form.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-sensor-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addSensorForm.html',
  styleUrls: ['./addSensorForm.scss']
})
export class AddSensorFormComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() submitSensor = new EventEmitter<{ name: string; min: number; max: number }>();

  sensorData = {
    name: '',
    min: null as number | null,
    max: null as number | null
  };

  onSubmit(): void {
    if (this.isFormValid()) {
      console.log('Sensor Data:', this.sensorData);
      this.submitSensor.emit({
        name: this.sensorData.name,
        min: this.sensorData.min!,
        max: this.sensorData.max!
      });
      this.resetForm();
      this.closeModal.emit();
    }
  }

  onCancel(): void {
    this.resetForm();
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

  resetForm(): void {
    this.sensorData = {
      name: '',
      min: null,
      max: null
    };
  }
}