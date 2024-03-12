import { NextFetchEvent, NextRequest } from "next/server";
import { MiddlewareFactory } from "./types";

export const withSecurityHeaders: MiddlewareFactory = (next) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    console.log("withSecurityHeaders");

    /*   const nonce = crypto.randomUUID();
    const cspPolicy = getCspPolicy().replace("nonce-", `'nonce-${nonce}'`);
    const securityPolicy = getSecurityHeaders(); */
    // Call next middleware and modify its response
    const response = await next(request, _next);
    /* if (response) {
      response.headers.set("x-nonce", nonce); // set for _document.js & _app.js see -> getInitialProps
      response.headers.set("Content-Security-Policy-Report-Only", cspPolicy);
      Object.entries(securityPolicy).forEach(([header, value]) => {
        response.headers.set(header, value);
      });
    } */

    return response;
  };
};
