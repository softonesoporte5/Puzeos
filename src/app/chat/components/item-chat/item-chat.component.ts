import { AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore';
import { IUserData, IUser } from './../../interfaces/user.interface';
import { AppService } from './../../../app.service';
import { IChat } from './../../interfaces/chat.interface';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-item-chat',
  templateUrl: './item-chat.component.html',
  styleUrls: ['./item-chat.component.scss'],
})
export class ItemChatComponent implements OnInit {

  @Input("chat") chat:IChat;
  chatUser:IUser;

  constructor(
    private appService:AppService,
    private fireStore:AngularFirestore
  ) {}

  ngOnInit() {
    console.log(this.chat);
    this.appService.obtenerUsuario()
    .subscribe((user:IUserData)=>{
      for (const key in this.chat.data.members){
        if(key!==user.userName){
          this.fireStore.collection("users").doc(key).get()
          .subscribe((userChat:DocumentSnapshot<IUserData>)=>{
            this.chatUser={
              id:userChat.id,
              data:{
                ...userChat.data()
              }
            }
          });
        };
      }
    });
  }
}
