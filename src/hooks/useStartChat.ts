// src/hooks/useStartChat.ts
//
// ============================================
// useStartChat — create-or-open a client↔provider thread
// ============================================
//
// Resolves the current user, gets (or lazily creates) the thread between
// them and a target provider, and navigates the user into that thread.
//
// Now uses chatService.openThread, which tries the backend first for
// real users, and falls back to localStorage for demo users (or if
// the backend is unreachable).

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../account/context/AuthContext';
import { chatService } from '../services/chat.service';

export interface StartChatTarget {
  providerId: string;
  providerDisplayName: string;
  providerAvatarGradient?: string;
  providerRating?: number;
  providerCompletedJobs?: number;
  providerCategories?: string[];
  providerVerified?: boolean;
}

export interface UseStartChatResult {
  /**
   * Create-or-open a thread with the given provider and navigate to it.
   * Silently no-ops when the current user cannot start a chat.
   * Returns the threadId on success, `null` on no-op.
   */
  startChat: (target: StartChatTarget) => Promise<string | null>;
  /** True when the current viewer is allowed to start chats. */
  canStartChat: boolean;
}

export const useStartChat = (): UseStartChatResult => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const viewerId = user?.id || null;
  const canStartChat = !!user && user.role === 'CLIENT' && !!viewerId;

  const startChat = useCallback(
    async (target: StartChatTarget): Promise<string | null> => {
      // Guard: only logged-in clients can start chats in this step
      if (!canStartChat || !viewerId || !user) return null;

      // Guard: target must be a real provider
      if (!target.providerId || !target.providerDisplayName) return null;

      const clientDisplayName =
        `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
        user.email ||
        'Client';

      try {
        const { thread } = await chatService.openThread({
          clientId: viewerId,
          providerId: target.providerId,
          fallback: {
            clientDisplayName,
            clientAvatarGradient: undefined,
            providerDisplayName: target.providerDisplayName,
            providerAvatarGradient: target.providerAvatarGradient,
            providerRating: target.providerRating,
            providerCompletedJobs: target.providerCompletedJobs,
            providerCategories: target.providerCategories,
            providerVerified: target.providerVerified,
          },
        });

        // Navigate to the dashboard with the thread pre-selected.
        // The MessagesView will pick this up from the ?thread= param.
        navigate(`/client/dashboard?thread=${thread.id}`);
        return thread.id;
      } catch (err) {
        console.error('Failed to start chat:', err);
        return null;
      }
    },
    [canStartChat, viewerId, user, navigate]
  );

  return { startChat, canStartChat };
};

export default useStartChat;