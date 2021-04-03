export interface IUser{
  id:string,
  data:IUserData
}

export class IUserData{
  uid:string;
  chats:object;
  buscando:{
    state:boolean;
    tagId?:string;
  };
}
