import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanReviewDrawerComponent } from './loan-review-drawer';

describe('LoanReviewDrawerComponent', () => {
  let component: LoanReviewDrawerComponent;
  let fixture: ComponentFixture<LoanReviewDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanReviewDrawerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoanReviewDrawerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
