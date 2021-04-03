import { IUser } from './../../interfaces/user.interface';
import { Action, AngularFirestore} from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { AppService } from './../../../app.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { IChat, IChatData } from '../../interfaces/chat.interface';

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
   .subscribe((user:IUser)=>{
      this.user=user;

      if(this.chats.length<Object.values(user.data.chats).length){
        this.chats=[];
        let cont=0;
        for(const key in user.data.chats) {
          const i=cont;

          this.firestore.collection("chats").doc(key)
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

