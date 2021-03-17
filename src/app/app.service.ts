import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private loading$=new Subject<boolean>();
  loading:boolean=false;

  constructor() { }

  getLoading():Observable<boolean>{
    return this.loading$.asObservable()
  }

  setLoading(state:boolean){
    this.loading=state;
    this.loading$.next(this.loading);
  }
}
