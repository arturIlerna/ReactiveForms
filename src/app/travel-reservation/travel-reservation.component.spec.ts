import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelReservationComponent } from './travel-reservation.component';

describe('TravelReservationComponent', () => {
  let component: TravelReservationComponent;
  let fixture: ComponentFixture<TravelReservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelReservationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
