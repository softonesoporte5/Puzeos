import { ImageModalComponent } from './../../components/image-modal/image-modal.component';
import { ImageMessageComponent } from './../../components/image-message/image-message.component';
import { FileSelectorComponent } from './../../components/file-selector/file-selector.component';
import { ItemMessageComponent } from './../../components/item-message/item-message.component';
import { PopoverChatMessageComponent } from './../../components/popover-chat-message/popover-chat-message.component';
import { AudioComponent } from './../../components/audio/audio.component';
import { SafePipe } from './../../../pipes/safe.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatPageRoutingModule } from './chat-routing.module';

import { ChatPage } from './chat.page';
import { Ionic4EmojiPickerModule } from 'ionic4-emoji-picker';
import { PopoverChatComponent } from 'src/app/components/popover-chat/popover-chat.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatPageRoutingModule,
    ReactiveFormsModule,
    Ionic4EmojiPickerModule,
    HttpClientModule
  ],
  declarations: [
    ChatPage,
    SafePipe,
    AudioComponent,
    PopoverChatComponent,
    PopoverChatMessageComponent,
    ItemMessageComponent,
    FileSelectorComponent,
    ImageMessageComponent,
    ImageModalComponent
  ]
})
export class ChatPageModule {}
