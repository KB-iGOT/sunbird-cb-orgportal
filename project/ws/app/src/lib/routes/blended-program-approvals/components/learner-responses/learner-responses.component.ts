import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { BlendedApporvalService } from '../../services/blended-approval.service'
import { NSProfileDataV2 } from '../../../home/models/profile-v2.model'

/* tslint:disable */
import _ from 'lodash'
import { RejectReasonDialogComponent } from '../reject-reason-dialog/reject-reason-dialog.component'
import { MatDialog } from '@angular/material/dialog'
import { DialogConfirmComponent } from '../../../../../../../../../src/app/component/dialog-confirm/dialog-confirm.component'
import { environment } from '../../../../../../../../../src/environments/environment'

@Component({
    selector: 'ws-app-learner-responses',
    templateUrl: './learner-responses.component.html',
    styleUrls: ['./learner-responses.component.scss'],
    standalone: false
})
export class LearnerResponsesComponent implements OnInit {
  @Input() selectedUser: any
  @Input() contentData: any
  @Input() batchData: any
  @Output() clickBack = new EventEmitter()
  @Output() actionClick = new EventEmitter()
  userId!: any
  learner!: any
  formId: any
  showActions: boolean = false
  userData: any
  apiData: any
  latestData: any
  isReadOnly = true
  showSpinner = true
  formfields: any
  newForm = true
  formTitle: string = ''
  surveyGroup: string = ''
  surevyDesignation: string = ''

  constructor(private bpService: BlendedApporvalService, private dialogue: MatDialog) { }

  ngOnInit(): void {
    if (this.contentData) {
      this.formId = this.contentData.wfSurveyLink.split("surveys/")[1]
    }
    if (this.selectedUser) {
      this.userId = this.selectedUser.wfInfo[0].userId
      this.showActions = this.selectedUser.wfInfo[0].currentStatus === 'SEND_FOR_MDO_APPROVAL'
    }
    this.fetchLearner()
    this.getFormById()
    this.getGroupAndDesignationFromSurevyForm()
  }


  getGroupAndDesignationFromSurevyForm() {
    let doptOrg = environment.doptOrg
    const customFields = this.batchData.batchAttributes.bpEnrolMandatoryProfileFields
    let profileSurveyLink = this.batchData.batchAttributes.profileSurveyLink
    if (customFields && customFields.length && profileSurveyLink) {
      let hasGroups = customFields.find((_field: any) => _field.field === 'profileDetails.professionalDetails.group')
      let hasDesignation = customFields.find((_field: any) => _field.field === 'profileDetails.professionalDetails.designation')
      if (doptOrg && doptOrg === this.contentData.createdFor[0] && (hasGroups || hasDesignation)) {
        let surveyId = profileSurveyLink.split("surveys/")[1]
        this.getProfileSurevyReport(surveyId, hasGroups, hasDesignation)
      }
    }
  }

  async getProfileSurevyReport(surevyId: string, hasGroups: boolean, hasDesignation: boolean) {
    const req = {
      searchObjects: [
        {
          key: 'formId',
          values: surevyId,
        },
        {
          key: 'updatedBy',
          values: this.userId,
        },
      ],
    }
    const resList = await this.bpService.getSurveyByUserID(req).toPromise().catch(_error => { })
    if (resList && resList.statusInfo && resList.statusInfo.statusCode && resList.statusInfo.statusCode === 200) {
      const tempData = _.sortBy(resList.responseData, ['timestamp'])
      let latestProfileSurevyData = tempData[tempData.length - 1]
      if (latestProfileSurevyData && latestProfileSurevyData.dataObject) {
        if (hasGroups) {
          this.surveyGroup = latestProfileSurevyData.dataObject.Group
        }
        if (hasDesignation) {
          this.surevyDesignation = latestProfileSurevyData.dataObject.Designation
        }
      }
    }

  }

  async getFormById() {
    const _result = await this.bpService.getSurveyByFormId(this.formId).toPromise().catch(_error => { })
    if (_.get(_result, 'result.response')) {
      const responce = _result.result.response
      this.formfields = responce.fields
      this.formTitle = responce.title || ''
      this.newForm = (responce.clientVersion && responce.clientVersion === 1.1 ||
        responce.clientVerion && responce.clientVerion === 1.1
      )
      this.getSurveyReport()
    }
  }

  fetchLearner() {
    this.bpService.getUserById(this.userId).subscribe((res: any) => {
      this.userData = res
      this.learner = {
        department: _.get(res, 'profileDetails.employmentDetails.departmentName'),
        profileImage: _.get(res, 'avatar'),
        name: `${_.get(res, 'firstName')}`,
        authorType: '',
        email: _.get(res, 'email'),
        profileLink: this.getProfileLink(res.profileDetails),
        userId: _.get(res, 'userId'),
        designation: _.get(res, 'profileDetails.professionalDetails[0].designation'),
      }
    })
  }

  get getLearner() {
    return this.learner || null
  }

  getProfileLink(res: NSProfileDataV2.IProfile) {
    if (res && res.userId) {
      return `/app/profile/${res.userId}`
    }
    return '#'
  }

  moveBack() {
    this.clickBack.emit(true)
  }

  async getSurveyReport() {
    const req = {
      filters: {
        formId: this.formId,
        status: 'SUBMITTED',
        createdBy: this.userId
      },
      page: 0,
      size: 20,
      sortBy: 'createdDate',
      sortOrder: 'ASC'
    }
    const resList = await this.bpService.getSubmissionsByUserId(req).toPromise().catch(_error => { })
    if (_.get(resList, 'params.status') === 'success') {
      const tempData = _.sortBy(_.get(resList, 'result.response.content'), ['timestamp'])
      this.latestData = tempData[tempData.length - 1]
      this.latestData['dataObject'] = this.formateLatestDataObject
      setTimeout(() => {
        this.showSpinner = false
      }, 1000)
    }
    this.apiData = {
      getAPI: `/apis/proxies/v8/forms/getFormById?id=${this.latestData.formId}`,
      postAPI: `/apis/proxies/v8/forms/v1/saveFormSubmit`,
      getAllApplications: `/apis/proxies/v8/forms/getAllApplications`,
      customizedHeader: {},
    }
  }

  get formateLatestDataObject(): any {
    let dataObject: { [key: string]: any } = {}
    if (this.latestData && this.latestData.responses) {
      this.latestData.responses.forEach((item: any) => {
        if (item.question) {
          dataObject[item.question] = item.answer
        }
      })
    }
    return dataObject
  }

  onReject() {
    const dialogRef = this.dialogue.open(RejectReasonDialogComponent, {
      disableClose: true,
      data: {
        title: 'Please provide the reason for rejecting the user from the batch',
        buttonText: 'Reject',
      },
    })
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response) {
        const data = {
          action: 'Reject',
          userData: this.selectedUser,
          comment: response.reason,
        }
        this.actionClick.emit(data)
      }
    })
  }

  onApprove() {
    const dialogRef = this.dialogue.open(DialogConfirmComponent, {
      data: {
        title: 'Are you sure?',
        body: `Please click <strong>Yes</strong> to approve this request.`,
      },
    })
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response) {
        const data = {
          action: 'Approve',
          userData: this.selectedUser,
        }
        this.actionClick.emit(data)
      }
    })
  }

  public getDateFromText(dateString: string): any {
    if (dateString) {
      const sv: string[] = dateString.split('T')
      if (sv && sv.length > 1) {
        return sv[0]
      }
      const splitValues: string[] = dateString.split('-')
      const [dd, mm, yyyy] = splitValues
      const dateToBeConverted = dd.length !== 4 ? `${yyyy}-${mm}-${dd}` : `${dd}-${mm}-${yyyy}`
      return new Date(dateToBeConverted)
    }
    return ''
  }

}
