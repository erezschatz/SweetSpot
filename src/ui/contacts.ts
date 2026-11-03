import { fromContact, type PickedContact } from '../lib/customers';

// The Contact Picker API (D18) is Chrome-on-Android only and not in TypeScript's DOM
// types, so the one call used is described here.
interface ContactsManager {
  select(properties: ('name' | 'tel')[], options?: { multiple?: boolean }): Promise<PickedContact[]>;
}

function contactsManager(): ContactsManager | null {
  const nav = navigator as Navigator & { contacts?: Partial<ContactsManager> };
  return nav.contacts && typeof nav.contacts.select === 'function' ? (nav.contacts as ContactsManager) : null;
}

/** Without the API the "from contacts" button is not shown at all; the form is typed. */
export function canPickContact(): boolean {
  return contactsManager() !== null;
}

/**
 * Opens the phone's contact list for one contact; only its name and numbers come back.
 * Must run from her tap. Null when she backs out without choosing.
 */
export async function pickContact(): Promise<{ name: string; phone: string } | null> {
  const manager = contactsManager();
  if (!manager) return null;
  const [contact] = await manager.select(['name', 'tel'], { multiple: false });
  return contact ? fromContact(contact) : null;
}
