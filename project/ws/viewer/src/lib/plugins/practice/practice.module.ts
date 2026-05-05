import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { PracticeComponent } from './practice.component'
import { OverviewComponent } from './components/overview/overview.component'
import { QuestionComponent } from './components/question/question.component'
import { SubmitQuizDialogComponent } from './components/submit-quiz-dialog/submit-quiz-dialog.component'

import { PipeDurationTransformModule, PipeLimitToModule } from '@sunbird-cb/utils-v2'

import {
    BtnFullscreenModule
} from '@sunbird-cb/collection'
import { ContentTocModule } from '@sunbird-cb/toc'
import { ResultComponent } from './components/result/result.component'
import { FillInTheBlankComponent } from './components/question/fitb/fitb.component'
import { MultipleChoiseQuesComponent } from './components/question/mcq-mca/mcq-mca.component'
import { SingleChoiseQuesComponent } from './components/question/mcq-sca/mcq-sca.component'
import { MatchTheFollowingQuesComponent } from './components/question/mtf/mtf.component'
import { TranslateModule } from '@ngx-translate/core'
import { StandaloneAssessmentComponent } from './components/standalone-assessment/standalone-assessment.component'
import { AssessmentHeaderComponent } from './components/assessment-header/assessment-header.component'
import { AssessmentFooterComponent } from './components/assessment-footer/assessment-footer.component'
import { AssessmentQuestionContainerComponent } from './components/assessment-question-container/assessment-question-container.component'
import { AssessmentQuestionCountContainerComponent } from './components/assessment-question-count-container/assessment-question-count-container.component'
import { AssessmentPerformanceSummaryComponent } from './components/assessment-performance-summary/assessment-performance-summary.component'
import { AssessmentPerformanceInsightSummaryComponent } from './components/assessment-performance-insight-summary/assessment-performance-insight-summary.component'
import { FinalAssessmentPopupComponent } from './components/final-assessment-popup/final-assessment-popup.component'
import { QuestionSafeUrlPipe } from './question-safe-pipe.pipe'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatIconModule } from '@angular/material/icon'
import { MatSidenavModule } from '@angular/material/sidenav'
import { ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatChipsModule } from '@angular/material/chips'
import { MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatRadioModule } from '@angular/material/radio'
import { MatSelectModule } from '@angular/material/select'
import { MatTableModule } from '@angular/material/table'
import { MatTooltipModule } from '@angular/material/tooltip'
import { SkeletonLoaderModule } from '../../components/skeleton-loader/skeleton-loader.module'
import { ReplaceNbspPipe } from '../../pipes/replace-nbsp.pipe'
@NgModule({
    declarations: [
        FillInTheBlankComponent,
        MatchTheFollowingQuesComponent,
        MultipleChoiseQuesComponent,
        OverviewComponent,
        PracticeComponent,
        QuestionComponent,
        ResultComponent,
        SingleChoiseQuesComponent,
        SubmitQuizDialogComponent,
        StandaloneAssessmentComponent,
        AssessmentHeaderComponent,
        AssessmentFooterComponent,
        AssessmentQuestionContainerComponent,
        AssessmentQuestionCountContainerComponent,
        AssessmentPerformanceSummaryComponent,
        AssessmentPerformanceInsightSummaryComponent,
        FinalAssessmentPopupComponent,
        QuestionSafeUrlPipe,
        ReplaceNbspPipe
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        PipeDurationTransformModule,
        PipeLimitToModule,
        MatCardModule,
        MatDialogModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
        MatListModule,
        MatProgressBarModule,
        MatRadioModule,
        MatSidenavModule,
        MatExpansionModule,
        MatTableModule,
        MatButtonModule,
        BtnFullscreenModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatChipsModule,
        SkeletonLoaderModule,
        TranslateModule,
        MatMenuModule,
        MatSelectModule,
        ContentTocModule,
    ],
    exports: [
        PracticeComponent,
        StandaloneAssessmentComponent,
        AssessmentHeaderComponent,
        AssessmentFooterComponent,
        AssessmentQuestionContainerComponent,
        AssessmentQuestionCountContainerComponent,
        AssessmentPerformanceSummaryComponent,
        AssessmentPerformanceInsightSummaryComponent,
        ReplaceNbspPipe
    ],
})
export class PracticePlModule { }
