export const environment = {
  production: true,
  firebaseConfig:{
    apiKey: "AIzaSyDxrHKjJFhwOYhS1e2Dk0l2YG2lD0I4z_Q",
    authDomain: "usuarios-6b56a.firebaseapp.com",
    projectId: "usuarios-6b56a",
    storageBucket: "usuarios-6b56a.appspot.com",
    messagingSenderId: "400280439340",
    appId: "1:400280439340:web:86c2b44eb810c4c8515f89"
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
