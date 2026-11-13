import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core'
import { Subscription } from 'rxjs'
import { LoaderService } from '../../../../../../../../../../../src/app/services/loader.service'
import {
  aparPlan,
  comprehensiveAssessment,
  CONTENT_COURSE_CATEGORY,
  QUESTIONSET_PRIMARY_CATEGORY,
} from '../../models/comprehensive-assessment.model'
import { ComprehensiveAssessmentService } from '../../services/comprehensive-assessment.service'

/**
 * Step 2 of the builder. Delegates the whole question set authoring to
 * `sb-uic-assessment-main` from `@sunbird-cb/consumption`, which internally renders
 * `sb-uic-assessment-basic-info` (Assessment Settings) followed by Add Questions.
 */
@Component({
  selector: 'ws-app-assessment-builder',
  templateUrl: './assessment-builder.component.html',
  styleUrls: ['./assessment-builder.component.scss'],
  standalone: false,
})
export class AssessmentBuilderComponent implements OnChanges, OnDestroy {

  @Input() assessmentId = ''
  @Input() openMode = 'edit'
  /** The name given in step 1, which seeds the title of the settings step. */
  @Input() assessmentName = ''
  /** Courses of the linked plan (`trainingPlan_v2.contentList`), the AI drafts questions from. */
  @Input() contentList: aparPlan.IPlanContent[] | null = []
  /** Emits the question set identifier as soon as the assessment is created. */
  @Output() assessmentSaved = new EventEmitter<string>()

  config!: comprehensiveAssessment.IAssessmentConfig
  /** The plan's courses once the search has named them, kept so a rebuilt config holds them. */
  refContent: comprehensiveAssessment.IRefContent[] = []
  private refContentSub?: Subscription

  constructor(
    private loaderService: LoaderService,
    private assessmentSvc: ComprehensiveAssessmentService
  ) {
    this.config = this.buildConfig()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.assessmentId || changes.openMode || changes.assessmentName) {
      this.config = this.buildConfig()
    }
    if (changes.contentList) {
      this.loadRefContent()
    }
  }

  ngOnDestroy(): void {
    if (this.refContentSub) {
      this.refContentSub.unsubscribe()
    }
  }

  buildConfig(): comprehensiveAssessment.IAssessmentConfig {
    return {
      identifier: this.assessmentId || '',
      primaryCategory: QUESTIONSET_PRIMARY_CATEGORY,
      // written onto the question set as it is created, and the only thing that tells a Live
      // comprehensive assessment from any other Course Assessment
      contextCategory: CONTENT_COURSE_CATEGORY,
      name: '',
      isReadOnly: this.openMode === 'view',
      aiQuestionsGen: this.buildAiQuestionsGen(),
    }
  }

  /** Identifiers of the linked plan's courses, the ones the search is asked to name. */
  getPlanCourseIds(): string[] {
    return (this.contentList || [])
      .map(content => content && content.identifier)
      .filter(identifier => !!identifier)
  }

  /**
   * Names the plan's courses and hands them to AI question generation. Only `aiQuestionsGen`
   * is swapped on the config already handed down: `sb-uic-assessment-main` reads the config
   * once and writes the question set's categories back onto it, a new config would lose them.
   */
  private loadRefContent(): void {
    if (this.refContentSub) {
      this.refContentSub.unsubscribe()
    }
    this.refContentSub = this.assessmentSvc.getRefContent(this.getPlanCourseIds()).subscribe(refContent => {
      this.refContent = refContent
      this.config.aiQuestionsGen = this.buildAiQuestionsGen()
    })
  }

  private buildAiQuestionsGen(): comprehensiveAssessment.IAiQuestionsGenConfig {
    return {
      enable: true,
      refContent: this.refContent,
    }
  }

  onAssessmentSaved(identifier: string) {
    if (identifier) {
      this.assessmentSaved.emit(identifier)
    }
  }

  onLoader(show: boolean) {
    this.loaderService.changeLoaderState(show)
  }

}
