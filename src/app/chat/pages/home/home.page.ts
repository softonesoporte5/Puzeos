import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IChat } from './../../interfaces/chat.interface';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { IUser } from './../../interfaces/user.interface';
import { AngularFirestore } from '@angular/fire/firestore';
import { Component, OnInit } from '@angular/core';
import { MenuController, AlertController } from '@ionic/angular';
import * as firebase from 'firebase';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit{

  user:IUser;
  chats:IChat[]=[];
  chatsFirebase:number=0;
  dbChats:ILocalForage;
  dbUsers:ILocalForage;
  chatsObj={};
  welcome=false;

  constructor(
    private menu: MenuController,
    private firestore:AngularFirestore,
    private db:DbService,
    private route:ActivatedRoute,
    private router:Router,
    public alertController: AlertController,
    private translate:TranslateService
  ) {

  }

  ngOnInit() {
    this.dbChats=this.db.loadStore('chats');
    this.dbUsers=this.db.loadStore("users");

    this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
    .then(user=>{
      this.user={
        id:firebase.default.auth().currentUser.uid,
        data:{...user}
      };

      this.dbChats.iterate((values,key)=>{
        this.chatsObj[key]={
          id:key,
          ...values
        }
        this.chatsFirebase++;
      }).then(()=>{
        this.orderChats();
        this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
        .then(user=>{
          console.log(user)
          this.user={
            id:firebase.default.auth().currentUser.uid,
            data:{...user}
          };
        }).catch(err=>console.log(err))

        //Nos subscribimos a los chats de manera local
        this.db.getItemsChat()
        .subscribe(resp=>{
          let chat=resp as IChat;
          this.chatsObj[chat.id]={
            ...chat
          }
          this.orderChats();
        });

        this.db.obtenerUsuario()
        .subscribe(user=>{
          this.user={
            id:firebase.default.auth().currentUser.uid,
            data:{...user}
          };
          if(this.chatsFirebase<this.user?.data?.chats?.length){
            console.log("Entró al if")
            for(let index=this.chats.length; index<user.chats.length; index++){
              console.log(user.chats[user.chats.length-1],user.chats.length-1);
              this.db.addNewConecction(user.chats[user.chats.length-1],user.chats.length-1);

              this.firestore.collection("chats").doc(user.chats[index])
              .get()
              .subscribe((resp)=>{
                console.log("Se reinició el chat o se agregó uno nuevo")
                const chat=resp.data() as IChat;
                this.db.setItemChat(user.chats[index],{
                  ...chat,
                  timestamp:chat.timestamp.toDate()
                });
              });
            }
            this.chatsFirebase=this.chatsFirebase+1;
          }
        });
      }).catch(err=>console.log(err));
    });

    this.route.queryParams
    .subscribe(params => {
      if(params.deleteChat && this.chatsObj[params.deleteChat]){
        this.chatsFirebase--;
        delete this.chatsObj[params.deleteChat];
        let message;
        if(params.blockUser){
          console.log(params.blockUser)
          message={
            type:"deleteAndBlock",
            specialData:JSON.parse(params.blockUser)
          }
        }else{
          message={type:"delete"}
        }
        this.firestore
        .collection("messages")
        .doc(params.deleteChat)
        .collection("messages")
        .add(message);

        this.orderChats();
      }

      if(params.welcome){
        this.welcome=true;
      }
    });
  }

  openMenu(){
    const open=async()=> {
      await this.menu.open();
    }
    open();
  }

  orderChats(){
    let chatsArr=[];
    const chats={...this.chatsObj};
    for (let property in chats) {
      chatsArr.push({...chats[property],timestamp:chats[property].timestamp.valueOf()});
    }

    chatsArr=chatsArr.sort(function (a, b) {
      if (a.timestamp < b.timestamp) {
        return 1;
      }
      if (a.timestamp > b.timestamp) {
        return -1;
      }
      // a must be equal to b
      return 0;
    });

    this.chats=chatsArr;
  }

  trackItems(index: number, chat: IChat) {
    return chat.id;
  }

  agregarRoute(){
    if(this.user.data.chats.length<5){
      this.router.navigate(['/chat/agregar']);
    }else{
      let alertTxt='';
      this.translate.get("HomePage.LimitMessage").subscribe(resp=>{
        this.presentAlert(resp+" :D");
      });
    }
  }

  async presentAlert(message:string) {
    let txt='';
    this.translate.get("Global.ToAccept").subscribe(resp=>{txt=resp});
    const alert = await this.alertController.create({
      message: message,
      buttons: [
        {
          text: txt,
        }
      ]
    });
    await alert.present();
  }
}

