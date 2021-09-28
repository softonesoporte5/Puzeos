import { SharedModule } from './../../../shared/shared.module';
import { ImageCropperModalComponent } from './../../../components/image-cropper-modal/image-cropper.component';
import { ItemChatComponent } from './../../../components/item-chat/item-chat.component';
import { MenuComponent } from './../../../components/menu/menu.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { HttpClientModule} from '@angular/common/http';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    HttpClientModule,
    ImageCropperModule,
    SharedModule
  ],
  declarations: [HomePage, MenuComponent, ItemChatComponent, ImageCropperModalComponent]
})
export class HomePageModule {}

