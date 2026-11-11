// src/components/Support/SupportBubble.tsx
//
// Thin adapter over the shared ChatBubble. Maps a SupportMessage into
// the ChatMessage shape and pins the display name to
// "ServiceConnect Support" for any staff-authored message.

import React from 'react';
import type { SupportMessage, ChatMessage } from '../../types';
import { ChatBubble } from '../Chat';
import { SUPPORT_DISPLAY_NAME, SUPPORT_AVATAR_GRADIENT } from '../../types/support.types';

export interface SupportBubbleProps {
  message: SupportMessage;
  /** Current viewer's user id — decides `isOwn` and the sender label. */
  viewerId: string;
}

export const SupportBubble: React.FC<SupportBubbleProps> = ({
  message,
  viewerId,
}) => {
  const isOwn = message.senderId === viewerId;
  const isStaff =
    message.senderRole === 'ADMIN' || message.senderRole === 'EMPLOYEE';

  const chatMessage: ChatMessage = {
    id: message.id,
    threadId: message.ticketId,
    senderId: message.senderId,
    text: message.text,
    attachments: message.attachments,
    sentAt: message.sentAt,
    status: message.status,
    readAt: message.readAt,
  };

  return (
    <ChatBubble
      message={chatMessage}
      senderName={isOwn ? 'You' : isStaff ? SUPPORT_DISPLAY_NAME : 'User'}
      isOwn={isOwn}
      senderAvatarGradient={isStaff ? SUPPORT_AVATAR_GRADIENT : undefined}
    />
  );
};

export default SupportBubble;