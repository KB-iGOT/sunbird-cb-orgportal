import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsRoutingModule } from './custom-forms-routing.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatTableModule } from '@angular/material/table'
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatButtonModule } from '@angular/material/button'
import { MatMenuModule } from '@angular/material/menu'
import { MatInputModule } from '@angular/material/input'
import { MatRadioModule } from '@angular/material/radio'
import { MatSelectModule } from '@angular/material/select'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { FormsListComponent } from './forms-list/forms-list.component'
import { MatCardModule } from '@angular/material/card'
import { MatTabsModule } from '@angular/material/tabs'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatSortModule } from '@angular/material/sort'
import { CreateFormComponent } from './create-form/create-form.component'
import { BaseComponent } from './base/base.component'
import { CustomInputTextComponent } from './custom-input-text/custom-input-text.component'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { UIORGTableModule } from '@sunbird-cb/collection'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { ConfirmDeleteComponent } from './confirm-delete/confirm-delete.component'
import { CustomFieldsService } from '../../../users/custom-fields.service'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDialogModule } from '@angular/material/dialog'
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
    MatButtonModule,
    MatMenuModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTabsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatMenuModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatSnackBarModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatTabsModule,
    MatSortModule,
    MatSlideToggleModule,
    UIORGTableModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
  ],
  providers: [CustomFieldsService]
})
export class CustomFormsModule { }
