'use client';

import { HeroHighlight } from '@workspace/ui/components/ui/hero-highlight';
import { Hero } from './_components/hero';
import { Header } from './_components/header';
import { CodeEditor } from './_components/code-editor';

export default function HomePage() {
  return (
    <main>
      <Header />

      <HeroHighlight className="h-screen w-full flex lg:flex-row flex-col items-center justify-start">
        <Hero />
        <CodeEditor />
      </HeroHighlight>
    </main>
  );
}
