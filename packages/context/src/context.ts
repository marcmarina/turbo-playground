import { AsyncLocalStorage } from 'async_hooks';

const context = new AsyncLocalStorage<Map<string, unknown>>();

export async function httpContextWrapper(next) {
  await context.run(new Map(), next);
}

export function getStore() {
  return context.getStore();
}
