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

exports.onUserStatusChanged = functions.database.ref("/status/{uid}").onUpdate(
    async (change, context) => {
      // Get the data written to Realtime Database
      const eventStatus = change.after.val();

      // Then use other event data to create a reference to the
      // corresponding Firestore document.
      const userStatusFirestoreRef = firestore
          .doc(`status/${context.params.uid}`);

      // It is likely that the Realtime Database change that triggered
      // this event has already been overwritten by a fast change in
      // online / offline status, so we'll re-read the current data
      // and compare the timestamps.
      const statusSnapshot = await change.after.ref.once("value");
      const status = statusSnapshot.val();
      functions.logger.log(status, eventStatus);
      // If the current timestamp for this data is newer than
      // the data that triggered this event, we exit this function.
      if (status.last_changed > eventStatus.last_changed) {
        return null;
      }

      // Otherwise, we convert the last_changed field to a Date
      eventStatus.last_changed = new Date(eventStatus.last_changed);

      // ... and write it to Firestore.
      return userStatusFirestoreRef.set(eventStatus);
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
