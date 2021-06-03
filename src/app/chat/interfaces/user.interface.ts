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
  imageUrl?:string;
  imageUrlLoc?:string;
  savedMessages?:object[];
}
