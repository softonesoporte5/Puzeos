import { ILocalForage } from './chat/interfaces/localForage.interface';
import { DbService } from './services/db.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  dbUsers:ILocalForage;

  constructor(
    private firestore:AngularFirestore,
    private db:DbService
  ){
    this.dbUsers=this.db.loadStore("users");
  }

  obtenerUsuario(){
    return this.dbUsers.getItem(firebase.default.auth().currentUser.uid);


    //return this.firestore.collection("users").doc(firebase.default.auth().currentUser.uid).valueChanges();
  }

  convertBlobToBase64=(blob:Blob)=>new Promise((resolve,reject)=>{
    const reader=new FileReader;
    reader.onerror=reject;
    reader.onload=()=>resolve(reader.result);
    reader.readAsDataURL(blob);
  });

}
