import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfirmationBoxComponent } from '../../../../../training-plan/components/confirmation-box/confirmation.box.component'
import { MatLegacyDialog } from '@angular/material/legacy-dialog'

@Component({
  selector: 'ws-app-create-request-form-v2',
  templateUrl: './create-request-form-v2.component.html',
  styleUrls: ['./create-request-form-v2.component.scss']
})
export class CreateRequestFormV2Component implements OnInit {

  viewMode: string = 'Create'
  isHideData = false
  dialogRefs: any

  constructor(
    private router: Router,
    public dialog: MatLegacyDialog,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.routeSubscription()
  }
  routeSubscription() {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
        this.viewMode = params.name
      }
    })
  }

  //#region (interactions)
  navigateBack() {
    this.router.navigateByUrl('/app/home/request-list')
  }

  showDialogBox(event: any) {
    this.dialogRefs?.close()
    const dialogData: any = {}
    switch (event) {
      case 'progress':
        dialogData['type'] = 'progress'
        dialogData['icon'] = 'vega'
        dialogData['title'] = 'Processing your request'
        dialogData['subTitle'] = `Wait a second , your request is processing………`
        break
      case 'progress-completed':
        dialogData['type'] = 'progress-completed'
        dialogData['icon'] = 'accept_icon'
        dialogData['title'] = 'Processing your request'
        dialogData['subTitle'] = `Wait a second , your request is processing………`
        dialogData['primaryAction'] = 'Successfully created....'
        break
    }

    if (event) {
      this.openDialoagBox(dialogData)
    }
  }

  openDialoagBox(dialogData: any) {
    this.dialogRefs = this.dialog.open(ConfirmationBoxComponent, {
      disableClose: true,
      data: {
        type: dialogData.type,
        icon: dialogData.icon,
        title: dialogData.title,
        subTitle: dialogData.subTitle,
        primaryAction: dialogData.primaryAction,
        secondaryAction: dialogData.secondaryAction,
      },
      autoFocus: false,
    })

    this.dialogRefs.afterClosed().subscribe(() => {
    })
  }
  //#endregion

}
