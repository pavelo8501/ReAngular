import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numToStr',
  standalone: true
})
export class NumToStrPipe implements PipeTransform {

  transform(value: number, apendWith:string):string {
    return value.toString() + apendWith
  }

}
