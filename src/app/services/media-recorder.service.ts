import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { IMediaRecorder, MediaRecorder } from 'extendable-media-recorder';

@Injectable({
  providedIn: 'root'
})
export class MediaRecorderService {

  mediaRecorder:IMediaRecorder;
  audioData:any[]=[];
  audioBlob:Blob;
  audio$=new Subject<Blob>();
  audioUrl:string;

  constructor() {
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
      this.audio$.next(this.audioBlob);
      this.audioData=[];
    }
  }

  stop(){
    this.mediaRecorder.stop();
  }
}
