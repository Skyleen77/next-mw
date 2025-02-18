import { type NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { middlewares } from '../src/index';

describe('middlewares composition', () => {
  describe('matcher', () => {
    /**
     * Test that when no middleware returns a response,
     * the composed middleware returns NextResponse.next() with status 200.
     */
    it('should return NextResponse.next() if no middleware returns a response', async () => {
      const req = new NextRequest('http://localhost/about');
      const ev = {} as NextFetchEvent;
      const mw1 = async () => undefined;
      const composed = middlewares({ middleware: mw1 });
      const res = await composed(req, ev);
      expect(res).toBeDefined();
      expect(res!.status).toBe(200);
    });

    /**
     * Test that if a middleware returns a response (e.g., a redirect),
     * that response is returned and subsequent middlewares are not executed.
     */
    it('should return the response from the first middleware that returns a response', async () => {
      const req = new NextRequest('http://localhost/about');
      const ev = {} as NextFetchEvent;
      const mw1 = async (req: NextRequest) => {
        return NextResponse.redirect(new URL('/login', req.url));
      };
      const mw2 = async () => NextResponse.next();
      const composed = middlewares({ middleware: mw1 }, { middleware: mw2 });
      const res = await composed(req, ev);
      expect(res).toBeDefined();
      expect(res!.status).toBe(307);
      const locationUrl = new URL(res!.headers.get('location') as string);
      expect(locationUrl.pathname).toBe('/login');
    });

    /**
     * Test that a middleware with a simple matcher is skipped when the request does not match.
     */
    it('should skip middleware whose matcher does not match the request', async () => {
      const req = new NextRequest('http://localhost/not-about');
      const ev = {} as NextFetchEvent;
      const mw1 = async (req: NextRequest) => {
        return NextResponse.redirect(new URL('/matched', req.url));
      };
      // Using '/about' here expects an exact match.
      const mwModule = { middleware: mw1, config: { matcher: '/about' } };
      const composed = middlewares(mwModule);
      const res = await composed(req, ev);
      expect(res).toBeDefined();
      expect(res!.status).toBe(200);
    });

    /**
     * Test that a middleware with a complex matcher is executed when conditions are met.
     */
    it('should execute middleware with complex matcher when conditions are met', async () => {
      const req = new NextRequest('http://localhost/api/data?userId=123');
      const ev = {} as NextFetchEvent;
      const mw1 = async (req: NextRequest) => {
        return NextResponse.redirect(new URL('/api-matched', req.url));
      };
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
      // Set header to satisfy the "has" condition.
      req.headers.set('authorization', 'Bearer Token');
      const composed = middlewares(mwModule);
      const res = await composed(req, ev);
      expect(res).toBeDefined();
      expect(res!.status).toBe(307);
      const locationUrl = new URL(res!.headers.get('location') as string);
      expect(locationUrl.pathname).toBe('/api-matched');
    });

    /**
     * Test that a middleware with a complex matcher is skipped when its conditions are not met.
     */
    it('should skip middleware with complex matcher when conditions are not met', async () => {
      const req = new NextRequest('http://localhost/api/data?userId=123');
      const ev = {} as NextFetchEvent;
      const mw1 = async (req: NextRequest) => {
        return NextResponse.redirect(new URL('/api-matched', req.url));
      };
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
      const composed = middlewares(mwModule);
      const res = await composed(req, ev);
      expect(res).toBeDefined();
      expect(res!.status).toBe(200);
    });
  });

  describe('include/exclude', () => {
    /**
     * Test that when using only "include", the middleware executes if the request matches the include pattern.
     */
    it('should execute middleware with include when request matches include', async () => {
      const req = new NextRequest('http://localhost/about');
      const ev = {} as NextFetchEvent;
      const mwInclude = async (req: NextRequest) => {
        return NextResponse.redirect(new URL('/included', req.url));
      };
      const mwModule = { middleware: mwInclude, config: { include: '/about' } };
      const composed = middlewares(mwModule);
      const res = await composed(req, ev);
      expect(res).toBeDefined();
      expect(res!.status).toBe(307);
      const locationUrl = new URL(res!.headers.get('location') as string);
      expect(locationUrl.pathname).toBe('/included');
    });

    /**
     * Test that when using only "include", the middleware is skipped if the request does not match the include pattern.
     */
    it('should skip middleware with include when request does not match include', async () => {
      const req = new NextRequest('http://localhost/not-about');
      const ev = {} as NextFetchEvent;
      const mwInclude = async (req: NextRequest) => {
        return NextResponse.redirect(new URL('/included', req.url));
      };
      const mwModule = { middleware: mwInclude, config: { include: '/about' } };
      const composed = middlewares(mwModule);
      const res = await composed(req, ev);
      expect(res).toBeDefined();
      expect(res!.status).toBe(200);
    });

    /**
     * Test that when using only "exclude", the middleware executes if the request does not match the exclude pattern.
     */
    it('should execute middleware with exclude when request does not match exclude', async () => {
      const req = new NextRequest('http://localhost/about');
      const ev = {} as NextFetchEvent;
      const mwExclude = async (req: NextRequest) => {
        return NextResponse.redirect(new URL('/not-excluded', req.url));
      };
      // Here, '/api' will not match '/about'.
      const mwModule = { middleware: mwExclude, config: { exclude: '/api' } };
      const composed = middlewares(mwModule);
      const res = await composed(req, ev);
      expect(res).toBeDefined();
      expect(res!.status).toBe(307);
      const locationUrl = new URL(res!.headers.get('location') as string);
      expect(locationUrl.pathname).toBe('/not-excluded');
    });

    /**
     * Test that when using only "exclude", the middleware is skipped if the request matches the exclude pattern.
     */
    it('should skip middleware with exclude when request matches exclude', async () => {
      const req = new NextRequest('http://localhost/api/data');
      const ev = {} as NextFetchEvent;
      const mwExclude = async (req: NextRequest) => {
        return NextResponse.redirect(new URL('/not-excluded', req.url));
      };
      // Use a pattern that matches nested routes.
      const mwModule = {
        middleware: mwExclude,
        config: { exclude: '/api/:path*' },
      };
      const composed = middlewares(mwModule);
      const res = await composed(req, ev);
      expect(res).toBeDefined();
      expect(res!.status).toBe(200);
    });

    /**
     * Test that when using both "include" and "exclude", the middleware executes
     * if the request matches the include pattern but does not match the exclude pattern.
     */
    it('should execute middleware with include/exclude combination when request matches include but not exclude', async () => {
      const req = new NextRequest('http://localhost/dashboard/user');
      const ev = {} as NextFetchEvent;
      const mwIncExc = async (req: NextRequest) => {
        return NextResponse.redirect(new URL('/inc-exc', req.url));
      };
      // Update patterns to match nested routes.
      const mwModule = {
        middleware: mwIncExc,
        config: {
          include: '/dashboard/:path*',
          exclude: '/dashboard/admin/:path*',
        },
      };
      const composed = middlewares(mwModule);
      const res = await composed(req, ev);
      expect(res).toBeDefined();
      expect(res!.status).toBe(307);
      const locationUrl = new URL(res!.headers.get('location') as string);
      expect(locationUrl.pathname).toBe('/inc-exc');
    });

    /**
     * Test that when using both "include" and "exclude", the middleware is skipped
     * if the request matches both the include and the exclude patterns.
     */
    it('should skip middleware with include/exclude combination when request matches both include and exclude', async () => {
      const req = new NextRequest('http://localhost/dashboard/admin');
      const ev = {} as NextFetchEvent;
      const mwIncExc = async (req: NextRequest) => {
        return NextResponse.redirect(new URL('/inc-exc', req.url));
      };
      const mwModule = {
        middleware: mwIncExc,
        config: {
          include: '/dashboard/:path*',
          exclude: '/dashboard/admin/:path*',
        },
      };
      const composed = middlewares(mwModule);
      const res = await composed(req, ev);
      expect(res).toBeDefined();
      expect(res!.status).toBe(200);
    });
  });
});
