import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthDto } from './auth.dto';

describe('AuthDto', () => {
  let component: AuthDto;
  let fixture: ComponentFixture<AuthDto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthDto],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthDto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
