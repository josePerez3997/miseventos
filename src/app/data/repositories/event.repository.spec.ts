import { TestBed } from '@angular/core/testing';

import { EventRepositoryService } from './event.repository';

describe('EventRepositoryService', () => {
  let service: EventRepositoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventRepositoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
