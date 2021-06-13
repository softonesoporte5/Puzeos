import { IChat } from './../chat/interfaces/chat.interface';
import { Subject } from 'rxjs';
import { ILocalForage } from './../chat/interfaces/localForage.interface';
import { Injectable } from '@angular/core';
const localForage = require("localforage") as ILocalForage;

@Injectable({
  providedIn: 'root'
})
export class DbService{

  private dbChats$=new Subject<IChat[] | IChat>();
  chats:IChat[]=[];
  private dbChats:ILocalForage;

  constructor() {
    this.dbChats=this.loadStore("chats");
  }

  loadStore(name: string){
    return localForage.createInstance({
      name        : localForage._config.name,
      storeName   : name
    });
  }

  setItemChat(idChat:string,value:IChat){
    this.dbChats.setItem(idChat,value)
    .then((resp)=>this.dbChats$.next(resp))
    .catch(err=>console.log(err));
  }

  getItemsChat(){
    return this.dbChats$.asObservable();
  }

  cargarItemsChat(){
    this.dbChats.iterate(chat=>{
      this.chats.push(chat);
    }).then(()=>this.dbChats$.next(this.chats))
    .catch(err=>console.log(err));
  }
}
