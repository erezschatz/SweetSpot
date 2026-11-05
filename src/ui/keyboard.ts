import { scrollToClear } from '../lib/keyboard';

function focusedField(): HTMLElement | null {
  const el = document.activeElement;
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement
    ? el
    : null;
}

function clearField(): void {
  const field = focusedField();
  // Pinch-zoomed, the visible area and the page's coordinates no longer match; leave her zoom alone.
  if (!field || (window.visualViewport?.scale ?? 1) !== 1) return;
  const visibleHeight = window.visualViewport?.height ?? window.innerHeight;
  // Only the part of the save bar that is actually over the visible area covers anything;
  // on a short form it sits in the flow below the fields.
  const bar = document.querySelector<HTMLElement>('.actions');
  const covered = bar ? Math.max(0, visibleHeight - bar.getBoundingClientRect().top) : 0;
  const scroll = scrollToClear(field.getBoundingClientRect(), visibleHeight, covered);
  // Instant, not smooth: the resize and focus handlers can both run, and a second smooth
  // scroll started mid-way could overshoot.
  if (scroll !== 0) window.scrollBy(0, scroll);
}

/**
 * Keeps the field she is typing in above the keyboard and the save bar (src/lib/keyboard.ts).
 * Runs whenever the visible area resizes (the keyboard opening is the case that matters) and when focus moves
 * to another field while it is already open.
 */
export function keepFocusedFieldVisible(): void {
  window.visualViewport?.addEventListener('resize', clearField);
  // After Chrome's own scroll-into-view, so this one has the last word.
  document.addEventListener('focusin', () => setTimeout(clearField, 300));
}
