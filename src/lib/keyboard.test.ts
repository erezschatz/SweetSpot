import { describe, expect, it } from 'vitest';
import { scrollToClear } from './keyboard';

// A Pixel-sized visible area with the keyboard open: 400 px tall, an 80 px save bar.
const visible = 400;
const bar = 80;

describe('scrollToClear', () => {
  it('leaves a field that is already clear of the bar', () => {
    expect(scrollToClear({ top: 100, bottom: 148 }, visible, bar)).toBe(0);
  });

  it('scrolls a field hidden under the bar up above it', () => {
    // Chrome left it just above the keyboard: bottom at 396, top at 348.
    expect(scrollToClear({ top: 348, bottom: 396 }, visible, bar)).toBe(396 - (400 - 80 - 12));
  });

  it('scrolls a field above the top back into view', () => {
    expect(scrollToClear({ top: -30, bottom: 18 }, visible, bar)).toBe(-42);
  });

  it('keeps the top of a tall text box in view rather than its bottom', () => {
    expect(scrollToClear({ top: 200, bottom: 600 }, visible, bar)).toBe(200 - 12);
  });

  it('needs no bar: with none, only the keyboard edge counts', () => {
    expect(scrollToClear({ top: 340, bottom: 395 }, visible, 0)).toBe(395 - 388);
  });
});
