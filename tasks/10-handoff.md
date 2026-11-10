# 10 · Polish and hand-off

## Context

**Promise.** The baker installs SweetSpot on her own phone in two minutes, understands every screen without being told, and has made her first backup before the programmer leaves.

**Acceptance**

- [ ] The programmer has used the app for a fake week (five orders, two customers, payments) and fixed what annoyed him; each fix is listed here, not in a new task.
- [ ] Every Hebrew string reviewed for gender and tone (the baker is addressed in the feminine).
- [ ] Install page at `#/install` (or a section in settings) with the four promises from the Install bullet of `docs/SPEC.md` (D37) and the add-to-home-screen steps for Chrome on Android.
- [ ] Verified on the baker's Galaxy in Chrome: installed, persistent storage granted, backup shared to her Drive, one customer picked from contacts, one real order entered, one real WhatsApp message sent.
- [ ] Her first three remarks written down here as candidate tasks for 1.1.
- [ ] Added 2026-11-10 before work started (D43): the browser's own dialogs (`confirm()`: cancelling an order, deleting a customer or an ingredient, restoring a backup) are replaced by the app's own, in Hebrew and in its style.
- [ ] Added 2026-11-10 before work started (D43): buttons the programmer finds out of place are moved, from his list of which ones and where. The bottom bar stays as it is.

## What was done

2026-11-10, programmer's Mac. The choices are D45. The title read "09", left over from D35's renumbering, and now reads "10".

**The app's own dialogs** (box added by D43):
- `src/ui/dialog.tsx`: `ask({ message, yes, no, danger })` and `tell(message, ok)`, each a promise. A native `<dialog>` with `showModal()`, rendered into its own node and removed after the answer. Back, Escape, or the dialog closing any other way answers no, once. Only one dialog at a time: a second ask while one is open answers no. Focus starts on the safe answer and returns where it was. CSS (`.app-dialog`, `button.danger`): a centred card on a dimmed page, full-size buttons, a red destructive yes.
- Uses:
  - cancelling an order (`order-detail.tsx`): "ביטול ההזמנה" / "השארת ההזמנה";
  - deleting a customer (`customer-detail.tsx`) or an ingredient (`ingredient-form.tsx`): "מחיקה" / "חזרה";
  - restoring a backup (`settings.tsx`): "שחזור" / "חזרה", and after it, "השחזור הושלם." with "המשך" in place of `alert()`.
  - No `confirm()` or `alert()` is left in `src`. Deleting a customer with orders, or an ingredient a recipe uses, is still refused before anything is asked.
- Cancelling an order reads the order again after the answer, so a change made while the dialog was open is not overwritten.
- `src/i18n/he.ts`: `goBack`, `orderDetail.cancelYes`/`cancelNo`, `backup.restoreYes`/`restoredOk`, and the `install` block.

**Install page** (box 3):
- `src/ui/install.ts` keeps Chrome's `beforeinstallprompt` from the start (`main.tsx`), listening once, and offers it once. A failed offer still redraws the page. It tells whether the app runs from the icon (`standalone`, `fullscreen` or `minimal-ui`), or was installed from this tab a moment ago (`appinstalled`), so the page then says so.
- `src/screens/install.tsx` at `#/install` shows:
  - the four promises;
  - "התקנה עכשיו" when Chrome offers it;
  - the menu steps in four lines, naming both labels Chrome uses;
  - when already installed, a line saying so;
  - a button back to the diary;
  - the bottom bar, as on other screens.
- `src/app.tsx`: the route. CSS for the promises, the steps and the diary's install line.
- The diary shows "כדאי להתקין את SweetSpot למסך הבית." with "איך מתקינים" while the app runs in a tab. Settings has a "התקנה למסך הבית" button under storage.
- `src/lib/route.ts`: `#/install`, tested.
- `docs/SPEC.md`: install, routes and dialogs. D45.

**Observed by Claude** in the browser pane at 360×780 against the dev server, a Chrome tab, so not installed:
- The diary showed the install line above the backup prompt. Its button opened the page with the four promises and the four steps.
- "התקנה עכשיו" did not show, since Chrome makes no install offer to the dev server; the one-tap path is unobserved.
- On a test customer with no orders, delete opened the dialog: "למחוק את הלקוח?", a red "מחיקה" and "חזרה", over a dimmed page. Escape closed it and the customer stayed. "מחיקה" deleted the customer and returned to the list.

A fresh-reader review led to these fixes before commit, after the browser run:
- Back could close a dialog without a cancel event, leaving the question unanswered;
- a quick double tap could open two dialogs;
- focus started on the red yes;
- cancelling wrote the order as it was before the question;
- the install page kept showing the steps after installing from the tab;
- two docs lines overstated what the code does.

Rechecked in the pane after the fixes, by calling `ask()` from the console:
- a second question while one was open answered no, and only one dialog showed;
- focus was on "חזרה";
- closing the dialog with `close()`, not through a button, answered no and removed it.

Not observed:
- the cancel-order and restore dialogs (the pane held no orders, and a restore would replace its data);
- the one-tap install;
- Android's Back on a dialog;
- the page on an installed app.

Still open in this step: the fake week, the Hebrew review, the button moves (waiting on Erez's list), and the hand-off on her Galaxy. Not verified on a device.
