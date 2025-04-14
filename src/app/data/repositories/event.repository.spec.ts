import { TestBed } from '@angular/core/testing';

import { EventRepository } from './event.repository';

describe('EventRepositoryService', () => {
  let service: EventRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventRepository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
