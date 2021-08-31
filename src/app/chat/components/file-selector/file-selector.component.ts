import { TranslateService } from '@ngx-translate/core';
import { FileSystemService } from '../../../services/file-system.service';
import { ActionSheetController } from '@ionic/angular';
import { FirebaseStorageService } from './../../../services/firebase-storage.service';
import { Component, OnInit, Input } from '@angular/core';
import { Chooser } from '@ionic-native/chooser/ngx';

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
    private actionSheetController: ActionSheetController,
    private fileSystemService: FileSystemService,
    private translate: TranslateService
  ) { }

  ngOnInit() {}

  selectFile(mime:string,type:string){

    this.chooser.getFile(mime)
    .then(file =>{
      if(file.name){
        const date=new Date().valueOf();
        const randomId="a"+Math.round(Math.random()*1000)+date;
        let ext='';
        let directory='';
        let messageTxt='';
        if(file.mediaType.includes("video")){
          type="video";
          ext='mp4';
          directory="Videos/";
          messageTxt="Video";
        }else if(file.mediaType.includes("image")){
          type="image";
          ext='jpeg';
          directory="Images/";
          messageTxt="Imágen";
        }else if(file.mediaType.includes("application") || file.mediaType.includes("text")){
          type="document";
          ext=file.mediaType.slice((file.mediaType.lastIndexOf("/") - 1 >>> 0) + 2);
          directory="DocumentsAndMusic/";
          messageTxt=file.name;
        }else if(file.mediaType.includes("audio")){
          type="audio";
          ext='mp3';
          directory="DocumentsAndMusic/";
          messageTxt=file.name;
        }

        this.fileSystemService.writeFile(file.dataURI,`${randomId}.${ext}`,directory)
        .then(respUrl=>{
          if(respUrl){
            let extraData={};

            if(type==="document" || type==="audio"){
              extraData={
                fileName:file.name,
                mimeType:file.mediaType
              }
            }
            this.firebaseStorage.uploadFile(file.dataURI,this.userName,type,respUrl,this.idChat,extraData,ext, messageTxt)
            .catch(err=>console.log(err));
          }
        })
      }
    }).catch((error: any) => console.error(error));
  }

  async openOpc() {
    let txt1='';
    this.translate.get("ChatPage.ImageOrVideo").subscribe(resp=>{txt1=resp});
    let txt2='';
    this.translate.get("ChatPage.Document").subscribe(resp=>{txt2=resp});
    let txt3='';
    this.translate.get("ChatPage.Audio").subscribe(resp=>{txt3=resp});

    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      buttons: [
        {
          text: txt1,
          icon: 'camera-sharp',
          handler: () => {
            this.selectFile("image/*,video/*","image")
          }
        },
        {
          text: txt2,
          icon: 'document-outline',
          handler: () => {
            this.selectFile("application/*,text/*","document")
          }
        },
        {
          text: txt3,
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
