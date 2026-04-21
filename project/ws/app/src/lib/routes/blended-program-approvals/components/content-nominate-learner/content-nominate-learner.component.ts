import { Component, Input, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { IEnroleType2 } from '../../enums/enrolment-type'
import { ActivatedRoute, Router } from '@angular/router'
import { ContentBatchService } from '../../services/content-batch.service'
import { NSContent } from '../../interface/content'
import { LocalDataService } from '../../services/local-data.service'
import * as _ from 'lodash'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'

@Component({
  selector: 'ws-app-content-nominate-learner',
  templateUrl: './content-nominate-learner.component.html',
  styleUrls: ['./content-nominate-learner.component.scss']
})
export class ContentNominateLearnerComponent implements OnInit {
  contentForm!: FormGroup
  batchId: any
  @Input() batchData: any
  @Input() programID: any
  enroleTypeList = Object.values(IEnroleType2)
  public contentId: string | null = null
  public content!: NSContent.IContentMeta
  constructor(public activatedRoute: ActivatedRoute, public router: Router,
    public batchService: ContentBatchService,
    private dataService: LocalDataService,
    private snackBar: MatSnackBar,
    private configSvc: ConfigurationsService
  ) {

    this.contentForm = new FormGroup({
      enroleType: new FormControl('', Validators.required),
      selectedUsers: new FormControl([], Validators.required),
      // userProfileFileds: new FormControl(IUserProfileFields.existing),
    })
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((_ele: any) => {
      this.fetchContent()
    })
  }

  fetchContent() {
    this.contentId = this.activatedRoute.snapshot.parent && this.activatedRoute.snapshot.parent.paramMap.get('contentId') || null
    const routeData = this.activatedRoute.snapshot.parent &&
      this.activatedRoute.snapshot.parent.data.content
    if (!routeData) {
      if (this.contentId) {
        this.batchService.readContentLive(this.contentId).subscribe((s: any) => {
          _.set(this, 'content', s)
          this.dataService.initData(s)
        })
      }
    } else {
      _.set(this, 'content', routeData)
      this.dataService.initData(routeData)
    }
    this.getCurrentBatch()
  }

  getCurrentBatch() {
    this.dataService.currentBatch.subscribe((res: any) => {
      if (res) {
        if (res && res.batchId) {
          this.batchId = res.batchId
        }
      } else {
        // API CALL
      }
    })
  }

  selectedUsersData(event: any) {
    this.contentForm.controls['selectedUsers'].setValue(event)
    this.contentForm.controls['selectedUsers'].updateValueAndValidity()
  }

  onSubmit() {
    const userId: any = []
    const formValues = this.contentForm && this.contentForm.value
    formValues.selectedUsers.forEach((ele: any) => {
      userId.push(ele.userId)
    })
    const request = {
      batchId: this.batchData?.batchId,
      courseId: this.programID,
      userIds: userId,
      serviceName: 'blendedprogram',
      deptName: this.configSvc?.userProfile?.departmentName
    }
    this.batchService.inviteUserToBatch(request).subscribe(
      (res: any) => {
        const response = res?.result?.data
        if (response && Array.isArray(response)) {
          let successCount = 0
          let alreadyExistsCount = 0
          let batchFullCount = 0
          let scheduleConflictCount = 0
          let otherFailureCount = 0

          for (const userResponse of response) {
            const status = (userResponse?.status || '').toUpperCase()
            if (status === 'APPROVED') {
              successCount++
            } else if (status === 'ALREADY_EXISTS') {
              alreadyExistsCount++
            } else if (status === 'BATCH_FULL') {
              batchFullCount++
            } else if (status === 'SCHEDULE_CONFLICT') {
              scheduleConflictCount++
            } else {
              otherFailureCount++
            }
          }

          const totalFailures = alreadyExistsCount + batchFullCount + scheduleConflictCount + otherFailureCount
          const messages: string[] = []

          // Build success message
          if (successCount > 0) {
            const successLabel = successCount > 1 ? 'users' : 'user'
            messages.push(`${successCount} ${successLabel} added successfully`)
          }

          // Build failure messages
          const failureMessages: string[] = []
          if (alreadyExistsCount > 0) {
            const alreadyLabel = alreadyExistsCount > 1 ? 'users' : 'user'
            failureMessages.push(`${alreadyExistsCount} ${alreadyLabel} already enrolled`)
          }
          if (batchFullCount > 0) {
            const batchLabel = batchFullCount > 1 ? 'users' : 'user'
            failureMessages.push(`${batchFullCount} ${batchLabel} failed (batch full)`)
          }
          if (scheduleConflictCount > 0) {
            const scheduleLabel = scheduleConflictCount > 1 ? 'users' : 'user'
            failureMessages.push(`${scheduleConflictCount} ${scheduleLabel} failed (schedule conflict)`)
          }
          if (otherFailureCount > 0) {
            const otherLabel = otherFailureCount > 1 ? 'users' : 'user'
            failureMessages.push(`${otherFailureCount} ${otherLabel} failed`)
          }

          if (failureMessages.length > 0) {
            messages.push(`Failed: ${failureMessages.join(', ')}`)
          }

          // Display appropriate message
          const finalMessage = messages.join('; ')
          if (successCount > 0 && totalFailures > 0) {
            this.snackBar.open(finalMessage, 'OK', { duration: 6000 })
          } else if (successCount > 0) {
            this.snackBar.open(finalMessage, 'OK', { duration: 4000 })
          } else {
            this.snackBar.open(`Nomination failed: ${failureMessages.join(', ')}`, 'OK', { duration: 6000 })
          }
        } else {
          this.snackBar.open('User is successfully added to the invitee list', 'OK', { duration: 4000 })
        }
      },
      (error: any) => {
        let errMsg = 'Some error occurred! Please try again'
        console.log('Error nominating users to batch:', error)
        this.snackBar.open(errMsg, 'OK', { duration: 6000 })
      }
    )
  }

  showError(meta: string) {
    if (this.contentForm.controls[meta] && this.contentForm.controls[meta].touched) {
      if (!this.contentForm.controls[meta].valid) {
        return true
      }
    }
    return false
  }

}