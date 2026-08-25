import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerNavbar } from './customer-navbar';

describe('CustomerNavbar', () => {
  let component: CustomerNavbar;
  let fixture: ComponentFixture<CustomerNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerNavbar],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerNavbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
