import { AppService } from './../app.service';
import { FirebaseStorageService } from 'src/app/services/firebase-storage.service';
import { IAudioBlob } from './../chat/interfaces/audioBlob.interface';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { IMediaRecorder, MediaRecorder } from 'extendable-media-recorder';
import { Plugins, FilesystemDirectory, FilesystemEncoding } from '@capacitor/core';

const { Filesystem } = Plugins;

@Injectable({
  providedIn: 'root'
})

export class MediaRecorderService {

  mediaRecorder:IMediaRecorder;
  audioData:any[]=[];
  audioBlob:Blob;
  audio$=new Subject<IAudioBlob>();
  audioUrl:string;
  duration:string;
  userName:string;
  idChat:string;
  cancel:boolean;

  constructor(
    private firebaseStorageService:FirebaseStorageService,
    private appService:AppService,
  ) {
    const loadMedia=async ()=> {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder=new MediaRecorder(stream);
    };
    loadMedia();
   }

  async recorder(){
    this.mediaRecorder.start();

    this.mediaRecorder.ondataavailable=e=>{
      this.audioData.push(e.data);
      this.audioBlob =new Blob([...this.audioData], { 'type' : 'audio/ogg; codecs=opus' });

      if(!this.cancel){
        this.appService.convertBlobToBase64(this.audioBlob)
        .then((resp:string)=>{
          const name='audio'+new Date().valueOf()+'.ogg';
          Filesystem.writeFile({
            path:'audios/'+name,
            data:resp,
            directory:FilesystemDirectory.Data,
            encoding: FilesystemEncoding.UTF8
          }).then(()=>{
            Filesystem.readFile({
              path:'audios/'+name,
              directory:FilesystemDirectory.Data,
            }).then(resp=>{
              const audioFile:IAudioBlob={
                data:resp.data,
                duration:this.duration
              };
              this.firebaseStorageService.uploadAudio(audioFile,this.userName,this.idChat,'audios/'+name);
            })
          })
        },err=>console.log(err));
      }
      this.audioData=[];
    }
  }

  stop(duration:string,userName:string,idChat:string,cancel:boolean){
    this.userName=userName;
    this.idChat=idChat;
    this.duration=duration;
    this.cancel=cancel;
    this.mediaRecorder.stop();
  }
}
