import { AngularFirestoreModule } from '@angular/fire/firestore';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthModule } from './auth/auth.module';
import { SnackbarModule } from 'ngx-snackbar';
import { environment } from 'src/environments/environment.prod';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { NgxIndexedDBModule } from 'ngx-indexed-db';
import { SQLite} from '@ionic-native/sqlite/ngx';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AuthModule,
    AppRoutingModule,
    SnackbarModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    NgxIndexedDBModule.forRoot(environment.dbConfig),
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    SQLite
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
