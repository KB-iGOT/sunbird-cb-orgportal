import { Component, Inject, OnInit } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { TrainingPlanDataSharingService } from '../../services/training-plan-data-share.service'
@Component({
    selector: 'ws-app-confirmation-box',
    templateUrl: './confirmation-box.component.html',
    styleUrls: ['./confirmation-box.component.scss'],
    standalone: false
})
export class ConfirmationBoxComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ConfirmationBoxComponent>,
    private tpdsSvc: TrainingPlanDataSharingService
  ) { }

  ngOnInit() {
  }

  closeModal() {
    this.dialogRef.close()
  }

  performAction(data: any) {
    // A warning is acknowledged the same way a confirmation is, the caller decides whether that
    // answer carries the plan on to the next step or only closes the box
    if (data && (data.type === 'conformation' || data.type === 'warning')) {
      this.dialogRef.close('confirmed')
    } else {
      this.dialogRef.close()
      this.tpdsSvc.trainingPlanCategoryChangeEvent.next(data)
    }
  }
}
