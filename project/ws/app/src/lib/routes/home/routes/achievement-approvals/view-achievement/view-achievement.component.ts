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

  constructor() {
    this.achievement = {
      title: 'Achievement Title Example',
      description: 'Learning objectives for an Angular course focus on enabling students to build, test, and deploy modern, scalable single-page applications (SPAs) using TypeScript, components, and CLI tools. Core outcomes include mastering data binding, services, dependency injection, routing, and form validation, along with integrating REST APIs and optimizing performance',
      issuedBy: 'Microsoft corporation',
      issueDate: '2024-06-15',
      uploadedDocumentUrl: 'https://portal.qa.karmayogibharat.net/content-store/content/do_1145007188382187521364/artifact/do_1145007188382187521364_1770107280240_coursethumbnail61770107279623.jpg',
      status: 'Approved',
      decisionDate: '2024-06-20',
      deliveryMode: 'Online',
      startDate: '2024-05-01',
      endDate: '2024-06-01',
      learningHours: 40,
      trainingType: 'Self-paced',
      //url: 'https://google.com'
    }
  }

  get truncatedDescription(): string {
    const desc = this.achievement?.description || ''
    if (!desc) {
      return ''
    }
    if (this.showFullDescription || desc.length <= 200) {
      return desc
    }
    return desc.slice(0, 200) + '...'
  }

  get isLongDescription(): boolean {
    return (this.achievement?.description || '').length > 200
  }


  onClose(): void {
    this.closeSidenav.emit()
  }
}
