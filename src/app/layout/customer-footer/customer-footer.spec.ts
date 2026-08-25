import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerFooter } from './customer-footer';

describe('CustomerFooter', () => {
  let component: CustomerFooter;
  let fixture: ComponentFixture<CustomerFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerFooter],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerFooter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
