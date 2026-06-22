import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { SelectionModel } from '@angular/cdk/collections'
import { ContentBatchService } from '../../services/content-batch.service'
import { DialogConfirmComponent } from './../dialog-confirm/dialog-confirm.component'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { SnackbarComponent } from '../snackbar/snackbar.component'

export interface IUserElement {
  fullName: string
  status: string
  message: string
  email: string
  ministry: string
  mobile: any
}

@Component({
    selector: 'ws-app-user-bulk-upload',
    templateUrl: './user-bulk-upload.component.html',
    styleUrls: ['./user-bulk-upload.component.scss'],
    standalone: false
})
export class UserBulkUploadComponent implements OnInit {
  csvContent: any
  contacts: any = []
  properties: any = ''
  flag = false
  fileUploading = false
  isSuccessUserlist: any = []
  isErrorUserlist: any = []
  isSeletedTab = 'success'
  displayedColumns: string[] = ['fullName', 'email', 'ministry', 'status', 'mobile']
  dataSource = new MatTableDataSource<IUserElement>()
  selection = new SelectionModel<IUserElement>(true, [])
  @Output() successUserData = new EventEmitter<any>()

  constructor(
    private contentSvc: ContentBatchService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.successUserData.emit([])
  }

  onDrop(input: HTMLInputElement) {
    this.fileUploading = true
    const files: any = [input]
    const fileTypes = ['csv']  // acceptable file types
    if (files && files.length) {
      const extension = files[0].name.split('.').pop().toLowerCase()  // file extension from input file
      const isSuccess = fileTypes.indexOf(extension) > -1  // is extension in acceptable types
      // console.log(isSuccess)
      // console.log('Filename: ' + files[0].name)
      // console.log('Type: ' + files[0].type)
      // console.log('Size: ' + files[0].size + ' bytes')
      if (isSuccess) {
        const fileToRead = files[0]
        const fileReader = new FileReader()
        fileReader.onload = (event: any) => {
          this.onFileLoad(event)
        }
        fileReader.readAsText(fileToRead, 'UTF-8')
      } else {
        this.fileUploading = false
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: {
            message: 'Unsupported File Format. Please upload a CSV file.', type: 'error',
          }, duration: 3000, panelClass: 'course-error-snackbar',
        })
      }
    } else {
      this.fileUploading = false
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: {
          message: 'Unsupported File Format. Please upload a CSV file.', type: 'error',
        }, duration: 3000, panelClass: 'course-error-snackbar',
      })
    }
  }

  async onFileLoad(fileLoadedEvent: any) {
    this.isSuccessUserlist = []
    this.isErrorUserlist = []
    const textFromFileLoaded = fileLoadedEvent.target.result
    this.csvContent = textFromFileLoaded

    // Flag is for extracting first line
    let flag = false
    // Main Data
    const objarray: any = []
    // Properties
    const prop: any = []
    // Total Length
    let size: any = 0

    for (const line of this.csvContent.split(/[\r\n]+/)) {
      if (flag) {
        const obj: any = {}
        for (let k = 0; k < size; k += 1) {
          // Dynamic Object Properties
          obj[prop[k]] = line.split(',')[k]
        }
        objarray.push(obj)
      } else {
        // First Line of CSV will be having Properties
        for (let k = 0; k < line.split(',').length; k += 1) {
          size = line.split(',').length
          // Removing all the spaces to make them usefull, also removing any " characters
          prop.push(line.split(',')[k].replace(/ /g, '').replace(/"/g, ''))
        }
        flag = true
      }
    }
    this.contacts = objarray
    if (this.contacts && this.contacts.length > 0) {
      const headerValues = Object.keys(this.contacts[0])
      if ((headerValues.length < 0 || headerValues.length > 2)) { // NOSONAR
        this.fileUploading = false
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: {
            message: 'Field Mismatch. Please ensure your uploaded file matches the sample template provided.', type: 'error',
          }, duration: 3000, panelClass: 'course-error-snackbar',
        })
        return
      } if (!headerValues.includes('Emailid') || !headerValues.includes('Mobilenumber')) {
        this.fileUploading = false
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: {
            message: 'Field Mismatch. Please ensure your uploaded file matches the sample template provided.', type: 'error',
          }, duration: 3000, panelClass: 'course-error-snackbar',
        })
        return
      }
    }
    this.properties = []

    this.properties = prop
    // console.log(this.properties)
    const emailIds: any = []
    const mobileNumbers: any = []
    const bothEmailAndMobile: any = {}
    this.contacts = this.contacts.filter((ele: any) => ele.Emailid || ele.Mobilenumber)
    if (this.contacts.length > 30) {

      this.dialog.open(DialogConfirmComponent, {
        data: {
          body: 'More than 30 users are not allowed',
          yes: 'Okay',
          no: 'Cancel',
        },
      })
      this.fileUploading = false
    } else {
      await this.contacts.forEach((element: any) => {
        const emailPattern = new RegExp(`^[\\w\-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$`)
        const mobilePattern = new RegExp(/^(6|7|8|9)\d{9}$/)
        const emailTest = element.Emailid ? emailPattern.test(element.Emailid) : true
        const mobileTest = element.Mobilenumber ? mobilePattern.test(element.Mobilenumber) : true
        element['email'] = element.Emailid
        element['mobile'] = element.Mobilenumber
        if (mobileTest && element.Mobilenumber) {
          mobileNumbers.push(element.Mobilenumber)
        }
        if (emailTest && element.Emailid) {
          emailIds.push(element.Emailid.toLowerCase())
        }
        if (emailTest && mobileTest) {
          element['status'] = 'Success'
          element['userStatus'] = true
          bothEmailAndMobile[element.Emailid.toLowerCase()] = element
        } else {
          if (emailTest || mobileTest) {
            element['status'] = 'Success'
            element['userStatus'] = true
            if ((!emailTest && element.Mobilenumber !== '') || (!emailTest && element.Mobilenumber === '')) {
              element['status'] = 'Error'
              element['userStatus'] = false
              element['message'] = emailPattern.test(element.Emailid) ? '' : 'Invalid Email id'
            }
            if ((!mobileTest && element.Emailid !== '') || (!mobileTest && element.Emailid === '')) {
              element['status'] = 'Error'
              element['userStatus'] = false
              element['message'] = mobilePattern.test(element.Mobilenumber) ? '' : 'Invalid Mobile number'

            }
          } else {
            if (!emailTest && !mobileTest) {
              element['status'] = 'Error'
              element['userStatus'] = false
              element['message'] = 'Invalid Email id and Mobile number'
            } else {
              element['status'] = 'Error'
              element['userStatus'] = false
              element['message'] = emailPattern.test(element.Emailid) ? '' : 'Invalid Email id'
              element['message'] = mobilePattern.test(element.Mobilenumber) ? '' : 'Invalid Mobile number'
            }
          }

        }
      })
      this.flag = true
      const emailResponseData = await this.callUserCheckApi(emailIds, 'primaryEmail')
      const mobileResponseData = await this.callUserCheckApi(mobileNumbers, 'mobile')
      if (emailResponseData && mobileResponseData) {
        this.manageData(emailResponseData, mobileResponseData)
      } else {
        this.fileUploading = false
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: {
            message: 'Something went wrong! Please try again', type: 'error',
          }, duration: 3000, panelClass: 'course-error-snackbar',
        })
      }
    }
  }
  async callUserCheckApi(userData: any, key: any) {
    const request: any = {
      request: {
        filters: {

        },
        fields: [
          'userId',
          'email',
          'firstName',
          'lastName',
          'phone',
          'rootOrgId',
          'channel',
          'roles',
          'profileDetails',
          'createdDate',
          'rootOrgName', 'organisations', 'username',
        ],
      },

    }
    if (key === 'primaryEmail') {
      request.request.filters = {
        ...request.request.filters, email: userData,
      }
    } else {
      request.request.filters = {
        ...request.request.filters, phone: userData,
      }
    }
    return this.contentSvc.validateUser(request).toPromise().then(async (res: any) => {
      if (res.result.response) {
        return await res.result.response
      }
    })
      .catch((_err: any) => { })
      .finally(() => Promise.resolve())
  }

  manageData(userEmailData: any, userMobileData: any) {
    this.isSuccessUserlist = []
    this.isErrorUserlist = []
    const userEmailMap: any = {}
    const userEmailMapUserId: any = {}
    const userMobileMap: any = {}
    if (userEmailData.count) {
      userEmailData.content.forEach(async (e: any) => {
        if (e.profileDetails) {
          userEmailMap[e.profileDetails.personalDetails.primaryEmail.toLowerCase()] = e
          userEmailMapUserId[e.userId] = e
        }
      })
    }
    if (userMobileData.count) {
      userMobileData.content.forEach(async (e: any) => {
        if (e.profileDetails) {
          userMobileMap[e.profileDetails.personalDetails.mobile] = e
        }
      })
    }
    this.contacts.forEach(async (e: any) => {
      if (e.userStatus) {
        if (e.email && e.mobile) {
          const userData = userEmailMap[e.email.toLowerCase()]
          if (userData && userData.profileDetails.personalDetails && userData.profileDetails.personalDetails.mobile) {
            if (String(userData.profileDetails.personalDetails.mobile) === String(e.mobile)) {
              e['userId'] = userData.userId
              e['ministry'] = userData.rootOrgName
              e['fullName'] = userData.firstName || userData.firstname
            } else {
              e['status'] = 'Error'
              e['userStatus'] = false
              e['message'] = 'Given credentials are not matching'
            }
          } else {
            e['status'] = 'Error'
            e['userStatus'] = false
            e['message'] = 'Given credentials are not matching'
          }

        } else if (e.email && userEmailMap[e.email.toLowerCase()]) {
          const userData = userEmailMap[e.email.toLowerCase()]
          e['mobile'] = userData.profileDetails.personalDetails.mobile

          e['userId'] = userData.userId
          e['ministry'] = userData.rootOrgName
          e['fullName'] = userData.firstName || userData.firstname
        } else if (e.mobile && userMobileMap[e.mobile]) {
          const userData = userMobileMap[e.mobile]
          e['email'] = userData.profileDetails.personalDetails.primaryEmail
          e['userId'] = userData.userId
          e['ministry'] = userData.rootOrgName
          e['fullName'] = userData.firstName || userData.firstname
        } else {
          e['status'] = 'Error'
          e['userStatus'] = false
          e['message'] = 'Given credentials are not matching'
        }
      }
    })
    this.fileUploading = false
    this.isSuccessUserlist = this.contacts.filter((ele: any) => ele.userStatus)
    this.isErrorUserlist = this.contacts.filter((ele: any) => !ele.userStatus)
    this.successUserData.emit(this.isSuccessUserlist)
    this.isSeletedTab = this.isSuccessUserlist.length ? 'success' : 'error'
    if (this.isSeletedTab === 'success') {
      this.displayedColumns = ['fullName', 'email', 'ministry', 'status', 'mobile']
      this.dataSource = new MatTableDataSource<IUserElement>(this.isSuccessUserlist)
    } else if (this.isSeletedTab === 'error') {
      this.displayedColumns = ['email', 'status', 'mobile', 'message']
      this.dataSource = new MatTableDataSource<IUserElement>(this.isErrorUserlist)
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length
    const numRows = this.dataSource.data.length
    return numSelected === numRows
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear()
      return
    }

    this.selection.select(...this.dataSource.data)
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`
  }
  changeFilterType(filterType: string) {
    if (filterType === 'error') {
      this.displayedColumns = ['email', 'status', 'mobile', 'message']
      this.dataSource = new MatTableDataSource<IUserElement>(this.isErrorUserlist)
    } else {
      this.displayedColumns = ['fullName', 'email', 'ministry', 'status', 'mobile']
      this.dataSource = new MatTableDataSource<IUserElement>(this.isSuccessUserlist)
    }
    this.isSeletedTab = filterType

  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }
  downloadErrorFile() {
    this.contentSvc.downloadFile(this.isErrorUserlist, 'userErrordata')
  }
  public downloadFile(): void {
    // this.fileService.download(this.downloadSampleFilePath, this.downloadAsFileName)
  }
}
