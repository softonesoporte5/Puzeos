import { ActionSheetController } from '@ionic/angular';
import { IMessage } from './../../interfaces/message.interface';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirebaseStorageService } from './../../../services/firebase-storage.service';
import { Component, OnInit, Input } from '@angular/core';
import { Chooser } from '@ionic-native/chooser/ngx';
import * as firebase from 'firebase';
import {Plugins, FilesystemDirectory, FilesystemEncoding} from '@capacitor/core';
const {Filesystem} = Plugins;


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
    private actionSheetController: ActionSheetController
  ) { }

  ngOnInit() {}

  selectFile(mime:string,type:string){
    this.chooser.getFile(mime)
    .then(file =>{

      if(file.name){
        const date=new Date().valueOf();
        const randomId=Math.round(Math.random()*1000)+date;
        let ext='';

        if(file.mediaType.includes("video")){
          type="video";
          ext='mp4';
        }else if(file.mediaType.includes("image")){
          type="image";
          ext='jpeg';
        }else if(file.mediaType.includes("application") || file.mediaType.includes("text")){
          type="document";
          ext=file.mediaType.slice((file.mediaType.lastIndexOf("/") - 1 >>> 0) + 2);;
        }

        Filesystem.writeFile({
          path: `${randomId}.${ext}`,
          data: file.dataURI,
          directory: FilesystemDirectory.Data
        }).then(fileResp=>{
          this.firebaseStorage.uploadImageInChat(file.dataURI,this.userName)
          .then(resp=>{
            let base64Length = file.dataURI.length - (file.dataURI.indexOf(',') + 1);
            let padding = (file.dataURI.charAt(file.dataURI.length - 2) === '=') ? 2 : ((file.dataURI.charAt(file.dataURI.length - 1) === '=') ? 1 : 0);
            let fileSize = base64Length * 0.75 - padding;

            const timestamp=firebase.default.firestore.FieldValue.serverTimestamp();
            let message:IMessage;
            if(type==="document"){
              message={
                message:"Archivo",
                size:fileSize,
                user:this.userName,
                type:type,
                timestamp:timestamp,
                ref:resp,
                download:false,
                localRef:fileResp.uri,
                fileName:file.name,
                mimeType:file.mediaType
              }
            }else{
              message={
                message:"Archivo",
                size:fileSize,
                user:this.userName,
                type:type,
                timestamp:timestamp,
                ref:resp,
                download:false,
                localRef:fileResp.uri
              }
            }
            this.firestore.collection("messages").doc(this.idChat).collection("messages")
            .add(message)
            .catch(error=>{
              console.log(error);
            });

          }).catch(err=>console.log(err));
        }).catch(err=>console.log(err))
      }
    }).catch((error: any) => console.error(error));
  }

  async openOpc() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      buttons: [
        {
          text: 'Imágen o video',
          icon: 'camera-sharp',
          handler: () => {
            this.selectFile("image/*,video/*","image")
          }
        },
        {
          text: 'Documento',
          icon: 'document-outline',
          handler: () => {
            this.selectFile("application/*,text/*","document")
          }
        },
        {
          text: 'Audio',
          icon: 'musical-notes-outline',
          handler: () => {
            this.selectFile("audio/*","audio")
          }
        }
      ]
    });
    await actionSheet.present();
  }
}
