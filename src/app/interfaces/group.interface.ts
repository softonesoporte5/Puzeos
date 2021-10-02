export interface IGroup{
  id:string;
  title: string;
  lastMessage:string;
  timestamp:any;
  group: boolean;
  usersData:{
    id:string,
    userName:string
  }[];
  newMessages?:number;
  tokens:string[];
}
