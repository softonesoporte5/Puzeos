export interface IChat{
  id:string,
  group:boolean;
  lastMessage:string;
  members:object;
  userNames:string[];
}
