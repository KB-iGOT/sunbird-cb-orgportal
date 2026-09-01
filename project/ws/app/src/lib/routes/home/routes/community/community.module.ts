import { NgModule } from '@angular/core'
import { CommonModule, DatePipe } from '@angular/common'

import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatMenuModule } from '@angular/material/menu'
import { MatInputModule } from '@angular/material/input'
import { MatRadioModule } from '@angular/material/radio'
import { MatSelectModule } from '@angular/material/select'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatCardModule } from '@angular/material/card'
import { MatTableModule } from '@angular/material/table'
import { MatIconModule } from '@angular/material/icon'
import { MatStepperModule } from '@angular/material/stepper'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatTabsModule } from '@angular/material/tabs'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
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

import { MatChipsModule } from '@angular/material/chips'
import { TooltipDirective } from './directive/tooltip.directive'
import { TooltipComponent } from './directive/tooltip/tooltip.component'
import { CompTooltipDirective } from '../../../state-profile/directives/tooltip.directive'
import { CommunityManageComponent } from './components/community-manage/community-manage.component'
import { ReportIssueComponent } from './components/report-issue/report-issue.component'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { StripHtmlPipe } from './pipes/strip-html.pipe'
import { ImageSlidersComponent } from './components/image-sliders/image-sliders.component'
import { PipeRelativeTimePipe } from './pipes/pipe-relative-time/pipe-relative-time.pipe'
import { ProfileAvatarComponent } from './components/profile-avatar/profile-avatar.component'


@NgModule({
  declarations: [
    CommunityDashboardComponent,
    CommunityCreationComponent,
    CommunityBasicDetailsComponent,
    AddModeratorComponent,
    CommunityCompetencyComponent,
    TooltipComponent,
    TooltipDirective,
    CommunityManageComponent,
    ReportIssueComponent,
    StripHtmlPipe,
    ImageSlidersComponent,
    PipeRelativeTimePipe,
    ProfileAvatarComponent
  ],
  imports: [
    CommonModule,
    CompTooltipDirective,
    CommunityRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
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
    MatStepperModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    MatTabsModule,
    SbUiResolverModule,
    NgxMaterialTimepickerModule,
    CarouselModule,
    DragDropModule,
    MatSortModule,
    ComponentSharedModule,
    CKEditorModule,
    CompetencyAddModule,
    MatChipsModule,
    MatProgressBarModule
  ],
  providers: [
    DatePipe,
    CommunityService,
    EventsService
  ],
  // Removed entryComponents as it is no longer required in Angular 9+
})
export class CommunityModule { }
