import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  OnInit,
  WritableSignal,
  signal,
  computed,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage, ChatTopic, GroupedTopic } from './main-chat.model';
import { GroupLabels } from './main-chat.constant';

@Component({
  selector: 'app-main-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss',
})
export class MainChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  // topics: ChatTopic[] = [];
  $topics: WritableSignal<ChatTopic[]> = signal([]);
  groupedTopicsSignalArray: GroupedTopic[] = [
    {
      label: GroupLabels.recently,
      $topics: computed(() =>
        this.$topics().filter((topic) => {
          return this.getTimeDiff(topic) < 1;
        })
      ),
    },
    {
      label: GroupLabels.lastWeek,
      $topics: computed(() =>
        this.$topics().filter((topic) => {
          return !(this.getTimeDiff(topic) < 1) && this.getTimeDiff(topic) < 7;
        })
      ),
    },
    {
      label: GroupLabels.lastMonth,
      $topics: computed(() =>
        this.$topics().filter((topic) => {
          return !(this.getTimeDiff(topic) < 7) && this.getTimeDiff(topic) < 30;
        })
      ),
    },
    {
      label: GroupLabels.older,
      $topics: computed(() =>
        this.$topics().filter((topic) => {
          return !(this.getTimeDiff(topic) < 30);
        })
      ),
    },
  ];
  $chatHistory: Signal<ChatMessage[]> = computed(() => {
    const newMessage =
      this.$topics().find((topic) => topic.id === this.$selectedTopic()?.id)
        ?.messages || [];
    return newMessage;
  });
  $selectedTopic: WritableSignal<ChatTopic> = signal(null);
  newMessage = '';
  isTyping: boolean = false;
  showSidebar = false;

  ngOnInit(): void {
    const saved = localStorage.getItem('chatTopics');
    this.$topics.set(saved ? JSON.parse(saved) : []);
    if (this.$topics().length > 0) {
      this.$selectedTopic.set(this.$topics()[0]);
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private getLastMessageTimestamp(topic: ChatTopic): Date {
    const lastMsg = topic.messages.at(-1);
    if (lastMsg?.timestamp) {
      return new Date(lastMsg.timestamp);
    }
    return lastMsg ? new Date() : new Date(topic.createdAt);
  }

  private getTimeDiff(topic) {
    const now = new Date();
    const last = this.getLastMessageTimestamp(topic);
    const diff = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
    return diff;
  }

  scrollToBottom(): void {
    if (this.chatContainer) {
      setTimeout(() => {
        this.chatContainer.nativeElement.scrollTop =
          this.chatContainer.nativeElement.scrollHeight;
      });
    }
  }

  loadChat(topic: ChatTopic): void {
    this.$selectedTopic.set(topic);
    this.newMessage = '';
    this.isTyping = false;
    this.showSidebar = false;
  }

  sendMessage(): void {
    const message = this.newMessage.trim();
    if (!message || this.isTyping) return;

    const timeNow = new Date().toISOString();

    // New Topic
    if (!this.$selectedTopic()) {
      const newTitle =
        message.length > 40 ? message.slice(0, 40) + '...' : message;
      const newId = crypto.randomUUID();

      const newTopic: ChatTopic = {
        id: newId,
        title: newTitle,
        messages: [
          {
            from: 'user',
            text: message,
            messageId: 0,
            timestamp: timeNow,
          },
        ],
        createdAt: timeNow,
        pinned: false,
      };
      this.$topics.update((topics) => [...topics, newTopic]);
      this.$selectedTopic.set(newTopic);
    } else {
      this.$topics.update((topics) => {
        const topic = topics.find((topic) => {
          return topic.id === this.$selectedTopic().id;
        });

        topic.messages.push({
          from: 'user',
          text: message,
          messageId: topic.messages.length,
          timestamp: timeNow,
        });
        return topics;
      });
    }

    this.newMessage = '';
    this.isTyping = true;
    this.updateLocalStorage();

    this.fetchResponse();
  }

  fetchResponse() {
    setTimeout(() => {
      const timeNow = new Date().toISOString();
      if (this.isTyping) {
        this.$selectedTopic.update((topic) => {
          topic.messages.push({
            from: 'ai',
            text: 'Thank you for your question. Let me get back to you with the data.',
            messageId: topic.messages.length,
            timestamp: timeNow,
          });
          return topic;
        });
        this.isTyping = false;
        this.updateLocalStorage();
      }
    }, 1000);
  }

  updateLocalStorage(): void {
    localStorage.setItem('chatTopics', JSON.stringify(this.$topics()));
  }

  screenIsSmall(): boolean {
    return window.innerWidth < 768;
  }
}
