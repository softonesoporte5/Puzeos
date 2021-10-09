import { DateStringPipe } from './../../../pipes/date-string.pipe';
import { SharedModule } from './../../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {ScrollingModule as ExperimentalScrollingModule} from '@angular/cdk-experimental/scrolling';
import { IonicModule } from '@ionic/angular';

import { ChatPageRoutingModule } from './chat-routing.module';

import { ChatPage } from './chat.page';
import { HttpClientModule } from '@angular/common/http';

import { NoKeyboardModule } from 'ionic-no-keyboard';
import { ChatsModule } from 'src/app/shared/chats.module';


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
    ChatsModule
  ],
  declarations: [
    ChatPage,
    DateStringPipe
  ]
})
export class ChatPageModule {}
