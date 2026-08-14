import type { DemoSlug } from '@/lib/demos';
import { connectHref } from '@/lib/use-geena';

/**
 * The Connect-with-Geena button — deliberately IDENTICAL in all three demos. Three different
 * worlds, one recognizable button: the constancy is the product shot. Brand tokens do not apply
 * here; only the Geena colorway and the Geena mark do.
 */
export function GeenaButton({
  demo,
  returnTo,
  label,
  size = 'md',
}: {
  demo: DemoSlug;
  returnTo?: string;
  label?: string;
  size?: 'md' | 'lg';
}) {
  return (
    <a
      href={connectHref(demo, returnTo)}
      className={`inline-flex items-center gap-2.5 rounded-xl font-semibold text-[color:var(--geena-ink)] shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.99] ${
        size === 'lg' ? 'px-6 py-3.5 text-[15px]' : 'px-4 py-2.5 text-[13px]'
      }`}
      style={{ background: 'var(--geena)', fontFamily: 'var(--font-inter)' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset, no optimization needed */}
      <img
        src="/geena/icon-white.svg"
        alt=""
        aria-hidden
        className={size === 'lg' ? 'h-[17px] w-auto' : 'h-[15px] w-auto'}
      />
      {label ?? 'Continue with Geena'}
    </a>
  );
}
