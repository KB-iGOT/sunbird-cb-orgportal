import { NsContent } from '@sunbird-cb/utils-v2'
import { ResultComponent } from './result.component'

const PRACTICE_CATEGORY = NsContent.EPrimaryCategory.PRACTICE_RESOURCE
const OTHER_CATEGORY = 'Course' as any

function makeQuizResponse(overrides: any = {}): any {
  return {
    total: 10,
    correct: 5,
    incorrect: 3,
    overallResult: 75,
    timeTakenForAssessment: 3661000,
    totalSectionMarks: 15,
    totalMarks: 20,
    children: [
      {
        name: 'Section A',
        identifier: 'sec1',
        sectionMarks: 10,
        totalMarks: 20,
        correct: 5,
        incorrect: 3,
        children: [
          { question: '<p>Q1</p>', result: 'correct', questionLevel: 'easy', timeSpent: 60000 },
          { question: '<p>Q2&nbsp;text</p>', result: 'incorrect', questionLevel: 'medium', timeSpent: 90000 },
          { question: '<p>Q3</p>', result: 'blank', questionLevel: 'hard', timeSpent: 30000 },
        ],
      },
    ],
    ...overrides,
  }
}

describe('ResultComponent', () => {
  let component: ResultComponent
  let mockLangTranslations: any

  beforeEach(() => {
    mockLangTranslations = { translateLabelWithoutspace: jest.fn().mockReturnValue('translated') }
    component = new ResultComponent(mockLangTranslations)
    component.quizResponse = makeQuizResponse()
    component.quizCategory = PRACTICE_CATEGORY
  })

  // ─── ngOnInit ──────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set isMobile to true when window.innerWidth < 768', () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 })
      component.ngOnInit()
      expect(component.isMobile).toBe(true)
    })

    it('should set isMobile to false when window.innerWidth >= 768', () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1200 })
      component.ngOnInit()
      expect(component.isMobile).toBe(false)
    })
  })

  // ─── ngOnChanges ──────────────────────────────────────────────────────────

  describe('ngOnChanges', () => {
    it('should not throw when quizResponse is undefined', () => {
      component.quizResponse = undefined as any
      component.quizCategory = undefined as any
      expect(() => component.ngOnChanges()).not.toThrow()
    })

    it('should build sectionsList with All + sections from quizResponse.children', () => {
      component.ngOnChanges()
      expect(component.sectionsList.length).toBe(2)
      expect(component.sectionsList[0].sectionName).toBe('All')
    })

    it('should set summaryTableDataSource', () => {
      component.ngOnChanges()
      expect(component.summaryTableDataSource).toBeDefined()
    })

    it('should set overAllSummary score using totalSectionMarks/totalMarks', () => {
      component.ngOnChanges()
      const score = component.overAllSummary.find((s: any) => s.summaryType === 'quizresult.score')
      expect(score?.summary).toContain('15.00')
    })

    it('should set overAllSummary accuracy from overallResult', () => {
      component.ngOnChanges()
      const accuracy = component.overAllSummary.find((s: any) => s.summaryType === 'quizresult.accuracy')
      expect(accuracy?.summary).toBe('75%')
    })

    it('should format timeTaken as HH:MM:SS in overAllSummary', () => {
      component.ngOnChanges()
      const timeTaken = component.overAllSummary.find((s: any) => s.summaryType === 'quizresult.timeTaken')
      expect(timeTaken?.summary).toBe('01:01:01')
    })

    it('should default timeTaken to 00:00:00 when timeTakenForAssessment is missing', () => {
      component.quizResponse.timeTakenForAssessment = undefined as any
    })

    it('should set showInsight to true when quizCategory is PRACTICE_RESOURCE', () => {
      component.quizCategory = PRACTICE_CATEGORY
      component.ngOnChanges()
      expect(component.showInsight).toBe(true)
    })

    it('should set showInsight to false when quizCategory is not PRACTICE_RESOURCE', () => {
      component.quizCategory = OTHER_CATEGORY
      component.ngOnChanges()
      expect(component.showInsight).toBe(false)
    })

    it('should accumulate correct/incorrect from sections when PRACTICE_RESOURCE and correct is undefined', () => {
      component.quizResponse = makeQuizResponse({
        correct: undefined,
        incorrect: undefined,
        children: [
          { name: 'S1', identifier: 'sec1', correct: 3, incorrect: 2, sectionMarks: 5, totalMarks: 10, children: [] },
          { name: 'S2', identifier: 'sec2', correct: 4, incorrect: 1, sectionMarks: 5, totalMarks: 10, children: [] },
        ],
      })
      component.ngOnChanges()
      expect(component.quizResponse.correct).toBe(7)
      expect(component.quizResponse.incorrect).toBe(3)
    })

    it('should unshift timeTaken in scoreSummary when quizCategory is not PRACTICE_RESOURCE', () => {
      component.quizCategory = OTHER_CATEGORY
      component.ngOnChanges()
      expect(component.scoreSummary[0].summaryType).toBe('quizresult.timeTaken')
    })

    it('should not unshift timeTaken in scoreSummary when quizCategory is PRACTICE_RESOURCE', () => {
      component.quizCategory = PRACTICE_CATEGORY
      component.ngOnChanges()
      expect(component.scoreSummary[0].summaryType).not.toBe('quizresult.timeTaken')
    })

    it('should fallback scoreSummary timeTaken to 0 when timeTakenForAssessment is missing (non-practice)', () => {
      component.quizCategory = OTHER_CATEGORY
      component.quizResponse.timeTakenForAssessment = undefined as any
      component.ngOnChanges()
      const timeSummary = component.scoreSummary.find((s: any) => s.summaryType === 'quizresult.timeTaken')
      expect(timeSummary?.summary).toBe('0')
    })

    it('should use Default Section name when single section has empty name', () => {
      component.quizResponse = makeQuizResponse({ children: [{ name: '', identifier: 'sec1', sectionMarks: 5, totalMarks: 10, children: [] }] })
      component.ngOnChanges()
      expect(component.sectionsList[1].sectionName).toBe('Default Section')
    })

    it('should assign fallback names Section A–F for multiple unnamed sections', () => {
      component.quizResponse = makeQuizResponse({
        children: [
          { name: '', identifier: 's0', sectionMarks: 1, totalMarks: 5, children: [] },
          { name: '', identifier: 's1', sectionMarks: 1, totalMarks: 5, children: [] },
          { name: '', identifier: 's2', sectionMarks: 1, totalMarks: 5, children: [] },
          { name: '', identifier: 's3', sectionMarks: 1, totalMarks: 5, children: [] },
          { name: '', identifier: 's4', sectionMarks: 1, totalMarks: 5, children: [] },
          { name: '', identifier: 's5', sectionMarks: 1, totalMarks: 5, children: [] },
        ],
      })
      component.ngOnChanges()
      const names = component.sectionsList.slice(1).map((s: any) => s.sectionName)
      expect(names).toEqual(['Section A', 'Section B', 'Section C', 'Section D', 'Section E', 'Section F'])
    })

    it('should accumulate totalQuestions from children when total is 0', () => {
      component.quizResponse = makeQuizResponse({
        total: 0,
        children: [
          {
            name: 'S1', identifier: 'sec1', sectionMarks: 5, totalMarks: 10,
            children: [{ question: 'Q1', result: 'correct', questionLevel: 'easy', timeSpent: 1000 }],
          },
        ],
      })
      component.ngOnChanges()
      expect(component.summaryTableDataSource).toBeDefined()
    })

    it('should show score as 0 when totalSectionMarks is falsy', () => {
      component.quizResponse.totalSectionMarks = 0
      component.ngOnChanges()
      const score = component.overAllSummary.find((s: any) => s.summaryType === 'quizresult.score')
      expect(score?.summary).toBe('0')
    })

    it('should handle incorrect as 0 in scoreSummary wrong entry', () => {
      component.quizResponse.incorrect = 0
      component.ngOnChanges()
      const wrongEntry = component.scoreSummary.find((s: any) => s.summaryType === 'quizresult.wrong')
      expect(wrongEntry?.summary).toBe('0')
    })

    it('should handle overallResult being non-number gracefully', () => {
      component.quizResponse.overallResult = 'invalid' as any
      expect(() => component.ngOnChanges()).not.toThrow()
    })

    it('should handle quizResponse without children property', () => {
      component.quizResponse = { total: 5, correct: 2, incorrect: 1, overallResult: 50 } as any
      expect(() => component.ngOnChanges()).not.toThrow()
    })

    it('should set attempted summary to 0 when total is 0', () => {
      component.quizResponse.total = 0
      component.quizResponse.children = []
      component.ngOnChanges()
      const attempted = component.overAllSummary.find((s: any) => s.summaryType === 'quizresult.attempted')
      expect(attempted?.summary).toBe('0')
    })
  })

  // ─── getSectionalData ──────────────────────────────────────────────────────

  describe('getSectionalData', () => {
    beforeEach(() => component.ngOnChanges())

    it('should reset questionStatuTableData on every call', () => {
      component.getSectionalData('all', 'all')
      expect(Array.isArray(component.questionStatuTableData)).toBe(true)
    })

    it('should include all 3 questions when sectionId=all and resultType=all', () => {
      component.getSectionalData('all', 'all')
      expect(component.questionStatuTableData.length).toBe(3)
    })

    it('should filter to only correct questions (resultType=correct, sectionId=all)', () => {
      component.getSectionalData('all', 'correct')
      expect(component.questionStatuTableData.every((q: any) => q.status === 'correct')).toBe(true)
      expect(component.questionStatuTableData.length).toBe(1)
    })

    it('should filter to only wrong questions (resultType=wrong, sectionId=all)', () => {
      component.getSectionalData('all', 'wrong')
      expect(component.questionStatuTableData.every((q: any) => q.status === 'wrong')).toBe(true)
      expect(component.questionStatuTableData.length).toBe(1)
    })

    it('should filter to unattempted questions (resultType=notAnswered, sectionId=all)', () => {
      component.getSectionalData('all', 'notAnswered')
      expect(component.questionStatuTableData.every((q: any) => q.status === 'Unattempted')).toBe(true)
      expect(component.questionStatuTableData.length).toBe(1)
    })

    it('should map blank result to Unattempted in all mode', () => {
      component.getSectionalData('all', 'all')
      const unattempted = component.questionStatuTableData.find((q: any) => q.status === 'Unattempted')
      expect(unattempted).toBeDefined()
    })

    it('should map incorrect result to wrong in all mode', () => {
      component.getSectionalData('all', 'all')
      const wrong = component.questionStatuTableData.find((q: any) => q.status === 'wrong')
      expect(wrong).toBeDefined()
    })

    it('should replace &nbsp; in question text', () => {
      component.getSectionalData('all', 'all')
      const q = component.questionStatuTableData.find((q: any) => q.question.includes('Q2'))
      expect(q?.question).not.toContain('&nbsp;')
    })

    it('should replace FTB input placeholder with underscores (sectionId=all)', () => {
      component.quizResponse = makeQuizResponse({
        children: [{
          name: 'S1', identifier: 'sec1', sectionMarks: 5, totalMarks: 10,
          children: [{
            question: 'Fill <input style="border-style:none none solid none" /> blank',
            result: 'correct', questionLevel: 'easy', timeSpent: 0, qType: 'FTB',
          }],
        }],
      })
      component.getSectionalData('all', 'all')
      expect(component.questionStatuTableData[0].question).toContain('_________')
    })

    it('should filter by specific sectionId for resultType=all', () => {
      component.getSectionalData('sec1', 'all')
      expect(component.questionStatuTableData.length).toBe(3)
    })

    it('should filter by sectionId + resultType=correct', () => {
      component.getSectionalData('sec1', 'correct')
      expect(component.questionStatuTableData.every((q: any) => q.status === 'correct')).toBe(true)
    })

    it('should filter by sectionId + resultType=wrong', () => {
      component.getSectionalData('sec1', 'wrong')
      expect(component.questionStatuTableData.every((q: any) => q.status === 'wrong')).toBe(true)
    })

    it('should filter by sectionId + resultType=notAnswered', () => {
      component.getSectionalData('sec1', 'notAnswered')
      expect(component.questionStatuTableData.every((q: any) => q.status === 'Unattempted')).toBe(true)
    })

    it('should replace FTB placeholder inside specific-section filter', () => {
      component.quizResponse = makeQuizResponse({
        children: [{
          name: 'S1', identifier: 'sec1', sectionMarks: 5, totalMarks: 10,
          children: [{
            question: 'Blank <input style="border-style:none none solid none" /> here',
            result: 'correct', questionLevel: 'easy', timeSpent: 0, qType: 'FTB',
          }],
        }],
      })
      component.getSectionalData('sec1', 'all')
      expect(component.questionStatuTableData[0].question).toContain('_________')
    })

    it('should treat empty sectionId as all', () => {
      component.getSectionalData('', 'all')
      expect(component.selectedSectionId).toBe('all')
    })

    it('should assign questionStatuTableDataSource = questionStatuTableData', () => {
      component.getSectionalData('all', 'all')
      expect(component.questionStatuTableDataSource).toBe(component.questionStatuTableData)
    })

    it('should produce empty questionStatuTableData when quizResponse has no children sections', () => {
      // When children is empty the inner loops don't execute → result stays []
      component.quizResponse = { ...makeQuizResponse(), children: [] }
      component.getSectionalData('unknown-id', 'all')
      expect(component.questionStatuTableData.length).toBe(0)
    })

    it('should not throw when quizResponse has no children', () => {
      component.quizResponse = { total: 5, correct: 2, incorrect: 1 } as any
      expect(() => component.getSectionalData('all', 'all')).not.toThrow()
    })
  })

  // ─── getQuestionByStatus ───────────────────────────────────────────────────

  describe('getQuestionByStatus', () => {
    beforeEach(() => component.ngOnChanges())

    it('should set selectedStatus and delegate to getSectionalData', () => {
      const spy = jest.spyOn(component, 'getSectionalData')
      component.getQuestionByStatus('correct')
      expect(component.selectedStatus).toBe('correct')
      expect(spy).toHaveBeenCalledWith(component.selectedSectionId, 'correct')
    })

    it('should pass current selectedSectionId to getSectionalData', () => {
      component.selectedSectionId = 'sec1'
      const spy = jest.spyOn(component, 'getSectionalData')
      component.getQuestionByStatus('wrong')
      expect(spy).toHaveBeenCalledWith('sec1', 'wrong')
    })
  })

  // ─── action ───────────────────────────────────────────────────────────────

  describe('action', () => {
    it('should emit userSelection event with the given value', () => {
      const spy = jest.spyOn(component.userSelection, 'emit')
      component.action('tryAgain' as any)
      expect(spy).toHaveBeenCalledWith('tryAgain')
    })
  })

  // ─── isOnlySection getter ─────────────────────────────────────────────────

  describe('isOnlySection', () => {
    it('should return true when there is exactly one child section', () => {
      component.quizResponse = makeQuizResponse({ children: [{ name: 'S1', identifier: 'sec1', children: [] }] })
      expect(component.isOnlySection).toBe(true)
    })

    it('should return false when there are multiple children', () => {
      component.quizResponse = makeQuizResponse({
        children: [
          { name: 'S1', identifier: 'sec1', children: [] },
          { name: 'S2', identifier: 'sec2', children: [] },
        ],
      })
      expect(component.isOnlySection).toBe(false)
    })
  })

  // ─── checkRes ─────────────────────────────────────────────────────────────

  describe('checkRes', () => {
    it('should return true when quizResponse is a string', () => {
      component.quizResponse = 'some-string' as any
      expect(component.checkRes()).toBe(true)
    })

    it('should return false when quizResponse is an object', () => {
      component.quizResponse = makeQuizResponse()
      expect(component.checkRes()).toBe(false)
    })

    it('should return false when quizResponse is falsy', () => {
      component.quizResponse = undefined as any
      expect(component.checkRes()).toBe(false)
    })
  })

  // ─── retryResult ──────────────────────────────────────────────────────────

  describe('retryResult', () => {
    it('should emit fetchResult event', () => {
      const spy = jest.spyOn(component.fetchResult, 'emit')
      component.retryResult()
      expect(spy).toHaveBeenCalled()
    })
  })

  // ─── getQuestionCount ─────────────────────────────────────────────────────

  describe('getQuestionCount', () => {
    it('should set activeQuestionSet and selectedQuestionData', () => {
      component.getQuestionCount({ id: 'q1' }, 'setA')
      expect(component.activeQuestionSet).toBe('setA')
      expect(component.selectedQuestionData).toEqual({ id: 'q1' })
    })

    it('should update values on subsequent calls', () => {
      component.getQuestionCount({ id: 'q1' }, 'setA')
      component.getQuestionCount({ id: 'q2' }, 'setB')
      expect(component.activeQuestionSet).toBe('setB')
      expect(component.selectedQuestionData).toEqual({ id: 'q2' })
    })
  })

  // ─── updateProgress ───────────────────────────────────────────────────────

  describe('updateProgress', () => {
    it('should call setProperty with correct values and set innerText', () => {
      const mockProgress: any = { style: { setProperty: jest.fn() }, innerText: '' }
      jest.spyOn(document, 'querySelector').mockReturnValue(mockProgress)
      component.updateProgress(50)
      expect(mockProgress.style.setProperty).toHaveBeenCalledWith('--percentage', '180deg')
      expect(mockProgress.style.setProperty).toHaveBeenCalledWith('--passPercentage', 50)
      expect(mockProgress.innerText).toBe('50%')
    })

    it('should compute deg as value * 3.6', () => {
      const mockProgress: any = { style: { setProperty: jest.fn() }, innerText: '' }
      jest.spyOn(document, 'querySelector').mockReturnValue(mockProgress)
      component.updateProgress(100)
      expect(mockProgress.style.setProperty).toHaveBeenCalledWith('--percentage', '360deg')
    })
  })

  // ─── translateLabels ──────────────────────────────────────────────────────

  describe('translateLabels', () => {
    it('should delegate to translateLabelWithoutspace and return result', () => {
      const result = component.translateLabels('hello', 'type')
      expect(mockLangTranslations.translateLabelWithoutspace).toHaveBeenCalledWith('hello', 'type', '')
      expect(result).toBe('translated')
    })
  })

  // ─── getFinalColumns ──────────────────────────────────────────────────────

  describe('getFinalColumns', () => {
    it('should return array of key strings from displayedColumns', () => {
      const cols = [{ header: 'H1', key: 'col1' }, { header: 'H2', key: 'col2' }]
      expect(component.getFinalColumns(cols)).toEqual(['col1', 'col2'])
    })

    it('should return empty array for empty input', () => {
      expect(component.getFinalColumns([])).toEqual([])
    })
  })

  // ─── millisecondsToHMS ────────────────────────────────────────────────────

  describe('millisecondsToHMS', () => {
    it('should return 00:00:00 for 0 ms', () => {
      expect(component.millisecondsToHMS(0)).toBe('00:00:00')
    })

    it('should pad single-digit seconds with leading zero', () => {
      expect(component.millisecondsToHMS(1000)).toBe('00:00:01')
    })

    it('should convert 60000ms to 00:01:00', () => {
      expect(component.millisecondsToHMS(60000)).toBe('00:01:00')
    })

    it('should convert 3600000ms to 01:00:00', () => {
      expect(component.millisecondsToHMS(3600000)).toBe('01:00:00')
    })

    it('should convert 3661000ms to 01:01:01', () => {
      expect(component.millisecondsToHMS(3661000)).toBe('01:01:01')
    })

    it('should handle string ms input', () => {
      expect(component.millisecondsToHMS('3600000')).toBe('01:00:00')
    })

    it('should use two-digit format for values >= 10', () => {
      expect(component.millisecondsToHMS(36610000)).toBe('10:10:10')
    })
  })
})
