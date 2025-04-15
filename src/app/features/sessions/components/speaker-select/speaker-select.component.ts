import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Speaker } from '../../../../core/models/event.model';
import { SessionRepository } from '../../../../data/repositories/session.repository';

@Component({
  selector: 'app-speaker-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './speaker-select.component.html',
  styleUrls: ['./speaker-select.component.scss']
})
export class SpeakerSelectComponent implements OnInit {
  @Input() selectedSpeaker?: Speaker;
  @Output() speakerSelected = new EventEmitter<Speaker>();

  speakers: Speaker[] = [];
  loading = false;
  error = '';
  selectedSpeakerId?: number;
  showSpeakerDetails = false;

  constructor(private sessionRepository: SessionRepository) { }

  ngOnInit(): void {
    this.loadSpeakers();
    this.selectedSpeakerId = this.selectedSpeaker?.id;
  }

  loadSpeakers(): void {
    this.loading = true;
    this.error = '';

    this.sessionRepository.getSpeakers().subscribe({
      next: (speakers) => {
        this.speakers = speakers;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading speakers', err);
        this.error = 'Error al cargar los ponentes. Por favor, inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }

  onSpeakerChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const speakerId = parseInt(select.value, 10);

    if (speakerId) {
      const speaker = this.speakers.find(s => s.id === speakerId);
      if (speaker) {
        this.selectedSpeaker = speaker;
        this.speakerSelected.emit(speaker);
        this.showSpeakerDetails = true;
      }
    } else {
      this.selectedSpeaker = undefined;
      this.speakerSelected.emit(undefined);
      this.showSpeakerDetails = false;
    }
  }

  toggleSpeakerDetails(): void {
    this.showSpeakerDetails = !this.showSpeakerDetails;
  }
}