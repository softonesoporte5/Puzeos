import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  private db: SQLiteObject;
  private isOpen: boolean;

  constructor(
    public storage: SQLite
  ) {
    if (!this.isOpen) {
      this.storage = new SQLite();
      this.storage.echoTest().then(resp=>console.log(resp)).catch(e=>console.log(e))
      this.storage.create({ name: "data.db", location: "default" }).then((db: SQLiteObject) => {
        this.db = db;
        db.executeSql("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, identification INTEGER, name TEXT, lastname text)", []);
        this.isOpen = true;
      }).catch((error) => {
        console.log(error);
      })
    }
  }

  CreateUser(identification: number, name:string, lastname:string){
    return new Promise ((resolve, reject) => {
      let sql = "INSERT INTO users (identification, name, lastname) VALUES (?, ?, ?)";
      this.db.executeSql(sql, [identification, name, lastname]).then((data) =>{
        resolve(data);
      }, (error) => {
        reject(error);
      });
    });
  }

  GetAllUsers(){
    return new Promise ((resolve, reject) => {
      this.db.executeSql("SELECT * FROM users", []).then((data) => {
        let arrayUsers = [];
        if (data.rows.length > 0) {
          for (var i = 0; i < data.rows.length; i++) {
            arrayUsers.push({
              id: data.rows.item(i).id,
              identification: data.rows.item(i).identification,
              name: data.rows.item(i).name,
              lastname: data.rows.item(i).lastname
            });
          }
        }
        resolve(arrayUsers);
      }, (error) => {
        reject(error);
      })
    })
  }

  DeleteUser(idUser){

  }
}
