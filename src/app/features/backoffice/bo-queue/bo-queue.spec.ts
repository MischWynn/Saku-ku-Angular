import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoQueue } from './bo-queue';

describe('BoQueue', () => {
  let component: BoQueue;
  let fixture: ComponentFixture<BoQueue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoQueue],
    }).compileComponents();

    fixture = TestBed.createComponent(BoQueue);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
