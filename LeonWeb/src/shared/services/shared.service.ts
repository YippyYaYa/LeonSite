import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  public readonly showSideDock = new BehaviorSubject(false);

  constructor() {
  }

  toggleSideDock() {
    this.showSideDock.next(!this.showSideDock.getValue())
  }
}