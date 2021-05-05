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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatPageRoutingModule,
    ReactiveFormsModule,
    Ionic4EmojiPickerModule
  ],
  declarations: [
    ChatPage,
    SafePipe,
    AudioComponent,
    PopoverChatComponent
  ]
})
export class ChatPageModule {}
