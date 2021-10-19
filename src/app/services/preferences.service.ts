import { ITopic } from './../interfaces/topic.interface';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  changeTopics$=new Subject<ITopic>();

  constructor() { }

  preferencesTopicSubscribe(){
    return this.changeTopics$.asObservable();
  }


}
