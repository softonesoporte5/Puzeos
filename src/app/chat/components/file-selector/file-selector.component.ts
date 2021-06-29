import { CameraService } from './../../../services/camera.service';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { ActionSheetController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-file-selector',
  templateUrl: './file-selector.component.html',
  styleUrls: ['./file-selector.component.scss'],
})
export class FileSelectorComponent implements OnInit {

  constructor(
    private actionSheetController: ActionSheetController,
    private fileChooser: FileChooser,
    private camera:CameraService
  ) { }

  ngOnInit() {}

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      buttons: [
        {
          text: 'Documento',
          icon: 'document',
          handler: () => {
            this.fileChooser.open()
            .then(file => console.log(file ? file : 'canceled'))
            .catch((error: any) => console.error(error));
          }
        },
        {
          text: 'Galería',
          icon: 'image-sharp',
          // handler: () => {
          //   //this.camera.openGallery();
          // }
        },
        {
          text: 'Audio',
          icon: 'musical-notes',
          handler: () => {
          }
        }
      ]
    });
    await actionSheet.present();
  }

  openOpc(){
    this.presentActionSheet();
  }

}
