import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, QuerySnapshot } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { IUser } from './chat/interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  user$=new Subject<IUser>();

  constructor(
    private firestore:AngularFirestore,
    private auth:AngularFireAuth
  ) { }

  cargarUsuario(uid:string){
    this.firestore.collection("users").ref.where("uid","==",uid)
    .get()
    .then((querySnapshot:QuerySnapshot<IUser>) => {
        querySnapshot.forEach((doc) => {
          this.user$.next({
            id:doc.id,
            data:{
              uid:doc.data().uid,
              chats:{...doc.data().chats}
            }
          });
        });
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });
  }

  obtenerUsuario(){
    this.auth.user.subscribe(userInfo=>{
      this.cargarUsuario(userInfo.uid);
    });
    return this.user$.asObservable();
  }
}
