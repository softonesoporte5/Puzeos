import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed,
} from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { OneSignal } from '@ionic-native/onesignal/ngx';

const { PushNotifications } = Plugins

@Injectable({
  providedIn: 'root'
})
export class NotificationServiceService {

  token:string='';

  constructor(
    private platform:Platform,
    private router:Router,
    private oneSignal: OneSignal
  ) {

  }

  inicializar(){
    if(this.platform.is("capacitor")){
     /* PushNotifications.requestPermission()
      .then(resul=>{
        if(resul.granted){
          PushNotifications.register();
          this.addListeners();
        }else{

        }
      });*/

      this.oneSignal.startInit('e8539368-3a10-4b86-b79d-96b1d68118cd', '400280439340');
      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.None);

      this.oneSignal.getIds()
      .then(resp=>{
        this.token=resp.userId;
      })

      /*this.oneSignal.handleNotificationReceived().subscribe(() => {
      // do something when notification is received
      });

      this.oneSignal.handleNotificationOpened().subscribe(() => {
        // do something when a notification is opened
      });*/

      this.oneSignal.endInit();
    }
  }

  addListeners(){
    /*PushNotifications.addListener('registration',
    (token:PushNotificationToken)=>{
     //this.token=token.value;
    });

    PushNotifications.addListener('registrationError',(err:any)=>{
      console.log(err);
    });

    //Primer plano
    /*PushNotifications.addListener('pushNotificationReceived',(notification:PushNotification)=>{
      console.log(notification);
    });*/

    /*PushNotifications.addListener('pushNotificationActionPerformed',
    (notification:PushNotificationActionPerformed)=>{
      this.router.navigate(['/chat']);
    })*/
  }
}
