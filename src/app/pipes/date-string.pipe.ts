import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform,  } from '@angular/core';

@Pipe({
  name: 'dateString'
})
export class DateStringPipe extends DatePipe implements PipeTransform  {

  transform(value: any): any {
    let formatedByDatePipe = super.transform(value, 'shortTime');

    const date=new Date();
    const date2=new Date(value);
    if(date2.toLocaleDateString()===date.toLocaleDateString()){
      return formatedByDatePipe;
    }else{
      return date2.toLocaleDateString();
    }
  }

}
