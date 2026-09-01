import { PdfScormDataService } from './pdf-scorm-data-service'
import { Subject } from 'rxjs'

describe('PdfScormDataService', () => {
  let service: PdfScormDataService

  beforeEach(() => {
    service = new PdfScormDataService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('should expose handleBackFromPdfScormFullScreen as a Subject', () => {
    expect(service.handleBackFromPdfScormFullScreen).toBeInstanceOf(Subject)
  })

  it('should expose handlePdfMarkComplete as a Subject', () => {
    expect(service.handlePdfMarkComplete).toBeInstanceOf(Subject)
  })

  describe('handleBackFromPdfScormFullScreen', () => {
    it('should emit values to subscribers', (done) => {
      service.handleBackFromPdfScormFullScreen.subscribe((value) => {
        expect(value).toBe(true)
        done()
      })
      service.handleBackFromPdfScormFullScreen.next(true)
    })

    it('should emit false to subscribers', (done) => {
      service.handleBackFromPdfScormFullScreen.subscribe((value) => {
        expect(value).toBe(false)
        done()
      })
      service.handleBackFromPdfScormFullScreen.next(false)
    })
  })

  describe('handlePdfMarkComplete', () => {
    it('should emit content data to subscribers', (done) => {
      const contentData = { status: 2, identifier: 'pdf-001' }
      service.handlePdfMarkComplete.subscribe((value) => {
        expect(value).toEqual(contentData)
        done()
      })
      service.handlePdfMarkComplete.next(contentData)
    })

    it('should emit null to subscribers', (done) => {
      service.handlePdfMarkComplete.subscribe((value) => {
        expect(value).toBeNull()
        done()
      })
      service.handlePdfMarkComplete.next(null)
    })
  })
})
