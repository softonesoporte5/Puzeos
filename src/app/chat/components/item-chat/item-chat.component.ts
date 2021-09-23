import { AppService } from './../../../app.service';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/firestore';
import { IUserData } from './../../interfaces/user.interface';
import { DbService } from './../../../services/db.service';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { IChat } from './../../interfaces/chat.interface';
import { Component, Input, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { Plugins, Capacitor, FilesystemDirectory } from '@capacitor/core';
import { FirebaseStorageService } from 'src/app/services/firebase-storage.service';
import { StoreNames } from 'src/app/enums/store-names.enum';
const {Filesystem} = Plugins;

@Component({
  selector: 'app-item-chat',
  templateUrl: './item-chat.component.html',
  styleUrls: ['./item-chat.component.scss'],
})
export class ItemChatComponent implements OnInit {

  @Input("chat") chat:IChat;
  @Input("chatUser") chatUser:string;
  chatName:string;
  dbUsers:ILocalForage;
  urlImg:string="../../../../assets/person.jpg";
  dateString:string;

  constructor(
    private db:DbService,
    private firestore:AngularFirestore,
    private firebaseStorage:FirebaseStorageService,
    private http:HttpClient,
    private appService:AppService
  ) {}

  ngOnInit() {
    let arrUser=this.chat.userNames.filter(userName=>userName!==this.chatUser);
    this.chatName=arrUser[0];

    this.dbUsers=this.db.loadStore(StoreNames.Users);

    const date=new Date();
    const date2=new Date(this.chat.timestamp);
    if(date2.toLocaleDateString()===date.toLocaleDateString()){
      this.dateString="";
    }else{
      this.dateString=date2.toLocaleDateString();
    }

    for (const key in this.chat.members) {
      if(key!==firebase.default.auth().currentUser.uid){
        this.dbUsers.getItem(key)
        .then((userData:IUserData)=>{
          if(!userData){
            this.dbUsers.setItem(key,{
              userName:this.chatName
            }).then(()=>{
              let storageSubscribe=this.firestore.collection("users").doc(key)
              .get()
              .subscribe(resp=>{
                let dataUser=resp.data() as IUserData;
                console.log(resp.data())
                this.dbUsers.setItem(key,{
                  ...dataUser,
                  createDate:dataUser.createDate.toDate()
                });

                if(dataUser.imageUrl){
                  let imageSubscribe=this.firebaseStorage.getUrlFile(dataUser.imageUrl)
                  .subscribe(downloadUrl=>{
                    imageSubscribe.unsubscribe();
                    let httpSubscribe=this.http.get(downloadUrl,{
                      responseType:'blob',
                      reportProgress:true,
                      observe:'events'
                    }).subscribe(async event=>{
                      if(event.type===HttpEventType.DownloadProgress){
                      }else if(event.type===HttpEventType.Response){
                        let base64;
                        const date=new Date().valueOf();
                        const randomId=Math.round(Math.random()*1000)+date;
                        const reader=new FileReader;
                        console.log(reader)

                        this.appService.convertBlobToBase64(event.body)
                        .then((result:string | ArrayBuffer)=>{
                          base64=result;
                          Filesystem.writeFile({
                            path:randomId+'.jpeg',
                            data:base64,
                            directory:FilesystemDirectory.Data
                          }).then(resp=>{
                            this.dbUsers.setItem(key,{
                              ...dataUser,
                              imageUrlLoc:resp.uri,
                            }).then(()=>{
                              console.log(resp.uri)
                              this.urlImg=Capacitor.convertFileSrc(resp.uri);
                              storageSubscribe.unsubscribe();
                              httpSubscribe.unsubscribe();
                            }).catch(err=>console.log(err));
                          }).catch(err=>console.log(err));
                        }).catch(err=>console.log(err));
                      }
                    });
                  })
                }
              })
            })
          }else{
            if(userData.imageUrlLoc){
              this.urlImg=Capacitor.convertFileSrc(userData.imageUrlLoc);
            }else{
              this.urlImg='../../../../assets/avatar/avatar_'+userData.avatarId+'.jpg'
            }
          }
        },err=>console.log(err));
        break;
      }
    }
  }
}
