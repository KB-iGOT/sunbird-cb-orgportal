import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    name: 'pipeEmail',
    standalone: false
})
export class PipeEmailPipe implements PipeTransform {

  transform(value: string): any {
    // return value.split(".").join("[dot]").replace("@", "[at]")
    return value.replace(/\./g, '[dot]').replace('@', '[at]')

  }

}
