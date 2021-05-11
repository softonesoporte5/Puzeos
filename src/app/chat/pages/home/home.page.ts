import { IChatData } from './../../interfaces/chat.interface';
import { IUser, IUserData } from './../../interfaces/user.interface';
import { AngularFirestore} from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { AppService } from './../../../app.service';
import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { IChat} from '../../interfaces/chat.interface';
import * as firebase from 'firebase';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit{

  user:IUser;
  userSubscription:Subscription;
  chats:IChat[]=[];
  chatsFirebase:number=0;
  dbChats:any;

  constructor(
    private menu: MenuController,
    private appService:AppService,
    private firestore:AngularFirestore,
    private db:DbService
  ) { }

  ngOnInit() {
    this.dbChats=this.db.cargarDB("chats");

    this.dbChats.allDocs({include_docs: true})
    .then(docs=>{console.log(docs)
      docs.rows.forEach((chat,i:number) => {
        this.chats[i]={
          id:chat.id,
          data:chat.doc.data
        }
      });
    }).catch(error=>{
      console.log(error);
    });

    this.userSubscription=this.appService.obtenerUsuario()
    .subscribe((user:IUserData)=>{
      this.user={
        id:firebase.default.auth().currentUser.uid,
        data:{...user}
      };

      if(this.chatsFirebase<this.user?.data?.chats?.length){
        if(this.chatsFirebase===0){
          let cont=0;

          this.user.data.chats.forEach(chat=>{
            const i=cont;
            this.firestore.collection("chats").doc(chat)
            .valueChanges()
            .subscribe((resp:IChatData)=>{

              //Comprobamos si existe en la bd local
              this.dbChats.get(chat)
              .then(doc=>{
                doc.data={
                  group:resp.group,
                  lastMessage:resp.lastMessage,
                  members:resp.members,
                  userNames:resp.userNames
                }
                this.dbChats.put(doc);
              })
              .catch(error=>{
                if(error.status===404){
                  const chatDB={
                    _id:chat,
                    data:{
                      group:resp.group,
                      lastMessage:resp.lastMessage,
                      members:resp.members,
                      userNames:resp.userNames
                    }
                  };
                  this.dbChats.put(chatDB);
                }
              });

              this.chats[i]={
                id:chat,
                data:{
                  group:resp.group,
                  lastMessage:resp.lastMessage,
                  members:resp.members,
                  userNames:resp.userNames
                }
              }
            });
            cont++;
            this.chatsFirebase=this.chatsFirebase+1;
          });
        }else{
          for(let index=this.chats.length; index<user.chats.length; index++){
            this.firestore.collection("chats").doc(user.chats[index])
            .valueChanges()
            .subscribe((chat:IChatData)=>{
              this.chats[index]={
                id:user.chats[index],
                data:{
                  group:chat.group,
                  lastMessage:chat.lastMessage,
                  members:chat.members,
                  userNames:chat.userNames
                }
              }
              console.log(this.chats);
            })
          }
        }
      }
   });
  }

  openMenu(){
    const open=async()=> {
      await this.menu.open();
    }
    open();
  }

}

