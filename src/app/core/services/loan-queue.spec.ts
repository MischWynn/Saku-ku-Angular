import { TestBed } from '@angular/core/testing';

import { LoanQueue } from './loan-queue';

describe('LoanQueue', () => {
  let service: LoanQueue;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoanQueue);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
