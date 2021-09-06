import { IMessage } from './../chat/interfaces/message.interface';
import { IUserData } from './../chat/interfaces/user.interface';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(
    private firestore: AngularFirestore
  ) { }

  getUser(){
    return this.firestore.collection("users").doc(firebase.default.auth().currentUser.uid).valueChanges() as Observable<IUserData>;
  }

  getMessagesRef(chatID: string){
    return this.firestore.collection("messages")
    .doc(chatID).collection<IMessage>("messages")
    .ref;
  }
}
