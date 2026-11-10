import { useEffect, useState } from 'preact/hooks';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Order } from '../db/schema';
import { ordersRepo, settingsRepo } from '../db/repositories';
import { backupNow } from '../db/backup';
import { he } from '../i18n/he';
import { formatDay, localIsoDate, weekdayName } from '../lib/dates';
import { backupDue, buildDiary, daysSinceBackup, totalOwed, type DiarySection } from '../lib/diary';
import { formatShekels } from '../lib/money';
import { href } from '../lib/route';
import { OrderCard } from '../ui/order-card';
import { isInstalled } from '../ui/install';

// The front screen (step 07): what is due, from today on. Delivered and cancelled orders
// leave it, except the delivered ones still owing, which have a line of their own.
export function DiaryScreen() {
  const today = useToday();
  const orders = useLiveQuery(() => ordersRepo.all());
  const settings = useLiveQuery(() => settingsRepo.get());
  if (!orders || !settings) return null;

  const diary = buildDiary(orders, today);
  const nothingOpen = diary.sections.every((s) => s.days.length === 0);

  return (
    <section class="diary">
      {/* Opened in a Chrome tab, not from the icon: until it is installed, show her how. */}
      {!isInstalled() && (
        <div class="alert install">
          <p>{he.install.banner}</p>
          <a class="button" href={href({ name: 'install' })}>{he.install.bannerButton}</a>
        </div>
      )}
      <BackupPrompt lastBackupAt={settings.lastBackupAt} today={today} />

      {diary.overdue.length > 0 && (
        <details class="alert overdue">
          <summary>
            {he.diary.overdue}: {diary.overdue.length}
          </summary>
          <p class="muted">{he.diary.overdueHint}</p>
          <OrderList orders={diary.overdue} />
        </details>
      )}

      {diary.unpaid.length > 0 && (
        <details class="alert unpaid">
          <summary>
            {he.diary.unpaid}: {diary.unpaid.length} · {formatShekels(totalOwed(diary.unpaid))}
          </summary>
          <OrderList orders={diary.unpaid} />
        </details>
      )}

      {diary.sections.map((s) => (
        <Section key={s.key} section={s} today={today} />
      ))}
      {nothingOpen && diary.overdue.length === 0 && <p class="muted">{he.diary.empty}</p>}

      <a class="fab" href={href({ name: 'orderNew' })}>+ {he.orders.newOrder}</a>
    </section>
  );
}

function Section({ section, today }: { section: DiarySection<Order>; today: string }) {
  // Today is always shown, so an empty one says so; the other sections only when something is due.
  if (section.key === 'today') {
    const orders = section.days[0]?.orders ?? [];
    return (
      <>
        <h2>
          {he.diary.today} <span class="muted day-name">· {weekdayName(today)}</span>
        </h2>
        {orders.length === 0 ? <p class="muted">{he.diary.nothingToday}</p> : <OrderList orders={orders} showDate={false} />}
      </>
    );
  }
  if (section.days.length === 0) return null;
  return (
    <>
      <h2>{he.diary[section.key]}</h2>
      {section.days.map((day) => (
        <div key={day.date} class="diary-day">
          <h3>{formatDay(day.date)}</h3>
          <OrderList orders={day.orders} showDate={false} />
        </div>
      ))}
    </>
  );
}

function OrderList({ orders, showDate = true }: { orders: Order[]; showDate?: boolean }) {
  return (
    <ul class="cards">
      {orders.map((order) => (
        <li key={order.id}>
          <OrderCard order={order} showDate={showDate} />
        </li>
      ))}
    </ul>
  );
}

function BackupPrompt({ lastBackupAt, today }: { lastBackupAt: string | undefined; today: string }) {
  const [message, setMessage] = useState('');
  const due = backupDue(lastBackupAt, today);
  // Once the backup succeeds the prompt goes, but what happened is still said once.
  if (!due) return message ? <p class="message">{message}</p> : null;

  const days = daysSinceBackup(lastBackupAt, today);

  async function onBackup() {
    try {
      setMessage(he.backup[await backupNow()]);
    } catch {
      setMessage(he.backup.failed);
    }
  }

  return (
    <div class="alert backup">
      <p>
        {days === null ? he.diary.backupNever : `${he.diary.backupAgo} ${days} ${he.diary.backupAgoDays}`}{' '}
        {he.diary.backupWhy}
      </p>
      <button type="button" onClick={onBackup}>
        {he.backup.backupNow}
      </button>
      {message && <p class="muted">{message}</p>}
    </div>
  );
}

/**
 * The phone's local date. An installed app stays open for days, so it is re-read when the
 * app comes back to the front and once a minute while it stays there, past midnight too.
 */
function useToday(): string {
  const [today, setToday] = useState(() => localIsoDate(new Date()));
  useEffect(() => {
    const refresh = () => setToday(localIsoDate(new Date()));
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    const timer = setInterval(refresh, 60_000);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(timer);
    };
  }, []);
  return today;
}
