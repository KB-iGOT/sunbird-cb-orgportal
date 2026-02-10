import { Component, EventEmitter, Output, Input } from '@angular/core'

@Component({
  selector: 'ws-app-view-achievement',
  templateUrl: './view-achievement.component.html',
  styleUrls: ['./view-achievement.component.scss']
})
export class ViewAchievementComponent {
  @Output() closeSidenav = new EventEmitter<void>()

  @Input() achievement: any = {}
  showFullDescription = false

  toggleDescription(): void {
    this.showFullDescription = !this.showFullDescription
  }

  constructor() { }
  get truncatedDescription(): string {
    const desc = this.achievement?.contextData?.description || ''
    if (!desc) {
      return ''
    }
    if (this.showFullDescription || desc.length <= 200) {
      return desc
    }
    return desc.slice(0, 200) + '...'
  }

  get isLongDescription(): boolean {
    return (this.achievement?.contextData?.description || '').length > 200
  }


  onClose(): void {
    this.closeSidenav.emit()
  }
}
