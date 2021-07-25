// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebaseConfig:{
    apiKey: "AIzaSyDxrHKjJFhwOYhS1e2Dk0l2YG2lD0I4z_Q",
    authDomain: "usuarios-6b56a.firebaseapp.com",
    projectId: "usuarios-6b56a",
    storageBucket: "usuarios-6b56a.appspot.com",
    messagingSenderId: "400280439340",
    appId: "1:400280439340:web:86c2b44eb810c4c8515f89",
    persistance: false
  },
  dbConfig:{
    name: 'puzeosDb',
    version: 1,
    objectStoresMeta: [{
      store: 'messages',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [

      ]
    }]
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
