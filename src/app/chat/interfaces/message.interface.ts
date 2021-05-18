export interface IMessage{
  type:string,
  message?:string,
  user:string,
  timestamp:any,
  ref?:string,
  _id?:string,
  _rev?:string,
  download:boolean
}
