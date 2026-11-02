import { db, type Settings } from './schema';
import { settingsRepo } from './repositories';
import {
  backupFileName,
  base64ToBytes,
  bytesToBase64,
  serialiseBackup,
  type Backup,
  type BackupSettings,
} from '../lib/backup';

export type BackupOutcome = 'shared' | 'downloaded' | 'cancelled';

/** Writes every table to one JSON file and hands it to the share sheet (or downloads it). */
export async function backupNow(now = new Date()): Promise<BackupOutcome> {
  const [settings, products, customers, orders] = await Promise.all([
    settingsRepo.get(),
    db.products.toArray(),
    db.customers.toArray(),
    db.orders.toArray(),
  ]);
  const text = serialiseBackup(
    { settings: await settingsForFile(settings), products, customers, orders },
    now.toISOString(),
  );
  const name = backupFileName(now);

  const outcome = await shareOrDownload(text, name);
  if (outcome !== 'cancelled') await settingsRepo.update({ lastBackupAt: now.toISOString() });
  return outcome;
}

/** Replaces everything on the phone with a backup already checked by parseBackup. */
export async function restoreBackup(backup: Backup): Promise<void> {
  const { settings, products, customers, orders } = backup;

  // One transaction: if any write fails, Dexie rolls all four tables back.
  await db.transaction('rw', [db.settings, db.products, db.customers, db.orders], async () => {
    await Promise.all([db.settings.clear(), db.products.clear(), db.customers.clear(), db.orders.clear()]);
    await db.settings.put(settingsFromFile(settings));
    await db.products.bulkAdd(products);
    await db.customers.bulkAdd(customers);
    await db.orders.bulkAdd(orders);
  });
}

async function settingsForFile(settings: Settings): Promise<BackupSettings> {
  const { logo, ...rest } = settings;
  if (!logo) return rest;
  const bytes = new Uint8Array(await logo.arrayBuffer());
  return { ...rest, logo: { type: logo.type, base64: bytesToBase64(bytes) } };
}

function settingsFromFile(settings: BackupSettings): Settings {
  const { logo, ...rest } = settings;
  if (!logo) return rest;
  return { ...rest, logo: new Blob([base64ToBytes(logo.base64)], { type: logo.type }) };
}

// Chrome on Android shares only some file types, and JSON may not be one of them.
// The same content as .txt still reaches Drive or WhatsApp; restore accepts both (D27).
async function shareOrDownload(text: string, name: string): Promise<BackupOutcome> {
  const candidates = [
    new File([text], name, { type: 'application/json' }),
    new File([text], name.replace(/\.json$/, '.txt'), { type: 'text/plain' }),
  ];
  const shareable = candidates.find((file) => navigator.canShare?.({ files: [file] }));
  if (shareable) {
    try {
      await navigator.share({ files: [shareable] });
      return 'shared';
    } catch (e) {
      // AbortError: she closed the share sheet. Nothing was saved, so it is not a backup.
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled';
      // Anything else (e.g. the gesture expired): fall through to a download.
    }
  }
  download(candidates[0]!);
  return 'downloaded';
}

function download(file: File): void {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
