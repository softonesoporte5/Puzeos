import { ISettings } from './chat/interfaces/settings.interface';
import { NotificationServiceService } from './services/notification-service.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private notificationService:NotificationServiceService,
  ) {
    this.notificationService.inicializar();

    const settings = JSON.parse(localStorage.getItem("settings")) as ISettings;
    if(settings?.darkMode){
      document.body.classList.add("dark");
    }
  }
}
