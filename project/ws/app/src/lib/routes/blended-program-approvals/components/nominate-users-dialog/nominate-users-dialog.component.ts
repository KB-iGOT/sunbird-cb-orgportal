import { SelectionModel } from '@angular/cdk/collections'
import { Component, Inject, OnInit, ViewChild } from '@angular/core'
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table'
import { UsersService } from '../../../users/services/users.service'
import { MatSort } from '@angular/material/sort'
import { BlendedApporvalService } from '../../services/blended-approval.service'
import { DialogConfirmComponent } from '../../../../../../../../../src/app/component/dialog-confirm/dialog-confirm.component'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
@Component({
  selector: 'ws-app-nominate-users-dialog',
  templateUrl: './nominate-users-dialog.component.html',
  styleUrls: ['./nominate-users-dialog.component.scss'],

})
export class NominateUsersDialogComponent implements OnInit {

  displayedColumns: string[] = ['select', 'name', 'email']
  searchText = ''
  selection = new SelectionModel(true, [])
  filteredUsers: any = []
  dataSource = new MatTableDataSource<any>()
  displayLoader = false
  learners: any = []
  userscount: any

  @ViewChild(MatSort) set matSort(sort: MatSort) {
    if (!this.dataSource.sort) {
      this.dataSource.sort = sort
    }
  }

  tableColumns = [
    { name: 'name', dispalyName: 'Full name' },
    { name: 'email', dispalyName: 'Email' },
  ]

  constructor(public dialogRef: MatDialogRef<NominateUsersDialogComponent>,
    private usersService: UsersService,
    private configSvc: ConfigurationsService,
    private dialogue: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any, private bpService: BlendedApporvalService,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    const filterObj = {
      request: {
        query: '',
        filters: {
          rootOrgId: this.data.orgId,
          status: 1,
        },
        limit: 100,
        offset: 0,
      },
    }
    this.getAllUsers(filterObj)
  }

  getAllUsers(filterObj: any) {
    this.displayLoader = true
    this.filteredUsers = []
    this.dataSource = new MatTableDataSource()
    this.learners = this.data.learners.map((u: any) => {
      return u.user_id
    })
    this.usersService.getAllUsers(filterObj).subscribe(data => {
      data.content.map((details: any) => {
        const dept = (details.profileDetails && details.profileDetails.employmentDetails)
          ? details.profileDetails.employmentDetails.departmentName : details.rootOrgName
        if (!this.learners.includes(details.id)) {
          this.filteredUsers.push({
            name: details.firstName,
            email: details.maskedEmail,
            userId: details.id,
            rootOrgId: this.data.orgId,
            actorUserId: details.id,
            state: 'APPROVED',
            serviceName: 'blendedprogram',
            deptName: dept,
            courseId: this.data.courseId, // blended program course ID
            applicationId: this.data.applicationId, // blended program batch ID
            updateFieldValues: [
              { toValue: { name: details.firstName } },
            ],
          })
        }

      })
      this.dataSource = new MatTableDataSource(this.filteredUsers)
      this.displayLoader = false
    })
  }

  searchUsers(filterValue: any) {
    const filterObj = {
      request: {
        query: filterValue.value ? filterValue.value.trim().toLowerCase() : '',
        filters: {
          rootOrgId: this.data.orgId,
          status: 1,
        },
      },
    }
    this.getAllUsers(filterObj)
  }

  async addLearners() {
    await this.getUsersCount()
    if (this.selection.selected.length > 0) {
      const differenceCount = this.data.totalBatchCount - this.userscount.totalApplied
      if (this.selection.selected.length <= differenceCount) {
        let userIds: any = []
        this.selection.selected.forEach((user: any) => {
          userIds.push(user.userId)
        })
        const request = {
          batchId: this.data.applicationId,
          courseId: this.data.courseId,
          userIds: userIds,
          serviceName: 'blendedprogram',
          deptName: this.configSvc?.userProfile?.departmentName
        }
        this.bpService.inviteUserToBatch(request).subscribe(
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
            this.dialogRef.close('done')
          },
          (error: any) => {
            let errMsg = 'Some error occurred! Please try again'
            console.log('Error nominating users to batch:', error)
            this.snackBar.open(errMsg, 'OK', { duration: 6000 })
          }
        )
      } else {
        this.dialogue.open(DialogConfirmComponent, {
          width: '35vw',
          data: {
            title: 'Nomination Limit Exceeded',
            // tslint:disable-next-line
            body: `You can nominate up to <b> ${differenceCount} </b> learners for this batch, based on the current batch enrollment availability.Please review and adjust your nominations accordingly, and then submit.`,
            ok: 'OK',
            cancel: 'hide',
          },
          disableClose: true,
          autoFocus: false,
        })
      }
    }
  }

  closeDiaogBox() {
    this.dialogRef.close('close')
  }

  async getUsersCount() {
    if (this.data && this.data.applicationId) {
      // const req = {
      //   serviceName: 'blendedprogram',
      //   applicationStatus: '',
      //   applicationIds: [
      //     this.data.applicationId,
      //   ],
      //   limit: 100,
      //   offset: 0,
      // }
      this.userscount = {
        enrolled: 0,
        totalApplied: 0,
        rejected: 0,
      }

      const request = {
        serviceName: ['blendedprogram'],
        applicationStatus: ['SEND_FOR_PC_APPROVAL', 'SEND_FOR_MDO_APPROVAL', 'APPROVED'],
        applicationIds: [this.data.applicationId],
        limit: 100,
        offset: 0,
      }
      const resData: any = await this.bpService.getSerchRequests(request).toPromise().catch(_error => { })
      if (resData && resData.result && resData.result.data && resData.result.data.length > 0) {
        this.userscount.totalApplied = this.userscount.totalApplied + resData.result.data.length
      }
      return this.userscount
      //  this.bpService.fetchBlendedUserCount(req).then(async (res: any) => {
      //   if (res.result && res.result.data) {
      //     const statusToNegate = ['WITHDRAWN', 'REMOVED', 'REJECTED', 'ADMIN_ENROLL_IS_IN_PROGRESS']
      //     await res.result.data.forEach((ele: any) => {
      //       if (!statusToNegate.includes(ele.currentStatus)) {
      //         this.userscount.totalApplied = this.userscount.totalApplied + ele.statusCount
      //       }
      //     })
      //
      //   }
      // })
    }
  }
}
