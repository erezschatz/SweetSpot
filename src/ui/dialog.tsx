import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';

// The app's own dialogs in place of the browser's confirm() and alert() (D43, D45): the
// browser's are in the phone's language and style, with "OK" and "Cancel" buttons that say
// nothing about what happens. A plain <dialog> opened with showModal(): it traps focus,
// dims the page behind it, and Android's Back closes it as a "no".

interface Choice {
  message: string;
  /** What the yes button does, as a verb: "מחיקה", "שחזור". */
  yes: string;
  /** What the no button does; never "ביטול" when the yes is a cancellation. */
  no: string;
  /** Destroys or replaces something: the yes button is drawn as a warning. */
  danger?: boolean;
}

/** Asks one question; resolves true only for the yes button. */
export function ask(choice: Choice): Promise<boolean> {
  return show((answer) => <AppDialog {...choice} onAnswer={answer} />);
}

/** Says one thing, with one button. Resolves when she taps it or goes Back. */
export function tell(message: string, ok: string): Promise<boolean> {
  return show((answer) => <AppDialog message={message} yes={ok} onAnswer={answer} />);
}

// One at a time: a quick second tap must not stack a second question (and a second delete).
let showing = false;

// Rendered into a node of its own, outside the app, so any screen can ask from an event
// handler with one await, as it did with confirm().
function show(build: (answer: (yes: boolean) => void) => preact.JSX.Element): Promise<boolean> {
  if (showing) return Promise.resolve(false);
  showing = true;
  const returnFocus = document.activeElement as HTMLElement | null;
  return new Promise((resolve) => {
    const host = document.createElement('div');
    document.body.append(host);
    let answered = false;
    const answer = (yes: boolean) => {
      // A button, Back and the dialog's own close can all arrive; the first one counts.
      if (answered) return;
      answered = true;
      render(null, host);
      host.remove();
      showing = false;
      returnFocus?.focus();
      resolve(yes);
    };
    render(build(answer), host);
  });
}

function AppDialog({
  message,
  yes,
  no,
  danger = false,
  onAnswer,
}: {
  message: string;
  yes: string;
  no?: string;
  danger?: boolean;
  onAnswer: (yes: boolean) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  // Before paint, so the page behind is never tappable while the dialog is on its way.
  useLayoutEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      class="app-dialog"
      // Back on Android, or Escape: the "cancel" event. preventDefault keeps the dialog in
      // charge of closing itself, so the answer is given once.
      onCancel={(e) => {
        e.preventDefault();
        onAnswer(false);
      }}
      // Chrome may close a dialog on Back without a cancel event (when it was opened without
      // a fresh tap, as after reading a file); that is a no too.
      onClose={() => onAnswer(false)}
    >
      <p>{message}</p>
      <div class="actions">
        <button type="button" class={danger ? 'danger' : ''} onClick={() => onAnswer(true)}>
          {yes}
        </button>
        {/* Focus starts on the safe answer, so a stray Enter does not delete or cancel. */}
        {no && (
          <button type="button" class="secondary" autoFocus onClick={() => onAnswer(false)}>
            {no}
          </button>
        )}
      </div>
    </dialog>
  );
}
