import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    name: 'stripHtml',
    standalone: false
})
export class StripHtmlPipe implements PipeTransform {

  transform(value: string): string {
    console.log(value, 'string vallll-')
    if (!value) return ''
    return value.replace(/<[^>]*>/g, '')
  }

}
