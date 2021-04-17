import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, QuerySnapshot } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IUser } from './chat/interfaces/user.interface';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  user$=new Subject<IUser>();


  constructor(
    private firestore:AngularFirestore,
    private auth:AngularFireAuth
  ) {

   }

  obtenerUsuario(){
    return this.firestore.collection("users").doc(firebase.default.auth().currentUser.uid).valueChanges();
  }
}
