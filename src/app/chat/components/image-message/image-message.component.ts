import { FilePath } from '@ionic-native/file-path/ngx';
import { IMessage } from './../../interfaces/message.interface';
import { Component, Input, OnInit } from '@angular/core';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { Plugins, FilesystemDirectory, FilesystemEncoding, Capacitor } from '@capacitor/core';
const { Filesystem } = Plugins;

@Component({
  selector: 'app-image-message',
  templateUrl: './image-message.component.html',
  styleUrls: ['./image-message.component.scss'],
})
export class ImageMessageComponent implements OnInit {

  @Input() image:IMessage;
  @Input() userName:string;
  imageUrl:string;

  constructor(
    private file:File,
    private filePath: FilePath
  ) { }

  ngOnInit(){
    console.log(Capacitor.platform)
    if(this.image.user===this.userName){
      //Obtener la URL del archivo
      this.filePath.resolveNativePath(this.image.localRef)
      .then(filePath=>{
        this.imageUrl=Capacitor.convertFileSrc(filePath);
        /*Filesystem.readFile({path:filePath})
        .then(resp=>{
          console.log(resp)
        }).catch(err=>console.log(err));*/

        /*console.log(this.imageUrl)
        //Extraemos la ruta de la carpeta y el nombre del archivo
        const path = filePath.substring(0, filePath.lastIndexOf('/'));
        const file = filePath.substring(filePath.lastIndexOf('/')+1, filePath.length);
        //Obtenemos el archivo
        this.file.resolveDirectoryUrl(path)
        .then(directory=>{
          console.log(directory)
          console.log(filePath)

          this.file.resolveLocalFilesystemUrl(filePath)
          .then(entry => {
            (<FileEntry>entry).file(file => {
              this.file.readAsDataURL("cdvfile://localhost/sdcard/Download/","at.jpg")
              .then(resp=>{
                let a=resp;
                console.log(a);
                console.log("f")
              })
              .catch(err=>console.log(err))

            });
          }).catch(err=>console.log(err));

        })
        .catch(err=>console.log(err));
        // this.file.getFile()*/
      }).catch(err=>console.log(err));
    }
  }

}
