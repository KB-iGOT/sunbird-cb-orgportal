import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup } from '@angular/forms'

@Component({
    selector: 'ws-app-groups-grade',
    templateUrl: './groups-grade.component.html',
    styleUrls: ['./groups-grade.component.scss'],
    standalone: false
})
export class GroupsGradeComponent implements OnInit {
  settingsForm!: FormGroup
  groupGradeValue = ''
  groupGradeOtherValue = ''
  gradeList = [
    {
      value: 'grade_1',
      label: 'Grade I',
    },
    {
      value: 'grade_2',
      label: 'Grade II',
    },
    {
      value: 'grade_3',
      label: 'Grade III',
    },
    {
      value: 'grade_4',
      label: 'Grade IV',
    },
  ]
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.settingsForm = this.formBuilder.group({
      group_grade: [''],
      group_grade_other: [''],
    })
  }

  onGradeGroupChange(event: any): void {
    this.groupGradeValue = event.value

  }
  onOtherChange(event: any): void {
    this.groupGradeOtherValue = event.value

  }
}
