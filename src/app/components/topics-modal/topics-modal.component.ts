import { AngularFirestore } from '@angular/fire/firestore';
import { IUser, IUserData } from './../../interfaces/user.interface';
import { NavParams, ModalController } from '@ionic/angular';
import { ITopic } from './../../interfaces/topic.interface';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { DbService } from './../../services/db.service';
import { StoreNames } from 'src/app/enums/store-names.enum';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-topics-modal',
  templateUrl: './topics-modal.component.html',
  styleUrls: ['./topics-modal.component.scss'],
})
export class TopicsModalComponent implements OnInit {

  dbTopics: ILocalForage;
  dbUsers: ILocalForage;
  items: ITopic[]=[];
  allItems: ITopic[]=[];
  user:IUser;
  pos: number;
  search:string;
  miFormulario:FormGroup=this.fb.group({
    searchTxt:['', [Validators.required, Validators.minLength(1)]]
  });

  searchTxt:AbstractControl=this.miFormulario.get("searchTxt");

  constructor(
    private db:DbService,
    private fb:FormBuilder,
    private navParams: NavParams,
    private firestore: AngularFirestore,
    private modalController:ModalController
  ) { }

  ngOnInit() {
    this.dbTopics=this.db.loadStore(StoreNames.Topics);
    this.dbUsers=this.db.loadStore(StoreNames.Users);
    this.user=this.navParams.get("user");
    this.pos=this.navParams.get("pos");

    this.dbTopics.getItem("topics")
    .then(tags=>{
      if(tags){
        this.items=tags.sort((a, b)=>{
          if (a.data.title > b.data.title) {
            return 1;
          }
          if (a.data.title < b.data.title) {
            return -1;
          }
          return 0;
        });

        this.allItems=this.items;
      }
    },err=>console.log(err));

    let search='';

    this.searchTxt.statusChanges.subscribe(()=>{
      search=this.searchTxt.value.normalize('NFD').replace(/[\u0300-\u036f]/g,"");
      search=search.toLocaleLowerCase();
      this.search=search;

      let items=[];
      this.allItems.forEach((item:ITopic) => {
        let itemTxt=item.data.title.normalize('NFD').replace(/[\u0300-\u036f]/g,"");
        itemTxt=itemTxt.toLocaleLowerCase();
        if(itemTxt.indexOf(search)!==-1){
          items.push(item);
        }
      });
      this.items=items;
    })
  }

  changeFavoriteTopic(topic: ITopic){
    console.log(this.pos)
    if(this.user.data.favoriteTopics[this.pos]?.id!==topic.id || !this.user.data.favoriteTopics[this.pos]){
      this.user.data.favoriteTopics[this.pos]=topic;
      this.firestore.collection("users").doc(this.user.id).update({
        favoriteTopics: this.user.data.favoriteTopics
      }).then(()=>{
        this.dbUsers.getItem(this.user.id)
        .then((userData:IUserData)=>{
          this.dbUsers.setItem(this.user.id,{
            ...userData,
            favoriteTopics: this.user.data.favoriteTopics
          });
        });
      },()=>{window.alert("An error occurred while trying to update preferences")});
    }
    this.close();
  }

  trackItems(index: number, item: ITopic) {
    return item.id;
  }

  close(){
    this.modalController.dismiss();
  }
}
