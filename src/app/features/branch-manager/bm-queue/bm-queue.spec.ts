import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BmQueue } from './bm-queue';

describe('BmQueue', () => {
  let component: BmQueue;
  let fixture: ComponentFixture<BmQueue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BmQueue],
    }).compileComponents();

    fixture = TestBed.createComponent(BmQueue);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
