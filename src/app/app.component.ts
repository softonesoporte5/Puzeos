import { DbService } from './services/db.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private db:DbService
  ) {
    // this.db.createDB("chats");
    // this.db.createDB("users");
  }
}
