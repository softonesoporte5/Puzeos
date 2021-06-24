import { IMessage } from './../../interfaces/message.interface';
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
  dbChatsMessages:ILocalForage[]=[];
  messages:IMessage[]=[];
  searchTimeOut:NodeJS.Timeout;

  constructor(
    private fb:FormBuilder,
    private db:DbService
  ) { }

  ngOnInit() {
    this.dbUsers=this.db.loadStore(dbNames.USERS);

    this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
    .then(resp=>{
      if(resp){
        resp.chats.forEach((chat:string)=>{
          console.log(this.dbChatsMessages)
          this.dbChatsMessages.push(this.db.loadStore("messages"+chat));
        });
      }
    });
    this.searchTxt.statusChanges.subscribe(()=>{
      clearTimeout(this.searchTimeOut);

      if(this.searchTxt.value.trim()!==''){
        this.searchTimeOut=setTimeout(()=>{
          this.dbChatsMessages.forEach(chatDb=>{
            chatDb.iterate((message:IMessage)=>{
              if(message.type==="text" && message.message.indexOf(this.searchTxt.value)!==-1){
                console.log(message.message.indexOf(this.searchTxt.value))
                this.messages.push(message);
              }
            })
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
