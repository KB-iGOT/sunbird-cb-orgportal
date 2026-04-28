import { HttpClient } from '@angular/common/http'
import { of } from 'rxjs'
import { PracticeService } from './practice.service'
import { NSPractice } from './practice.model'

const mockSection = (identifier: string): any => ({
  identifier,
  name: 'Test Section',
})

const mockQuizReq = (): any => ({
  identifier: 'q1',
  isAssessment: false,
  questions: [],
  timeLimit: 60,
  title: 'Test Quiz',
})

describe('PracticeService', () => {
  let service: PracticeService
  let httpClientMock: any

  beforeEach(() => {
    httpClientMock = {
      post: jest.fn(),
      get: jest.fn(),
    }

    service = new PracticeService(httpClientMock as HttpClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // ─── BehaviorSubject defaults ────────────────────────────────────────────

  describe('initial state', () => {
    it('should have empty secAttempted on init', () => {
      expect(service.secAttempted.getValue()).toEqual([])
    })

    it('should have empty questionAnswerHash on init', () => {
      expect(service.questionAnswerHash.getValue()).toEqual({})
    })

    it('should have displayCorrectAnswer false on init', () => {
      expect(service.displayCorrectAnswer.getValue()).toBe(false)
    })
  })

  // ─── startSection ─────────────────────────────────────────────────────────

  describe('startSection', () => {
    it('should not throw when section list is empty', () => {
      expect(() => service.startSection(mockSection('s1'))).not.toThrow()
      expect(service.secAttempted.getValue()).toEqual([])
    })

    it('should set isAttempted=true and fullAttempted=false on matching section', () => {
      service.secAttempted.next([
        { identifier: 's1', isAttempted: false, fullAttempted: false },
      ] as any)

      service.startSection(mockSection('s1'))

      expect(service.secAttempted.getValue()).toEqual([
        { identifier: 's1', isAttempted: true, fullAttempted: false },
      ])
    })

    it('should not modify non-matching sections', () => {
      service.secAttempted.next([
        { identifier: 's2', isAttempted: false, fullAttempted: false },
      ] as any)

      service.startSection(mockSection('s1'))

      expect(service.secAttempted.getValue()[0].isAttempted).toBe(false)
    })
  })

  // ─── setFullAttemptSection ────────────────────────────────────────────────

  describe('setFullAttemptSection', () => {
    it('should not throw when section list is empty', () => {
      expect(() => service.setFullAttemptSection(mockSection('s1'))).not.toThrow()
    })

    it('should set isAttempted=true and fullAttempted=true on matching section', () => {
      service.secAttempted.next([
        { identifier: 's1', isAttempted: false, fullAttempted: false },
      ] as any)

      service.setFullAttemptSection(mockSection('s1'))

      expect(service.secAttempted.getValue()).toEqual([
        { identifier: 's1', isAttempted: true, fullAttempted: true },
      ])
    })

    it('should not modify non-matching sections', () => {
      service.secAttempted.next([
        { identifier: 's2', isAttempted: false, fullAttempted: false },
      ] as any)

      service.setFullAttemptSection(mockSection('s1'))

      expect(service.secAttempted.getValue()[0].fullAttempted).toBe(false)
    })
  })

  // ─── qAnsHash ─────────────────────────────────────────────────────────────

  describe('qAnsHash', () => {
    it('should update questionAnswerHash with provided value', () => {
      const payload = { q1: ['opt1'] }
      service.qAnsHash(payload)
      expect(service.questionAnswerHash.getValue()).toEqual(payload)
    })
  })

  // ─── submitQuizV2 ─────────────────────────────────────────────────────────

  describe('submitQuizV2', () => {
    it('should POST to ASSESSMENT_SUBMIT_V2 endpoint', () => {
      const mockResp = { correct: 1, blank: 0, inCorrect: 0, passPercent: 80, result: 1, total: 1 }
      httpClientMock.post.mockReturnValue(of(mockResp))

      service.submitQuizV2(mockQuizReq()).subscribe((res: any) => {
        expect(res).toEqual(mockResp)
      })

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/evaluate/assessment/submit/v2',
        mockQuizReq()
      )
    })
  })

  // ─── submitQuizV3 ─────────────────────────────────────────────────────────

  describe('submitQuizV3', () => {
    it('should POST and return response.result', () => {
      const inner = { sections: [] }
      httpClientMock.post.mockReturnValue(of({ result: inner }))

      service.submitQuizV3(mockQuizReq()).subscribe((res: any) => {
        expect(res).toEqual(inner)
      })

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/evaluate/assessment/submit/v3',
        mockQuizReq()
      )
    })
  })

  // ─── submitQuizV4/V5/V6/V7 ────────────────────────────────────────────────

  describe('submitQuizV4', () => {
    it('should POST to ASSESSMENT_SUBMIT_V4 endpoint', () => {
      const mockResp = { result: {} }
      httpClientMock.post.mockReturnValue(of(mockResp))

      service.submitQuizV4(mockQuizReq()).subscribe((res: any) => {
        expect(res).toEqual(mockResp)
      })

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/evaluate/assessment/submit/v4',
        mockQuizReq()
      )
    })
  })

  describe('submitQuizV5', () => {
    it('should POST to ASSESSMENT_SUBMIT_V5 endpoint', () => {
      httpClientMock.post.mockReturnValue(of({}))

      service.submitQuizV5(mockQuizReq()).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/evaluate/assessment/submit/v5',
        mockQuizReq()
      )
    })
  })

  describe('submitQuizV6', () => {
    it('should POST to ASSESSMENT_SUBMIT_V6 endpoint', () => {
      httpClientMock.post.mockReturnValue(of({}))

      service.submitQuizV6(mockQuizReq()).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/evaluate/assessment/submit/v6',
        mockQuizReq()
      )
    })
  })

  describe('submitQuizV7', () => {
    it('should POST to ASSESSMENT_SUBMIT_V7 endpoint', () => {
      httpClientMock.post.mockReturnValue(of({}))

      service.submitQuizV7(mockQuizReq()).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/evaluate/assessment/submit/v7',
        mockQuizReq()
      )
    })
  })

  // ─── publicV4Submit / publicV5Submit ──────────────────────────────────────

  describe('publicV4Submit', () => {
    it('should POST to PUBLIC_ASSESSMENT_V4_SUBMIT endpoint', () => {
      httpClientMock.post.mockReturnValue(of({}))

      service.publicV4Submit(mockQuizReq()).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        'api/public/assessment/v4/assessment/submit',
        mockQuizReq()
      )
    })
  })

  describe('publicV5Submit', () => {
    it('should POST to PUBLIC_ASSESSMENT_SUBMIT endpoint', () => {
      httpClientMock.post.mockReturnValue(of({}))

      service.publicV5Submit(mockQuizReq()).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        'api/public/assessment/v5/assessment/submit',
        mockQuizReq()
      )
    })
  })

  // ─── quizResult / quizResultV5 / quizResultV7 ─────────────────────────────

  describe('quizResult', () => {
    it('should POST to ASSESSMENT_RESULT_V4 when forPreview is falsy', () => {
      httpClientMock.post.mockReturnValue(of({}))

      service.quizResult({ some: 'data' }).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/user/assessment/v4/result',
        { some: 'data' }
      )
    })

    it('should POST to PUBLIC_ASSESSMENT_V4_RESULT when forPreview is truthy', () => {
      httpClientMock.post.mockReturnValue(of({}))

      service.quizResult({ some: 'data' }, true).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        'api/public/assessment/v5/result',
        { some: 'data' }
      )
    })
  })

  describe('quizResultV5', () => {
    it('should POST to ASSESSMENT_RESULT_V5 when forPreview is falsy', () => {
      httpClientMock.post.mockReturnValue(of({}))

      service.quizResultV5({ x: 1 }).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/user/assessment/v5/result',
        { x: 1 }
      )
    })

    it('should POST to PUBLIC_ASSESSMENT_RESULT when forPreview is truthy', () => {
      httpClientMock.post.mockReturnValue(of({}))

      service.quizResultV5({ x: 1 }, true).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        'api/public/assessment/v5/result',
        { x: 1 }
      )
    })
  })

  describe('quizResultV7', () => {
    it('should POST to ASSESSMENT_RESULT_V7 when forPreview is falsy', () => {
      httpClientMock.post.mockReturnValue(of({}))

      service.quizResultV7({ x: 1 }).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/user/assessment/v7/result',
        { x: 1 }
      )
    })

    it('should POST to PUBLIC_ASSESSMENT_RESULT when forPreview is truthy', () => {
      httpClientMock.post.mockReturnValue(of({}))

      service.quizResultV7({ x: 1 }, true).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        'api/public/assessment/v5/result',
        { x: 1 }
      )
    })
  })

  // ─── createAssessmentSubmitRequest ────────────────────────────────────────

  describe('createAssessmentSubmitRequest', () => {
    const baseOption = (optionId: string): NSPractice.IOption => ({
      optionId,
      text: 'Option text',
      isCorrect: false,
      hint: '',
    })

    it('should set userSelected=true for mcq-sca when option is in answer hash', () => {
      const quiz: NSPractice.IQuiz = {
        timeLimit: 60,
        isAssessment: false,
        questions: [{
          questionId: 'q1',
          questionType: 'mcq-sca',
          question: 'Q1',
          multiSelection: false,
          section: '',
          instructions: '',
          questionLevel: '',
          timeTaken: '',
          options: [baseOption('opt1'), baseOption('opt2')],
          choices: { options: [] },
        }],
      }

      const result = service.createAssessmentSubmitRequest(
        'id1', 'Title', quiz, { q1: ['opt1'] }, {}
      )

      expect(result.questions[0].options[0].userSelected).toBe(true)
      expect(result.questions[0].options[1].userSelected).toBe(false)
    })

    it('should set userSelected=false when no answer for mcq question', () => {
      const quiz: NSPractice.IQuiz = {
        timeLimit: 60,
        isAssessment: false,
        questions: [{
          questionId: 'q1',
          questionType: 'mcq-mca',
          question: 'Q1',
          multiSelection: true,
          section: '',
          instructions: '',
          questionLevel: '',
          timeTaken: '',
          options: [baseOption('opt1')],
          choices: { options: [] },
        }],
      }

      const result = service.createAssessmentSubmitRequest('id1', 'Title', quiz, {}, {})

      expect(result.questions[0].options[0].userSelected).toBe(false)
    })

    it('should set response for ftb question from answer hash', () => {
      const quiz: NSPractice.IQuiz = {
        timeLimit: 60,
        isAssessment: false,
        questions: [{
          questionId: 'q1',
          questionType: 'ftb',
          question: 'Q1',
          multiSelection: false,
          section: '',
          instructions: '',
          questionLevel: '',
          timeTaken: '',
          options: [baseOption('opt1'), baseOption('opt2')],
          choices: { options: [] },
        }],
      }

      const result = service.createAssessmentSubmitRequest(
        'id1', 'Title', quiz, { q1: ['ans1,ans2'] }, {}
      )

      expect(result.questions[0].options[0].response).toBe('ans1')
      expect(result.questions[0].options[1].response).toBe('ans2')
    })

    it('should skip ftb response when no answer hash entry', () => {
      const quiz: NSPractice.IQuiz = {
        timeLimit: 60,
        isAssessment: false,
        questions: [{
          questionId: 'q1',
          questionType: 'ftb',
          question: 'Q1',
          multiSelection: false,
          section: '',
          instructions: '',
          questionLevel: '',
          timeTaken: '',
          options: [baseOption('opt1')],
          choices: { options: [] },
        }],
      }

      const result = service.createAssessmentSubmitRequest('id1', 'Title', quiz, {}, {})

      expect(result.questions[0].options[0].response).toBeUndefined()
    })

    it('should set mtf response when source matches and targetId exists', () => {
      const quiz: NSPractice.IQuiz = {
        timeLimit: 60,
        isAssessment: false,
        questions: [{
          questionId: 'q1',
          questionType: 'mtf',
          question: 'Q1',
          multiSelection: false,
          section: '',
          instructions: '',
          questionLevel: '',
          timeTaken: '',
          rhsChoices: ['RHS1', 'RHS2'],
          options: [{ optionId: 'opt1', text: 'Source1', isCorrect: false }],
          choices: { options: [] },
        }],
      }

      const result = service.createAssessmentSubmitRequest(
        'id1', 'Title', quiz,
        {},
        { q1: { source: ['Source1'], target: ['target1'] } }
      )

      expect(result.questions[0].options[0].userSelected).toBe(true)
    })

    it('should set userSelected=false for mtf when targetId is missing', () => {
      const quiz: NSPractice.IQuiz = {
        timeLimit: 60,
        isAssessment: false,
        questions: [{
          questionId: 'q1',
          questionType: 'mtf',
          question: 'Q1',
          multiSelection: false,
          section: '',
          instructions: '',
          questionLevel: '',
          timeTaken: '',
          rhsChoices: ['RHS1'],
          options: [{ optionId: 'opt1', text: 'Source1', isCorrect: false }],
          choices: { options: [] },
        }],
      }

      const result = service.createAssessmentSubmitRequest(
        'id1', 'Title', quiz,
        {},
        { q1: { source: ['Source1'], target: [''] } }
      )

      expect(result.questions[0].options[0].userSelected).toBe(false)
    })

    it('should set response="" for mtf when source not in mtfSrc', () => {
      const quiz: NSPractice.IQuiz = {
        timeLimit: 60,
        isAssessment: false,
        questions: [{
          questionId: 'q1',
          questionType: 'mtf',
          question: 'Q1',
          multiSelection: false,
          section: '',
          instructions: '',
          questionLevel: '',
          timeTaken: '',
          options: [{ optionId: 'opt1', text: 'NoMatch', isCorrect: false }],
          choices: { options: [] },
        }],
      }

      const result = service.createAssessmentSubmitRequest(
        'id1', 'Title', quiz,
        {},
        { q1: { source: ['DifferentSource'], target: ['target1'] } }
      )

      expect(result.questions[0].options[0].response).toBe('')
    })
  })

  // ─── sanitizeAssessmentSubmitRequest ──────────────────────────────────────

  describe('sanitizeAssessmentSubmitRequest', () => {
    it('should clear question text and option text for non-ftb/mtf questions', () => {
      const req: NSPractice.IQuizSubmitRequest = {
        identifier: 'id1',
        isAssessment: false,
        questions: [{
          questionId: 'q1',
          questionType: 'mcq-sca',
          question: 'Some question text',
          multiSelection: false,
          section: '',
          instructions: '',
          questionLevel: '',
          timeTaken: '',
          options: [{ optionId: 'opt1', text: 'Option A', hint: 'hint', isCorrect: false }],
          choices: { options: [] },
        }],
        timeLimit: 60,
        title: 'Test',
      }

      const result = service.sanitizeAssessmentSubmitRequest(req)

      expect(result.questions[0].question).toBe('')
      expect(result.questions[0].options[0].hint).toBe('')
      expect(result.questions[0].options[0].text).toBe('')
    })

    it('should preserve option text for ftb questions', () => {
      const req: NSPractice.IQuizSubmitRequest = {
        identifier: 'id1',
        isAssessment: false,
        questions: [{
          questionId: 'q1',
          questionType: 'ftb',
          question: 'Fill the blank',
          multiSelection: false,
          section: '',
          instructions: '',
          questionLevel: '',
          timeTaken: '',
          options: [{ optionId: 'opt1', text: 'answer', hint: 'h', isCorrect: false }],
          choices: { options: [] },
        }],
        timeLimit: 60,
        title: 'Test',
      }

      const result = service.sanitizeAssessmentSubmitRequest(req)

      expect(result.questions[0].options[0].text).toBe('answer')
    })

    it('should preserve option text for mtf questions', () => {
      const req: NSPractice.IQuizSubmitRequest = {
        identifier: 'id1',
        isAssessment: false,
        questions: [{
          questionId: 'q1',
          questionType: 'mtf',
          question: 'Match the following',
          multiSelection: false,
          section: '',
          instructions: '',
          questionLevel: '',
          timeTaken: '',
          options: [{ optionId: 'opt1', text: 'match text', hint: 'h', isCorrect: false }],
          choices: { options: [] },
        }],
        timeLimit: 60,
        title: 'Test',
      }

      const result = service.sanitizeAssessmentSubmitRequest(req)

      expect(result.questions[0].options[0].text).toBe('match text')
    })
  })

  // ─── extractContent ───────────────────────────────────────────────────────

  describe('extractContent', () => {
    it('should extract text content from HTML string', () => {
      const result = service.extractContent('<p>Hello <strong>World</strong></p>')
      expect(result).toBe('Hello World')
    })

    it('should replace non-breaking spaces with regular spaces', () => {
      const result = service.extractContent('<p>Hello\u00A0World</p>')
      expect(result).toBe('Hello World')
    })

    it('should return empty string for empty html', () => {
      const result = service.extractContent('')
      expect(result).toBe('')
    })
  })

  // ─── getSection ───────────────────────────────────────────────────────────

  describe('getSection', () => {
    it('should POST to PUBLIC_QUESTION_READ for preview mode', () => {
      const sectionId = 'section1'
      const postData = { data: 'test' }
      const mockResponse = { success: true }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.getSection(sectionId, true, postData).subscribe((response: any) => {
        expect(response).toEqual(mockResponse)
      })

      expect(httpClientMock.post).toHaveBeenCalledWith(
        'api/public/assessment/v5/read',
        postData
      )
    })

    it('should GET with parentContextId for normal mode', () => {
      const sectionId = 'section1'
      const collectionId = 'col1'
      const mockResponse = { success: true }

      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.getSection(sectionId, false, undefined, collectionId).subscribe((response: any) => {
        expect(response).toEqual(mockResponse)
      })

      expect(httpClientMock.get).toHaveBeenCalledWith(
        `/apis/proxies/v8/assessment/v5/read/${sectionId}?parentContextId=${collectionId}`
      )
    })
  })

  // ─── getQuestions ─────────────────────────────────────────────────────────

  describe('getQuestions', () => {
    it('should POST to PUBLIC_QUESTION_LIST for preview mode', () => {
      const identifiers = ['id1', 'id2']
      const assessmentId = 'assess1'
      const collectionId = 'col1'
      httpClientMock.post.mockReturnValue(of({ count: 2, questions: [] }))

      service.getQuestions(identifiers, assessmentId, true, {}, collectionId).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/api/public/assessment/v1/question/list',
        expect.objectContaining({
          assessmentIdentifier: assessmentId,
          contextId: collectionId,
        })
      )
    })

    it('should POST to QUESTION_PAPER_QUESTIONS for normal mode', () => {
      const identifiers = ['id1']
      const assessmentId = 'assess1'
      httpClientMock.post.mockReturnValue(of({ count: 1, questions: [] }))

      service.getQuestions(identifiers, assessmentId).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/question/v5/read',
        expect.objectContaining({ assessmentId })
      )
    })
  })

  // ─── getSectionV4 ─────────────────────────────────────────────────────────

  describe('getSectionV4', () => {
    it('should POST to PUBLIC_QUESTION_READ for preview mode', () => {
      httpClientMock.post.mockReturnValue(of({}))

      service.getSectionV4('sec1', true, { data: 'x' }).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        'api/public/assessment/v5/read',
        { data: 'x' }
      )
    })

    it('should GET with parentContextId for normal mode', () => {
      httpClientMock.get.mockReturnValue(of({}))

      service.getSectionV4('sec1', false, undefined, 'col2').subscribe()

      expect(httpClientMock.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/assessment/read/sec1?parentContextId=col2'
      )
    })
  })

  // ─── getQuestionsV4 ───────────────────────────────────────────────────────

  describe('getQuestionsV4', () => {
    it('should POST to PUBLIC_QUESTION_V4_LIST for preview mode', () => {
      httpClientMock.post.mockReturnValue(of({ count: 0, questions: [] }))

      service.getQuestionsV4(['id1'], 'assess1', true, {}, 'col1').subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/api/public/assessment/v5/question/list',
        expect.objectContaining({ assessmentIdentifier: 'assess1' })
      )
    })

    it('should POST to QUESTION_PAPER_QUESTIONS_V4 for normal mode', () => {
      httpClientMock.post.mockReturnValue(of({ count: 0, questions: [] }))

      service.getQuestionsV4(['id1'], 'assess1').subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/question/read',
        expect.objectContaining({ assessmentId: 'assess1' })
      )
    })
  })

  // ─── shuffle ──────────────────────────────────────────────────────────────

  describe('shuffle', () => {
    it('should return array with same elements', () => {
      const original = ['a', 'b', 'c', 'd', 'e']
      const shuffled = service.shuffle([...original])
      expect(shuffled.length).toBe(original.length)
      original.forEach(item => expect(shuffled).toContain(item))
    })

    it('should return empty array unchanged', () => {
      expect(service.shuffle([])).toEqual([])
    })

    it('should return single-element array unchanged', () => {
      expect(service.shuffle(['only'])).toEqual(['only'])
    })
  })

  // ─── canAttend ────────────────────────────────────────────────────────────

  describe('canAttend', () => {
    it('should GET and return result for valid identifier', () => {
      const mockResponse = { result: { attemptsMade: 1, attemptsAllowed: 3 } }
      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.canAttend('quiz1').subscribe((res: any) => {
        expect(res).toEqual(mockResponse.result)
      })

      expect(httpClientMock.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/user/assessment/retake/quiz1'
      )
    })

    it('should return default attempts for empty identifier', () => {
      service.canAttend('').subscribe((res: any) => {
        expect(res).toEqual({ attemptsMade: 0, attemptsAllowed: 1 })
      })

      expect(httpClientMock.get).not.toHaveBeenCalled()
    })
  })

  // ─── canAttendV5 ──────────────────────────────────────────────────────────

  describe('canAttendV5', () => {
    it('should GET from v5 retake endpoint for valid identifier', () => {
      httpClientMock.get.mockReturnValue(of({ result: { attemptsMade: 2, attemptsAllowed: 5 } }))

      service.canAttendV5('quiz5').subscribe((res: any) => {
        expect(res).toEqual({ attemptsMade: 2, attemptsAllowed: 5 })
      })

      expect(httpClientMock.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/user/assessment/v5/retake/quiz5'
      )
    })

    it('should return default attempts for empty identifier', () => {
      service.canAttendV5('').subscribe((res: any) => {
        expect(res).toEqual({ attemptsMade: 0, attemptsAllowed: 1 })
      })

      expect(httpClientMock.get).not.toHaveBeenCalled()
    })
  })

  // ─── canAttendV7 ──────────────────────────────────────────────────────────

  describe('canAttendV7', () => {
    it('should GET from v7 retake endpoint for valid identifier', () => {
      httpClientMock.get.mockReturnValue(of({ result: { attemptsMade: 0, attemptsAllowed: 2 } }))

      service.canAttendV7('quiz7').subscribe((res: any) => {
        expect(res).toEqual({ attemptsMade: 0, attemptsAllowed: 2 })
      })

      expect(httpClientMock.get).toHaveBeenCalledWith(
        '/apis/proxies/v8/user/assessment/v7/retake/quiz7'
      )
    })

    it('should return default attempts for empty identifier', () => {
      service.canAttendV7('').subscribe((res: any) => {
        expect(res).toEqual({ attemptsMade: 0, attemptsAllowed: 1 })
      })

      expect(httpClientMock.get).not.toHaveBeenCalled()
    })
  })

  // ─── saveAndNextQuestion ──────────────────────────────────────────────────

  describe('saveAndNextQuestion', () => {
    it('should POST to SAVE_AND_NEXT_QUESTION endpoint and return response', () => {
      const mockResp = { result: { status: 'ok' } }
      httpClientMock.post.mockReturnValue(of(mockResp))

      service.saveAndNextQuestion(mockQuizReq()).subscribe((res: any) => {
        expect(res).toEqual(mockResp)
      })

      expect(httpClientMock.post).toHaveBeenCalledWith(
        'apis/proxies/v8/assessment/save',
        mockQuizReq()
      )
    })
  })

  // ─── shCorrectAnswer ──────────────────────────────────────────────────────

  describe('shCorrectAnswer', () => {
    it('should set displayCorrectAnswer to true', () => {
      service.shCorrectAnswer(true)
      expect(service.displayCorrectAnswer.getValue()).toBe(true)
    })

    it('should set displayCorrectAnswer to false', () => {
      service.shCorrectAnswer(true)
      service.shCorrectAnswer(false)
      expect(service.displayCorrectAnswer.getValue()).toBe(false)
    })
  })
})
