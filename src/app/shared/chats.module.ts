import { SharedModule } from './shared.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FooterChatComponent } from './../components/footer-chat/footer-chat.component';
import { DocumentComponent } from './../components/document/document.component';
import { VideoMessageComponent } from './../components/video-message/video-message.component';
import { PerfilModalComponent } from './../components/perfil-modal/perfil-modal.component';
import { ScrollBottomComponent } from './../components/scroll-bottom/scroll-bottom.component';
import { ImageModalComponent } from './../components/image-modal/image-modal.component';
import { ImageMessageComponent } from './../components/image-message/image-message.component';
import { FileSelectorComponent } from './../components/file-selector/file-selector.component';
import { ItemMessageComponent } from './../components/item-message/item-message.component';
import { PopoverChatMessageComponent } from './../components/popover-chat-message/popover-chat-message.component';
import { AudioComponent } from './../components/audio/audio.component';
import { PopoverChatComponent } from 'src/app/components/popover-chat/popover-chat.component';
import { Ionic4EmojiPickerModule } from 'ionic4-emoji-picker';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [
    PopoverChatComponent,
    AudioComponent,
    PopoverChatMessageComponent,
    ItemMessageComponent,
    FileSelectorComponent,
    ImageMessageComponent,
    ImageModalComponent,
    ScrollBottomComponent,
    PerfilModalComponent,
    VideoMessageComponent,
    DocumentComponent,
    FooterChatComponent
  ],
  exports: [
    PopoverChatComponent,
    AudioComponent,
    PopoverChatMessageComponent,
    ItemMessageComponent,
    FileSelectorComponent,
    ImageMessageComponent,
    ImageModalComponent,
    ScrollBottomComponent,
    PerfilModalComponent,
    VideoMessageComponent,
    DocumentComponent,
    FooterChatComponent
  ],
  imports: [
    CommonModule,
    Ionic4EmojiPickerModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule
  ]
})
export class ChatsModule { }
