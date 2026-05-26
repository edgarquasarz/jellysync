import '@testing-library/jest-dom';
import { afterEach } from 'vitest';

// Conditionally load renderer-specific setup only when jsdom is active
// This avoids crashes when running with node environment
if (typeof window !== 'undefined') {
  import('@testing-library/react').then(({ cleanup }) => {
    afterEach(() => cleanup());
  });
}

// Mock IntersectionObserver for jsdom
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'IntersectionObserver', {
    value: MockIntersectionObserver,
    writable: true,
  });
}
