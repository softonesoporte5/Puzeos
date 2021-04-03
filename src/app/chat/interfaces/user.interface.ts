export interface IUser{
  id:string,
  data:IUserData
}

export class IUserData{
  userName:string;
  chats:[];
  buscando:{
    state:boolean;
    tagId?:string;
  };
}
