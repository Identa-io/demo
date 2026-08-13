import type { DemoSlug } from '@/lib/demos';
import { connectHref } from '@/lib/use-geena';

/**
 * The Connect-with-Geena button — deliberately IDENTICAL in all three demos. Three different
 * worlds, one recognizable button: the constancy is the product shot. Brand tokens do not apply
 * here; only the Geena colorway does.
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
      <span
        aria-hidden
        className="flex h-5 w-5 items-center justify-center rounded-full bg-white/95 text-[11px] font-black"
        style={{ color: 'var(--geena)' }}
      >
        G
      </span>
      {label ?? 'Continue with Geena'}
    </a>
  );
}
