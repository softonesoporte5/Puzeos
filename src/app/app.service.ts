import { ILocalForage } from './chat/interfaces/localForage.interface';
import { DbService } from './services/db.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';
import { IUserData } from './chat/interfaces/user.interface';

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
    return this.firestore.collection("users").doc(firebase.default.auth().currentUser.uid).valueChanges() as Observable<IUserData>;
  }

  private getFileReader(): FileReader {
    const fileReader = new FileReader();
    const zoneOriginalInstance = (fileReader as any)["__zone_symbol__originalInstance"];
    return zoneOriginalInstance || fileReader;
  }

  convertBlobToBase64=(blob:Blob)=>new Promise((resolve,reject)=>{
    const reader=this.getFileReader();
    reader.onerror=reject;
    reader.onload=()=>resolve(reader.result);
    reader.readAsDataURL(blob);
  });

}
