import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanQueueListComponent } from './loan-queue-list';

describe('LoanQueueListComponent', () => {
  let component: LoanQueueListComponent;
  let fixture: ComponentFixture<LoanQueueListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanQueueListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoanQueueListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
