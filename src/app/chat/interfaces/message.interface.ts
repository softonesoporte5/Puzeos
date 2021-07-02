export interface IMessage{
  type:string,
  message?:string,
  user:string,
  timestamp:any,
  ref?:string,
  download:boolean,
  state?:boolean,
  id?:string,
  localRef?:string,
  fileName?:string
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
