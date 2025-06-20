import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsRoutingModule } from './custom-forms-routing.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyFormFieldModule as MatFormFieldModule, MatLegacyFormFieldModule } from '@angular/material/legacy-form-field'
import { MatLegacyButtonModule } from '@angular/material/legacy-button'
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu'
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input'
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio'
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select'
import { MatLegacyCheckboxModule } from '@angular/material/legacy-checkbox'
import { FormsListComponent } from './forms-list/forms-list.component'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatLegacyTabsModule } from '@angular/material/legacy-tabs'
import { MatDialogModule } from '@angular/material/dialog'
import { MatLegacyTooltipModule } from '@angular/material/legacy-tooltip'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator'
import { MatSortModule } from '@angular/material/sort'
import { CreateFormComponent } from './create-form/create-form.component'
import { BaseComponent } from './base/base.component'
import { CustomInputTextComponent } from './custom-input-text/custom-input-text.component'
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle'
import { UIORGTableModule } from '@sunbird-cb/collection'
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'
import { ConfirmDeleteComponent } from './confirm-delete/confirm-delete.component'
import { CustomFieldsService } from '../../../users/custom-fields.service'
@NgModule({
  declarations: [
    FormsListComponent,
    CreateFormComponent,
    BaseComponent,
    CustomInputTextComponent,
    ConfirmDeleteComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormsRoutingModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatLegacyButtonModule,
    MatMenuModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatLegacyCheckboxModule,
    MatLegacyTabsModule,
    MatDialogModule,
    MatLegacyFormFieldModule,
    MatLegacyTooltipModule,
    MatMenuModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatLegacyCheckboxModule,
    MatCardModule,
    MatSnackBarModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatLegacyTabsModule,
    MatSortModule,
    MatSlideToggleModule,
    UIORGTableModule,
    MatProgressSpinnerModule,
  ],
  providers: [CustomFieldsService, MatDialogModule]
})
export class CustomFormsModule { }
