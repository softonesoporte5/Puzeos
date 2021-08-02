import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
// const firestore=admin.firestore();
// firebase deploy --only functions

exports.newMessage=functions.firestore
    .document("/messages/{idChat}/messages/{idMessage}")
    .onCreate(async (change, context) => {
      console.log(change.data(), context);
      const data=change.data() as IMessage;

      const dataFCM={
        enlace: "/chat/",
      };

      const notification: INotification={
        data: dataFCM,
        token: data.sendToToken,
        notification: {
          title: data.user,
          body: data.message,
        },
      };

      return sendNotification(notification);
    });
/*
exports.AddChat=functions.firestore
    .document("/chats/{idChat}")
    .onCreate(async (change, context) => {
      console.log(change.data(), context);
      const data=change.data() as IChat;
      const registrationTokens=data.tokens;

      const dataFCM={
        enlace: "/chat/",
      };

      const body="Se ha agregado un compañero que";

      const notification: INotification={
        data: dataFCM,
        tokens: registrationTokens,
        notification: {
          title: "Has agregado un compañero!!",
          body: body +` quiere hablar contigo sobre ${data.tema}`,
        },
      };

      return sendNotification(notification);
    });*/

const sendNotification= (notification: INotification)=>{
  return new Promise((resolve)=>{
    const message: admin.messaging.Message={
      data: notification.data,
      token: notification.token,
      notification: notification.notification,
      android: {
        notification: {
          icon: "ic_stat_name",
          color: "#ffffff",
        },
        collapseKey: "f",
      },
      apns: {
        payload: {
          aps: {
            sound: {
              critical: true,
              name: "default",
              volume: 1,
            },
          },
        },
      },
    };

    admin.messaging().send(message)
        .then((response)=>{
          console.log("Send Notification success"+response);
          resolve(true);
          return;
        }, (err)=> {
          console.log("Error al enviar FCM", err);
          resolve(false);
          return;
        });
  });
};

interface IMessage{
  type:string,
  message?:string,
  user:string,
  ref?:string,
  download:boolean,
  state?:boolean,
  id?:string,
  localRef?:string,
  fileName?:string,
  dateChange?:boolean,
  sendToToken:string
}

interface INotification {
  data:any;
  token: string;
  notification: admin.messaging.Notification
}
/*
interface IChat{
  id:string,
  group:boolean;
  lastMessage:string;
  userNames:string[];
  newMessages?:number;
  deleted?:boolean;
  tokens:[];
  tema:string;
}*/
