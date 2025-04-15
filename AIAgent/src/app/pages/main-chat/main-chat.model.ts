export interface ChatMessage {
  from: 'user' | 'ai';
  text: string;
}

export interface ChatTopic {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string; // added timestamp for sorting/grouping
  pinned: boolean;
}