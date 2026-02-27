import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'ws-app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  training: any = {}

  ngOnInit() {
    this.training = {
      title: 'Advanced Leadership Workshop',
      learningType: 'Leadership Development',
      deliveryMode: 'Hybrid / Instructor-Led',
      learningHours: '40 Hours',
      partnerName: 'Global Leadership Institute',
      learningObjective: 'The program is designed to enhance strategic thinking, high-stakes decision making, and team management skills. Participants will emerge with the ability to lead diverse organizational changes and build resilient corporate cultures.',
      certificateName: 'Jane Doe',
    }
  }
}
