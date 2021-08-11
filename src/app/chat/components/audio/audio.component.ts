import { FileSystemService } from './../../../services/file-system.service';
import { AppService } from './../../../app.service';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { FirebaseStorageService } from './../../../services/firebase-storage.service';
import { IMessage } from './../../interfaces/message.interface';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {Howl} from 'howler';
import { IonRange } from '@ionic/angular';
import { HttpClient, HttpEventType } from '@angular/common/http';

import { Plugins, FilesystemDirectory, Capacitor } from '@capacitor/core';
const {Filesystem} = Plugins;

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss'],
})
export class AudioComponent implements OnInit {

  @Input() audio:IMessage;
  @Input() send:boolean;
  @Input() dbMessages:ILocalForage;
  progress=0;
  player:Howl;
  pause:boolean=true;
  @ViewChild('range') range:IonRange;
  interval:any;
  descargar:number=1;
  downloadProgress=0;
  downloadUrl:string;

  constructor(
    private http:HttpClient,
    private firebaseService:FirebaseStorageService,
    private appService:AppService,
    private fileSystemService:FileSystemService
  ) { }

  ngOnInit() {
    this.dbMessages.getItem(this.audio.id)
    .then((message:IMessage)=>{
      if(message){
        if(message.download===false){
          this.descargar=1;
        }else{
          this.descargar=3;
          this.controls(Capacitor.convertFileSrc(this.audio.localRef));
        }
      }else{
        this.descargar=1;
      }

    }).catch(error=>{
      console.log(error);
    });
  }

  downloadFile(){
    this.descargar=2;

    let storageSubscribe=this.firebaseService.getUrlFile(this.audio.ref).
    subscribe(resul=>{
      this.downloadUrl=resul;

      let httpSubscribe=this.http.get(this.downloadUrl,{
        responseType:'blob',
        reportProgress:true,
        observe:'events'
      }).subscribe(async event=>{
        if(event.type===HttpEventType.DownloadProgress){
          this.downloadProgress=Math.round((100*event.loaded)/event.total);

        }else if(event.type===HttpEventType.Response){
          this.downloadProgress=0;
          let base64;

          const name='audio'+this.audio.id+'.mp3';
          this.appService.convertBlobToBase64(event.body)
          .then((result:string | ArrayBuffer)=>{
            base64=result;
            this.fileSystemService.writeFile(base64,name, "Puzeos VoiceNotes/",true)
            .then(respUrl=>{
              if(respUrl){
                this.controls(Capacitor.convertFileSrc(respUrl));
                this.descargar=3;
                this.dbMessages.setItem(this.audio.id,{
                  ...this.audio,
                  download:true,
                  localRef:respUrl
                }).catch(err=>console.log(err));

                storageSubscribe.unsubscribe();
                httpSubscribe.unsubscribe();
              }
            })
          }).catch(err=>console.log(err));
        }
      });
    });
  }

  controls(src:string):Howl{
    this.player=new Howl({
      src: [src],
      format:'mp3',
      onplay:()=>{
        this.updateProgress();
      },
      onpause:()=>{
        clearInterval(this.interval);
      },
      onend:()=>{
        this.pause=true;
        clearInterval(this.interval);
      }
    });
  }

  setPause(){
    this.pause=false;
    this.tooglePlayer();
  }

  tooglePlayer(){
    if(this.pause){
      this.player.play();
    }else{
      this.player.pause();
    }
    this.pause=!this.pause;
  }

  seek(){
    let newValue=+this.range.value;
    let duration=this.player.duration();
    this.player.seek(duration*(newValue/100));
    this.pause=true;
    this.tooglePlayer();
  }

  updateProgress(){
    let seek=this.player.seek();
    this.progress=(seek/this.player.duration())*100 || 0;
    this.interval=setTimeout(()=>{
      this.updateProgress();
    },100);
  }
}
