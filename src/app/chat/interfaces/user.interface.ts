export interface IUser{
  id:string,
  data:IUserData
}

export class IUserData{
  userName:string;
  chats:string[];
  buscando:{
    state:boolean;
    tagId?:string;
  };
  _rev?:string;
  _id?:string;
}
