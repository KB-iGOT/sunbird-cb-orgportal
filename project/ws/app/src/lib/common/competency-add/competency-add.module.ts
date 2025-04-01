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
import { MatLegacySnackBarModule } from '@angular/material/legacy-snack-bar'
import { MatLegacyFormFieldModule } from '@angular/material/legacy-form-field'
import { MatLegacyInputModule } from '@angular/material/legacy-input'
import { MatLegacySelectModule } from '@angular/material/legacy-select'
import { MatLegacyCheckboxModule } from '@angular/material/legacy-checkbox'
import { MatLegacyButtonModule } from '@angular/material/legacy-button'
import { MatLegacyDialogModule } from '@angular/material/legacy-dialog'

@NgModule({
  declarations: [CompetencyAddComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Choose ONE set of modules - either legacy OR non-legacy
    // Remove the duplicate MatLegacyDialogModule
    // Example using legacy modules:
    MatIconModule,
    MatLegacyButtonModule,
    MatLegacyInputModule,
    MatLegacySelectModule,
    MatLegacyCheckboxModule,
    MatLegacyDialogModule,
    MatLegacySnackBarModule,
    MatLegacyFormFieldModule
  ],
  exports: [CompetencyAddComponent],
  providers: [CommonService]
})
export class CompetencyAddModule { }
