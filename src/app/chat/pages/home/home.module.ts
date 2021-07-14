import { ImageCropperModalComponent } from './../../components/image-cropper-modal/image-cropper.component';
import { HttpClientModule } from '@angular/common/http';
import { ItemChatComponent } from './../../components/item-chat/item-chat.component';
import { MenuComponent } from './../../components/menu/menu.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    HttpClientModule,
    ImageCropperModule
  ],
  declarations: [HomePage, MenuComponent, ItemChatComponent, ImageCropperModalComponent]
})
export class HomePageModule {}
