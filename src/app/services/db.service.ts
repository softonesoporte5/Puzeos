import { ILocalForage } from './../chat/interfaces/localForage.interface';
import { Injectable } from '@angular/core';
const localForage = require("localforage") as ILocalForage;

@Injectable({
  providedIn: 'root'
})
export class DbService {

  constructor() {}

  cargarDB(){
    return localForage;
  }

  loadStore(name:string){
    return localForage.createInstance({
      name        : localForage._config.name,
      storeName   : name
    });
  }
}
