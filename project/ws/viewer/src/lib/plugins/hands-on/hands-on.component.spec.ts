import { HandsOnComponent } from './hands-on.component'
import { of, throwError } from 'rxjs'
import { NSHandsOnConstants } from './hands-on.constants'

// ─── helpers ──────────────────────────────────────────────────────────────────

const makeHandsOn = (override: any = {}): any => ({
  problemStatement: '<p>Solve this</p>',
  starterCodes: ['print("hello")'],
  timeLimit: 60,
  supportedLanguages: [{ id: 71, language: 'Python 3' }],
  forFPCourse: false,
  safeProblemStatement: null,
  ...override,
})

// ─── suite ────────────────────────────────────────────────────────────────────

describe('HandsOnComponent', () => {
  let component: HandsOnComponent
  let mockLogger: any
  let mockSanitizer: any
  let mockHandsOnSvc: any
  let mockDialog: any
  let mockDialogRef: any
  let mockEventSvc: any

  beforeEach(() => {
    mockLogger = { error: jest.fn(), log: jest.fn() }
    mockSanitizer = {
      bypassSecurityTrustHtml: jest.fn().mockImplementation((html: string) => html),
    }
    mockHandsOnSvc = {
      execute: jest.fn().mockReturnValue(of(null)),
      verifyFp: jest.fn().mockReturnValue(of(null)),
      verifyJavaFp: jest.fn().mockReturnValue(of(null)),
      verifyCe: jest.fn().mockReturnValue(of(null)),
      submitFp: jest.fn().mockReturnValue(of(null)),
      submitJavaFp: jest.fn().mockReturnValue(of(null)),
      submitCe: jest.fn().mockReturnValue(of(null)),
      viewLastSubmission: jest.fn().mockReturnValue(of(null)),
    }
    mockDialogRef = { afterClosed: jest.fn().mockReturnValue(of(null)) }
    mockDialog = { open: jest.fn().mockReturnValue(mockDialogRef) }
    mockEventSvc = { raiseInteractTelemetry: jest.fn() }

    component = new HandsOnComponent(
      mockLogger,
      mockSanitizer,
      mockHandsOnSvc,
      mockDialog,
      mockEventSvc,
    )
    component.handsOn = makeHandsOn()
    component.artifactUrl = 'https://example.com/content/index.html'
    component.identifier = 'lex_001'
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  // ─── create ────────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have correct initial state', () => {
    expect(component.firstInput).toBe(true)
    expect(component.isInput).toBe(false)
    expect(component.executed).toBe(false)
    expect(component.isPostActionSectionShown).toBe(false)
  })

  // ─── ngOnInit ──────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set EXECUTION_STATUS from NSHandsOnConstants', () => {
      component.ngOnInit()
      expect(component.EXECUTION_STATUS).toEqual(NSHandsOnConstants.EXECUTION_STATUS)
    })
  })

  // ─── ngOnChanges ───────────────────────────────────────────────────────────

  describe('ngOnChanges', () => {
    it('should reset flags and call initializeExercise', () => {
      jest.useFakeTimers()
      component.firstInput = false
      component.isClick = true
      component.isPostActionSectionShown = true
      component.ngOnChanges()
      expect(component.firstInput).toBe(true)
      expect(component.isClick).toBe(false)
      expect(component.isPostActionSectionShown).toBe(false)
    })

    it('should populate exerciseData from handsOn', () => {
      jest.useFakeTimers()
      component.ngOnChanges()
      expect(component.exerciseData).not.toBeNull()
      expect(component.exerciseData!.starterCodes[0]).toBe('print("hello")')
    })

    it('should call sanitizer with modified problem statement', () => {
      jest.useFakeTimers()
      component.ngOnChanges()
      expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalled()
    })

    it('should start interval timer when timeLimit >= 0', () => {
      jest.useFakeTimers()
      component.handsOn = makeHandsOn({ timeLimit: 10 })
      component.ngOnChanges()
      expect(component['timerSubscription']).not.toBeNull()
      component.ngOnDestroy()
    })

    it('should set exerciseTimeRemaining to 0 when timer ticks past zero', () => {
      jest.useFakeTimers()
      component.handsOn = makeHandsOn({ timeLimit: 0 })
      component.ngOnChanges()
      // advance enough for timeLeft to go negative
      jest.advanceTimersByTime(500)
      expect(component.exerciseTimeRemaining).toBe(0)
    })

    it('should not start timer when timeLimit is -1', () => {
      jest.useFakeTimers()
      component.handsOn = makeHandsOn({ timeLimit: -1 })
      component.ngOnChanges()
      expect(component['timerSubscription']).toBeNull()
    })

    it('should call ngOnDestroy first to clean up previous subscriptions', () => {
      jest.useFakeTimers()
      const spy = jest.spyOn(component, 'ngOnDestroy')
      component.ngOnChanges()
      expect(spy).toHaveBeenCalled()
    })
  })

  // ─── ngOnDestroy ───────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should unsubscribe timerSubscription when set', () => {
      const sub = { unsubscribe: jest.fn() }
      component['timerSubscription'] = sub as any
      component.ngOnDestroy()
      expect(sub.unsubscribe).toHaveBeenCalled()
    })

    it('should unsubscribe notifierTimerSubscription when set', () => {
      const sub = { unsubscribe: jest.fn() }
      component['notifierTimerSubscription'] = sub as any
      component.ngOnDestroy()
      expect(sub.unsubscribe).toHaveBeenCalled()
    })

    it('should clearInterval for inputInterval and clickInterval', () => {
      jest.useFakeTimers()
      component.inputInterval = setInterval(() => { }, 1000)
      component.clickInterval = setInterval(() => { }, 1000)
      const clearSpy = jest.spyOn(global, 'clearInterval')
      component.ngOnDestroy()
      expect(clearSpy).toHaveBeenCalledTimes(2)
    })

    it('should not throw when all subscriptions are null', () => {
      component['timerSubscription'] = null
      component['notifierTimerSubscription'] = null
      component.inputInterval = undefined
      component.clickInterval = undefined
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  // ─── reset ─────────────────────────────────────────────────────────────────

  describe('reset', () => {
    it('should reinitialise exercise and clear results', () => {
      jest.useFakeTimers()
      component.exerciseResult = { output: 'old' }
      component.verifyResult = { ok: true }
      component.reset()
      expect(component.exerciseResult).toBeNull()
      expect(component.verifyResult).toBeNull()
    })
  })

  // ─── done ──────────────────────────────────────────────────────────────────

  describe('done', () => {
    it('should not throw', () => {
      expect(() => component.done()).not.toThrow()
    })
  })

  // ─── openExecutionDialog ───────────────────────────────────────────────────

  describe('openExecutionDialog', () => {
    it('should set executed to true and open HandsOnDialogComponent', () => {
      component.openExecutionDialog('submit')
      expect(component.executed).toBe(true)
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should call submit(true) when dialog closes with "submit"', () => {
      mockDialogRef.afterClosed.mockReturnValue(of('submit'))
      const spy = jest.spyOn(component, 'submit')
      component.openExecutionDialog('submit')
      expect(spy).toHaveBeenCalledWith(true)
    })

    it('should NOT call submit when dialog closes with null', () => {
      mockDialogRef.afterClosed.mockReturnValue(of(null))
      const spy = jest.spyOn(component, 'submit')
      component.openExecutionDialog('submit')
      expect(spy).not.toHaveBeenCalled()
    })
  })

  // ─── showPostActionSection ─────────────────────────────────────────────────

  describe('showPostActionSection', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      component.ngOnChanges()
    })

    it('should set postActionSectionContent and isPostActionSectionShown', () => {
      component.showPostActionSection('execute')
      expect(component.postActionSectionContent).toBe('execute')
      expect(component.isPostActionSectionShown).toBe(true)
    })

    it('should call execute() when option is "execute"', () => {
      const spy = jest.spyOn(component, 'execute')
      component.showPostActionSection('execute')
      expect(spy).toHaveBeenCalled()
    })

    it('should call verify() when option is "verify"', () => {
      const spy = jest.spyOn(component, 'verify')
      component.showPostActionSection('verify')
      expect(spy).toHaveBeenCalled()
    })

    it('should call submit() when option is "submit"', () => {
      const spy = jest.spyOn(component, 'submit')
      component.showPostActionSection('submit')
      expect(spy).toHaveBeenCalled()
    })
  })

  // ─── execute ───────────────────────────────────────────────────────────────

  describe('execute', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      component.ngOnChanges()
    })

    it('should set executionInProgress to false after response', () => {
      mockHandsOnSvc.execute.mockReturnValue(of({ output: 'ok', errors: '' }))
      component.execute()
      expect(component.executionInProgress).toBe(false)
    })

    it('should set status OK when output is non-empty and errors is empty', () => {
      mockHandsOnSvc.execute.mockReturnValue(of({ output: 'hello', errors: '' }))
      component.execute()
      expect(component.exerciseResult.status).toBe(NSHandsOnConstants.EXECUTION_STATUS.OK)
      expect(component.exerciseResult.showOutput).toBe('hello')
    })

    it('should set status ERROR when output contains "compilation failed"', () => {
      mockHandsOnSvc.execute.mockReturnValue(
        of({ output: 'Compilation failed', errors: 'syntax error' }),
      )
      component.execute()
      expect(component.exerciseResult.status).toBe(NSHandsOnConstants.EXECUTION_STATUS.ERROR)
      expect(component.exerciseResult.showOutput).toContain('Compilation failed')
    })

    it('should set status WARNING when output contains "compilation succeeded"', () => {
      mockHandsOnSvc.execute.mockReturnValue(
        of({ output: 'Compilation succeeded', errors: 'unused var' }),
      )
      component.execute()
      expect(component.exerciseResult.status).toBe(NSHandsOnConstants.EXECUTION_STATUS.WARNING)
      expect(component.exerciseResult.showOutput).toContain('Warnings')
    })

    it('should set status ERROR for runtime exception (errors non-empty, no compilation keyword)', () => {
      mockHandsOnSvc.execute.mockReturnValue(
        of({ output: 'Program crashed', errors: 'NullPointerException' }),
      )
      component.execute()
      expect(component.exerciseResult.status).toBe(NSHandsOnConstants.EXECUTION_STATUS.ERROR)
      expect(component.exerciseResult.showOutput).toContain('Runtime Exception')
    })

    it('should handle null data response gracefully', () => {
      mockHandsOnSvc.execute.mockReturnValue(of(null))
      expect(() => component.execute()).not.toThrow()
      expect(component.executionInProgress).toBe(false)
    })
  })

  // ─── verify — CE path ──────────────────────────────────────────────────────

  describe('verify (CE path)', () => {
    const ceResult = {
      testCaseOutputs: [
        { type: 'sample', result: 'Passed' },
        { type: 'hidden', result: 'Passed' },
        { type: 'hidden', result: 'Failed' },
      ],
    }

    beforeEach(() => {
      jest.useFakeTimers()
      component.handsOn = makeHandsOn({ forFPCourse: false })
      component.ngOnChanges()
    })

    it('should call verifyCe and parse result', () => {
      mockHandsOnSvc.verifyCe.mockReturnValue(
        of({ verifyResult: JSON.stringify(ceResult) }),
      )
      component.verify()
      expect(mockHandsOnSvc.verifyCe).toHaveBeenCalled()
      expect(component.verifyResult.Samples).toHaveLength(1)
      expect(component.verifyResult.Hiddens).toHaveLength(2)
      expect(component.verifyResult.SamplesPassed).toHaveLength(1)
      expect(component.verifyResult.HiddensPassed).toHaveLength(1)
      expect(component.verifyResult.HiddensFailed).toHaveLength(1)
    })

    it('should set apiErrorOccurred on verifyCe error', () => {
      mockHandsOnSvc.verifyCe.mockReturnValue(throwError(() => new Error('network')))
      component.verify()
      expect(component.apiErrorOccurred).toBe(true)
      expect(component.verifyResult).toBeNull()
    })

    it('should handle null verifyCe response gracefully', () => {
      mockHandsOnSvc.verifyCe.mockReturnValue(of(null))
      expect(() => component.verify()).not.toThrow()
      expect(component.executionInProgress).toBe(false)
    })
  })

  // ─── verify — FP non-Java path ─────────────────────────────────────────────

  describe('verify (FP non-Java path)', () => {
    const fpResult = {
      TestResultData: [
        { Type: 'Structural', SAType: '' },
        { Type: 'Functional', SAType: 'Sample' },
        { Type: 'Functional', SAType: 'Actual' },
      ],
    }

    beforeEach(() => {
      jest.useFakeTimers()
      component.handsOn = makeHandsOn({ forFPCourse: true, supportedLanguages: [{ id: 1, language: 'Python 3' }] })
      component.ngOnChanges()
    })

    it('should call verifyFp and parse non-java result', () => {
      mockHandsOnSvc.verifyFp.mockReturnValue(
        of({ verifyResult: JSON.stringify(fpResult) }),
      )
      component.verify()
      expect(mockHandsOnSvc.verifyFp).toHaveBeenCalled()
      expect(component.verifyResult.structural).toHaveLength(1)
      expect(component.verifyResult.sample).toHaveLength(1)
      expect(component.verifyResult.actual).toHaveLength(1)
    })

    it('should set apiErrorOccurred on verifyFp error', () => {
      mockHandsOnSvc.verifyFp.mockReturnValue(throwError(() => new Error('fail')))
      component.verify()
      expect(component.apiErrorOccurred).toBe(true)
    })
  })

  // ─── verify — FP Java path ─────────────────────────────────────────────────

  describe('verify (FP Java path)', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      component.handsOn = makeHandsOn({ forFPCourse: true, supportedLanguages: [{ id: 1, language: 'Java' }] })
      component.ngOnChanges()
    })

    it('should call verifyJavaFp and set verifyJavaResult', () => {
      const javaResult = { procedural: [{ sample: 'a' }, { actual: 'b' }] }
      mockHandsOnSvc.verifyJavaFp.mockReturnValue(
        of({ verifyResult: javaResult }),
      )
      component.verify()
      expect(mockHandsOnSvc.verifyJavaFp).toHaveBeenCalled()
      expect(component.verifyJavaResult).toBeDefined()
      expect(component.verifyJavaResult.sample).toEqual({ sample: 'a' })
      expect(component.verifyJavaResult.actual).toEqual({ actual: 'b' })
    })

    it('should set apiErrorOccurred on verifyJavaFp error', () => {
      mockHandsOnSvc.verifyJavaFp.mockReturnValue(throwError(() => new Error('fail')))
      component.verify()
      expect(component.apiErrorOccurred).toBe(true)
    })
  })

  // ─── submit — CE path ──────────────────────────────────────────────────────

  describe('submit (CE path)', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      component.handsOn = makeHandsOn({ forFPCourse: false })
      component.ngOnChanges()
    })

    it('should call submitCe and set submitResult', () => {
      mockHandsOnSvc.submitCe.mockReturnValue(
        of({ submitResult: { submitionStatus: true } }),
      )
      component.submit()
      expect(mockHandsOnSvc.submitCe).toHaveBeenCalled()
      expect(component.submitResult.submitionStatus).toBe(true)
    })

    it('should open execution dialog when submitionStatus is false', () => {
      mockHandsOnSvc.submitCe.mockReturnValue(
        of({ submitResult: { submitionStatus: false } }),
      )
      component.submit()
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should handle null submitCe response gracefully', () => {
      mockHandsOnSvc.submitCe.mockReturnValue(of(null))
      expect(() => component.submit()).not.toThrow()
      expect(component.executionInProgress).toBe(false)
    })

    it('should set apiErrorOccurred on submitCe error', () => {
      mockHandsOnSvc.submitCe.mockReturnValue(throwError(() => new Error('fail')))
      component.submit()
      expect(component.apiErrorOccurred).toBe(true)
    })

    it('should pass ignoreError=true when called with true', () => {
      mockHandsOnSvc.submitCe.mockReturnValue(of({ submitResult: { submitionStatus: true } }))
      component.submit(true)
      const req = mockHandsOnSvc.submitCe.mock.calls[0][1]
      expect(req.ignore_error).toBe(true)
    })
  })

  // ─── submit — FP non-Java path ─────────────────────────────────────────────

  describe('submit (FP non-Java path)', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      component.handsOn = makeHandsOn({ forFPCourse: true, supportedLanguages: [{ id: 1, language: 'Python 3' }] })
      component.ngOnChanges()
    })

    it('should call submitFp and set submitResult', () => {
      mockHandsOnSvc.submitFp.mockReturnValue(
        of({ submitResult: { submitionStatus: true } }),
      )
      component.submit()
      expect(mockHandsOnSvc.submitFp).toHaveBeenCalled()
    })

    it('should set apiErrorOccurred on submitFp error', () => {
      mockHandsOnSvc.submitFp.mockReturnValue(throwError(() => new Error('fail')))
      component.submit()
      expect(component.apiErrorOccurred).toBe(true)
    })
  })

  // ─── submit — FP Java path ─────────────────────────────────────────────────

  describe('submit (FP Java path)', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      component.handsOn = makeHandsOn({ forFPCourse: true, supportedLanguages: [{ id: 1, language: 'Java' }] })
      component.ngOnChanges()
    })

    it('should call submitJavaFp', () => {
      mockHandsOnSvc.submitJavaFp.mockReturnValue(
        of({ submitResult: { submitionStatus: true } }),
      )
      component.submit()
      expect(mockHandsOnSvc.submitJavaFp).toHaveBeenCalled()
    })

    it('should set apiErrorOccurred on submitJavaFp error', () => {
      mockHandsOnSvc.submitJavaFp.mockReturnValue(throwError(() => new Error('fail')))
      component.submit()
      expect(component.apiErrorOccurred).toBe(true)
    })
  })

  // ─── viewLastSubmission ────────────────────────────────────────────────────

  describe('viewLastSubmission', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      component.ngOnChanges()
    })

    it('should call openExecutionDialog("no-submit") when response is no-submission marker', () => {
      mockHandsOnSvc.viewLastSubmission.mockReturnValue(of('---no submission found---'))
      const spy = jest.spyOn(component, 'openExecutionDialog')
      component.viewLastSubmission()
      expect(spy).toHaveBeenCalledWith('no-submit')
    })

    it('should update starterCodes when valid submission data returned', () => {
      const code = 'print("saved code")'
      mockHandsOnSvc.viewLastSubmission.mockReturnValue(of(code))
      component.viewLastSubmission()
      expect(component.exerciseData!.starterCodes[0]).toBe(code)
    })

    it('should handle null response gracefully', () => {
      mockHandsOnSvc.viewLastSubmission.mockReturnValue(of(null))
      expect(() => component.viewLastSubmission()).not.toThrow()
    })

    it('should call openExecutionDialog("no-submit") on service error', () => {
      mockHandsOnSvc.viewLastSubmission.mockReturnValue(throwError(() => new Error('fail')))
      const spy = jest.spyOn(component, 'openExecutionDialog')
      component.viewLastSubmission()
      expect(spy).toHaveBeenCalledWith('no-submit')
    })
  })

  // ─── copyToClipBoardFunction ───────────────────────────────────────────────

  describe('copyToClipBoardFunction', () => {
    let mockTextarea: any
    let execCommandMock: jest.Mock

    beforeEach(() => {
      jest.useFakeTimers()
      component.ngOnChanges()
      mockTextarea = {
        style: {},
        select: jest.fn(),
        value: '',
      }
      execCommandMock = jest.fn().mockReturnValue(true)
      Object.defineProperty(document, 'execCommand', {
        value: execCommandMock,
        configurable: true,
        writable: true,
      })
    })

    it('should create textarea and copy code when no textarea exists', () => {
      const createdTextarea = { ...mockTextarea }
      jest.spyOn(document, 'createElement').mockReturnValue(createdTextarea as any)
      jest.spyOn(document, 'querySelector').mockReturnValue({ appendChild: jest.fn() } as any)
      jest.spyOn(document, 'getElementById')
        .mockReturnValueOnce(null)          // first call: textarea not found
        .mockReturnValueOnce(createdTextarea) // second call: after appendChild
        .mockReturnValue(null)               // tooltip

      component.copyToClipBoardFunction()
      expect(execCommandMock).toHaveBeenCalledWith('copy')
    })

    it('should use existing textarea when it already exists', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(mockTextarea as any)
      component.copyToClipBoardFunction()
      expect(execCommandMock).toHaveBeenCalledWith('copy')
    })

    it('should log error when execCommand returns false', () => {
      execCommandMock.mockReturnValue(false)
      jest.spyOn(document, 'getElementById').mockReturnValue(mockTextarea as any)
      component.copyToClipBoardFunction()
      expect(mockLogger.error).toHaveBeenCalled()
    })

    it('should update tooltip when copy succeeds and tooltip element exists', () => {
      const mockTooltip = { innerHTML: '' }
      jest.spyOn(document, 'getElementById').mockImplementation((id: string) => {
        if (id === 'mycustom-clipboard-textarea-hidden-id') {
          return mockTextarea as any
        }
        if (id === 'myTooltip') {
          return mockTooltip as any
        }
        return null
      })
      component.copyToClipBoardFunction()
      expect(mockTooltip.innerHTML).toBe('Code Copied!')
    })

    it('should not throw when execCommand throws', () => {
      execCommandMock.mockImplementation(() => { throw new Error('not allowed') })
      jest.spyOn(document, 'getElementById').mockReturnValue(mockTextarea as any)
      expect(() => component.copyToClipBoardFunction()).not.toThrow()
    })
  })

  // ─── outFunc ───────────────────────────────────────────────────────────────

  describe('outFunc', () => {
    it('should set tooltip innerHTML when tooltip element exists', () => {
      const mockTooltip = { innerHTML: 'Code Copied!' }
      jest.spyOn(document, 'getElementById').mockReturnValue(mockTooltip as any)
      component.outFunc()
      expect(mockTooltip.innerHTML).toBe('Copy to clipboard')
    })

    it('should not throw when tooltip element does not exist', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null)
      expect(() => component.outFunc()).not.toThrow()
    })
  })

  // ─── raiseInputChange ──────────────────────────────────────────────────────

  describe('raiseInputChange', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      component.ngOnChanges()
    })

    it('should set isInput and call raiseInteractTelemetry when first input', () => {
      component.inputStarterCode = 'old code'
      component.exerciseData!.starterCodes[0] = 'new code'
      component.firstInput = true
      // Mock impl so raiseInteractTelemetry doesn't reset isInput=false before assertion
      const spy = jest.spyOn(component, 'raiseInteractTelemetry').mockImplementation(jest.fn())
      component.raiseInputChange()
      expect(component.isInput).toBe(true)
      expect(spy).toHaveBeenCalledWith('editor', 'codeinput')
    })

    it('should not call raiseInteractTelemetry when firstInput is false', () => {
      component.inputStarterCode = 'old code'
      component.exerciseData!.starterCodes[0] = 'new code'
      component.firstInput = false
      const spy = jest.spyOn(component, 'raiseInteractTelemetry')
      component.raiseInputChange()
      expect(spy).not.toHaveBeenCalled()
    })

    it('should set firstInput to false after call', () => {
      component.inputStarterCode = 'old code'
      component.exerciseData!.starterCodes[0] = 'new code'
      component.firstInput = true
      component.raiseInputChange()
      expect(component.firstInput).toBe(false)
    })

    it('should not set isInput when inputStarterCode matches starterCodes[0]', () => {
      component.inputStarterCode = 'same code'
      component.exerciseData!.starterCodes[0] = 'same code'
      component.raiseInputChange()
      expect(component.isInput).toBe(false)
    })
  })

  // ─── raiseClickEvent ──────────────────────────────────────────────────────

  describe('raiseClickEvent', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      component.ngOnChanges()
    })

    it('should set isClick and call raiseInteractTelemetry on first click', () => {
      component.firstClick = true
      // Mock impl so raiseInteractTelemetry doesn't reset isClick=false before assertion
      const spy = jest.spyOn(component, 'raiseInteractTelemetry').mockImplementation(jest.fn())
      component.raiseClickEvent()
      expect(component.isClick).toBe(true)
      expect(spy).toHaveBeenCalledWith('editor', 'buttonclick')
    })

    it('should not call raiseInteractTelemetry when firstClick is false', () => {
      component.firstClick = false
      const spy = jest.spyOn(component, 'raiseInteractTelemetry')
      component.raiseClickEvent()
      expect(spy).not.toHaveBeenCalled()
    })

    it('should set firstClick to false after call', () => {
      component.firstClick = true
      component.raiseClickEvent()
      expect(component.firstClick).toBe(false)
    })
  })

  // ─── raiseInteractTelemetry ────────────────────────────────────────────────

  describe('raiseInteractTelemetry', () => {
    it('should call eventSvc.raiseInteractTelemetry when identifier is set', () => {
      component.identifier = 'lex_001'
      component.raiseInteractTelemetry('editor', 'codeinput')
      expect(mockEventSvc.raiseInteractTelemetry).toHaveBeenCalledWith('editor', 'codeinput', {})
    })

    it('should set isInput to false for "codeinput" event', () => {
      component.identifier = 'lex_001'
      component.isInput = true
      component.raiseInteractTelemetry('editor', 'codeinput')
      expect(component.isInput).toBe(false)
    })

    it('should set isClick to false for "buttonclick" event', () => {
      component.identifier = 'lex_001'
      component.isClick = true
      component.raiseInteractTelemetry('editor', 'buttonclick')
      expect(component.isClick).toBe(false)
    })

    it('should not call eventSvc when identifier is not set', () => {
      component.identifier = undefined as any
      component.raiseInteractTelemetry('editor', 'codeinput')
      expect(mockEventSvc.raiseInteractTelemetry).not.toHaveBeenCalled()
    })
  })

  // ─── startInputTimer / startClickTimer ────────────────────────────────────

  describe('startInputTimer', () => {
    it('should call raiseInteractTelemetry when isInput is true after interval', () => {
      jest.useFakeTimers()
      component.isInput = true
      const spy = jest.spyOn(component, 'raiseInteractTelemetry')
      component.startInputTimer()
      jest.advanceTimersByTime(2 * 60000)
      expect(spy).toHaveBeenCalledWith('editor', 'codeinput')
      clearInterval(component.inputInterval)
    })

    it('should NOT call raiseInteractTelemetry when isInput is false', () => {
      jest.useFakeTimers()
      component.isInput = false
      const spy = jest.spyOn(component, 'raiseInteractTelemetry')
      component.startInputTimer()
      jest.advanceTimersByTime(2 * 60000)
      expect(spy).not.toHaveBeenCalled()
      clearInterval(component.inputInterval)
    })
  })

  describe('startClickTimer', () => {
    it('should call raiseInteractTelemetry when isClick is true after interval', () => {
      jest.useFakeTimers()
      component.isClick = true
      const spy = jest.spyOn(component, 'raiseInteractTelemetry')
      component.startClickTimer()
      jest.advanceTimersByTime(2 * 60000)
      expect(spy).toHaveBeenCalledWith('editor', 'buttonclick')
      clearInterval(component.clickInterval)
    })

    it('should NOT call raiseInteractTelemetry when isClick is false', () => {
      jest.useFakeTimers()
      component.isClick = false
      const spy = jest.spyOn(component, 'raiseInteractTelemetry')
      component.startClickTimer()
      jest.advanceTimersByTime(2 * 60000)
      expect(spy).not.toHaveBeenCalled()
      clearInterval(component.clickInterval)
    })
  })
})

