import { Router } from '@angular/router';
import { ISettings } from './chat/interfaces/settings.interface';
import { NotificationServiceService } from './services/notification-service.service';
import { Component, NgZone } from '@angular/core';
import { Plugins, AppState } from '@capacitor/core';

const { App } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private notificationService:NotificationServiceService,
    private router:Router
  ) {
    this.initializeApp();
    this.notificationService.inicializar();

    const settings = JSON.parse(localStorage.getItem("settings")) as ISettings;
    if(settings?.darkMode){
      document.body.classList.add("dark");
    }

    App.addListener('appStateChange', (state: AppState) => {
      // state.isActive contains the active state
      if(state.isActive){
        App.getLaunchUrl().then(resp=>{
          if(resp.url){
            if(resp.url.includes("email")){
              this.router.navigate(['auth/login']);
            }
          }
        },e=>console.log(e))
      }
    });

    App.addListener('appUrlOpen', (data: any) => {
      console.log('App opened with URL: ' + data.url);
    });

    App.addListener('appRestoredResult', (data: any) => {
      console.log('Restored state:', data);
    });

    App.getLaunchUrl().then(resp=>{
      if(resp.url){
        this.router.navigate(['auth/login']);
      }
    },e=>console.log(e))
  }

  initializeApp() {
    // CapacitorFirebaseDynamicLinks.addListener('deepLinkOpen', (data: { url: string }) => {
    //   console.log("asdwq")
    // })
  }
}
