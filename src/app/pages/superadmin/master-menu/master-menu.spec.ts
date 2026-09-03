import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterMenu } from './master-menu';

describe('MasterMenu', () => {
  let component: MasterMenu;
  let fixture: ComponentFixture<MasterMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(MasterMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
