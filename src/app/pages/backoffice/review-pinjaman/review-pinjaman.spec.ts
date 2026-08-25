import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewPinjaman } from './review-pinjaman';

describe('ReviewPinjaman', () => {
  let component: ReviewPinjaman;
  let fixture: ComponentFixture<ReviewPinjaman>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewPinjaman],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewPinjaman);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
