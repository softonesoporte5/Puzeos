export interface IUser{
  id:string,
  data:IUserData
}

export class IUserData{
  uid:string;
  chats:object;
}
