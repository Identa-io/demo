'use client';

import { DEMOS, JOURNEY, type DemoSlug } from '@/lib/demos';
import { useHubHref } from '@/lib/use-geena';

/**
 * The slim journey strip above every demo — neutral Geena chrome (brand ≠ chrome): which
 * chapter this is, the single thing to watch for, and the way back to the hub. It is the only
 * element that admits the three brands are one story.
 */
export function JourneyBar({ demo }: { demo: DemoSlug }) {
  const hub = useHubHref();
  const def = DEMOS[demo];

  return (
    <div
      className="border-b border-[color:var(--geena)]/20 bg-[color:var(--geena)]/[0.06] text-[12px]"
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-2">
        <p className="flex min-w-0 items-center gap-2.5">
          <span className="flex shrink-0 items-center gap-1" aria-label={`Chapter ${def.chapter} of ${JOURNEY.length}`}>
            {JOURNEY.map((slug) => (
              <span
                key={slug}
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background:
                    DEMOS[slug].chapter <= def.chapter ? 'var(--geena)' : 'transparent',
                  boxShadow: `inset 0 0 0 1px var(--geena)`,
                }}
              />
            ))}
          </span>
          <span className="shrink-0 font-semibold">
            Chapter {def.chapter} of {JOURNEY.length}
          </span>
          <span className="truncate text-[color:var(--muted)]">{def.watchFor}</span>
        </p>
        <a
          href={hub}
          className="shrink-0 font-semibold underline-offset-4 hover:underline"
          style={{ color: 'var(--geena)' }}
        >
          The journey →
        </a>
      </div>
    </div>
  );
}
