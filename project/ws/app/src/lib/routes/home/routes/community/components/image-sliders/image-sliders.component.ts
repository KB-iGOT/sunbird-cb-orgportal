import { Component, Input } from '@angular/core'
import { Subscription, interval } from 'rxjs'

@Component({
  selector: 'ws-app-image-sliders',
  templateUrl: './image-sliders.component.html',
  styleUrls: ['./image-sliders.component.scss']
})
export class ImageSlidersComponent {
  @Input() imageUrls: any[] = []
  currentIndex = 0
  slideInterval: Subscription | null = null


  reInitiateSlideInterval() {
      if (this.imageUrls && this.imageUrls.length > 1) {
        try {
          if (this.slideInterval) {
            this.slideInterval.unsubscribe()
          }
        } catch (e) {
        } finally {
          this.slideInterval = interval(8000).subscribe(() => {
            if (this.currentIndex === this.imageUrls.length - 1) {
              this.currentIndex = 0
            } else {
              this.currentIndex += 1
            }
          })
        }
      }

  }

  slideTo(index: number) {
    if (index >= 0 && index < this.imageUrls.length) {
      this.currentIndex = index
    } else if (index === this.imageUrls.length) {
      this.currentIndex = 0
    } else {
      this.currentIndex = this.imageUrls.length + index
    }
    this.reInitiateSlideInterval()
  }

}
