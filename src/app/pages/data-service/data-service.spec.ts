import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataService } from './data-service';

describe('DataService', () => {
  let component: DataService;
  let fixture: ComponentFixture<DataService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataService],
    }).compileComponents();

    fixture = TestBed.createComponent(DataService);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
