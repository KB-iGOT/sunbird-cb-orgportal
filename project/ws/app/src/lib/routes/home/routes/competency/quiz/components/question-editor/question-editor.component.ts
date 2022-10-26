import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { QuizStoreService } from '../../services/store.service'
import { NOTIFICATION_TIME } from '../../constants/quiz-constants'
import { Subscription } from 'rxjs'
import { NotificationComponent } from '../../../../../../notification/components/notification/notification.component'

@Component({
  selector: 'ws-auth-question-editor',
  templateUrl: './question-editor.component.html',
  styleUrls: ['./question-editor.component.scss'],
})
export class QuestionEditorComponent implements OnInit, OnChanges, OnDestroy {
  quizIndex!: number
  selectedQuiz?: any
  activeIndexSubscription?: Subscription
  activeContentSubscription?: Subscription
  showHint!: boolean
  @Input() submitPressed = false
  currentId = ''

  constructor(
    public quizStoreSvc: QuizStoreService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnDestroy() {
    if (this.activeIndexSubscription) {
      this.activeIndexSubscription.unsubscribe()
    }
    if (this.activeContentSubscription) {
      this.activeContentSubscription.unsubscribe()
    }
  }

  ngOnChanges() {
    if (this.selectedQuiz && this.submitPressed) {
      this.validateNdShowError(this.submitPressed)
    }
  }
  ngOnInit() {
    this.activeIndexSubscription = this.quizStoreSvc.selectedQuizIndex.subscribe(index => {
      this.quizIndex = index
      const val = this.quizStoreSvc.getQuiz(index)
      this.selectedQuiz = val ? val : null
      if (this.submitPressed && val) {
        this.validateNdShowError(true)
      }
    })
  }

  /**
   * Updates emitted data to the corresponding quiz object
   * @param $event data
   * @param type updated property name
   */
  updateSelectedQuiz($event: any, type?: string) {
    const quizData = JSON.parse(JSON.stringify(this.quizStoreSvc.getQuiz(this.quizIndex)))
    let updatedVal: any = {}
    if (type === 'question') {
      updatedVal = quizData
      updatedVal.question = $event
    } else {
      updatedVal = {
        ...quizData,
        ...$event,
      }
      for (let i = 0; i < updatedVal.options.length; i = i + 1) {
        updatedVal.options[i] = { ...quizData.options[i], ...$event.options[i] }
      }
    }
    this.quizStoreSvc.updateQuiz(this.quizIndex, updatedVal)
    if (updatedVal.isInValid) {
      this.validateNdShowError()
    }
  }

  /**
   * Validates the quiz and shows the error if any only once
   */
  validateNdShowError(showError?: boolean) {
    const errorType = this.quizStoreSvc.validateQuiz(this.quizIndex)
    if (showError) {
      if (errorType) {
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: errorType,
          },
          duration: NOTIFICATION_TIME * 500,
        })
      }
    }
  }
}
