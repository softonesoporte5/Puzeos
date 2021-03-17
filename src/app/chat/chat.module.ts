import { ItemChatComponent } from './components/item-chat/item-chat.component';
import { HomeComponent } from './pages/home/home.component';
import { ChatRoutingModule } from './chat-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations:[
    HomeComponent,
    ItemChatComponent
  ],
  imports: [
    CommonModule,
    ChatRoutingModule
  ]
})
export class ChatModule { }
