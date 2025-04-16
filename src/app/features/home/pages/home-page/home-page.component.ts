import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Event, EventSearchParams } from '../../../../core/models/event.model';
import { EventRepository } from '../../../../data/repositories/event.repository';
import { EventCardComponent } from '../../components/event-card/event-card.component';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, EventCardComponent]
})
export class HomePageComponent implements OnInit {
  events: Event[] = [];
  totalEvents = 0;
  page = 1;
  pageSize = 12;
  searchControl = new FormControl('');
  loading = false;
  error = '';
  Math = Math;

  constructor(
    private eventRepository: EventRepository,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.page = params['page'] ? parseInt(params['page'], 10) : 1;
      if (params['search']) {
        this.searchControl.setValue(params['search'], { emitEvent: false });
      }
      this.loadEvents();
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.page = 1;
      this.updateUrl();
      this.loadEvents();
    });
  }

  loadEvents(): void {
    this.loading = true;
    const params: EventSearchParams = {
      page: this.page,
      pageSize: this.pageSize,
      searchTerm: this.searchControl.value || undefined
    };

    this.eventRepository.getEvents(params).subscribe({
      next: (response) => {
        this.events = response.events;
        this.totalEvents = response.totalCount;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load events. Please try again.';
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.page = page;
    this.updateUrl();
    this.loadEvents();
    window.scrollTo(0, 0);
  }

  private updateUrl(): void {
    const queryParams: any = { page: this.page };
    if (this.searchControl.value) {
      queryParams.search = this.searchControl.value;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }
}