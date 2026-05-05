import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
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
import { MatCardModule } from '@angular/material/card'
import { MatTabsModule } from '@angular/material/tabs'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatSortModule } from '@angular/material/sort'
import { BaseComponent } from './base/base.component'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { UIORGTableModule } from '@sunbird-cb/collection'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDialogModule } from '@angular/material/dialog'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'
import { ListComponent } from './list/list.component'
import { ExternalTrainingsRoutingModule } from './external-trainings-routing.module'
import { ExternalTrainingsService } from '../../services/external-trainings.service'
import { DetailsComponent } from './details/details.component'
import { BatchesComponent } from './batches/batches.component'
import { TrainingViewComponent } from './training-view/training-view.component'
import { CreateBatchComponent } from './create-batch/create-batch.component'
import { NewExternalTrainingComponent } from './new-external-training/new-external-training.component'
import { CompetenciesModule } from '@sunbird-cb/consumption'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { BatchDetailsComponent } from './batch-details/batch-details.component'
import { AvatarPhotoModule } from '@sunbird-cb/collection'
import { FileLogsComponent } from './file-logs/file-logs.component'
import { PipeOrderByModule } from '@sunbird-cb/utils-v2'

@NgModule({
  declarations: [
    BaseComponent,
    ListComponent,
    DetailsComponent,
    BatchesComponent,
    TrainingViewComponent,
    NewExternalTrainingComponent,
    CreateBatchComponent,
    BatchDetailsComponent,
    FileLogsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ExternalTrainingsRoutingModule,
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
    MatDatepickerModule,
    MatNativeDateModule,
    CompetenciesModule,
    MatSnackBarModule,
    AvatarPhotoModule,
    PipeOrderByModule,
  ],
  providers: [
    ExternalTrainingsService
  ]
})
export class ExternalTrainingsModule { }
