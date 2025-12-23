import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { CreateRequestRoutingModule } from './create-request-routing.module'
import { AddUserPopupComponent } from './dialogs/add-user-popup/add-user-popup.component'
import { CreateRequestFormV2Component } from './components/create-request-form-v2/create-request-form-v2.component'
import { CreateRequestContentDetailsComponent } from './components/create-request-content-details/create-request-content-details.component'
import { CreateRequestAdditionalDetailsComponent } from './components/create-request-additional-details/create-request-additional-details.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { HttpClientModule } from '@angular/common/http'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyButtonModule } from '@angular/material/legacy-button'
import { MatLegacyCheckboxModule } from '@angular/material/legacy-checkbox'
import { MatLegacyChipsModule } from '@angular/material/legacy-chips'
import { MatLegacyOptionModule } from '@angular/material/legacy-core'
import { MatLegacyDialogModule } from '@angular/material/legacy-dialog'
import { MatLegacyFormFieldModule } from '@angular/material/legacy-form-field'
import { MatLegacyInputModule } from '@angular/material/legacy-input'
import { MatLegacySelectModule } from '@angular/material/legacy-select'
import { RouterModule } from '@angular/router'
import { HorizontalDynamicStepperModule } from '@sunbird-cb/consumption'
import { MatLegacyCardModule } from '@angular/material/legacy-card'
import { MatLegacyRadioModule } from '@angular/material/legacy-radio'
import { MatLegacyTooltipModule } from '@angular/material/legacy-tooltip'


@NgModule({
  declarations: [
    CreateRequestFormV2Component,
    CreateRequestContentDetailsComponent,
    CreateRequestAdditionalDetailsComponent,
    AddUserPopupComponent
  ],
  imports: [
    CommonModule,
    CreateRequestRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatLegacyFormFieldModule,
    MatIconModule,
    MatLegacyChipsModule,
    MatLegacyOptionModule,
    MatLegacySelectModule,
    MatLegacyInputModule,
    MatLegacyButtonModule,
    MatLegacyCheckboxModule,
    MatLegacyDialogModule,
    MatLegacyCardModule,
    MatLegacyRadioModule,
    MatLegacyTooltipModule,
    HttpClientModule,
    HorizontalDynamicStepperModule,
  ]
})
export class CreateRequestModule { }
