import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule} from '@angular/common/http';
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
    path: 'setting',
    loadChildren: () => import('./pages/setting/setting.module').then( m => m.SettingPageModule)
  },
  {
    path: 'search-message',
    loadChildren: () => import('./pages/search-message/search-message.module').then( m => m.SearchMessagePageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path:'**',
    pathMatch:'full',
    redirectTo:''
  },
  {
    path: 'setting',
    loadChildren: () => import('./pages/setting/setting.module').then( m => m.SettingPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule)
  }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
    })
  ],
  exports:[
    RouterModule,
    TranslateModule
  ]
})
export class ChatRoutingModule { }

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
