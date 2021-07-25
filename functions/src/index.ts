import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
// const firestore=admin.firestore();

exports.newMessage=functions.firestore
    .document("/messages/{idChat}/messages/{idMessage}")
    .onCreate(async (change, context) => {
      console.log(change.data(), context);
      const data=change.data() as IMessage;
      const registrationTokens=[data.sendToToken];

      const dataFCM={
        enlace: "/chat/",
      };

      const notification: INotification={
        data: dataFCM,
        tokens: registrationTokens,
        notification: {
          title: data.user,
          body: data.message,
        },
      };

      return sendNotification(notification);
    });

const sendNotification= (notification: INotification)=>{
  return new Promise((resolve)=>{
    const message: admin.messaging.MulticastMessage={
      data: notification.data,
      tokens: notification.tokens,
      notification: notification.notification,
      android: {
        notification: {
          icon: "ic_stat_name",
          color: "#ffffff",
        },
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

    admin.messaging().sendMulticast(message)
        .then((response)=>{
          if (response.failureCount>0) {
            const failedTokens: unknown[]=[];
            response.responses.forEach((resp, idx)=>{
              if (!resp.success) {
                failedTokens.push(notification.tokens[idx]);
              }
            });
            // Eliminar tokens
          } else {
            console.log("Send Notification success");
          }
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
  timestamp:any,
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
  tokens: string[];
  notification: admin.messaging.Notification
}
