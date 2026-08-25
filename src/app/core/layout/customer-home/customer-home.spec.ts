import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerHome } from './customer-home';

describe('CustomerHome', () => {
  let component: CustomerHome;
  let fixture: ComponentFixture<CustomerHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerHome],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
