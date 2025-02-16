import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark as theme } from 'react-syntax-highlighter/dist/esm/styles/prism';

const files = {
  'middleware.ts': `import { middlewares } from 'next-mw';

import * as authMiddleware from './middlewares/auth';
import * as authMiddleware from './middlewares/admin';

export const middleware = middlewares(authMiddleware, adminMiddleware);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};`,
  'middlewares/auth.ts': `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken');
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
};`,
  'middlewares/admin.ts': `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAdmin = request.cookies.get('isAdmin');
  if (!isAdmin || isAdmin.value !== 'true') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    {
      source: '/admin/:path*',
      regexp: '^/admin/(.*)$',
      locale: false,
      has: [{ type: 'header', key: 'x-admin-check', value: 'check' }],
      missing: [{ type: 'cookie', key: 'bypassAdmin', value: 'true' }],
    },
    '/admin/:path*',
  ],
};`,
};

export const CodeEditor = () => {
  const [currentFile, setCurrentFile] = useState('middleware.ts');

  return (
    <div className="fixed bottom-0 right-0 shadow-lg lg:w-[40%] w-full">
      <div className="bg-gradient-to-r from-indigo-300 to-purple-300 dark:from-indigo-500 dark:to-purple-500 [clip-path:inset(0)] lg:rounded-tl-[50px]">
        <div className="relative px-6 pt-8 sm:pt-12 md:pl-12 md:pr-0">
          <div className="mx-auto max-w-2xl md:mx-0 md:max-w-none">
            <div className="w-screen overflow-hidden rounded-tl-2xl bg-neutral-950">
              <div className="flex bg-neutral-900/40 ring-1 ring-white/5">
                <div className="-mb-px flex text-sm/6 font-medium text-neutral-400">
                  {Object.keys(files).map((file) => (
                    <button
                      key={file}
                      onClick={() => setCurrentFile(file)}
                      className={`px-4 py-2 border-b border-r ${
                        currentFile === file
                          ? 'border-b border-r-transparent bg-white/5 px-4 py-2 text-white'
                          : 'border-r border-b-transparent border-neutral-600/10 px-4 py-2'
                      }`}
                    >
                      {file}
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-6 pb-14 pt-6 code-block h-[calc(100vh-650px)] lg:h-[525px] overflow-auto">
                {/* @ts-ignore */}
                <SyntaxHighlighter language="typescript" style={theme}>
                  {files[currentFile as keyof typeof files]}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
