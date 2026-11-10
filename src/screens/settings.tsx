import { useEffect, useRef, useState } from 'preact/hooks';
import { useLiveQuery } from 'dexie-react-hooks';
import type { TemplateKey } from '../db/schema';
import { he } from '../i18n/he';
import { settingsRepo } from '../db/repositories';
import { backupNow, restoreBackup } from '../db/backup';
import { parseBackup } from '../lib/backup';
import { resizeImage } from '../ui/image';
import { LogoImage } from '../ui/logo';
import { ask, tell } from '../ui/dialog';
import { href } from '../lib/route';

// Reached from the gear in the header (D39): the business, the messages, and backup.
export function SettingsScreen() {
  const settings = useLiveQuery(() => settingsRepo.get());
  const [message, setMessage] = useState('');

  if (!settings) return null;

  return (
    <section>
      <h2>{he.settings.title}</h2>

      <label class="field">
        <span>{he.settings.businessName}</span>
        <BusinessNameInput initial={settings.businessName} />
      </label>

      <LogoPicker logo={settings.logo} onError={setMessage} />

      <h2>{he.templates.title}</h2>
      <p class="muted">{he.templates.explain}</p>
      <p class="muted legend">{he.templates.legend}</p>
      {templateKeys.map((key) => (
        <TemplateEditor key={key} templateKey={key} saved={settings.templates[key]} />
      ))}

      <h2>{he.backup.title}</h2>
      <p class="muted">{he.backup.explain}</p>
      <p>
        {he.backup.lastBackup}{' '}
        {settings.lastBackupAt ? formatDateTime(settings.lastBackupAt) : he.backup.never}
      </p>
      <BackupButtons onMessage={setMessage} />

      {message && <p class="message" role="status">{message}</p>}

      <h2>{he.storage.title}</h2>
      <StorageStatus />
      <div class="screen-links">
        <a class="button secondary" href={href({ name: 'install' })}>{he.install.settingsLink}</a>
      </div>

      <p class="muted">{he.version} {__APP_VERSION__}</p>
    </section>
  );
}

const templateKeys: TemplateKey[] = ['accepted', 'reminder', 'ready', 'payment'];

// Like the business name: local state while she types, saved on every keystroke.
// No saved text means the default from he.ts applies.
function TemplateEditor({ templateKey, saved }: { templateKey: TemplateKey; saved?: string }) {
  const defaultText = he.whatsapp.defaults[templateKey];
  const [value, setValue] = useState(saved ?? defaultText);
  return (
    <label class="field template">
      <span>{he.whatsapp.send[templateKey]}</span>
      <textarea
        value={value}
        onInput={(e) => {
          const next = e.currentTarget.value;
          setValue(next);
          // Typed back to the default, it is the default again, so a later improvement reaches her.
          void settingsRepo.setTemplate(templateKey, next === defaultText ? undefined : next);
        }}
      />
      {value !== defaultText && (
        <button
          type="button"
          class="small"
          onClick={() => {
            setValue(defaultText);
            void settingsRepo.setTemplate(templateKey, undefined);
          }}
        >
          {he.templates.reset}
        </button>
      )}
    </label>
  );
}

// Local state so typing is never interrupted by the database round-trip.
function BusinessNameInput({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  return (
    <input
      type="text"
      value={value}
      placeholder={he.settings.businessNamePlaceholder}
      onInput={(e) => {
        const next = e.currentTarget.value;
        setValue(next);
        void settingsRepo.update({ businessName: next });
      }}
    />
  );
}

function LogoPicker({ logo, onError }: { logo?: Blob; onError: (m: string) => void }) {
  const input = useRef<HTMLInputElement>(null);

  async function onPick(file: File | undefined) {
    if (!file) return;
    try {
      await settingsRepo.update({ logo: await resizeImage(file) });
    } catch {
      onError(he.settings.logoFailed);
    }
  }

  return (
    <div class="field">
      <span>{he.settings.logo}</span>
      {logo && <LogoImage logo={logo} class="logo-preview" />}
      <div class="row">
        <button type="button" onClick={() => input.current?.click()}>
          {logo ? he.settings.replaceLogo : he.settings.chooseLogo}
        </button>
        {logo && (
          <button type="button" class="secondary" onClick={() => void settingsRepo.removeLogo()}>
            {he.settings.removeLogo}
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          void onPick(e.currentTarget.files?.[0]);
          e.currentTarget.value = '';
        }}
      />
    </div>
  );
}

function BackupButtons({ onMessage }: { onMessage: (m: string) => void }) {
  const input = useRef<HTMLInputElement>(null);

  async function onBackup() {
    try {
      const outcome = await backupNow();
      onMessage(he.backup[outcome]);
    } catch {
      onMessage(he.backup.failed);
    }
  }

  async function onRestore(file: File | undefined) {
    if (!file) return;
    let parsed: ReturnType<typeof parseBackup>;
    try {
      parsed = parseBackup(await file.text());
    } catch {
      onMessage(he.backup.errors.unreadable);
      return;
    }
    // A bad file is refused before she is asked to wipe anything.
    if (!parsed.ok) {
      onMessage(he.backup.errors[parsed.error]);
      return;
    }
    if (!(await ask({ message: he.backup.restoreConfirm, yes: he.backup.restoreYes, no: he.goBack, danger: true }))) return;
    try {
      await restoreBackup(parsed.backup);
    } catch {
      // The transaction rolled back, so this is still true.
      onMessage(he.backup.errors.damaged);
      return;
    }
    // A reload is the plain way to make every screen and input show the restored data.
    await tell(he.backup.restored, he.backup.restoredOk);
    location.reload();
  }

  return (
    <div class="row">
      <button type="button" onClick={() => void onBackup()}>{he.backup.backupNow}</button>
      <button type="button" class="secondary" onClick={() => input.current?.click()}>
        {he.backup.restore}
      </button>
      <input
        ref={input}
        type="file"
        accept=".json,.txt,application/json,text/plain"
        hidden
        onChange={(e) => {
          void onRestore(e.currentTarget.files?.[0]);
          e.currentTarget.value = '';
        }}
      />
    </div>
  );
}

function StorageStatus() {
  const [persisted, setPersisted] = useState<boolean | null>(null);
  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersisted, () => setPersisted(null));
  }, []);
  const text =
    persisted === null ? he.storage.unknown : persisted ? he.storage.persisted : he.storage.notPersisted;
  return <p class="muted">{text}</p>;
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('he-IL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}
