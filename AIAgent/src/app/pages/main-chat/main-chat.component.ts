import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage, ChatTopic } from './main-chat.model';

@Component({
  selector: 'app-main-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss'
})
export class MainChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  topics: ChatTopic[] = [];
  selectedTopicId: string = '';
  newMessage = '';
  isTyping = false;
  showSidebar = false;

  ngOnInit(): void {
    const saved = localStorage.getItem('chatTopics');
    this.topics = saved ? JSON.parse(saved) : [];

    if (this.topics.length > 0) {
      this.selectedTopicId = this.topics[0].id;
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  get chatHistory(): ChatMessage[] {
    const topic = this.topics.find(t => t.id === this.selectedTopicId);
    return topic ? topic.messages : [];
  }

  get groupedTopics(): Record<string, ChatTopic[]> {
    const now = new Date();
    const groups: Record<string, ChatTopic[]> = {
      'Recently': [],
      'Past 7 Days': [],
      'Past Month': [],
      'Older': []
    };

    const sortedTopics = this.topics
      .filter(t => !t.pinned)
      .sort((a, b) => {
        const aTime = this.getLastMessageTimestamp(a);
        const bTime = this.getLastMessageTimestamp(b);
        return aTime.getTime() - bTime.getTime();
      });

    for (const topic of sortedTopics) {
      const last = this.getLastMessageTimestamp(topic);
      const diff = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);

      if (diff < 1) {
        groups['Recently'].push(topic);
      } else if (diff < 7) {
        groups['Past 7 Days'].push(topic);
      } else if (diff < 30) {
        groups['Past Month'].push(topic);
      } else {
        groups['Older'].push(topic);
      }
    }

    return groups;
  }

  get pinnedTopics(): ChatTopic[] {
    return this.topics.filter(t => t.pinned);
  }

  isTopicPinned(topic: ChatTopic): boolean {
    return !!topic.pinned;
  }

  pinTopic(topic: ChatTopic, e: MouseEvent): void {
    e.stopPropagation();
    topic.pinned = !topic.pinned;
    this.updateLocalStorage();
  }

  renameTopic(topic: ChatTopic, e: MouseEvent): void {
    e.stopPropagation();
    const newTitle = prompt('Rename topic:', topic.title);
    if (newTitle) {
      topic.title = newTitle;
      this.updateLocalStorage();
    }
  }

  deleteTopic(topic: ChatTopic, e: MouseEvent): void {
    e.stopPropagation();
    const confirmDelete = confirm(`Delete topic "${topic.title}"?`);
    if (confirmDelete) {
      this.topics = this.topics.filter(t => t.id !== topic.id);
      if (this.selectedTopicId === topic.id) this.selectedTopicId = '';
      this.updateLocalStorage();
    }
  }

  private getLastMessageTimestamp(topic: ChatTopic): Date {
    const lastMsg = topic.messages.at(-1);
    if ('timestamp' in (lastMsg ?? {})) {
      return new Date((lastMsg as any).timestamp);
    }
    return lastMsg ? new Date() : new Date(topic.createdAt);
  }

  scrollToBottom(): void {
    if (this.chatContainer) {
      setTimeout(() => {
        this.chatContainer.nativeElement.scrollTop =
          this.chatContainer.nativeElement.scrollHeight;
      });
    }
  }

  loadChat(topicId: string): void {
    this.selectedTopicId = topicId;
    this.newMessage = '';
    this.isTyping = false;
    this.showSidebar = false;
  }

  sendMessage(): void {
    const message = this.newMessage.trim();
    if (!message) return;

    if (!this.selectedTopicId) {
      const newTitle = message.length > 40 ? message.slice(0, 40) + '...' : message;
      const newId = crypto.randomUUID();

      const newTopic: ChatTopic = {
        id: newId,
        title: newTitle,
        messages: [{ from: 'user', text: message }],
        createdAt: new Date().toISOString(),
        pinned: false
      };

      this.topics.push(newTopic);
      this.selectedTopicId = newId;
      this.newMessage = '';
      this.isTyping = true;
      this.updateLocalStorage();

      setTimeout(() => {
        newTopic.messages.push({
          from: 'ai',
          text: 'Thank you for your question. Let me get back to you with the data.'
        });
        this.isTyping = false;
        this.updateLocalStorage();
      }, 1000);

      return;
    }

    const topic = this.topics.find(t => t.id === this.selectedTopicId);
    if (!topic) return;

    topic.messages.push({ from: 'user', text: message });
    this.newMessage = '';
    this.isTyping = true;
    this.updateLocalStorage();

    setTimeout(() => {
      topic.messages.push({
        from: 'ai',
        text: 'Thank you for your question. Let me get back to you with the data.'
      });
      this.isTyping = false;
      this.updateLocalStorage();
    }, 1000);
  }

  updateLocalStorage(): void {
    localStorage.setItem('chatTopics', JSON.stringify(this.topics));
  }

  screenIsSmall(): boolean {
    return window.innerWidth < 768;
  }
}
