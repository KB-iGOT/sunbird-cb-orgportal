import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class GlobalEventsService {

  private loaderSubject = new Subject<boolean>();
  loaderState$ = this.loaderSubject.asObservable();

  constructor(
  ) {
    this.registerIcons()
  }

  private registerIcons(): void {

  }

  setLoaderState(isLoading: boolean) {
    this.loaderSubject.next(isLoading)
  }
}