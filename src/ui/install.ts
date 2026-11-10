// Installing to the home screen (step 10). Chrome on Android fires `beforeinstallprompt`
// once, early, when the page is installable; it is kept here so the install page can offer
// a one-tap install. Without it (already installed, or Chrome chose not to offer) the page
// falls back to the menu steps.

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallPrompt | null = null;
let justInstalled = false;
let listening = false;
const listeners = new Set<() => void>();

/** Called once from main.tsx, before the app renders, so the early event is not missed. */
export function listenForInstallPrompt(): void {
  if (listening) return;
  listening = true;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // Chrome's own mini bar would otherwise compete with the page.
    deferred = e as InstallPrompt;
    listeners.forEach((l) => l());
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    justInstalled = true;
    listeners.forEach((l) => l());
  });
}

export function canPromptInstall(): boolean {
  return deferred !== null;
}

/** Lets the install page re-render when the prompt arrives or goes. Returns the unsubscribe. */
export function onInstallChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Shows Chrome's install dialog; true when she accepted. The event can be used once. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const prompt = deferred;
  deferred = null;
  try {
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    return outcome === 'accepted';
  } catch {
    return false;
  } finally {
    listeners.forEach((l) => l());
  }
}

/**
 * Opened from the home-screen icon rather than in a Chrome tab, or installed from this tab
 * a moment ago (the tab itself stays a tab, so it must say so from the event).
 */
export function isInstalled(): boolean {
  return justInstalled || ['standalone', 'fullscreen', 'minimal-ui'].some((m) => window.matchMedia(`(display-mode: ${m})`).matches);
}
