import { Signal } from "@angular/core";

export interface ChatMessage {
  from: 'user' | 'ai';
  text: string;
  messageId: number;
  timestamp: string;
}

export interface ChatTopic {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  pinned: boolean;
}

export interface GroupedTopic {
  label: string,
  $topics: Signal<ChatTopic[]>
}