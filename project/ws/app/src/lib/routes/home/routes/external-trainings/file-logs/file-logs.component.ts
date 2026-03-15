import { Component, Input } from '@angular/core'
import { PageEvent } from '@angular/material/paginator'
import { ExternalTrainingsService } from '../../../services/external-trainings.service'

@Component({
  selector: 'ws-app-file-logs',
  templateUrl: './file-logs.component.html',
  styleUrls: ['./file-logs.component.scss']
})
export class FileLogsComponent {
  lastUploadList: any[] = []
  startIndex = 0
  lastIndex: any

  pageSize = 10

  sizeOptions = [10, 20]
  @Input() batchId = ''
  @Input() trainingId = ''

  constructor(
    private externalTrainingsSvc: ExternalTrainingsService,
  ) {
    // this.lastUploadList = [
    //   {
    //     "dateUpdatedOn": "2025-01-22T14:27:04.095+0000",
    //     "identifier": "0c4b59bd-c6a4-41e5-ae6d-9200af1914f1",
    //     "totalRecords": 4,
    //     "fileName": "1737556023295_Testfourerrorlistdev.csv",
    //     "successfulRecordsCount": 1,
    //     "failedRecordsCount": 3,
    //     "filePath": "https://storage.googleapis.com/sb-cb-ext-dev/bulkupload/1737556023295_Testfourerrorlistdev.csv",
    //     "comment": "",
    //     "dateCreatedOn": "2025-01-22T14:27:03.786+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "FAILED"
    //   },
    //   {
    //     "dateUpdatedOn": "2025-03-07T13:16:59.499+0000",
    //     "identifier": "0e7932e6-1a38-4984-8be7-43672ff4f46d",
    //     "totalRecords": 1,
    //     "fileName": "1741353419162_user-bulk-upload-sample.csv",
    //     "successfulRecordsCount": 0,
    //     "failedRecordsCount": 1,
    //     "filePath": "https://storage.googleapis.com/sb-cb-ext-dev/bulkupload/1741353419162_user-bulk-upload-sample.csv",
    //     "comment": "",
    //     "dateCreatedOn": "2025-03-07T13:16:59.353+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "FAILED"
    //   },
    //   {
    //     "dateUpdatedOn": "2024-04-02T11:40:05.859+0000",
    //     "identifier": "1f9b9c81-4d65-4058-af13-00cd0ea891e3",
    //     "totalRecords": 1335,
    //     "fileName": "1712057964233_1709802899723_7 3 24.xlsx",
    //     "successfulRecordsCount": 376,
    //     "failedRecordsCount": 318,
    //     "filePath": "https://static.karmayogiprod.nic.in/sb-cb-ext-dev/bulkupload/1712057964233_1709802899723_7%203%2024.xlsx",
    //     "comment": "",
    //     "dateCreatedOn": "2024-04-02T11:39:24.535+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "FAILED"
    //   },
    //   {
    //     "dateUpdatedOn": "2025-12-19T10:05:03.490+0000",
    //     "identifier": "22e94327-9483-4703-ab4e-848683d4d661",
    //     "totalRecords": 1,
    //     "fileName": "1766138703147_bulk-upload.csv",
    //     "successfulRecordsCount": 0,
    //     "failedRecordsCount": 1,
    //     "filePath": "https://storage.googleapis.com/sb-cb-ext-dev/bulkupload/1766138703147_bulk-upload.csv",
    //     "comment": "",
    //     "dateCreatedOn": "2025-12-19T10:05:03.293+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "FAILED"
    //   },
    //   {
    //     "dateUpdatedOn": "2024-04-03T07:00:38.337+0000",
    //     "identifier": "328b07c5-e081-481b-b688-ea9336c94806",
    //     "totalRecords": 1335,
    //     "fileName": "1712127636065_1709802899723_7 3 24.xlsx",
    //     "successfulRecordsCount": 0,
    //     "failedRecordsCount": 309,
    //     "filePath": "https://static.karmayogiprod.nic.in/sb-cb-ext-dev/bulkupload/1712127636065_1709802899723_7%203%2024.xlsx",
    //     "comment": "",
    //     "dateCreatedOn": "2024-04-03T07:00:36.688+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "FAILED"
    //   },
    //   {
    //     "dateUpdatedOn": "2025-03-03T13:23:26.528+0000",
    //     "identifier": "37d4cb2c-3a08-4352-a1d7-cd375c0cd838",
    //     "totalRecords": 1,
    //     "fileName": "1741008205671_user-bulk-upload-sample.csv",
    //     "successfulRecordsCount": 0,
    //     "failedRecordsCount": 1,
    //     "filePath": "https://storage.googleapis.com/sb-cb-ext-dev/bulkupload/1741008205671_user-bulk-upload-sample.csv",
    //     "comment": "",
    //     "dateCreatedOn": "2025-03-03T13:23:26.175+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "FAILED"
    //   },
    //   {
    //     "dateUpdatedOn": "2025-01-27T06:38:57.744+0000",
    //     "identifier": "4e0e3989-b0a2-4528-b711-adff3e5f644e",
    //     "totalRecords": 0,
    //     "fileName": "1737959937264_user-bulk-upload-sample.csv",
    //     "successfulRecordsCount": 0,
    //     "failedRecordsCount": 0,
    //     "filePath": "https://storage.googleapis.com/sb-cb-ext-dev/bulkupload/1737959937264_user-bulk-upload-sample.csv",
    //     "comment": "",
    //     "dateCreatedOn": "2025-01-27T06:38:57.656+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "FAILED"
    //   },
    //   {
    //     "dateUpdatedOn": "2025-01-27T06:29:48.040+0000",
    //     "identifier": "5d6f7cdd-ac38-470e-b880-da592877a4de",
    //     "totalRecords": 4,
    //     "fileName": "1737959213474_user-bulk-upload-sample.csv",
    //     "successfulRecordsCount": 0,
    //     "failedRecordsCount": 4,
    //     "filePath": "https://storage.googleapis.com/sb-cb-ext-dev/bulkupload/1737959213474_user-bulk-upload-sample.csv",
    //     "comment": "",
    //     "dateCreatedOn": "2025-01-27T06:26:53.799+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "FAILED"
    //   },
    //   {
    //     "dateUpdatedOn": "2024-04-02T11:39:26.604+0000",
    //     "identifier": "5d714262-7ac1-49f1-8cc2-c3397157b160",
    //     "totalRecords": 8,
    //     "fileName": "1712057966092_1709813352050_7 3 24 again.xlsx",
    //     "successfulRecordsCount": 0,
    //     "failedRecordsCount": 0,
    //     "filePath": "https://static.karmayogiprod.nic.in/sb-cb-ext-dev/bulkupload/1712057966092_1709813352050_7%203%2024%20again.xlsx",
    //     "comment": "",
    //     "dateCreatedOn": "2024-04-02T11:39:26.287+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "FAILED"
    //   },
    //   {
    //     "dateUpdatedOn": "2025-04-04T07:37:47.011+0000",
    //     "identifier": "61569190-7159-47f3-a9e0-06e304504d0e",
    //     "totalRecords": 4,
    //     "fileName": "1743752265438_user-bulk-upload-sample.csv",
    //     "successfulRecordsCount": 0,
    //     "failedRecordsCount": 4,
    //     "filePath": "https://storage.googleapis.com/sb-cb-ext-dev/bulkupload/1743752265438_user-bulk-upload-sample.csv",
    //     "comment": "",
    //     "dateCreatedOn": "2025-04-04T07:37:46.477+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "FAILED"
    //   },
    //   {
    //     "dateUpdatedOn": "2025-03-03T11:26:26.825+0000",
    //     "identifier": "630d6ed2-878f-4f41-9554-0b4c8aff0abb",
    //     "totalRecords": 0,
    //     "fileName": "1741001185884_TestBulkerrorlistdevtwo.csv",
    //     "successfulRecordsCount": 0,
    //     "failedRecordsCount": 1,
    //     "filePath": "https://storage.googleapis.com/sb-cb-ext-dev/bulkupload/1741001185884_TestBulkerrorlistdevtwo.csv",
    //     "comment": "",
    //     "dateCreatedOn": "2025-03-03T11:26:26.453+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "FAILED"
    //   },
    //   {
    //     "dateUpdatedOn": null,
    //     "identifier": "64ec89b7-64f0-4e81-89fc-48fea7a601cf",
    //     "totalRecords": null,
    //     "fileName": "1737958474848_user-bulk-upload-default-values.xlsx",
    //     "successfulRecordsCount": null,
    //     "failedRecordsCount": null,
    //     "filePath": "https://storage.googleapis.com/sb-cb-ext-dev/bulkupload/1737958474848_user-bulk-upload-default-values.xlsx",
    //     "comment": "",
    //     "dateCreatedOn": "2025-01-27T06:14:36.199+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "INITIATED"
    //   },
    //   {
    //     "dateUpdatedOn": "2025-01-22T14:52:05.461+0000",
    //     "identifier": "6ac6bdcc-422b-44ff-9823-8b3a56919a5c",
    //     "totalRecords": 0,
    //     "fileName": "1737557525123_TestBulkerrorlistdevtwo.csv",
    //     "successfulRecordsCount": 0,
    //     "failedRecordsCount": 1,
    //     "filePath": "https://storage.googleapis.com/sb-cb-ext-dev/bulkupload/1737557525123_TestBulkerrorlistdevtwo.csv",
    //     "comment": "",
    //     "dateCreatedOn": "2025-01-22T14:52:05.311+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "FAILED"
    //   },
    //   {
    //     "dateUpdatedOn": "2025-01-22T12:06:04.605+0000",
    //     "identifier": "73f9fb3d-806b-4352-bb03-c035af3835bb",
    //     "totalRecords": 3,
    //     "fileName": "1737547563757_TestBulkUserDevOne.csv",
    //     "successfulRecordsCount": 1,
    //     "failedRecordsCount": 2,
    //     "filePath": "https://storage.googleapis.com/sb-cb-ext-dev/bulkupload/1737547563757_TestBulkUserDevOne.csv",
    //     "comment": "",
    //     "dateCreatedOn": "2025-01-22T12:06:04.099+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "FAILED"
    //   },
    //   {
    //     "dateUpdatedOn": "2025-12-19T10:05:49.701+0000",
    //     "identifier": "82c821f4-931c-4fac-90db-c212b8fa9933",
    //     "totalRecords": 1,
    //     "fileName": "1766138749070_bulk-upload.csv",
    //     "successfulRecordsCount": 1,
    //     "failedRecordsCount": 0,
    //     "filePath": "https://storage.googleapis.com/sb-cb-ext-dev/bulkupload/1766138749070_bulk-upload.csv",
    //     "comment": "",
    //     "dateCreatedOn": "2025-12-19T10:05:49.193+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "SUCCESSFUL"
    //   },
    //   {
    //     "dateUpdatedOn": "2025-01-27T06:38:08.206+0000",
    //     "identifier": "8e2a4d16-55ed-42ce-bcf0-ee38f481e6a9",
    //     "totalRecords": 4,
    //     "fileName": "1737959711678_user-bulk-upload-sample.csv",
    //     "successfulRecordsCount": 0,
    //     "failedRecordsCount": 4,
    //     "filePath": "https://storage.googleapis.com/sb-cb-ext-dev/bulkupload/1737959711678_user-bulk-upload-sample.csv",
    //     "comment": "",
    //     "dateCreatedOn": "2025-01-27T06:35:13.270+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "FAILED"
    //   },
    //   {
    //     "dateUpdatedOn": "2025-04-04T07:42:15.430+0000",
    //     "identifier": "8f001f56-3345-4912-aa6a-75cc67c72ce8",
    //     "totalRecords": 1,
    //     "fileName": "1743752535024_user-bulk-upload-sample.csv",
    //     "successfulRecordsCount": 1,
    //     "failedRecordsCount": 0,
    //     "filePath": "https://storage.googleapis.com/sb-cb-ext-dev/bulkupload/1743752535024_user-bulk-upload-sample.csv",
    //     "comment": "",
    //     "dateCreatedOn": "2025-04-04T07:42:15.217+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "SUCCESSFUL"
    //   },
    //   {
    //     "dateUpdatedOn": "2025-01-27T07:01:39.950+0000",
    //     "identifier": "91d3d136-e913-4279-8c55-cb9e60af3918",
    //     "totalRecords": 4,
    //     "fileName": "1737961154406_user-bulk-upload-sample.csv",
    //     "successfulRecordsCount": 2,
    //     "failedRecordsCount": 2,
    //     "filePath": "https://storage.googleapis.com/sb-cb-ext-dev/bulkupload/1737961154406_user-bulk-upload-sample.csv",
    //     "comment": "",
    //     "dateCreatedOn": "2025-01-27T06:59:16.028+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "FAILED"
    //   },
    //   {
    //     "dateUpdatedOn": "2025-03-07T11:38:16.680+0000",
    //     "identifier": "9bb202e4-f2a8-4c77-b25c-a5f06afb639e",
    //     "totalRecords": 3,
    //     "fileName": "1741347495930_testmdo.csv",
    //     "successfulRecordsCount": 0,
    //     "failedRecordsCount": 3,
    //     "filePath": "https://storage.googleapis.com/sb-cb-ext-dev/bulkupload/1741347495930_testmdo.csv",
    //     "comment": "",
    //     "dateCreatedOn": "2025-03-07T11:38:16.472+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "FAILED"
    //   },
    //   {
    //     "dateUpdatedOn": "2025-01-22T11:57:05.604+0000",
    //     "identifier": "9f43d22b-a266-485e-9dc9-92f16f4f4db3",
    //     "totalRecords": 3,
    //     "fileName": "1737547025097_user-bulk-upload-modified.csv",
    //     "successfulRecordsCount": 0,
    //     "failedRecordsCount": 3,
    //     "filePath": "https://storage.googleapis.com/sb-cb-ext-dev/bulkupload/1737547025097_user-bulk-upload-modified.csv",
    //     "comment": "",
    //     "dateCreatedOn": "2025-01-22T11:57:05.293+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "FAILED"
    //   },
    //   {
    //     "dateUpdatedOn": "2025-03-06T12:51:21.188+0000",
    //     "identifier": "adbcc641-7c29-44a8-8e88-a2f664901c1d",
    //     "totalRecords": 1,
    //     "fileName": "1741265479651_user-bulk-upload-sample.csv",
    //     "successfulRecordsCount": 0,
    //     "failedRecordsCount": 1,
    //     "filePath": "https://storage.googleapis.com/sb-cb-ext-dev/bulkupload/1741265479651_user-bulk-upload-sample.csv",
    //     "comment": "",
    //     "dateCreatedOn": "2025-03-06T12:51:20.638+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "FAILED"
    //   },
    //   {
    //     "dateUpdatedOn": "2025-03-07T13:10:26.218+0000",
    //     "identifier": "c4cbf5ca-7cd0-4784-bd93-2352c23f764a",
    //     "totalRecords": 1,
    //     "fileName": "1741353025565_user-bulk-upload-sample.csv",
    //     "successfulRecordsCount": 0,
    //     "failedRecordsCount": 1,
    //     "filePath": "https://storage.googleapis.com/sb-cb-ext-dev/bulkupload/1741353025565_user-bulk-upload-sample.csv",
    //     "comment": "",
    //     "dateCreatedOn": "2025-03-07T13:10:26.070+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "FAILED"
    //   },
    //   {
    //     "dateUpdatedOn": null,
    //     "identifier": "c906868f-ffd8-4810-8215-cbf3b2d4bbff",
    //     "totalRecords": null,
    //     "fileName": "1737958277436_user-bulk-upload-sample.csv",
    //     "successfulRecordsCount": null,
    //     "failedRecordsCount": null,
    //     "filePath": "https://storage.googleapis.com/sb-cb-ext-dev/bulkupload/1737958277436_user-bulk-upload-sample.csv",
    //     "comment": "",
    //     "dateCreatedOn": "2025-01-27T06:11:19.460+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "INITIATED"
    //   },
    //   {
    //     "dateUpdatedOn": null,
    //     "identifier": "e9b7842e-d461-4ab5-b90a-9cc8911b0eca",
    //     "totalRecords": null,
    //     "fileName": "1737959092414_Ranjit.txt",
    //     "successfulRecordsCount": null,
    //     "failedRecordsCount": null,
    //     "filePath": "https://storage.googleapis.com/sb-cb-ext-dev/bulkupload/1737959092414_Ranjit.txt",
    //     "comment": "",
    //     "dateCreatedOn": "2025-01-27T06:24:52.957+0000",
    //     "rootOrgId": "01376822290813747263",
    //     "status": "INITIATED"
    //   }
    // ]

    // this.lastUploadList = this.lastUploadList.sort((a, b) => new Date(b.dateCreatedOn).getTime() - new Date(a.dateCreatedOn).getTime())
  }

  ngOnInit() {
    this.getLogs()
  }

  getLogs() {
    this.externalTrainingsSvc.getFileLogs(this.trainingId, this.batchId).subscribe((res: any) => {
      if (res && res.result && res.result.content) {
        this.lastUploadList = res.result.content.sort((a: any, b: any) => new Date(b.dateCreatedOn).getTime() - new Date(a.dateCreatedOn).getTime())
      }
    }, error => {
      console.log(error)
    })
  }

  onChangePage(pe: PageEvent) {
    this.startIndex = pe.pageIndex * pe.pageSize
    this.lastIndex = (pe.pageIndex + 1) * pe.pageSize
  }

  handleChangePage(_event: PageEvent): void {
    this.pageSize = _event.pageSize
    this.startIndex = (_event.pageIndex) * _event.pageSize
    this.lastIndex = this.startIndex + _event.pageSize
  }

  handleDownloadFile(listObj: any): void {
    const filePath = `/apis/proxies/v8/externaltraining/v1/bulkuser/download/${listObj.fileName}`
    window.open(filePath, '_blank')
  }

}
