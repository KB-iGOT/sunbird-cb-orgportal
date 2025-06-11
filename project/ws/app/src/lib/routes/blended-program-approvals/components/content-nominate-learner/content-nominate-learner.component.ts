import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { IEnroleType2 } from '../../enums/enrolment-type'
import { ActivatedRoute, Router } from '@angular/router'
import { ContentBatchService } from '../../services/content-batch.service'
import { NSContent } from '../../interface/content'
import { LocalDataService } from '../../services/local-data.service'
import * as _ from 'lodash'

@Component({
  selector: 'ws-app-content-nominate-learner',
  templateUrl: './content-nominate-learner.component.html',
  styleUrls: ['./content-nominate-learner.component.scss']
})
export class ContentNominateLearnerComponent implements OnInit {
  contentForm!: FormGroup
  batchId: any
  enroleTypeList = Object.values(IEnroleType2)
  public contentId: string | null = null
  public content!: NSContent.IContentMeta
  constructor(public activatedRoute: ActivatedRoute, public router: Router,
    public batchService: ContentBatchService,
    private dataService: LocalDataService,
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
      request: {
        batchId: this.batchId,
        programId: this.contentId,
        userIdList: userId,
      },
    }
    console.log('request', request)
    // this.batchService.inviteUserToBatch(request).subscribe((_res: any) => {

    //   this.router.navigate(['/author', 'content-detail', this.contentId, 'batches'])
    // })
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