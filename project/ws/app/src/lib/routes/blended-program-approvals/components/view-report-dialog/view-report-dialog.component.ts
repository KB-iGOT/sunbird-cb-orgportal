import { Component, Inject, OnInit } from '@angular/core'
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
/* tslint:disable */
import _ from 'lodash'
import { BlendedApporvalService } from '../../services/blended-approval.service'
/* tslint:enable */

@Component({
    selector: 'ws-auth-app-view-report-dialog',
    templateUrl: './view-report-dialog.component.html',
    styleUrls: ['./view-report-dialog.component.scss'],
    standalone: false
})
export class ViewReportDialogComponent implements OnInit {
  reasonForm!: UntypedFormGroup
  apiData: any
  latestData: any
  isReadOnly = true
  showSpinner = true

  constructor(
    public dialogRef: MatDialogRef<ViewReportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private bpService: BlendedApporvalService,
  ) {
    this.reasonForm = new UntypedFormGroup({
      reason: new UntypedFormControl('', [Validators.required, Validators.maxLength(500)]),
    })
  }

  ngOnInit() {
    this.getSurveyReport()
  }

  async getSurveyReport() {
    const req = {
      searchObjects: [
        {
          key: 'formId',
          values: this.data.formId,
        },
        {
          key: 'updatedBy',
          values: this.data.userId,
        },
      ],
    }
    const resList = await this.bpService.getSurveyByUserID(req).toPromise().catch(_error => { })
    if (resList && resList.statusInfo && resList.statusInfo.statusCode && resList.statusInfo.statusCode === 200) {
      const tempData = _.sortBy(resList.responseData, ['timestamp'])
      this.latestData = tempData[tempData.length - 1]
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

  onClose() {
    this.dialogRef.close(true)
  }

}
