export interface IGroup{
  id:string;
  title: string;
  lastMessage:string;
  timestamp:any;
  group: boolean;
  usersData:{
    id:string,
    userName:string,
    compressImage?:string,
    avatarId: number
  }[];
  newMessages?:number;
  tokens:string[];
}
