import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ReviewPinjaman } from './review-pinjaman';
import { ApiPengajuan } from '../../../shared/models/pengajuan-api.model';

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

/**
 * `totalCount`/`totalAmount`/`avgAmount` (from `ReviewQueueBase`, shared by all 3 role
 * containers — see CLAUDE.md "Dashboard staff digabung ke Review Pinjaman") previously had
 * no coverage beyond the implicit empty-array case in the "should create" test above. These
 * are `protected` computed signals (inherited, not part of ReviewPinjaman's own public API),
 * accessed here via a cast the same way most Angular test suites reach protected component
 * state — no production code was changed to make this testable.
 */
function buildApiPengajuan(overrides: Partial<ApiPengajuan> = {}): ApiPengajuan {
  return {
    id: 'pengajuan-1',
    status: 'MARKETING_REVIEW',
    nominalPengajuan: 5_000_000,
    nominalDisetujui: null,
    tujuanPinjaman: 'MODAL_USAHA',
    tenor: 12,
    interestRate: 3,
    tanggalPengajuan: '2026-01-01',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    customer: {
      id: 'customer-1',
      namaLengkap: 'Novita Sari',
      nik: '3201234567890001',
      email: 'novita.sari@mail.com',
      noHp: '081234567890',
      alamat: 'Jl. Merdeka No. 1',
      plafond: 12_000_000,
      status: 'ACTIVE',
      tanggalLahir: null,
      tipePekerjaan: null,
      pekerjaan: null,
      lamaBekerjaBulan: null,
      pendapatanBulanan: null,
      utangBerjalan: null,
    },
    bungaTenor: {
      id: 'bunga-tenor-1',
      tenor: 12,
      interestRate: 3,
      status: 'ACTIVE',
    },
    ...overrides,
  };
}

describe('ReviewPinjaman — stat strip computed signals (totalCount/totalAmount/avgAmount)', () => {
  let component: ReviewPinjaman;
  let fixture: ComponentFixture<ReviewPinjaman>;
  let httpMock: HttpTestingController;

  async function setup(items: ApiPengajuan[]) {
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
      .flush({ statusCode: 200, message: 'OK', data: items });

    await fixture.whenStable();
  }

  afterEach(() => {
    httpMock.verify();
  });

  it('derives totalCount/totalAmount/avgAmount from fetched items, not from a separate endpoint', async () => {
    await setup([
      buildApiPengajuan({ id: 'a', nominalPengajuan: 5_000_000 }),
      buildApiPengajuan({ id: 'b', nominalPengajuan: 3_000_000 }),
    ]);

    expect((component as any).totalCount()).toBe(2);
    expect((component as any).totalAmount()).toBe(8_000_000);
    expect((component as any).avgAmount()).toBe(4_000_000);
  });

  it('rounds avgAmount when it does not divide evenly', async () => {
    await setup([
      buildApiPengajuan({ id: 'a', nominalPengajuan: 5_000_000 }),
      buildApiPengajuan({ id: 'b', nominalPengajuan: 3_000_000 }),
      buildApiPengajuan({ id: 'c', nominalPengajuan: 3_000_000 }),
    ]);

    // total = 11,000,000 / 3 = 3,666,666.67 -> rounds to 3,666,667
    expect((component as any).totalCount()).toBe(3);
    expect((component as any).totalAmount()).toBe(11_000_000);
    expect((component as any).avgAmount()).toBe(3_666_667);
  });

  it('reports zero stats (no division by zero) when the queue is empty', async () => {
    await setup([]);

    expect((component as any).totalCount()).toBe(0);
    expect((component as any).totalAmount()).toBe(0);
    expect((component as any).avgAmount()).toBe(0);
  });
});
