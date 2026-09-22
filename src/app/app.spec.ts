import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // Root cause (verified in isolation, not a missing-provider issue like the other 4 specs):
  // the scaffold markup this test targets (the `<h1>Hello, {{ title() }}</h1>` block in
  // app.html) has been entirely HTML-commented-out since the landing-page work — App's real
  // template today is just a `<router-outlet>` wrapper. Asserting on the dead `<h1>` text was
  // structurally guaranteed to fail forever, unrelated to DI/providers. Replaced with an
  // assertion on what App actually renders: its router-outlet host.
  it('should render the router outlet host', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
