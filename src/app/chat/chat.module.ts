import { MenuComponent } from './components/menu/menu.component';
import { IonicModule } from '@ionic/angular';
import { ItemChatComponent } from './components/item-chat/item-chat.component';
import { ChatRoutingModule } from './chat-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations:[],
  imports: [
    CommonModule,
    ChatRoutingModule,
    IonicModule
  ]
})
export class ChatModule { }
