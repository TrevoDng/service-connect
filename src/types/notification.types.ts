// src/types/notification.types.ts

// ============================================
// NOTIFICATION TYPES
// ============================================
//
// Every event that fires across the app should map to one of these types.
// Components decide the icon/copy based on `type`.
//

export type NotificationType =
  // booking lifecycle
  | 'booking_requested'         // provider receives a new request
  | 'booking_accepted'          // client receives acceptance
  | 'booking_declined'          // client receives decline + reason
  | 'consultation_paid'         // provider receives confirmation
  | 'consultation_completed'    // client receives site photos + notes
  | 'price_proposed'            // client receives final price
  | 'price_agreed'              // provider receives agreement
  | 'price_disputed'            // both sides + admins receive dispute alert

  // work session
  | 'clock_in'                  // client receives reference code
  | 'clock_confirmed'           // provider receives client confirmation
  | 'clock_out'                 // client receives departure notification
  | 'photos_uploaded'           // client receives new progress photos
  | 'job_completed'             // client receives final photos + review prompt

  // chat
  | 'chat_message'              // recipient receives a new message

  // account
  | 'account_approved'          // user receives approval
  | 'account_rejected'          // user receives rejection
  | 'account_pending';          // user receives pending status

export type NotificationPriority = 'low' | 'normal' | 'high';

export interface Notification {
  id: string;
  userId: string;               // who should see this notification
  type: NotificationType;
  priority: NotificationPriority;

  title: string;
  message: string;

  // Optional deep-link target
  linkTo?: string;              // e.g. /client/dashboard?booking=123

  // Optional actor (who triggered it)
  actorId?: string;
  actorDisplayName?: string;

  // Optional entity references
  bookingId?: string;
  workSessionId?: string;
  threadId?: string;

  createdAt: string;            // ISO
  readAt?: string;
}
