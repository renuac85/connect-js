import { loadScript, initStripeConnect, LoadConnect } from "./shared";

// Execute our own script injection after a tick to give users time to do their
// own script injection.
let loadCalled = false;

export const loadConnect: LoadConnect = (env?: string) => {
  loadCalled = true;
  const stripePromise = Promise.resolve().then(() => loadScript(env || "prod"));

  stripePromise.catch((err: Error) => {
    if (!loadCalled) {
      console.warn(err);
    }
  });

  return stripePromise.then(maybeConnect => initStripeConnect(maybeConnect));
};

export {};
