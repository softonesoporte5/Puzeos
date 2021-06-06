import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

const routes:Routes=[
  {
    path:'',
    loadChildren:()=>import("./pages/home/home.module").then(m=>m.HomePageModule)
  },
  {
    path:'id/:id',
    loadChildren:()=>import("./pages/chat/chat.module").then(m=>m.ChatPageModule)
  },
  {
    path: 'agregar',
    loadChildren: () => import('./pages/agregar/agregar.module').then( m => m.AgregarPageModule)
  },
  {
    path: 'saved-messages',
    loadChildren: () => import('./pages/saved-messages/saved-messages.module').then( m => m.SavedMessagesPageModule)
  },
  {
    path: 'blocked-users',
    loadChildren: () => import('./pages/blocked-users/blocked-users.module').then( m => m.BlockedUsersPageModule)
  },
  {
    path:'**',
    pathMatch:'full',
    redirectTo:''
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
