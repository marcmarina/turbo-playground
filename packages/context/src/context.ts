import { AsyncLocalStorage } from 'async_hooks';

type Context = {
  requestId?: string;
};

const context = new AsyncLocalStorage<Context>();

export async function httpContextWrapper(next) {
  await context.run({}, next);
}

export function getStore() {
  return context.getStore();
}

export function updateStore(values: Partial<Context>) {
  const store = getStore();

  if (store) {
    Object.assign(store, values);
  }
}
