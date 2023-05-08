import { loadScript, initStripeConnect, LoadConnect } from "./shared";

export const loadConnect: LoadConnect = (env?: string) => {
  return loadScript(env || "prod").then(maybeStripe =>
    initStripeConnect(maybeStripe)
  );
};
