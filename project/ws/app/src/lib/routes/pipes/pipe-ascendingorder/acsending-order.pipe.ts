import { Pipe, PipeTransform } from '@angular/core'
import { orderBy } from 'lodash'

// Same ordering as the default Array.prototype.sort(): compares the string form of each element
const defaultSortOrder = (a: any, b: any) => Number(`${a}` > `${b}`) - Number(`${a}` < `${b}`)

@Pipe({
    name: 'acsendingOrder',
    standalone: false
})
export class AcsendingOrderPipe implements PipeTransform {

  transform(value: any[], order: any = '', column: string = ''): any[] {
    if (!value || order === '' || !order) { return value } // no array
    if (!column || column === '') {
      // const sorted = this.sortOnCaseSensitivity(value, caseInsensitive)
      if (order === 'asc') { return value.sort(defaultSortOrder) }
      return value.sort(defaultSortOrder).reverse()
    } // sort 1d array
    if (value.length <= 1) { return value } // array with only one item
    return orderBy(value, [column], [order])
  }

}
