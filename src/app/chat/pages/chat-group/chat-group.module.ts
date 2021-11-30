import { PerfilGroupModalComponent } from './../../../components/perfil-group-modal/perfil-group-modal.component';
import { PopoverGroupComponent } from './../../../components/popover-group/popover-group.component';
import { SharedModule } from './../../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {ScrollingModule as ExperimentalScrollingModule} from '@angular/cdk-experimental/scrolling';
import { IonicModule } from '@ionic/angular';


import { Ionic4EmojiPickerModule } from 'ionic4-emoji-picker';
import { HttpClientModule } from '@angular/common/http';

import { NoKeyboardModule } from 'ionic-no-keyboard';

import { ChatGroupPageRoutingModule } from './chat-group-routing.module';

import { ChatGroupPage } from './chat-group.page';
import { ItemMessageGroupComponent } from 'src/app/components/item-message-group/item-message-group.component';
import { ChatsModule } from 'src/app/shared/chats.module';
import { GroupInfoModalComponent } from 'src/app/components/group-info-modal/group-info-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatGroupPageRoutingModule,
    ReactiveFormsModule,
    Ionic4EmojiPickerModule,
    HttpClientModule,
    ScrollingModule,
    ExperimentalScrollingModule,
    SharedModule,
    NoKeyboardModule,
    ChatsModule
  ],
  declarations: [
    ChatGroupPage,
    PopoverGroupComponent,
    ItemMessageGroupComponent,
    PerfilGroupModalComponent,
    GroupInfoModalComponent
  ]
})
export class ChatGroupPageModule {}
