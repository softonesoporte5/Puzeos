import { HomeComponent } from './pages/home/home.component';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ChatComponent } from './pages/chat/chat.component';

const routes:Routes=[
  {
    path:'',
    children:[
      {path:'',component:HomeComponent},
      {path:'chat/:id',component:ChatComponent}
    ]
  }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports:[
    RouterModule
  ]
})
export class ChatRoutingModule { }
