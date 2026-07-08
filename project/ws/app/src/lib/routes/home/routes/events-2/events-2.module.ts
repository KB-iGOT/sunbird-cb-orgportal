import { NgModule } from '@angular/core'
import { CommonModule, DatePipe } from '@angular/common'

import { Events2RoutingModule } from './events-2-routing.module'
import { EventsComponent } from './components/events/events.component'
import { CreateEventComponent } from './components/create-event/create-event.component'
import { EventBasicDetailsComponent } from './components/event-basic-details/event-basic-details.component'
import { SpeakersComponent } from './components/speakers/speakers.component'
import { EventMaterialsComponent } from './components/event-materials/event-materials.component'
import { EventCompetenciesComponent } from './components/event-competencies/event-competencies.component'
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
import { EventsTableComponent } from './components/events-table/events-table.component'
import { MatCardModule } from '@angular/material/card'
import { MatTableModule } from '@angular/material/table'
import { MatIconModule } from '@angular/material/icon'
import { EventsService } from './services/events.service'
import { BasicInfoComponent } from './dialogs/basic-info/basic-info.component'
import { MatStepperModule } from '@angular/material/stepper'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { AddSpeakersComponent } from './dialogs/add-speakers/add-speakers.component'
import { MaterialDetailsComponent } from './components/material-details/material-details.component'
import { EventsListComponent } from './components/events-list/events-list.component'
import { MatPaginatorModule } from '@angular/material/paginator'
import { EventResolverService } from './services/event-resolver'
import { EventCategoryResolverService } from './services/event-category-resolver'
import { AddCompetencyComponent } from './dialogs/add-competency/add-competency.component'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatChipsModule } from '@angular/material/chips'
import { EventsPreviewComponent } from './components/events-preview/events-preview.component'
import { YoutubePlayerComponent } from './dialogs/youtube-player/youtube-player.component'
import { MatTabsModule } from '@angular/material/tabs'
import { CardCompetencyComponent } from './components/card-competency/card-competency.component'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker'
import { RejectionReasonComponent } from './dialogs/rejection-reason/rejection-reason.component'
import { CarouselModule } from 'ngx-owl-carousel-o'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { MatSortModule } from '@angular/material/sort'
import { ComponentSharedModule } from '../../../workallocation-v2/components/component-shared.module'
import { CourseListingComponent } from './components/course-listing/course-listing.component'
import { EventDetailsComponent } from './components/event-details/event-details.component'


@NgModule({
  declarations: [
    EventsComponent,
    CreateEventComponent,
    EventBasicDetailsComponent,
    SpeakersComponent,
    EventMaterialsComponent,
    EventCompetenciesComponent,
    EventsTableComponent,
    BasicInfoComponent,
    AddSpeakersComponent,
    MaterialDetailsComponent,
    EventsListComponent,
    AddCompetencyComponent,
    EventsPreviewComponent,
    YoutubePlayerComponent,
    CardCompetencyComponent,
    RejectionReasonComponent,
    CourseListingComponent,
    EventDetailsComponent
  ],
  imports: [
    CommonModule,
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
    Events2RoutingModule,
    MatCardModule,
    MatSnackBarModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    MatStepperModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatTabsModule,
    SbUiResolverModule,
    NgxMaterialTimepickerModule,
    CarouselModule,
    DragDropModule,
    MatSortModule,
    ComponentSharedModule
  ],
  providers: [
    DatePipe,
    EventsService,
    EventResolverService,
    EventCategoryResolverService
  ]
})
export class Events2Module { }
