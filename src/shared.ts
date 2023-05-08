import { StripeConnectWrapper, IStripeConnectInitParams } from "../types";

export type LoadConnect = () => Promise<StripeConnectWrapper>;

const EXISTING_SCRIPT_MESSAGE =
  "loadConnect was called but an existing Connect.js script already exists in the document; existing script parameters will be used";
const V0_URL = "v0.1/connect.js";

export const findScript = (): HTMLScriptElement | null => {
  return document.querySelectorAll<HTMLScriptElement>(
    `script[src^="${V0_URL}"]`
  )[0];
};

const getUrlFromEnvironment = (env: string) => {
  switch (env) {
    case "devbox":
      return "http://localhost:3001/";
    case "qa":
      return "https://qa-connect-js.stripe.com/";
    case "preprod":
      return "https://preprod-connect-js.stripe.com/";
    case "prod":
      return "https://connect-js.stripe.com/";
    default:
      return "https://connect-js.stripe.com/";
  }
};

const injectScript = (env: string): HTMLScriptElement => {
  const script = document.createElement("script");
  const baseUrl = getUrlFromEnvironment(env);

  script.src = `${baseUrl}${V0_URL}`;
  const head = document.head;

  if (!head) {
    throw new Error(
      "Expected document.head not to be null. Connect.js requires a <head> element."
    );
  }

  document.head.appendChild(script);

  return script;
};

let stripePromise: Promise<StripeConnectWrapper> | null = null;

export const loadScript = (
  env: string
): Promise<StripeConnectWrapper | null> => {
  // Ensure that we only attempt to load Connect.js at most once
  if (stripePromise !== null) {
    return stripePromise;
  }

  stripePromise = new Promise((resolve, reject) => {
    if ((window as any).StripeConnect) {
      console.warn(EXISTING_SCRIPT_MESSAGE);
    }

    if ((window as any).StripeConnect) {
      const wrapper = createWrapper((window as any).StripeConnect);
      resolve(wrapper);
      return;
    }

    try {
      let script = findScript();

      if (script) {
        console.warn(EXISTING_SCRIPT_MESSAGE);
      } else if (!script) {
        script = injectScript(env);
      }

      script.addEventListener("load", () => {
        if ((window as any).StripeConnect) {
          const wrapper = createWrapper((window as any).StripeConnect);
          resolve(wrapper);
        } else {
          reject(new Error("Connect.js did not load the necessary objects"));
        }
      });

      script.addEventListener("error", () => {
        reject(new Error("Failed to load Connect.js"));
      });
    } catch (error) {
      reject(error);
    }
  });

  return stripePromise;
};

export const initStripeConnect = (
  stripeConnectPromise: StripeConnectWrapper | null
): any | null => {
  if (stripeConnectPromise === null) {
    return null;
  }

  return stripeConnectPromise;
};

const createWrapper = (stripeConnect: any) => {
  const wrapper: StripeConnectWrapper = {
    initialize: (params: IStripeConnectInitParams) => {
      const metaOptions = (params as any).metaOptions ?? {};
      return stripeConnect.init({
        ...params,
        metaOptions: {
          ...metaOptions,
          sdk: true
        }
      });
    }
  };
  return wrapper;
};
