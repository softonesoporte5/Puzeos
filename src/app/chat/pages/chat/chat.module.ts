import { DateStringPipe } from './../../../pipes/date-string.pipe';
import { FooterChatComponent } from './../../../components/footer-chat/footer-chat.component';
import { SharedModule } from './../../../shared/shared.module';
import { DocumentComponent } from './../../../components/document/document.component';
import { VideoMessageComponent } from './../../../components/video-message/video-message.component';
import { PerfilModalComponent } from './../../../components/perfil-modal/perfil-modal.component';
import { ScrollBottomComponent } from './../../../components/scroll-bottom/scroll-bottom.component';
import { ImageModalComponent } from './../../../components/image-modal/image-modal.component';
import { ImageMessageComponent } from './../../../components/image-message/image-message.component';
import { FileSelectorComponent } from './../../../components/file-selector/file-selector.component';
import { ItemMessageComponent } from './../../../components/item-message/item-message.component';
import { PopoverChatMessageComponent } from './../../../components/popover-chat-message/popover-chat-message.component';
import { AudioComponent } from './../../../components/audio/audio.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {ScrollingModule as ExperimentalScrollingModule} from '@angular/cdk-experimental/scrolling';
import { IonicModule } from '@ionic/angular';

import { ChatPageRoutingModule } from './chat-routing.module';

import { ChatPage } from './chat.page';
import { Ionic4EmojiPickerModule } from 'ionic4-emoji-picker';
import { HttpClientModule } from '@angular/common/http';

import { NoKeyboardModule } from 'ionic-no-keyboard';
import { ChatModule } from '../../chat.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatPageRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    ScrollingModule,
    ExperimentalScrollingModule,
    SharedModule,
    NoKeyboardModule,
    ChatModule
  ],
  declarations: [
    ChatPage,
    DateStringPipe
  ]
})
export class ChatPageModule {}
