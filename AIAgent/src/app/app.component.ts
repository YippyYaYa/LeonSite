import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainChatComponent } from "./pages/main-chat/main-chat.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MainChatComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'AIAgent';
}
