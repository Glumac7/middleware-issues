/*
This structure supports multiple middlewares.
To add a new middleware go to /middleware and create a new file.
You can copy the structure from the withSecurityHeaders.ts file.
Import the file and add it to the array.
*/

/* const middlewares: MiddlewareFactory[] = [withSecurityHeaders];
const middleware = stackMiddlewares(middlewares);
export default middleware; */

/* export function middleware() {
  console.log("middleware");
}



export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}; */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest, response: NextResponse) {
  console.log("middleware");
  console.log("====================================");
  console.log(response);
  console.log("====================================");
  //response.headers.set("x-middleware-cache", "no-cache");
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
