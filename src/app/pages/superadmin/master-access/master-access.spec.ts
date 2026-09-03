import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { MasterAccess } from './master-access';

describe('MasterAccess', () => {
  let component: MasterAccess;
  let fixture: ComponentFixture<MasterAccess>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterAccess],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MasterAccess);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.includes('/api/v1/role')).flush({ statusCode: 200, message: 'OK', data: [] });
    httpMock.expectOne((req) => req.url.includes('/api/v1/menu')).flush({ statusCode: 200, message: 'OK', data: [] });

    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
