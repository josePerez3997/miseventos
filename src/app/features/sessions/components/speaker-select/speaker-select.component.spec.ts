import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeakerSelectComponent } from './speaker-select.component';

describe('SpeakerSelectComponent', () => {
  let component: SpeakerSelectComponent;
  let fixture: ComponentFixture<SpeakerSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeakerSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeakerSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
