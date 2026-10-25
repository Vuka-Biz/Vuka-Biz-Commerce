import { useSyncExternalStore } from 'react';

type Listener = () => void;

/**
 * Base class for app state. Subclasses keep an immutable `state` object and
 * call `setState` to publish changes; React screens read it with `useStore`.
 */
export abstract class ObservableStore<S extends object> {
  private readonly listeners = new Set<Listener>();

  protected constructor(private state: S) {}

  readonly subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  readonly getSnapshot = (): S => this.state;

  protected setState(patch: Partial<S>): void {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((listener) => listener());
  }
}

export function useStore<S extends object>(store: ObservableStore<S>): S {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
