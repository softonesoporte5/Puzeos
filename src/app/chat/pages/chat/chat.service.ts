import { IMessage } from './../../interfaces/message.interface';
import { Injectable } from '@angular/core';
import { CollectionReference } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor() { }

  subscribeMessages(ref:CollectionReference<IMessage>){
    ref.onSnapshot(resp=>{
      resp.docChanges().forEach(mensaje=>{
        if(mensaje.type!=='removed'){
          if(!mensaje.doc.metadata.hasPendingWrites){//Comprobar si los datos vienen del servidor
            this.dbMessages.getItem(mensaje.doc.id)
            .then(resp=>{
              if(!resp){
                const data=mensaje.doc.data() as IMessage;

                this.mensajes.push({
                  ...data,
                  id:mensaje.doc.id,
                  download:false,
                  timestamp:data.timestamp.toDate(),
                  state:false
                });
                this.orderMessages();

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
          for (let i = this.mensajes.length -1; i > 0; i--){
            if(this.mensajes[i].id===mensaje.doc.id){
              this.mensajes[i].state=true;

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
      })
    });
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
