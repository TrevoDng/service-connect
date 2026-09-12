// src/data/demoChat.ts
import type { ChatThread, ChatMessage } from '../types';

// ============================================
// DEMO CHAT THREADS
// ============================================
//
// Threads are scoped to (clientId, providerId). They can exist BEFORE a
// booking — clients are encouraged to chat with several providers first.
//
// Thread 1 → John Doe ↔ Tom Brown (b-001 not yet linked)
// Thread 2 → Jane Smith ↔ Emily Davis (linked to booking b-002)
// Thread 3 → John Doe ↔ Lisa Anderson (second provider — John is comparing)

export const demoChatThreads: ChatThread[] = [
  // ------------------------------------------
  // Thread 1 — pre-booking conversation, no booking yet
  // ------------------------------------------
  {
    id: 'ct-001',
    clientId: 'c-001',
    providerId: 'p-001',
    client: {
      userId: 'c-001',
      displayName: 'John Doe',
      role: 'CLIENT',
      avatarGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    provider: {
      userId: 'p-001',
      displayName: 'Tom Brown',
      role: 'PROVIDER',
      avatarGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      providerRating: 4.8,
      providerCompletedJobs: 46,
      providerCategories: ['Plumbing', 'Handyman'],
      providerVerified: true,
    },
    createdAt: '2026-09-09T14:00:00.000Z',
    lastMessageAt: '2026-09-10T09:15:00.000Z',
    lastMessagePreview: 'Perfect, that works for me. I will send a booking request now.',
    unreadCount: 1,
    // No linkedBookingId — chat happened before booking
  },

  // ------------------------------------------
  // Thread 2 — chat that led to a booking (linked)
  // ------------------------------------------
  {
    id: 'ct-002',
    clientId: 'c-002',
    providerId: 'p-002',
    client: {
      userId: 'c-002',
      displayName: 'Jane Smith',
      role: 'CLIENT',
      avatarGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    provider: {
      userId: 'p-002',
      displayName: 'Emily Davis',
      role: 'PROVIDER',
      avatarGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      providerRating: 4.9,
      providerCompletedJobs: 71,
      providerCategories: ['Electrical'],
      providerVerified: true,
    },
    createdAt: '2026-09-07T08:30:00.000Z',
    lastMessageAt: '2026-09-09T10:00:00.000Z',
    lastMessagePreview: 'Great, see you on the 16th!',
    unreadCount: 0,
    linkedBookingId: 'b-002',
  },

  // ------------------------------------------
  // Thread 3 — client comparing a second provider
  // ------------------------------------------
  {
    id: 'ct-003',
    clientId: 'c-001',
    providerId: 'p-004',
    client: {
      userId: 'c-001',
      displayName: 'John Doe',
      role: 'CLIENT',
      avatarGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    provider: {
      userId: 'p-004',
      displayName: 'Lisa Anderson',
      role: 'PROVIDER',
      avatarGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      providerRating: 4.7,
      providerCompletedJobs: 58,
      providerCategories: ['Cleaning', 'Housekeeping'],
      providerVerified: true,
    },
    createdAt: '2026-09-10T11:00:00.000Z',
    lastMessageAt: '2026-09-10T11:22:00.000Z',
    lastMessagePreview: 'Understood — happy to give you a quote on the carpets too.',
    unreadCount: 0,
  },
];

// ============================================
// DEMO CHAT MESSAGES
// ============================================
//
// Ordered chronologically. Each message belongs to a thread and has a
// senderId matching either the client or the provider of that thread.
//
// Message statuses progress: sending → sent → delivered → read.
// The UI uses these to show a small tick/checkmark next to the client's
// own messages.

export const demoChatMessages: ChatMessage[] = [
  // ------------------------------------------
  // ct-001 — John ↔ Tom (Plumbing, pre-booking)
  // ------------------------------------------
  {
    id: 'cm-1001',
    threadId: 'ct-001',
    senderId: 'c-001',
    text: 'Hi Tom, I saw your profile. My kitchen sink is leaking from the base. Would you be able to help this week?',
    sentAt: '2026-09-09T14:00:00.000Z',
    status: 'read',
    readAt: '2026-09-09T14:05:00.000Z',
  },
  {
    id: 'cm-1002',
    threadId: 'ct-001',
    senderId: 'p-001',
    text: "Hi John, thanks for reaching out. Yes, I can definitely take a look. Can you share a couple of photos so I know what I'm dealing with?",
    sentAt: '2026-09-09T14:06:00.000Z',
    status: 'read',
    readAt: '2026-09-09T14:10:00.000Z',
  },
  {
    id: 'cm-1003',
    threadId: 'ct-001',
    senderId: 'c-001',
    text: 'Sure, here are two photos of the leak under the cabinet.',
    attachments: [
      {
        id: 'att-1001',
        url: 'https://placehold.co/600x400?text=Leak+1',
        type: 'image',
        name: 'leak-1.jpg',
      },
      {
        id: 'att-1002',
        url: 'https://placehold.co/600x400?text=Leak+2',
        type: 'image',
        name: 'leak-2.jpg',
      },
    ],
    sentAt: '2026-09-09T14:12:00.000Z',
    status: 'read',
    readAt: '2026-09-09T14:15:00.000Z',
  },
  {
    id: 'cm-1004',
    threadId: 'ct-001',
    senderId: 'p-001',
    text: "Looks like a worn-out seal on the drain fitting. Common issue. I'd suggest somewhere around R350 as a starting point, but I'd need to confirm on-site.",
    sentAt: '2026-09-09T14:20:00.000Z',
    status: 'read',
    readAt: '2026-09-09T14:25:00.000Z',
  },
  {
    id: 'cm-1005',
    threadId: 'ct-001',
    senderId: 'c-001',
    text: 'That sounds reasonable. What day works for you?',
    sentAt: '2026-09-09T14:30:00.000Z',
    status: 'read',
    readAt: '2026-09-09T14:35:00.000Z',
  },
  {
    id: 'cm-1006',
    threadId: 'ct-001',
    senderId: 'p-001',
    text: "Any morning this week except Wednesday. I usually start around 8am. How about Tuesday?",
    sentAt: '2026-09-09T14:38:00.000Z',
    status: 'read',
    readAt: '2026-09-09T14:40:00.000Z',
  },
  {
    id: 'cm-1007',
    threadId: 'ct-001',
    senderId: 'c-001',
    text: "Tuesday 9am would be perfect.",
    sentAt: '2026-09-10T09:00:00.000Z',
    status: 'read',
    readAt: '2026-09-10T09:02:00.000Z',
  },
  {
    id: 'cm-1008',
    threadId: 'ct-001',
    senderId: 'p-001',
    text: 'Great. Send the booking request through and I will confirm.',
    sentAt: '2026-09-10T09:05:00.000Z',
    status: 'read',
    readAt: '2026-09-10T09:10:00.000Z',
  },
  {
    id: 'cm-1009',
    threadId: 'ct-001',
    senderId: 'c-001',
    text: 'Perfect, that works for me. I will send a booking request now.',
    sentAt: '2026-09-10T09:15:00.000Z',
    status: 'delivered', // client's last message — provider hasn't read yet
  },

  // ------------------------------------------
  // ct-002 — Jane ↔ Emily (Electrical, linked to b-002)
  // ------------------------------------------
  {
    id: 'cm-2001',
    threadId: 'ct-002',
    senderId: 'c-002',
    text: 'Hi Emily, I need two new power outlets installed in my home office. Is that something you do?',
    sentAt: '2026-09-07T08:30:00.000Z',
    status: 'read',
    readAt: '2026-09-07T08:45:00.000Z',
  },
  {
    id: 'cm-2002',
    threadId: 'ct-002',
    senderId: 'p-002',
    text: "Hi Jane, yes definitely. Do you know which wall you'd like them on, and how far the nearest existing outlet is?",
    sentAt: '2026-09-07T08:50:00.000Z',
    status: 'read',
    readAt: '2026-09-07T08:55:00.000Z',
  },
  {
    id: 'cm-2003',
    threadId: 'ct-002',
    senderId: 'c-002',
    text: 'One on the north wall and one on the south wall. Nearest existing outlet is maybe 3 metres away.',
    sentAt: '2026-09-07T09:00:00.000Z',
    status: 'read',
    readAt: '2026-09-07T09:10:00.000Z',
  },
  {
    id: 'cm-2004',
    threadId: 'ct-002',
    senderId: 'p-002',
    text: "OK, that sounds straightforward. Around R450 for the pair, but I'll confirm once I see the wall.",
    sentAt: '2026-09-07T09:15:00.000Z',
    status: 'read',
    readAt: '2026-09-07T09:20:00.000Z',
  },
  {
    id: 'cm-2005',
    threadId: 'ct-002',
    senderId: 'c-002',
    text: "Sounds good. I'll send a request for the 16th if that works?",
    sentAt: '2026-09-08T10:00:00.000Z',
    status: 'read',
    readAt: '2026-09-08T10:05:00.000Z',
  },
  {
    id: 'cm-2006',
    threadId: 'ct-002',
    senderId: 'p-002',
    text: 'The 16th is fine. See you then!',
    sentAt: '2026-09-09T10:00:00.000Z',
    status: 'read',
    readAt: '2026-09-09T10:10:00.000Z',
  },

  // ------------------------------------------
  // ct-003 — John ↔ Lisa (Cleaning, comparing providers)
  // ------------------------------------------
  {
    id: 'cm-3001',
    threadId: 'ct-003',
    senderId: 'c-001',
    text: 'Hi Lisa, I am also looking for someone to deep clean a 2-bedroom apartment. Are you available next week?',
    sentAt: '2026-09-10T11:00:00.000Z',
    status: 'read',
    readAt: '2026-09-10T11:05:00.000Z',
  },
  {
    id: 'cm-3002',
    threadId: 'ct-003',
    senderId: 'p-004',
    text: 'Hi John, yes. How many bathrooms and is there carpeting?',
    sentAt: '2026-09-10T11:10:00.000Z',
    status: 'read',
    readAt: '2026-09-10T11:15:00.000Z',
  },
  {
    id: 'cm-3003',
    threadId: 'ct-003',
    senderId: 'c-001',
    text: '1 bathroom, no carpets in the main rooms but 2 small rugs.',
    sentAt: '2026-09-10T11:18:00.000Z',
    status: 'read',
    readAt: '2026-09-10T11:20:00.000Z',
  },
  {
    id: 'cm-3004',
    threadId: 'ct-003',
    senderId: 'p-004',
    text: 'Understood — happy to give you a quote on the carpets too.',
    sentAt: '2026-09-10T11:22:00.000Z',
    status: 'delivered', // last message, unread by client
  },
];

// ============================================
// HELPERS
// ============================================

export const getThreadById = (id: string): ChatThread | undefined =>
  demoChatThreads.find((t) => t.id === id);

export const getMessagesByThread = (threadId: string): ChatMessage[] =>
  demoChatMessages
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());

export const getThreadsForUser = (
  userId: string,
  role: 'CLIENT' | 'PROVIDER'
): ChatThread[] =>
  demoChatThreads.filter((t) =>
    role === 'CLIENT' ? t.clientId === userId : t.providerId === userId
  );
