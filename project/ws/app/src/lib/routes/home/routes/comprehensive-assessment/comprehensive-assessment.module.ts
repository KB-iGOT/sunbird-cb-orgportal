import { NgModule } from '@angular/core'
import { CommonModule, DatePipe } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatSortModule } from '@angular/material/sort'
import { MatTableModule } from '@angular/material/table'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatRadioModule } from '@angular/material/radio'
import { MatSelectModule } from '@angular/material/select'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatStepperModule } from '@angular/material/stepper'
import { MatTooltipModule } from '@angular/material/tooltip'
import { CKEditorModule } from '@ckeditor/ckeditor5-angular'
import { AssessmentModule } from '@sunbird-cb/consumption'
import { AppTocLibModule } from '@sunbird-cb/toc'
import { ComprehensiveAssessmentRoutingModule } from './comprehensive-assessment-routing.module'
import { ComprehensiveAssessmentsComponent } from './components/comprehensive-assessments/comprehensive-assessments.component'
import { CreateAssessmentComponent } from './components/create-assessment/create-assessment.component'
import { AssessmentBasicDetailsComponent } from './components/assessment-basic-details/assessment-basic-details.component'
import { AssessmentBuilderComponent } from './components/assessment-builder/assessment-builder.component'
import { AssessmentPreviewComponent } from './components/assessment-preview/assessment-preview.component'
import { AssessmentsListComponent } from './components/assessments-list/assessments-list.component'
import { AssessmentsTableComponent } from './components/assessments-table/assessments-table.component'
import { BasicInfoComponent } from './dialogs/basic-info/basic-info.component'
import { PlanPickerComponent } from './dialogs/plan-picker/plan-picker.component'
import { ComprehensiveAssessmentService } from './services/comprehensive-assessment.service'
import { AssessmentResolverService } from './services/assessment-resolver'
import { ComponentSharedModule } from '../../../workallocation-v2/components/component-shared.module'
import { PipePublicURLModule } from '@sunbird-cb/utils-v2'

@NgModule({
  declarations: [
    ComprehensiveAssessmentsComponent,
    CreateAssessmentComponent,
    AssessmentBasicDetailsComponent,
    AssessmentBuilderComponent,
    AssessmentPreviewComponent,
    AssessmentsListComponent,
    AssessmentsTableComponent,
    BasicInfoComponent,
    PlanPickerComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
    MatSnackBarModule,
    MatStepperModule,
    MatTooltipModule,
    CKEditorModule,
    AssessmentModule,
    AppTocLibModule,
    ComponentSharedModule,
    PipePublicURLModule,
    ComprehensiveAssessmentRoutingModule,
  ],
  providers: [
    DatePipe,
    ComprehensiveAssessmentService,
    AssessmentResolverService,
  ],
})
export class ComprehensiveAssessmentModule { }
