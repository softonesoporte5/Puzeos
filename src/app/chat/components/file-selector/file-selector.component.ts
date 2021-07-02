import { IMessage } from './../../interfaces/message.interface';
import { ChatService } from './../../pages/chat/chat.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirebaseStorageService } from './../../../services/firebase-storage.service';
import { Component, OnInit, Input } from '@angular/core';
import { Chooser } from '@ionic-native/chooser/ngx';
import * as firebase from 'firebase';

@Component({
  selector: 'app-file-selector',
  templateUrl: './file-selector.component.html',
  styleUrls: ['./file-selector.component.scss'],
})
export class FileSelectorComponent implements OnInit {

  @Input() userName:string;
  @Input() idChat:string;

  constructor(
    private chooser:Chooser,
    private firebaseStorage:FirebaseStorageService,
    private firestore:AngularFirestore,
    private chatService:ChatService
  ) { }

  ngOnInit() {}

  openOpc(){
    this.chooser.getFile("image/*")
    .then(file =>{
      console.log(file)
      if(file.name){
        this.firebaseStorage.uploadImageInChat(file.dataURI,this.userName)
        .then(resp=>{
          const timestamp=firebase.default.firestore.FieldValue.serverTimestamp();
          let message:IMessage={
            message:"Imágen",
            user:this.userName,
            type:"image",
            timestamp:timestamp,
            ref:resp,
            download:false,
            localRef:file.uri,
            fileName:file.name
          }

          this.firestore.collection("messages").doc(this.idChat).collection("messages")
          .add(message)
          .then(resp=>{
            //this.chatService.addMessage(message,this.idChat);
          })
          .catch(error=>{
            console.log(error);
          });

          this.firestore.collection("chats").doc(this.idChat).update({//Agregar ultimo mensaje al chat
            lastMessage:`"Imágen"`,
            timestamp:timestamp
          });
        })
      }
    })
    .catch((error: any) => console.error(error));
  }
}
