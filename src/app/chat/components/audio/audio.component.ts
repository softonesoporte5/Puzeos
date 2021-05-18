import { FirebaseStorageService } from './../../../services/firebase-storage.service';
import { DbService } from './../../../services/db.service';
import { IMessage } from './../../interfaces/message.interface';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {Howl} from 'howler';
import { IonRange } from '@ionic/angular';
import {Plugins, FilesystemDirectory, FilesystemEncoding} from '@capacitor/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
const {Filesystem, Storage} = Plugins;

const FILE_KEY='files';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss'],
})
export class AudioComponent implements OnInit {

  @Input() audio:IMessage;
  @Input() dbMessages:any;
  progress=0;
  player:Howl;
  pause:boolean=true;
  @ViewChild('range') range:IonRange;
  interval:any;
  descargar:boolean=true;
  downloadProgress=0;
  downloadUrl:string;
  messageDB:IMessage;

  constructor(
    private db:DbService,
    private http:HttpClient,
    private firebaseService:FirebaseStorageService,
  ) { }

  ngOnInit() {
    this.dbMessages.get(this.audio._id)
    .then((message:IMessage)=>{
      this.messageDB=message;
      if(message.download===false){
        this.descargar=true;
      }else{
        this.descargar=false;

        Filesystem.readFile({
          path:this.audio.ref,
          encoding: FilesystemEncoding.UTF8,
          directory:FilesystemDirectory.Documents,
        }).then(resp=>{
          console.log(resp);
        }).catch(err=>console.log(err));

        this.controls(this.audio.ref);
      }
    }).catch(error=>{
      this.descargar=true;
    });
  }

  private convertBlobToBase64=(blob:Blob)=>new Promise((resolve,reject)=>{
    const reader=new FileReader;
    reader.onerror=reject;
    reader.onload=()=>resolve(reader.result);
    reader.readAsDataURL(blob);
  });


  downloadFile(){
    this.firebaseService.getAudio(this.audio.ref).
    subscribe(resul=>{
      this.downloadUrl=resul;
      this.http.get(this.downloadUrl,{
        responseType:'blob',
        reportProgress:true,
        observe:'events'
      }).subscribe(async event=>{
        if(event.type===HttpEventType.DownloadProgress){
          this.downloadProgress=Math.round((100*event.loaded)/event.total);
        }else if(event.type===HttpEventType.Response){
          this.downloadProgress=0;

          const name='audio'+this.audio._id+'.ogg';
          const base64=await this.convertBlobToBase64(event.body) as string;

          const savedFile=await Filesystem.writeFile({
            path:'audio/'+name,
            data:base64,
            directory:FilesystemDirectory.Documents,
            encoding: FilesystemEncoding.UTF8,
          });

          const path=savedFile.uri;
          console.log(path);
          this.dbMessages.put({
            _rev:this.messageDB._rev,
            _id:this.audio._id,
            download:true,
            ref:path
          }).catch(err=>console.log(err))
        }
      });
    });
  }

  controls(src:string):Howl{
    this.player=new Howl({
      src: [src],
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
