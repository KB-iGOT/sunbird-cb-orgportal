// need to refactor
import { HostListener, Directive } from '@angular/core'

@Directive()
// tslint:disable
export abstract class ComponentCanDeactivate {
    abstract canDeactivate(): boolean
    @HostListener('window:beforeunload', ['$event'])
    unloadNotification($event: any) {
        if (!this.canDeactivate()) {
            $event.returnValue = true
        }
    }
    // tslint:enable
}
