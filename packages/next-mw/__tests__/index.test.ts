import '@types/jest';

import { NextRequest, NextResponse } from 'next/server';
import { middlewares } from '../src/index';

describe('middlewares composition', () => {
  /**
   * Test that when no middleware returns a response,
   * the composed middleware returns NextResponse.next() with status 200.
   */
  it('should return NextResponse.next() if no middleware returns a response', async () => {
    // Create a fake request with URL '/about'
    const req = new NextRequest('http://localhost/about');
    const ev = {} as any;

    // Define a middleware that does not return any response.
    const mw1 = async (req: NextRequest, ev: any) => undefined;
    const composed = middlewares({ middleware: mw1 });

    const res = await composed(req, ev);
    expect(res.status).toBe(200);
  });

  /**
   * Test that if a middleware returns a response (e.g., a redirect),
   * that response is returned and subsequent middlewares are not executed.
   */
  it('should return the response from the first middleware that returns a response', async () => {
    const req = new NextRequest('http://localhost/about');
    const ev = {} as any;

    // Middleware 1 returns a redirect response.
    const mw1 = async (req: NextRequest, ev: any) => {
      return NextResponse.redirect(new URL('/login', req.url));
    };
    // Middleware 2 returns a next response (should not be executed)
    const mw2 = async (req: NextRequest, ev: any) => NextResponse.next();

    const composed = middlewares({ middleware: mw1 }, { middleware: mw2 });
    const res = await composed(req, ev);

    expect(res.status).toBe(307);
    // Extract pathname from location header for comparison.
    const locationUrl = new URL(res.headers.get('location') as string);
    expect(locationUrl.pathname).toBe('/login');
  });

  /**
   * Test that a middleware with a simple matcher is skipped when the request does not match.
   */
  it('should skip middleware whose matcher does not match the request', async () => {
    const req = new NextRequest('http://localhost/not-about');
    const ev = {} as any;

    // Define a middleware that should only run for URL '/about'
    const mw1 = async (req: NextRequest, ev: any) => {
      return NextResponse.redirect(new URL('/matched', req.url));
    };
    // Provide configuration with a matcher: '/about'
    const mwModule = { middleware: mw1, config: { matcher: '/about' } };

    const composed = middlewares(mwModule);
    const res = await composed(req, ev);

    // Since the request does not match '/about', no middleware returns a response,
    // so the default NextResponse.next() is returned.
    expect(res.status).toBe(200);
  });

  /**
   * Test that a middleware with a complex matcher is executed when conditions are met.
   */
  it('should execute middleware with complex matcher when conditions are met', async () => {
    // Request URL that matches the source '/api/:path*'
    const req = new NextRequest('http://localhost/api/data?userId=123');
    const ev = {} as any;

    // Create a middleware that returns a redirect when executed
    const mw1 = async (req: NextRequest, ev: any) => {
      return NextResponse.redirect(new URL('/api-matched', req.url));
    };
    // Create a middleware module with complex matcher configuration:
    // - source: '/api/:path*'
    // - must have query parameter userId=123 and header 'Authorization' = 'Bearer Token'
    // - must be missing cookie 'session' with value 'active'
    const mwModule = {
      middleware: mw1,
      config: {
        matcher: {
          source: '/api/:path*',
          locale: false,
          has: [
            { type: 'query', key: 'userId', value: '123' },
            { type: 'header', key: 'Authorization', value: 'Bearer Token' },
          ],
          missing: [{ type: 'cookie', key: 'session', value: 'active' }],
        },
      },
    };

    // Set up the header to satisfy the "has" condition.
    req.headers.set('authorization', 'Bearer Token');
    // Note: The cookie condition is satisfied because there is no 'session' cookie.

    const composed = middlewares(mwModule);
    const res = await composed(req, ev);

    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location') as string);
    expect(locationUrl.pathname).toBe('/api-matched');
  });

  /**
   * Test that a middleware with a complex matcher is skipped when its conditions are not met.
   */
  it('should skip middleware with complex matcher when conditions are not met', async () => {
    const req = new NextRequest('http://localhost/api/data?userId=123');
    const ev = {} as any;

    // Create a middleware that returns a redirect if executed.
    const mw1 = async (req: NextRequest, ev: any) => {
      return NextResponse.redirect(new URL('/api-matched', req.url));
    };
    // Create a middleware module with complex matcher configuration.
    // This time, the header condition will not be met.
    const mwModule = {
      middleware: mw1,
      config: {
        matcher: {
          source: '/api/:path*',
          locale: false,
          has: [
            { type: 'query', key: 'userId', value: '123' },
            { type: 'header', key: 'Authorization', value: 'Bearer Token' },
          ],
          missing: [{ type: 'cookie', key: 'session', value: 'active' }],
        },
      },
    };

    // Do not set the 'Authorization' header.
    const composed = middlewares(mwModule);
    const res = await composed(req, ev);

    // Since the conditions are not met, the middleware is skipped,
    // and NextResponse.next() (status 200) is returned.
    expect(res.status).toBe(200);
  });
});
