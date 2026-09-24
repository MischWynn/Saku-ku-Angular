import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { LoanSimulationComponent } from './simulation-calculator';

describe('LoanSimulationComponent', () => {
  let component: LoanSimulationComponent;
  let fixture: ComponentFixture<LoanSimulationComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanSimulationComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(LoanSimulationComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    // Request yang pending bikin whenStable() nunggu terus - flush dulu.
    httpMock.expectOne((req) => req.url.endsWith('/bunga-tenor')).flush({
      statusCode: 200,
      message: 'ok',
      data: [{ id: 't1', tenor: 6, interestRate: 3, status: 'ACTIVE', createdAt: '', updatedAt: '' }],
    });
    httpMock.expectOne((req) => req.url.endsWith('/plafond')).flush({ statusCode: 200, message: 'ok', data: [] });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('pakai rumus bunga flat per tenor yang sama dengan app', () => {
    // Rp10jt, 6 bulan, bunga 3% -> total 10.3jt, cicilan 10.3jt / 6
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('1,716,667');
  });
});
