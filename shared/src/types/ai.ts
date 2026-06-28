import type { UUID, ISODateString } from './common';

export type AgentType =
  | 'router'
  | 'faq'
  | 'card'
  | 'loan'
  | 'fraud'
  | 'investment'
  | 'memory'
  | 'handoff';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  messageId: UUID;
  sessionId: UUID;
  role: MessageRole;
  content: string;
  agentType?: AgentType;
  confidence?: number;
  timestamp: ISODateString;
}

export interface ChatSession {
  sessionId: UUID;
  customerId: UUID;
  messages: ChatMessage[];
  activeAgent: AgentType;
  createdAt: ISODateString;
}

export interface SendMessageRequest {
  message: string;
  sessionId?: UUID;
}

export interface AgentResponse {
  response: string;
  agentType: AgentType;
  confidence: number;
  sessionId: UUID;
  actions?: AgentAction[];
}

export interface AgentAction {
  type: string;
  payload: Record<string, unknown>;
}

export interface SupportTicket {
  ticketId: UUID;
  customerId: UUID;
  agentId?: UUID;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  conversationHistory: ChatMessage[];
  aiSuggestedReply?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
