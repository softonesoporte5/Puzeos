import { DbService } from 'src/app/services/db.service';
import { Subject } from 'rxjs';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { IMessage } from './../../interfaces/message.interface';
import { Injectable, OnInit } from '@angular/core';
import { CollectionReference, AngularFirestore, DocumentChange } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChatService implements OnInit{

  private messages$=new Subject<DocumentChange<IMessage>[]>();
  dbMessages:ILocalForage;
  userName:string;
  idChat:string;

  constructor(
    private db:DbService,
    private firestore:AngularFirestore
  ) { }

  ngOnInit(){}

  subscribeMessages(ref:CollectionReference<IMessage>){
    ref.onSnapshot(resp=>{
      this.messages$.next(resp.docChanges());
      console.log(resp.docChanges());

      /*resp.docChanges().forEach(mensaje=>{
        if(mensaje.type!=='removed'){
          if(!mensaje.doc.metadata.hasPendingWrites){//Comprobar si los datos vienen del servidor
            this.dbMessages.getItem(mensaje.doc.id)
            .then(resp=>{
              if(!resp){
                const data=mensaje.doc.data() as IMessage;

                // this.messages$.next({
                //   ...data,
                //   id:mensaje.doc.id,
                //   download:false,
                //   timestamp:data.timestamp.toDate(),
                //   state:false
                // });

                if(data.user!==this.userName){
                  this.firestore.collection("messages").doc(this.idChat)
                  .collection("messages").doc(mensaje.doc.id)
                  .delete()
                  .catch(error=>{
                    console.log(error);
                  });
                }

                this.dbMessages.setItem(mensaje.doc.id,{
                  id:mensaje.doc.id,
                  ...data,
                  download:false,
                  timestamp:data.timestamp.toDate(),
                  state:false
                }).catch(error=>console.log(error));
              }
            }).catch(err=>console.log(err));
          }
        }else{
          for (let i = this.messages.length -1; i > 0; i--){
            if(this.messages[i].id===mensaje.doc.id){
              this.messages[i].state=true;

              this.dbMessages.setItem(mensaje.doc.id,{
                id:mensaje.doc.id,
                ...mensaje.doc.data(),
                timestamp:mensaje.doc.data().timestamp.toDate(),
                state:true
              }).catch(error=>console.log(error));

              break;
            }
          }
        }
      })*/
    });
  }

  getMessages(ref:CollectionReference<IMessage>, idChat:string, userName:string){
    this.dbMessages=this.db.loadStore("messages"+idChat);
    this.idChat=idChat;
    this.userName=userName;
    this.subscribeMessages(ref);
    return this.messages$.asObservable();
  }

  orderMessages(mesagges:IMessage[]){
    let messageArr=[];

    mesagges.forEach(message=>{
      messageArr.push({...message,timestamp:message.timestamp.valueOf()});
    });

    messageArr=messageArr.sort(function (a, b) {
      if (a.timestamp > b.timestamp) {
        return 1;
      }
      if (a.timestamp < b.timestamp) {
        return -1;
      }
      // a must be equal to b
      return 0;
    });

    return messageArr;
  }
}
