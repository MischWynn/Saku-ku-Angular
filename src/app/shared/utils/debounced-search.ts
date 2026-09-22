import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

export interface DebouncedSearch {
  onInput(value: string): void;
  readonly term: Signal<string>;
}

/**
 * RxJS Subject -> debounceTime -> distinctUntilChanged -> Signal, biar filter search
 * gak nge-recompute tiap ketikan (nunggu user berhenti ngetik dulu).
 */
export function createDebouncedSearch(debounceMs = 300): DebouncedSearch {
  const input$ = new Subject<string>();

  const term = toSignal(
    input$.pipe(
      debounceTime(debounceMs),
      distinctUntilChanged(),
      map((value) => value.trim().toLowerCase())
    ),
    { initialValue: '' }
  );

  return {
    onInput: (value: string) => input$.next(value),
    term,
  };
}
