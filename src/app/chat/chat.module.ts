import { MenuComponent } from './components/menu/menu.component';
import { IonicModule } from '@ionic/angular';
import { ItemChatComponent } from './components/item-chat/item-chat.component';
import { HomeComponent } from './pages/home/home.component';
import { ChatRoutingModule } from './chat-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations:[
    HomeComponent,
    ItemChatComponent,
    MenuComponent
  ],
  imports: [
    CommonModule,
    ChatRoutingModule,
    IonicModule
  ]
})
export class ChatModule { }
