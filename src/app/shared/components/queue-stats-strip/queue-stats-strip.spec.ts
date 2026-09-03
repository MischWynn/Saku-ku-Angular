import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueueStatsStrip } from './queue-stats-strip';

describe('QueueStatsStrip', () => {
  let component: QueueStatsStrip;
  let fixture: ComponentFixture<QueueStatsStrip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueueStatsStrip],
    }).compileComponents();

    fixture = TestBed.createComponent(QueueStatsStrip);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
