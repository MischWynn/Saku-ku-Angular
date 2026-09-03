import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ReviewPinjaman } from './review-pinjaman';

describe('ReviewPinjaman', () => {
  let component: ReviewPinjaman;
  let fixture: ComponentFixture<ReviewPinjaman>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewPinjaman],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewPinjaman);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    httpMock
      .expectOne((req) => req.url.includes('/pengajuan/status/MARKETING_REVIEW'))
      .flush({ statusCode: 200, message: 'OK', data: [] });

    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
