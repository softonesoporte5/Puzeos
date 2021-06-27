import { IChat } from './../../interfaces/chat.interface';
import { IUserData } from './../../interfaces/user.interface';
import { IMessage, IMessageSearch } from './../../interfaces/message.interface';
import { dbNames, ILocalForage } from './../../interfaces/localForage.interface';
import { DbService } from './../../../services/db.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';

@Component({
  selector: 'app-search-message',
  templateUrl: './search-message.page.html',
  styleUrls: ['./search-message.page.scss'],
})
export class SearchMessagePage implements OnInit {

  miFormulario:FormGroup=this.fb.group({
    searchTxt:['', [Validators.required, Validators.minLength(1)]]
  });

  searchTxt:AbstractControl=this.miFormulario.get("searchTxt");
  dbUsers:ILocalForage;
  user:IUserData;
  dbChatsMessages:ILocalForage[]=[];
  messages:IMessageSearch[]=[];
  searchTimeOut:NodeJS.Timeout;
  dbChats:ILocalForage;
  arrChats:IChat[]=[];

  constructor(
    private fb:FormBuilder,
    private db:DbService
  ) { }

  ngOnInit() {
    this.dbUsers=this.db.loadStore(dbNames.USERS);
    this.dbChats=this.db.loadStore("chats");

    this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
    .then(resp=>{
      if(resp){
        this.user=resp;
        resp.chats.forEach((chatID:string)=>{
          this.dbChats.getItem(chatID)
          .then(chat=>{
            this.arrChats.push(chat);
          }).catch(err=>console.log(err));
          console.log(this.dbChatsMessages)
          this.dbChatsMessages.push(this.db.loadStore("messages"+chatID));
        });
      }
    });

    let search='';

    this.searchTxt.statusChanges.subscribe(()=>{
      search=this.searchTxt.value.normalize('NFD').replace(/[\u0300-\u036f]/g,"");
      search=search.toLocaleLowerCase();
      clearTimeout(this.searchTimeOut);
      console.log(search);
      if(this.searchTxt.value.trim()!==''){
        this.searchTimeOut=setTimeout(()=>{
          this.messages=[];

          this.dbChatsMessages.forEach((chatDb,index)=>{
            chatDb.iterate((message:IMessage)=>{
              let messageTxt=message.message.normalize('NFD').replace(/[\u0300-\u036f]/g,"");
              messageTxt=messageTxt.toLocaleLowerCase();
              if(message.type==="text" && messageTxt.indexOf(search)!==-1){
                let arrUser=this.arrChats[index].userNames.filter(userName=>userName!==this.user.userName);
                let chatName=arrUser[0];
                this.messages.push({
                  timestamp:message.timestamp,
                  type:message.type,
                  id:message.id,
                  message:message.message,
                  userSend:chatName,
                  idChat:this.arrChats[index].id,
                  user:message.user,
                  index:messageTxt.indexOf(search)
                });
              }
            }).catch(err=>console.log(err));
          })
        },1500);
      }
    })
  }

  clearSearch(){
    console.log(this.messages);
    this.searchTxt.setValue('');
  }

}
