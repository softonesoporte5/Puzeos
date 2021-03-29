export interface IChat{
  id:string,
  data:IChatData
}

export class IChatData{
  group:boolean;
  lastMessage:string;
  members:object;
}
