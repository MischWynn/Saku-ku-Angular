import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { CustomerHome } from './customer-home';

describe('CustomerHome', () => {
  let component: CustomerHome;
  let fixture: ComponentFixture<CustomerHome>;

  beforeEach(async () => {
    // jsdom (the environment Vitest runs in here) doesn't implement `window.matchMedia` at
    // all — it's undefined, not just "always matches: false". `ngAfterViewInit` ->
    // `setupScrollReveal()` calls `window.matchMedia('(prefers-reduced-motion: reduce)')`
    // unconditionally, which throws `TypeError: window.matchMedia is not a function` once
    // the component actually gets far enough to run its lifecycle hooks (previously masked by
    // the ActivatedRoute error below, which threw earlier in the same render pass). Stubbed
    // here to report "no reduced-motion preference" (`matches: false`), matching real browser
    // behavior for a user who hasn't set that OS preference — this is a missing jsdom API,
    // not applic behavior to work around.
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });

    // jsdom also doesn't implement IntersectionObserver — same `setupScrollReveal()` call
    // (right after the matchMedia check above) constructs one to drive the scroll-reveal
    // effect. Stubbed with no-op observe/unobserve/disconnect so the lifecycle hook completes;
    // nothing here asserts on reveal animations actually firing.
    (window as any).IntersectionObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    };

    // CustomerHome imports RouterLink (nav CTAs to /login, /register) which injects
    // ActivatedRoute — needs a router provider, same root cause/fix as login.spec.ts.
    await TestBed.configureTestingModule({
      imports: [CustomerHome],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
