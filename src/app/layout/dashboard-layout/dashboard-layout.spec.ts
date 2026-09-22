import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { DashboardLayoutComponent } from './dashboard-layout';

describe('DashboardLayoutComponent', () => {
  let component: DashboardLayoutComponent;
  let fixture: ComponentFixture<DashboardLayoutComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    // DashboardLayoutComponent embeds NavbarComponent (httpResource -> /review-log/me) and
    // SidebarComponent (RouterLink -> needs ActivatedRoute) — same root causes/fixes as
    // navbar.spec.ts and login.spec.ts, combined since both are nested here.
    await TestBed.configureTestingModule({
      imports: [DashboardLayoutComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardLayoutComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.includes('/review-log/me')).flush({ data: [] });

    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
