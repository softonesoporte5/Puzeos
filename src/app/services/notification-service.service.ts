import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { Injectable } from '@angular/core';

import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed,
} from '@capacitor/core';


import { Platform } from '@ionic/angular';

const { NotificationExtension } = Plugins
const { PushNotifications } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class NotificationServiceService {

  token:string;

  constructor(
    private platform:Platform,
    private router:Router,
  ) {

  }

  inicializar(){
    if(this.platform.is("capacitor")){
      PushNotifications.requestPermission()
      .then(resul=>{
        if(resul.granted){
          PushNotifications.register();
          this.addListeners();
        }else{

        }
      });
    }
  }

  addListeners(){
    NotificationExtension.addListener('pushNotificationActionPerformed', (notification: PushNotificationActionPerformed) => {
      localStorage.setItem("1-"+new Date().toString(),JSON.stringify(notification));
    });

    NotificationExtension.addListener('pushNotificationReceived', (notification) => {
      localStorage.setItem("2-"+new Date().toString(),JSON.stringify(notification));
    });

    NotificationExtension.register();
  }
}
