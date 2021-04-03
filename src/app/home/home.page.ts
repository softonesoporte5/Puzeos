import { IChatData } from './../../interfaces/chat.interface';
import { IUser } from './../../interfaces/user.interface';
import { Action, AngularFirestore} from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { AppService } from './../../../app.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { IChat} from '../../interfaces/chat.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {

  user:IUser;
  userSubscription:Subscription;
  chats:IChat[]=[];
  cargar:boolean=true;

  constructor(
    private menu: MenuController,
    private appService:AppService,
    private firestore:AngularFirestore
  ) { }

  ngOnInit() {
    this.userSubscription=this.appService.obtenerUsuario()
   .subscribe((user:IUser)=>{console.log("a");
      this.user=user;
      if(this.chats.length<user.data.chats.length){
        if(this.chats.length===0){
          this.chats=[];
          let cont=0;
          user.data.chats.forEach(chat=>{
            const i=cont;

            this.firestore.collection("chats").doc(chat)
            .snapshotChanges()
            .subscribe((resp:Action<any>)=>{
              this.cargar=false;
              const data=resp.payload.data();

              this.chats[i]={
                id:resp.payload.id,
                data:{
                  group:data.group,
                  lastMessage:data.lastMessage,
                  members:data.members,
                }
              }
            });
            cont++;
          });
        }else{
          for(let index=this.chats.length; index<user.data.chats.length; index++){
            this.firestore.collection("chats").doc(user.data.chats[index])
            .valueChanges()
            .subscribe((chat:IChatData)=>{
              this.chats[index]={
                id:user.data.chats[index],
                data:{
                  group:chat.group,
                  lastMessage:chat.lastMessage,
                  members:chat.members,
                }
              }
            })
          }
        }
      }
   });

  }

  ngOnDestroy(){
    this.userSubscription.unsubscribe();
  }

  openMenu(){
    const open=async()=> {
      await this.menu.open();
    }
    open();
  }

}

