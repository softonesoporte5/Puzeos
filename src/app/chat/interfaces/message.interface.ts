export interface IMessage{
  type:string,
  message?:string,
  user:string,
  timestamp:any,
  ref?:string,
  download:boolean,
  state?:number,
  id?:string,
  localRef?:string,
  fileName?:string,
  dateChange?:boolean,
  sendToToken?:string,
  duration?:number
  size?:number;
  mimeType?:string;
  idChat?:string;
}

export interface IMessageSearch{
  type:string;
  message?:string,
  user:string,
  timestamp:any,
  id?:string,
  userSend:string,
  idChat:string,
  index:number
}
