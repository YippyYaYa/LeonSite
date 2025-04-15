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
  selectedTopic = '';
  topicList: string[] = [];
  chatHistory: { from: 'user' | 'ai'; text: string }[] = [];
  newMessage = '';
  newTopicTitle = '';
  isTyping = false;
  showSidebar = false;

  ngOnInit(): void {
    const saved = localStorage.getItem('chatHistory');
    this.chats = saved ? JSON.parse(saved) : {};
    this.topicList = Object.keys(this.chats);
    this.selectedTopic = this.topicList[0] || '';
    if (this.selectedTopic) {
      this.loadChat(this.selectedTopic);
    }
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
    this.showSidebar = false;
  }

  sendMessage(): void {
    const message = this.newMessage.trim();
    if (!message) return;

    // Handle creating a new topic from first message
    if (!this.selectedTopic) {
      const newTopicTitle = message.length > 40 ? message.slice(0, 40) + '...' : message;
      if (this.chats[newTopicTitle]) {
        alert('A topic with this name already exists.');
        return;
      }

      this.chats[newTopicTitle] = [{ from: 'user', text: message }];
      this.selectedTopic = newTopicTitle;
      this.topicList.push(newTopicTitle);
      this.chatHistory = this.chats[newTopicTitle];
      this.newMessage = '';
      this.isTyping = true;
      this.updateChats();

      setTimeout(() => {
        this.chatHistory.push({
          from: 'ai',
          text: 'Thank you for your question. Let me get back to you with the data.'
        });
        this.isTyping = false;
        this.updateChats();
      }, 1000);

      return;
    }

    // Normal message flow
    this.chatHistory.push({ from: 'user', text: message });
    this.newMessage = '';
    this.isTyping = true;
    this.updateChats();

    setTimeout(() => {
      this.chatHistory.push({
        from: 'ai',
        text: 'Thank you for your question. Let me get back to you with the data.'
      });
      this.isTyping = false;
      this.updateChats();
    }, 1000);
  }

  addTopic(title: string): void {
    const trimmed = title.trim();
    if (!trimmed || this.chats[trimmed]) return;

    this.chats[trimmed] = [];
    this.topicList.push(trimmed);
    this.newTopicTitle = '';
    this.loadChat(trimmed);
    this.updateChats();
  }

  updateChats(): void {
    if (this.selectedTopic) {
      this.chats[this.selectedTopic] = this.chatHistory;
      localStorage.setItem('chatHistory', JSON.stringify(this.chats));
    }
  }

  screenIsSmall(): boolean {
    return window.innerWidth < 768;
  }
}
