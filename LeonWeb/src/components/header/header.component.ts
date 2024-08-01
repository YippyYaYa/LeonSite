import { Component, EventEmitter, Output } from '@angular/core';
import { SharedService } from 'src/shared/services/shared.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(
    public sharedService: SharedService
  ) {}
}
