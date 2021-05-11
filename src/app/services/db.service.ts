import { Injectable } from '@angular/core';
import PouchFind from 'pouchdb-find';
const PouchDB = require('pouchdb').default;
PouchDB.plugin(PouchFind);
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  private _DB:any;

  constructor() {}

  public cargarDB(name:string){
    if(name==="users"){
      return new PouchDB("users");
    }
    else if(name==="chats"){
      return new PouchDB("chats");
    }
    else if(name==="messages"){
      return new PouchDB("messages");
    }
  }

  // public createDBUsers() {
  //   this._DB=
  // }

  // public getDB(){
  //   return this._DB;
  // }
}
