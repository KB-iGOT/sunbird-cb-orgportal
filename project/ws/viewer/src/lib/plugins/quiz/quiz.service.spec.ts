import { of } from 'rxjs'
import { QuizService } from './quiz.service'
import { NSQuiz } from './quiz.model'

describe('QuizService', () => {
  let service: QuizService
  let mockHttp: any

  const buildQuestion = (overrides: Partial<NSQuiz.IQuestion> = {}): NSQuiz.IQuestion => ({
    multiSelection: false,
    section: '',
    question: 'What is 2+2?',
    questionId: 'q1',
    instructions: null,
    questionType: 'mcq-sca',
    questionLevel: 'easy',
    marks: 1,
    options: [
      { optionId: 'o1', text: 'Three', isCorrect: false },
      { optionId: 'o2', text: 'Four', isCorrect: true },
    ],
    choices: [],
    ...overrides,
  })

  const buildQuiz = (overrides: Partial<NSQuiz.IQuiz> = {}): NSQuiz.IQuiz => ({
    timeLimit: 300,
    questions: [buildQuestion()],
    isAssessment: false,
    maxQuestions: 1,
    requiresSubmit: 'Yes',
    showTimer: 'Yes',
    allowSkip: 'No',
    primaryCategory: 'Practice Resource' as any,
    ...overrides,
  })

  beforeEach(() => {
    mockHttp = { post: jest.fn() }
    service = new QuizService(mockHttp)
  })

  afterEach(() => jest.clearAllMocks())

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  // ─── submitQuizV2 ─────────────────────────────────────────────────────────

  describe('submitQuizV2', () => {
    it('should POST to the correct endpoint', () => {
      const req: NSQuiz.IQuizSubmitRequest = {
        identifier: 'q1',
        isAssessment: false,
        questions: [],
        timeLimit: 300,
        title: 'Test Quiz',
      }
      const mockResponse: NSQuiz.IQuizSubmitResponse = {
        blank: 0, correct: 1, inCorrect: 0, passPercent: 100, result: 100, total: 1,
      }
      mockHttp.post.mockReturnValue(of(mockResponse))

      service.submitQuizV2(req)

      expect(mockHttp.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/evaluate/assessment/submit/v2',
        req,
      )
    })

    it('should return the observable from http.post', done => {
      const mockResponse: NSQuiz.IQuizSubmitResponse = {
        blank: 0, correct: 1, inCorrect: 0, passPercent: 80, result: 80, total: 1,
      }
      mockHttp.post.mockReturnValue(of(mockResponse))

      service.submitQuizV2({} as any).subscribe(res => {
        expect(res).toEqual(mockResponse)
        done()
      })
    })
  })

  // ─── createAssessmentSubmitRequest ────────────────────────────────────────

  describe('createAssessmentSubmitRequest', () => {
    it('should return a request with identifier and title', () => {
      const quiz = buildQuiz()
      const result = service.createAssessmentSubmitRequest('id1', 'My Quiz', quiz, {})
      expect(result.identifier).toBe('id1')
      expect(result.title).toBe('My Quiz')
    })

    it('should set userSelected=true for selected option in mcq-sca', () => {
      const quiz = buildQuiz()
      const answerHash = { q1: ['o2'] }
      const result = service.createAssessmentSubmitRequest('id1', 'Quiz', quiz, answerHash)
      const option = result.questions[0].options.find(o => o.optionId === 'o2')
      expect(option?.userSelected).toBe(true)
    })

    it('should set userSelected=false for unselected option in mcq-sca', () => {
      const quiz = buildQuiz()
      const answerHash = { q1: ['o2'] }
      const result = service.createAssessmentSubmitRequest('id1', 'Quiz', quiz, answerHash)
      const option = result.questions[0].options.find(o => o.optionId === 'o1')
      expect(option?.userSelected).toBe(false)
    })

    it('should set userSelected=false when questionId not in answerHash', () => {
      const quiz = buildQuiz()
      const answerHash = {}
      const result = service.createAssessmentSubmitRequest('id1', 'Quiz', quiz, answerHash)
      result.questions[0].options.forEach(opt => {
        expect(opt.userSelected).toBe(false)
      })
    })

    it('should handle mcq-mca question type', () => {
      const quiz = buildQuiz({ questions: [buildQuestion({ questionType: 'mcq-mca' })] })
      const answerHash = { q1: ['o1', 'o2'] }
      const result = service.createAssessmentSubmitRequest('id1', 'Quiz', quiz, answerHash)
      expect(result.questions[0].options[0].userSelected).toBe(true)
      expect(result.questions[0].options[1].userSelected).toBe(true)
    })

    it('should handle undefined questionType as mcq-sca', () => {
      const quiz = buildQuiz({ questions: [buildQuestion({ questionType: undefined })] })
      const answerHash = { q1: ['o1'] }
      const result = service.createAssessmentSubmitRequest('id1', 'Quiz', quiz, answerHash)
      expect(result.questions[0].options[0].userSelected).toBe(true)
    })

    it('should handle fitb question type and set response', () => {
      const fitbQuestion = buildQuestion({
        questionType: 'fitb',
        options: [{ optionId: 'f1', text: 'blank1' }],
      })
      const quiz = buildQuiz({ questions: [fitbQuestion] })
      const answerHash = { q1: ['answer1,answer2'] }
      const result = service.createAssessmentSubmitRequest('id1', 'Quiz', quiz, answerHash)
      expect(result.questions[0].options[0].response).toBe('answer1')
    })

    it('should handle fitb when no answer provided', () => {
      const fitbQuestion = buildQuestion({
        questionType: 'fitb',
        options: [{ optionId: 'f1', text: 'blank1' }],
      })
      const quiz = buildQuiz({ questions: [fitbQuestion] })
      const result = service.createAssessmentSubmitRequest('id1', 'Quiz', quiz, {})
      // Should not throw and response should be undefined
      expect(result.questions[0].options[0].response).toBeUndefined()
    })

    it('should handle mtf question type and set response from match', () => {
      const mtfQuestion = buildQuestion({
        questionType: 'mtf',
        options: [
          { optionId: 'm1', text: '  Source A  ' },
          { optionId: 'm2', text: '  Source B  ' },
        ],
      })
      const quiz = buildQuiz({ questions: [mtfQuestion] })
      const answerHash = {
        q1: [[
          {
            source: { innerText: 'Source A' },
            target: { innerText: 'Target A' },
          },
        ]],
      }
      const result = service.createAssessmentSubmitRequest('id1', 'Quiz', quiz, answerHash)
      expect(result.questions[0].options[0].response).toBe('Target A')
    })

    it('should set response to empty string for unmatched mtf option', () => {
      const mtfQuestion = buildQuestion({
        questionType: 'mtf',
        options: [{ optionId: 'm1', text: 'Source A' }],
      })
      const quiz = buildQuiz({ questions: [mtfQuestion] })
      const answerHash = { q1: [[]] } // no match data
      const result = service.createAssessmentSubmitRequest('id1', 'Quiz', quiz, answerHash)
      expect(result.questions[0].options[0].response).toBe('')
    })

    it('should set response to empty string when mtf answer not in hash', () => {
      const mtfQuestion = buildQuestion({
        questionType: 'mtf',
        options: [{ optionId: 'm1', text: 'Source A' }],
      })
      const quiz = buildQuiz({ questions: [mtfQuestion] })
      const result = service.createAssessmentSubmitRequest('id1', 'Quiz', quiz, {})
      expect(result.questions[0].options[0].response).toBe('')
    })
  })

  // ─── sanitizeAssessmentSubmitRequest ─────────────────────────────────────

  describe('sanitizeAssessmentSubmitRequest', () => {
    it('should clear question text', () => {
      const req: NSQuiz.IQuizSubmitRequest = {
        identifier: 'id1',
        title: 'Quiz',
        isAssessment: false,
        timeLimit: 300,
        questions: [buildQuestion({ question: 'What is 2+2?' })],
      }
      service.sanitizeAssessmentSubmitRequest(req)
      expect(req.questions[0].question).toBe('')
    })

    it('should clear hint of non-fitb/non-mtf options', () => {
      const req: NSQuiz.IQuizSubmitRequest = {
        identifier: 'id1',
        title: 'Quiz',
        isAssessment: false,
        timeLimit: 300,
        questions: [buildQuestion({ options: [{ optionId: 'o1', text: 'Four', hint: 'Hint text' }] })],
      }
      service.sanitizeAssessmentSubmitRequest(req)
      expect(req.questions[0].options[0].hint).toBe('')
    })

    it('should clear text of non-fitb/non-mtf options', () => {
      const req: NSQuiz.IQuizSubmitRequest = {
        identifier: 'id1',
        title: 'Quiz',
        isAssessment: false,
        timeLimit: 300,
        questions: [buildQuestion({ options: [{ optionId: 'o1', text: 'Four' }] })],
      }
      service.sanitizeAssessmentSubmitRequest(req)
      expect(req.questions[0].options[0].text).toBe('')
    })

    it('should preserve text of fitb options', () => {
      const req: NSQuiz.IQuizSubmitRequest = {
        identifier: 'id1',
        title: 'Quiz',
        isAssessment: false,
        timeLimit: 300,
        questions: [buildQuestion({
          questionType: 'fitb',
          options: [{ optionId: 'f1', text: 'blank1', hint: 'a hint' }],
        })],
      }
      service.sanitizeAssessmentSubmitRequest(req)
      expect(req.questions[0].options[0].text).toBe('blank1')
    })

    it('should preserve text of mtf options', () => {
      const req: NSQuiz.IQuizSubmitRequest = {
        identifier: 'id1',
        title: 'Quiz',
        isAssessment: false,
        timeLimit: 300,
        questions: [buildQuestion({
          questionType: 'mtf',
          options: [{ optionId: 'm1', text: 'Source A', hint: 'a hint' }],
        })],
      }
      service.sanitizeAssessmentSubmitRequest(req)
      expect(req.questions[0].options[0].text).toBe('Source A')
    })

    it('should return the mutated request', () => {
      const req: NSQuiz.IQuizSubmitRequest = {
        identifier: 'id1', title: 'Quiz', isAssessment: false, timeLimit: 300, questions: [],
      }
      const result = service.sanitizeAssessmentSubmitRequest(req)
      expect(result).toBe(req)
    })

    it('should handle empty questions array', () => {
      const req: NSQuiz.IQuizSubmitRequest = {
        identifier: 'id1', title: 'Quiz', isAssessment: false, timeLimit: 300, questions: [],
      }
      expect(() => service.sanitizeAssessmentSubmitRequest(req)).not.toThrow()
    })
  })
})
