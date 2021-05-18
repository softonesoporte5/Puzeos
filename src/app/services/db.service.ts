import { ILocalForage } from './../chat/interfaces/localForage.interface';
import { Injectable } from '@angular/core';
import PouchFind from 'pouchdb-find';
const PouchDB = require('pouchdb').default;
PouchDB.plugin(PouchFind);
const localForage = require("localforage") as ILocalForage;

@Injectable({
  providedIn: 'root'
})
export class DbService {

  constructor() {}

  public cargarDB(name:string,id:string=''){
    if(name==="users"){
      return new PouchDB("users");
    }
    else if(name==="chats"){
      return new PouchDB("chats");
    }
    else if(name==="messages"){
      return new PouchDB("messages"+id);
    }
  }


  cargarDB2(){
    return localForage;
  }

  loadStore(name:string){
    return localForage.createInstance({
      name        : localForage._config.name,
      storeName   : name
    });
  }
}
