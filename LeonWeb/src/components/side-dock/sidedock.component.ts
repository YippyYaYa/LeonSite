import { Component } from '@angular/core';
import { SharedService } from 'src/shared/services/shared.service';

@Component({
  selector: 'app-sidedock',
  templateUrl: './sidedock.component.html',
  styleUrls: ['./sidedock.component.scss']
})
export class SideDockComponent {
  constructor(
    public sharedService: SharedService
  ) {}
}
