import { useEffect, useState } from 'preact/hooks';
import { he } from '../i18n/he';
import { href } from '../lib/route';
import { canPromptInstall, isInstalled, onInstallChange, promptInstall } from '../ui/install';

// Step 10: what installing gives her, in four promises (docs/SPEC.md, Install; D37), and how.
export function InstallScreen() {
  const [, redraw] = useState(0);
  useEffect(() => onInstallChange(() => redraw((n) => n + 1)), []);
  const installed = isInstalled();

  return (
    <section>
      <h2>{he.install.title}</h2>
      <ul class="promises">
        {he.install.promises.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>

      {installed ? (
        <p class="message">{he.install.installed}</p>
      ) : (
        <>
          {canPromptInstall() && (
            <button type="button" onClick={() => void promptInstall()}>
              {he.install.installNow}
            </button>
          )}
          <h3>{canPromptInstall() ? he.install.orByHand : he.install.byHand}</h3>
          <ol class="steps">
            {he.install.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </>
      )}

      <div class="screen-links">
        <a class="button secondary" href={href({ name: 'diary' })}>→ {he.install.toDiary}</a>
      </div>
    </section>
  );
}
