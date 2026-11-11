// src/components/Support/StaffSupportBubble.tsx
//
// Staff-side bubble. Requester messages show their real name + role
// avatar; staff messages render blue and are labelled either "You"
// (for the viewer's own replies) or "ServiceConnect Support".

import React from 'react';
import type { SupportMessage, ChatMessage } from '../../types';
import { ChatBubble } from '../Chat';
import { SUPPORT_DISPLAY_NAME, SUPPORT_AVATAR_GRADIENT } from '../../types/support.types';
import type { StaffSupportTicket } from '../../services/staffSupport.service';

export interface StaffSupportBubbleProps {
  message: SupportMessage;
  ticket: StaffSupportTicket;
  viewerId: string;
}

export const StaffSupportBubble: React.FC<StaffSupportBubbleProps> = ({
  message,
  ticket,
  viewerId,
}) => {
  const isOwn = message.senderId === viewerId;
  const isStaff =
    message.senderRole === 'ADMIN' || message.senderRole === 'EMPLOYEE';
  const isRequester =
    message.senderRole === 'CLIENT' || message.senderRole === 'PROVIDER';

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

  const senderName = isOwn
    ? 'You'
    : isStaff
    ? SUPPORT_DISPLAY_NAME
    : isRequester
    ? ticket.requester.displayName
    : 'Unknown';

  const senderAvatarGradient = isStaff
    ? SUPPORT_AVATAR_GRADIENT
    : isRequester
    ? ticket.requester.avatarGradient
    : undefined;

  return (
    <ChatBubble
      message={chatMessage}
      senderName={senderName}
      isOwn={isOwn}
      senderAvatarGradient={senderAvatarGradient}
    />
  );
};

export default StaffSupportBubble;