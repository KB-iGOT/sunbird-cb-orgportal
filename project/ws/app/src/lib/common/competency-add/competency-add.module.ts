import { NgModule } from '@angular/core'
import { CommonService } from '../services/common-service.service'
import { CompetencyAddComponent } from './competency-add.component'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'

// Choose either legacy or non-legacy modules consistently
// Non-legacy modules
import { MatIconModule } from '@angular/material/icon'
// import { MatButtonModule } from '@angular/material/button'
// import { MatInputModule } from '@angular/material/input'
// import { MatSelectModule } from '@angular/material/select'
// import { MatCheckboxModule } from '@angular/material/checkbox'
// import { MatDialogModule } from '@angular/material/dialog'

// Legacy modules
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog'

@NgModule({
  declarations: [CompetencyAddComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Choose ONE set of modules - either legacy OR non-legacy
    // Remove the duplicate MatDialogModule
    // Example using legacy modules:
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule
  ],
  exports: [CompetencyAddComponent],
  providers: [CommonService]
})
export class CompetencyAddModule { }
