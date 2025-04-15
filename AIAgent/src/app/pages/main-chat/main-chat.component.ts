import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Needed for ngModel

@Component({
  selector: 'app-main-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss'
})
export class MainChatComponent {
  chats: Record<string, { from: 'user' | 'ai'; text: string }[]> = {
    'Private Condo Market Trends': [
      {
        from: 'user',
        text: 'Hi AI, what are the latest market trends for private condominiums?'
      },
      {
        from: 'ai',
        text: 'Current trends show a steady increase in demand, especially in city fringe areas. Would you like a breakdown by district?'
      }
    ],
    'Freehold vs Leasehold': [
      {
        from: 'user',
        text: 'Yes, and can you compare freehold vs leasehold value retention?'
      },
      {
        from: 'ai',
        text: 'Freehold properties generally retain value better over time, but leasehold may offer better short-term yield. Would you like specific data?'
      }
    ],
    'HDB Upgrading Schemes': [
      {
        from: 'user',
        text: 'What are the current HDB upgrading schemes available?'
      },
      {
        from: 'ai',
        text: 'There are several, including the Home Improvement Programme (HIP) and Neighbourhood Renewal Programme (NRP).'
      }
    ],
    'Commercial Property ROI': [
      {
        from: 'user',
        text: 'Is investing in commercial property a good idea in 2024?'
      },
      {
        from: 'ai',
        text: 'It can be, especially with the rise in demand for mixed-use spaces. Would you like to see projected ROI for specific zones?'
      }
    ]
  };

  selectedTopic = 'Private Condo Market Trends';
  topicList = Object.keys(this.chats);
  chatHistory = this.chats[this.selectedTopic];
  newMessage = '';

  loadChat(topic: string) {
    this.selectedTopic = topic;
    this.chatHistory = this.chats[topic] || [];
    this.newMessage = '';
  }

  sendMessage() {
    const message = this.newMessage.trim();
    if (!message) return;

    this.chatHistory.push({ from: 'user', text: message });
    this.newMessage = '';

    // Simulate AI response (optional placeholder)
    setTimeout(() => {
      this.chatHistory.push({
        from: 'ai',
        text: 'Thank you for your question. Let me get back to you with the data.'
      });
    }, 500);
  }
}
