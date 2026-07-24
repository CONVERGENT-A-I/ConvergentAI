// import { prisma } from './database.js';
// import type { TurnLogEntry } from '../context/session-context-manager.js';

// /**
//  * Conversation Service
//  * Handles storing and retrieving conversation transcripts
//  */
// export class ConversationService {
//   /**
//    * Save a single conversation turn
//    */
//   async saveTurn(
//     applicationId: string,
//     role: 'USER' | 'ASSISTANT' | 'SYSTEM',
//     text: string,
//     turnNumber: number,
//     options?: {
//       lowConfidence?: boolean;
//       wasInterrupted?: boolean;
//       audioUrl?: string;
//       duration?: number;
//     }
//   ) {
//     if (!prisma) {
//       console.warn('[conversation-service] Database not enabled, skipping saveTurn');
//       return null;
//     }
//     return await prisma.conversation.create({
//       data: {
//         applicationId,
//         role,
//         text,
//         turnNumber,
//         lowConfidence: options?.lowConfidence || false,
//         wasInterrupted: options?.wasInterrupted || false,
//         audioUrl: options?.audioUrl,
//         duration: options?.duration,
//       },
//     });
//   }

//   /**
//    * Bulk save conversation history from turn log
//    */
//   async saveTurnLog(applicationId: string, turnLog: TurnLogEntry[]) {
//     if (!prisma) return null;
//     const conversations = turnLog.map((turn, index) => ({
//       applicationId,
//       role: turn.role.toUpperCase() as 'USER' | 'ASSISTANT',
//       text: turn.text,
//       turnNumber: index + 1,
//       timestamp: new Date(turn.timestamp),
//     }));

//     return await prisma.conversation.createMany({
//       data: conversations,
//       skipDuplicates: true,
//     });
//   }

//   /**
//    * Get conversation history for an application
//    */
//   async getConversationHistory(applicationId: string) {
//     if (!prisma) return [];
//     return await prisma.conversation.findMany({
//       where: { applicationId },
//       orderBy: { turnNumber: 'asc' },
//     });
//   }

//   /**
//    * Get recent turns (last N)
//    */
//   async getRecentTurns(applicationId: string, count: number = 10) {
//     if (!prisma) return [];
//     return await prisma.conversation.findMany({
//       where: { applicationId },
//       orderBy: { turnNumber: 'desc' },
//       take: count,
//     });
//   }
// }

// export const conversationService = new ConversationService();
