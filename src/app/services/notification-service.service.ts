import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed,
} from '@capacitor/core';
import { Platform } from '@ionic/angular';

import { FCM } from '@capacitor-community/fcm';
const fcm = new FCM();

const { PushNotifications } = Plugins

@Injectable({
  providedIn: 'root'
})
export class NotificationServiceService {

  token:string='';

  constructor(
    private platform:Platform,
    private router:Router
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
    PushNotifications.addListener('registration',
    (token:PushNotificationToken)=>{
      console.log(token.value);
     this.token=token.value;
    });

    PushNotifications.addListener('registrationError',(err:any)=>{
      console.log(err);
    });

    //Primer plano
    PushNotifications.addListener('pushNotificationReceived',(notification:PushNotification)=>{
      console.log(notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed',
    (notification:PushNotificationActionPerformed)=>{
      console.log('Click en notificación segundo plano',notification);
      this.router.navigate(['/chat']);
    })
  }
}
