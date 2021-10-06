import { Ionic4EmojiPickerModule } from 'ionic4-emoji-picker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { PopoverChatComponent } from './../components/popover-chat/popover-chat.component';
import { IonicModule } from '@ionic/angular';
import { ChatRoutingModule } from './chat-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule} from '@angular/common/http';

@NgModule({
  declarations:[
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
    FooterChatComponent,
  ],
  exports:[
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
    ChatRoutingModule,
    IonicModule,
    Ionic4EmojiPickerModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
    })
  ]
})
export class ChatModule { }

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
