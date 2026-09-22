import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Overview } from './overview';

describe('Overview', () => {
  let component: Overview;
  let fixture: ComponentFixture<Overview>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    // Overview fires 2 httpResource() calls (dashboard/superadmin/summary + /aktivitas) with
    // no HttpTestingController mocking those requests hit the real network, error out, and
    // crash change detection when the template reads the errored resource — same root cause/
    // fix pattern as pengajuan.spec.ts/navbar.spec.ts, just with 2 requests to flush instead of 1.
    await TestBed.configureTestingModule({
      imports: [Overview],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Overview);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    httpMock
      .expectOne((req) => req.url.includes('/dashboard/superadmin/summary'))
      .flush({ statusCode: 200, message: 'OK', data: null });
    httpMock
      .expectOne((req) => req.url.includes('/dashboard/superadmin/aktivitas'))
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
