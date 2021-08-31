import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
// firebase deploy --only functions

exports.newMessage=functions.firestore
    .document("/messages/{idChat}/messages/{idMessage}")
    .onCreate(async (change, context) => {
      const data=change.data() as IMessage;
      const registrationTokens=[data.sendToToken];

      const messagee ={
        app_id: "e8539368-3a10-4b86-b79d-96b1d68118cd",
        contents: {"en": data.message, "es": data.message},
        headings: {"en": data.user, "es": data.user},
        android_group: context.params.idChat,
        include_player_ids: registrationTokens,
      };

      return sendNotification(messagee);
    });

exports.AddChat=functions.firestore
    .document("/chats/{idChat}")
    .onCreate(async (change) => {
      const data=change.data() as IChat;
      const registrationTokens=data.tokens;

      const body="Se ha agregado un compañero que";

      const messagee ={
        app_id: "e8539368-3a10-4b86-b79d-96b1d68118cd",
        contents: {
          "en": body +` quiere hablar contigo sobre ${data.tema}`,
          "es": body +` quiere hablar contigo sobre ${data.tema}`},
        headings: {
          "en": "Has agregado un compañero!!",
          "es": "Has agregado un compañero!!"},
        include_player_ids: registrationTokens,
        android_group: "puzeos.group",
      };

      return sendNotification(messagee);
    });

const sendNotification= (notification: any)=>{
  return new Promise((resolve)=>{
    sendNotificationOneSignal(notification);
    resolve("");
    /*
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
        });*/
  });
};

const sendNotificationOneSignal = function(data:any) {
  console.log("Entrí");
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
  };

  const options = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: headers,
  };

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const https =require("https");
  const req = https.request(options, function(res:any) {
    res.on("data", function(data:any) {
      console.log("Response:");
      console.log(JSON.parse(data));
    });
  });

  req.on("error", function(e:any) {
    console.log("ERROR:");
    console.log(e);
  });

  req.write(JSON.stringify(data));
  req.end();
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

interface IChat{
  id:string,
  group:boolean;
  lastMessage:string;
  userNames:string[];
  newMessages?:number;
  deleted?:boolean;
  tokens:[];
  tema:string;
}
