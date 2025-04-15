import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-main-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss'
})
export class MainChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  chats: Record<string, { from: 'user' | 'ai'; text: string }[]> = {};
  selectedTopic = 'Private Condo Market Trends';
  topicList: string[] = [];
  chatHistory: { from: 'user' | 'ai'; text: string }[] = [];
  newMessage = '';
  isTyping = false;
  showSidebar = false;

  ngOnInit(): void {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      this.chats = JSON.parse(saved);
    } else {
      this.chats = {
        'Private Condo Market Trends': [],
        'Freehold vs Leasehold': [],
        'HDB Upgrading Schemes': [],
        'Commercial Property ROI': []
      };
    }

    this.topicList = Object.keys(this.chats);
    this.loadChat(this.selectedTopic);
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    if (this.chatContainer) {
      setTimeout(() => {
        this.chatContainer.nativeElement.scrollTop =
          this.chatContainer.nativeElement.scrollHeight;
      });
    }
  }

  loadChat(topic: string): void {
    this.selectedTopic = topic;
    this.chatHistory = this.chats[topic] || [];
    this.newMessage = '';
    this.isTyping = false;
    this.showSidebar = false; // Optional: auto-close sidebar on mobile after selection
  }

  sendMessage(): void {
    const message = this.newMessage.trim();
    if (!message) return;

    this.chatHistory.push({ from: 'user', text: message });
    this.updateChats();
    this.newMessage = '';
    this.isTyping = true;

    // Simulated AI reply
    setTimeout(() => {
      this.chatHistory.push({
        from: 'ai',
        text: 'Thank you for your question. Let me get back to you with the data.'
      });
      this.isTyping = false;
      this.updateChats();
    }, 1000);
  }

  updateChats(): void {
    this.chats[this.selectedTopic] = this.chatHistory;
    localStorage.setItem('chatHistory', JSON.stringify(this.chats));
  }

  screenIsSmall(): boolean {
    return window.innerWidth < 768;
  }
}
