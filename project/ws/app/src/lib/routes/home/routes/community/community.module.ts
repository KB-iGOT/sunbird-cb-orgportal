import { NgModule } from '@angular/core'
import { CommonModule, DatePipe } from '@angular/common'

import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatLegacyButtonModule } from '@angular/material/legacy-button'
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog'
import { MatLegacyProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'
import { MatLegacyFormFieldModule } from '@angular/material/legacy-form-field'
import { MatLegacyTooltipModule } from '@angular/material/legacy-tooltip'
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu'
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input'
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio'
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select'
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field'
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table'
import { MatIconModule } from '@angular/material/icon'
import { MatStepperModule } from '@angular/material/stepper'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatLegacyPaginatorModule } from '@angular/material/legacy-paginator'
import { MatLegacyCheckboxModule } from '@angular/material/legacy-checkbox'
import { MatLegacyAutocompleteModule } from '@angular/material/legacy-autocomplete'
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs'
import { WidgetResolverModule } from '@sunbird-cb/resolver'
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker'
import { CarouselModule } from 'ngx-owl-carousel-o'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { MatSortModule } from '@angular/material/sort'
import { ComponentSharedModule } from '../../../workallocation-v2/components/component-shared.module'
import { CommunityDashboardComponent } from './components/community-dashboard/community-dashboard.component'
import { CommunityRoutingModule } from './community-routing.module'
import { CommunityService } from './services/community.service'
import { CKEditorModule } from '@ckeditor/ckeditor5-angular'
import { CommunityCreationComponent } from './components/community-creation/community-creation.component'
import { CommunityBasicDetailsComponent } from './components/community-basic-details/community-basic-details.component'
import { AddModeratorComponent } from './components/add-moderator/add-moderator.component'
import { CommunityCompetencyComponent } from './components/community-competency/community-competency.component'
import { CompetencyAddModule } from '../../../../common/competency-add/competency-add.module'
import { EventsService } from '../events-2/services/events.service'

import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips'
import { TooltipDirective } from './directive/tooltip.directive'
import { TooltipComponent } from './directive/tooltip/tooltip.component'
import { CompTooltipDirective } from '../../../state-profile/directives/tooltip.directive'


@NgModule({
  declarations: [
    CommunityDashboardComponent,
    CommunityCreationComponent,
    CommunityBasicDetailsComponent,
    AddModeratorComponent,
    CommunityCompetencyComponent,
    TooltipComponent,
    TooltipDirective,
    CompTooltipDirective
  ],
  imports: [
    CommonModule,
    CommunityRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatLegacyButtonModule,
    MatDialogModule,
    MatLegacyProgressSpinnerModule,
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
    MatLegacyPaginatorModule,
    MatStepperModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatLegacyAutocompleteModule,
    MatTabsModule,
    WidgetResolverModule,
    NgxMaterialTimepickerModule,
    CarouselModule,
    DragDropModule,
    MatSortModule,
    ComponentSharedModule,
    CKEditorModule,
    CompetencyAddModule,
    MatChipsModule
  ],
  providers: [
    DatePipe,
    CommunityService,
    EventsService
  ],
  // Removed entryComponents as it is no longer required in Angular 9+
})
export class CommunityModule { }
