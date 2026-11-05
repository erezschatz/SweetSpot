// With the on-screen keyboard open, the page's visible area is short and the sticky save
// bar sits at its bottom. Chrome scrolls a focused field just above the keyboard, which is
// under the bar. This works out how far to scroll so the field clears the bar instead.

export interface FieldBox {
  top: number;
  bottom: number;
}

/**
 * Pixels to scroll the page (positive = down) so `field`, measured from the top of the
 * visible area, sits between the top and the bar that covers `coveredBelow` pixels at
 * the bottom. 0 when it is already clear. A field taller than the space is aligned by
 * its top, where she is typing.
 */
export function scrollToClear(field: FieldBox, visibleHeight: number, coveredBelow: number, margin = 12): number {
  const lowest = visibleHeight - coveredBelow - margin;
  if (field.top < margin) return field.top - margin;
  if (field.bottom <= lowest) return 0;
  const fitsBelow = field.bottom - lowest;
  const keepsTop = field.top - margin;
  return Math.min(fitsBelow, keepsTop);
}
