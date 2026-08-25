import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pengajuan } from './pengajuan';

describe('Pengajuan', () => {
  let component: Pengajuan;
  let fixture: ComponentFixture<Pengajuan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pengajuan],
    }).compileComponents();

    fixture = TestBed.createComponent(Pengajuan);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
