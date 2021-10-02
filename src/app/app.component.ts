import { AngularFirestore } from '@angular/fire/firestore';
import { ISettings } from './interfaces/settings.interface';
import { NotificationServiceService } from './services/notification-service.service';
import { Component, } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import * as firebase from 'firebase';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  messageColors=["#ffa500", "#0064ff", "#00ff0d", "#ff009a", "#ff0000"];
  constructor(
    private notificationService:NotificationServiceService,
    private fireDb: AngularFireDatabase,
    private firestore: AngularFirestore
  ) {
    this.notificationService.inicializar();

    const settings = JSON.parse(localStorage.getItem("settings")) as ISettings;
    if(settings?.darkMode){
      document.body.classList.add("dark");
    }

    const usersRef = this.firestore.collection('users'); // Get a reference to the Users collection;
    const onlineRef = this.fireDb.database.ref('.info/connected'); // Get a reference to the list of connections

    firebase.default.auth().onAuthStateChanged(userInfo=>{
      if(userInfo){
        onlineRef.on('value', snapshot => {
          // Set the Firestore User's online status to true
          usersRef
            .doc(userInfo.uid)
            .update({
              online: true,
            });

          fireDb.database.ref(`/status/${userInfo.uid}`).set('online');
        });

        fireDb.database
        .ref(`/status/${userInfo.uid}`)
        .onDisconnect() // Set up the disconnect hook
        .set('offline') // The value to be set for this key when the client disconnects
        .then(() => {
            // Set the Firestore User's online status to true
            usersRef
              .doc(userInfo.uid)
              .update({
                online: true,
              });
            fireDb.database.ref(`/status/${userInfo.uid}`).set('online');
        });
      }
    });

    if(!localStorage.getItem("messagesColor")){
      localStorage.setItem("messagesColor",this.messageColors[Math.round(Math.random()*4)])
    }
  }
}
