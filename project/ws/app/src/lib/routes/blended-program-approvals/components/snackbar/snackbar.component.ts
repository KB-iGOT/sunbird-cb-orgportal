import { Component, Inject } from '@angular/core'
import { MAT_LEGACY_SNACK_BAR_DATA as MAT_SNACK_BAR_DATA, MatLegacySnackBarRef as MatSnackBarRef } from '@angular/material/legacy-snack-bar'

@Component({
  selector: 'ws-app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss'],
})
export class SnackbarComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: { message: string, type: 'success | error' },
    public snackBarRef: MatSnackBarRef<SnackbarComponent>
  ) { }
}
