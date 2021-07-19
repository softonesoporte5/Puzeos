export interface IChat{
  id:string,
  group:boolean;
  lastMessage:string;
  members:object;
  timestamp:any;
  userNames:string[];
  newMessages?:number;
  deleted?:boolean;
}
