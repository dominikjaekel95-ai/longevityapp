import { CONSENT_ANALYTICS, CONSENT_PHOTO } from '@/content/consent';
import { setAnalyticsOptIn } from '@/lib/analytics';
import { deleteAllEstimates } from '@/lib/db/checkins';
import { recordConsent, revokeConsent } from '@/lib/db/consents';
import { getSession, supabase } from '@/lib/sync/supabase';
import { syncNow } from '@/lib/sync/sync';

/** Einwilligung erteilen oder widerrufen, mit den Folgen aus docs/REVIEW.md R2. */
export async function setConsent(consentId: string, version: string, granted: boolean): Promise<void> {
  if (granted) {
    await recordConsent(consentId, version);
    if (consentId === CONSENT_ANALYTICS) await setAnalyticsOptIn(true);
  } else {
    await revokeConsent(consentId);
    if (consentId === CONSENT_ANALYTICS) await setAnalyticsOptIn(false);
    if (consentId === CONSENT_PHOTO) {
      await deleteAllEstimates();
      const session = await getSession();
      if (supabase && session) {
        await supabase.from('estimates').delete().eq('user_id', session.user.id);
      }
    }
  }
  syncNow().catch(() => undefined);
}
