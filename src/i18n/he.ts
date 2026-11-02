// Every user-facing string lives here. The baker is addressed in the feminine.
export const he = {
  appName: 'SweetSpot',
  tagline: 'יומן ההזמנות שלך',
  version: 'גרסה',

  settings: {
    title: 'הגדרות',
    businessName: 'שם העסק',
    businessNamePlaceholder: 'למשל: העוגות של נועה',
    logo: 'לוגו העסק',
    chooseLogo: 'בחירת תמונה',
    replaceLogo: 'החלפת תמונה',
    removeLogo: 'הסרה',
    logoFailed: 'לא הצלחנו לקרוא את התמונה. נסי תמונה אחרת.',
  },

  backup: {
    title: 'גיבוי',
    explain: 'כל ההזמנות נשמרות רק בטלפון הזה. גיבוי שולח עותק לאן שתבחרי, למשל Drive או וואטסאפ לעצמך.',
    lastBackup: 'גיבוי אחרון:',
    never: 'עוד לא גיבית',
    backupNow: 'גיבוי עכשיו',
    shared: 'הגיבוי נשלח.',
    downloaded: 'קובץ הגיבוי נשמר בהורדות.',
    cancelled: 'הגיבוי בוטל.',
    failed: 'הגיבוי נכשל. נסי שוב.',
    restore: 'שחזור מקובץ',
    restoreConfirm: 'השחזור ימחק את כל מה שיש עכשיו בטלפון ויחליף אותו בתוכן הקובץ. להמשיך?',
    restored: 'השחזור הושלם.',
    errors: {
      notJson: 'זה לא קובץ גיבוי. בחרי קובץ ששמו מתחיל ב־sweetspot.',
      notSweetSpot: 'הקובץ הזה לא נוצר ב־SweetSpot. שום דבר לא השתנה.',
      newerVersion: 'הקובץ נוצר בגרסה חדשה יותר של האפליקציה. סגרי ופתחי אותה שוב כדי לעדכן, ונסי שוב.',
      damaged: 'הקובץ פגום ולא ניתן לשחזר ממנו. שום דבר לא השתנה.',
      unreadable: 'לא הצלחנו לקרוא את הקובץ. שום דבר לא השתנה.',
    },
  },

  storage: {
    title: 'אחסון',
    persisted: 'הנתונים שמורים לצמיתות בטלפון.',
    notPersisted: 'הדפדפן עלול למחוק את הנתונים כשחסר מקום. התקיני את האפליקציה למסך הבית וגבי באופן קבוע.',
    unknown: 'לא ידוע אם הנתונים שמורים לצמיתות.',
  },
} as const;
