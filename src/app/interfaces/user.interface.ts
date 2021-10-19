import { ITopic } from './topic.interface';
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
  blockedUsers:{};
  token:string;
  createDate:any;
  descripcion?:string;
  notAddUsers?:{};
  online?:boolean;
  last_changed?:any;
  avatarId:number;
  location:{
    country: string,
    countryCode: string
  };
  age: number;
  favoriteTopics: ITopic[];
}
