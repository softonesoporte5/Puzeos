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
    },e=>console.log(e));

    const usersRef = firestore.collection('users'); // Get a reference to the Users collection;
    const onlineRef = fireDb.database.ref('.info/connected'); // Get a reference to the list of connections

    firebase.default.auth().onAuthStateChanged((userInfo)=>{
      const {uid}=userInfo;
      console.log(uid)
      var userStatusDatabaseRef = this.fireDb.database.ref('/status/' + uid);
      var isOfflineForDatabase = {
          state: 'offline',
          last_changed: firebase.default.database.ServerValue.TIMESTAMP,
      };

      var isOnlineForDatabase = {
          state: 'online',
          last_changed: firebase.default.database.ServerValue.TIMESTAMP,
      };

      this.fireDb.database.ref('.info/connected').on('value', function(snapshot) {
        console.log("fas")
          // If we're not currently connected, don't do anything.
          if (snapshot.val() == false) {
              return;
          };

          userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function() {
            console.log("Entró")
              userStatusDatabaseRef.set(isOnlineForDatabase);
          });
      });
      let userStatusFirestoreRef =this.firestore.doc('/status/' + uid);

      let isOfflineForFirestore = {
          state: 'offline',
          last_changed: firebase.default.firestore.FieldValue.serverTimestamp(),
      };

      let isOnlineForFirestore = {
          state: 'online',
          last_changed: firebase.default.firestore.FieldValue.serverTimestamp(),
      };

      this.fireDb.database.ref('.info/connected').on('value', function(snapshot) {
          if (snapshot.val() == false) {
              userStatusFirestoreRef.set(isOfflineForFirestore);
              return;
          };

          userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function() {
              userStatusDatabaseRef.set(isOnlineForDatabase);

              // We'll also add Firestore set here for when we come online.
              userStatusFirestoreRef.set(isOnlineForFirestore);
          });
      });
    });

  }

  initializeApp() {
    // CapacitorFirebaseDynamicLinks.addListener('deepLinkOpen', (data: { url: string }) => {
    //   console.log("asdwq")
    // })
  }
}
