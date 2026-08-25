import { TestBed } from '@angular/core/testing';

import { MasterAdmin } from './master-admin';

describe('MasterAdmin', () => {
  let service: MasterAdmin;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MasterAdmin);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
