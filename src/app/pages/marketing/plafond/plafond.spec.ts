import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Plafond } from './plafond';

describe('Plafond', () => {
  let component: Plafond;
  let fixture: ComponentFixture<Plafond>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Plafond],
    }).compileComponents();

    fixture = TestBed.createComponent(Plafond);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
