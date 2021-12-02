export interface IGroup{
  id:string;
  title: string;
  lastMessage:string;
  timestamp:any;
  group: boolean;
  usersData:IUserDataGroup[];
  newMessages?:number;
  tokens:string[];
}

export interface IUserDataGroup{
  id:string,
  userName:string,
  compressImage?:string,
  avatarId: number
}
