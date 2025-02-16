import { motion } from 'framer-motion';

import { Highlight } from '@workspace/ui/components/ui/hero-highlight';
import { Button } from '@workspace/ui/components/ui/button';
import { ArrowRightIcon, Check, Copy } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

const command = 'npm install next-mw';

export const Hero = () => {
  const [copy, setCopy] = useState(false);
  const CopyIcon = useMemo(() => (copy ? Check : Copy), [copy]);

  return (
    <div className="mx-auto max-w-7xl px-6 lg:pt-20 pt-32 w-full">
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: [20, -5, 0],
        }}
        transition={{
          duration: 0.5,
          ease: [0.4, 0.0, 0.2, 1],
        }}
        className="lg:max-w-[60%] max-w-[700px] lg:space-y-8 space-y-6"
      >
        <h1 className="text-3xl md:text-4xl lg:text-[46px] font-semibold text-neutral-800 dark:text-white !leading-relaxed lg:!leading-snug text-start">
          Create <Highlight>multiple middlewares</Highlight> quickly and easily
          in Next.js
        </h1>

        <p className="lg:text-lg text-base text-neutral-500 dark:text-neutral-400 max-w-2xl">
          Keep the standard Next.js behavior for every middleware to maintain
          full compatibility.
        </p>

        <div className="flex lg:flex-row flex-col lg:gap-5 gap-3">
          <Button
            size="lg"
            className="w-fit rounded-full pr-5 bg-blue-500 hover:bg-blue-500/90 text-white"
            asChild
          >
            <Link href="/docs">
              Get Started <ArrowRightIcon className="!size-5" />
            </Link>
          </Button>

          <div className="bg-neutral-200 w-fit dark:bg-neutral-900 px-5 h-12 rounded-full flex gap-x-3 font-mono text-[15px] items-center justify-center">
            <span className="select-none">$</span>
            <span>{command}</span>
            <button
              className="ml-1 transition hover:opacity-50"
              onClick={() => {
                navigator.clipboard.writeText(command);
                setCopy(true);
                setTimeout(() => setCopy(false), 2000);
              }}
            >
              <CopyIcon className="!size-[19px]" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
