import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanSimulationComponent } from './simulation-calculator';

describe('LoanSimulationComponent', () => {
  let component: LoanSimulationComponent;
  let fixture: ComponentFixture<LoanSimulationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanSimulationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoanSimulationComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
