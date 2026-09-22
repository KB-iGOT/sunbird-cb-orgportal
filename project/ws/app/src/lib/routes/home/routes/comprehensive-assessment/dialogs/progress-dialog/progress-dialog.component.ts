import { Component, Inject } from '@angular/core'
import { MAT_DIALOG_DATA } from '@angular/material/dialog'

/**
 * Holds the screen while the platform finishes something the api has already taken. It says
 * what is happening and offers nothing to click: the caller opens it with `disableClose` and
 * closes it itself once the wait is over.
 */
@Component({
  selector: 'ws-app-comprehensive-assessment-progress',
  templateUrl: './progress-dialog.component.html',
  styleUrls: ['./progress-dialog.component.scss'],
  standalone: false,
})
export class ProgressDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

}
