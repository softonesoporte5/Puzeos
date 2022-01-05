import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {Firestore} from "@google-cloud/firestore";

admin.initializeApp();
const firestore = new Firestore();
// firebase deploy --only functions


exports.newMessage=functions.firestore
    .document("/messages/{idChat}/messages/{idMessage}")
    .onCreate(async (change, context) => {
      const data=change.data() as IMessage;
      let registrationTokens:string[]=[];

      if (typeof data.sendToToken === "object") {
        registrationTokens=data.sendToToken as [];
        registrationTokens=registrationTokens.filter((token:string)=>{
          return token?true:false;
        });
      } else {
        registrationTokens=[data.sendToToken];
      }

      const messagee ={
        app_id: "e8539368-3a10-4b86-b79d-96b1d68118cd",
        contents: {"en": data.message, "es": data.message},
        headings: {"en": data.user, "es": data.user},
        android_group: context.params.idChat,
        android_group_message: {
          "en": "You have $[notif_count] new messages",
          "es": "Tienes $[notif_count] nuevos mensajes"
        },
        include_player_ids: registrationTokens,
      };

      return sendNotification(messagee);
    });

exports.AddChat=functions.firestore
    .document("/chats/{idChat}")
    .onCreate(async (change) => {
      const data=change.data() as IChat;
      const registrationTokens=data.tokens;

      const messagee ={
        app_id: "e8539368-3a10-4b86-b79d-96b1d68118cd",
        contents: {
          "en": `A chat has been added about ${data.tema}`,
          "es": `Se ha agregado un chat sobre ${data.tema}`},
        headings: {
          "en": "You have added a partner!!",
          "es": "Has agregado un compañero!!"},
        include_player_ids: registrationTokens,
        android_group: "puzeos.group",
      };

      return sendNotification(messagee);
    });

exports.onUserStatusChanged = functions.database
    .ref("/status/{userId}") // Reference to the Firebase RealTime database key
    .onUpdate((event, context)=> {
      const usersRef = firestore.collection("/users");
      return event.after.ref.once("value")
          .then((statusSnapshot :any)=> statusSnapshot.val())
          .then((status :any) => {
          // check if the value is 'offline'
            if (status === "offline") {
            // Set the Firestore's document's online value to false
              usersRef
                  .doc(context.params.userId)
                  .update({
                    online: false,
                    last_changed: admin.firestore.FieldValue.serverTimestamp(),
                  });
            }
          });
    });
const sendNotification= (notification: any)=>{
  return new Promise((resolve)=>{
    sendNotificationOneSignal(notification);
    resolve("");
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
