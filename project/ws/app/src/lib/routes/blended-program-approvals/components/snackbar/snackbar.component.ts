import { Component, Inject } from '@angular/core'
import { MAT_SNACK_BAR_DATA, MatSnackBarRef as MatSnackBarRef } from '@angular/material/snack-bar'

@Component({
  selector: 'ws-app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss'],
  standalone: false
})
export class SnackbarComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: { message: string, type: 'success | error' },
    public snackBarRef: MatSnackBarRef<SnackbarComponent>
  ) { }
}
