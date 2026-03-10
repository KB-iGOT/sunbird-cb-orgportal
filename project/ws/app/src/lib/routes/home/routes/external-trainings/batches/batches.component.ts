import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'ws-app-batches',
  templateUrl: './batches.component.html',
  styleUrls: ['./batches.component.scss']
})
export class BatchesComponent implements OnInit {
  batches: { name: string; startDate: string; endDate: string }[] = []

  ngOnInit() {
    this.batches = [
      { name: 'Angular Upgrade', startDate: '2025-11-29', endDate: '2025-12-31' },
      { name: 'Java Certification', startDate: '2025-12-18', endDate: '2025-12-25' },
      { name: 'Python for Data Science', startDate: '2026-01-01', endDate: '2026-01-23' },
      { name: 'AWS Cloud Practitioner', startDate: '2026-01-15', endDate: '2026-02-28' },
      { name: 'React Native Basics', startDate: '2026-02-01', endDate: '2026-03-15' },
      { name: 'DevOps with Docker', startDate: '2026-02-10', endDate: '2026-03-20' },
      { name: 'Machine Learning Fundamentals', startDate: '2026-03-01', endDate: '2026-04-30' },
      { name: 'Kubernetes Administration', startDate: '2026-03-10', endDate: '2026-04-10' },
      { name: 'UI/UX Design Principles', startDate: '2026-03-15', endDate: '2026-04-25' },
      { name: 'Agile & Scrum Mastery', startDate: '2026-04-01', endDate: '2026-05-01' },
      { name: 'TypeScript Advanced', startDate: '2026-04-05', endDate: '2026-05-10' },
      { name: 'Cyber Security Essentials', startDate: '2026-04-15', endDate: '2026-05-30' },
      { name: 'Spring Boot Microservices', startDate: '2026-05-01', endDate: '2026-06-15' },
      { name: 'Azure Fundamentals', startDate: '2026-05-10', endDate: '2026-06-20' },
      { name: 'SQL & Database Design', startDate: '2026-05-20', endDate: '2026-06-30' },
      { name: 'Node.js Backend Development', startDate: '2026-06-01', endDate: '2026-07-15' },
      { name: 'GraphQL API Workshop', startDate: '2026-06-10', endDate: '2026-07-10' },
      { name: 'Flutter Mobile Development', startDate: '2026-06-15', endDate: '2026-07-30' },
      { name: 'Data Engineering with Spark', startDate: '2026-07-01', endDate: '2026-08-15' },
      { name: 'Go Programming Essentials', startDate: '2026-07-10', endDate: '2026-08-10' },
      { name: 'Blockchain Fundamentals', startDate: '2026-07-20', endDate: '2026-08-30' },
      { name: 'Terraform Infrastructure', startDate: '2026-08-01', endDate: '2026-09-15' },
      { name: 'Power BI Analytics', startDate: '2026-08-10', endDate: '2026-09-20' },
      { name: 'Rust Systems Programming', startDate: '2026-08-15', endDate: '2026-09-30' },
    ]
  }
}
