import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { ISettings } from './chat/interfaces/settings.interface';
import { NotificationServiceService } from './services/notification-service.service';
import { Component, } from '@angular/core';
import { Plugins, AppState } from '@capacitor/core';
import { AngularFireDatabase } from '@angular/fire/database';
import * as firebase from 'firebase';

const { App } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private notificationService:NotificationServiceService,
    private router:Router,
    private fireDb: AngularFireDatabase,
    private firestore: AngularFirestore
  ) {
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
    },e=>console.log(e));

    const usersRef = firestore.collection('users'); // Get a reference to the Users collection;
    const onlineRef = fireDb.database.ref('.info/connected'); // Get a reference to the list of connections

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
  }
}
