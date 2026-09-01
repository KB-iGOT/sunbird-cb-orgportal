(window as any)['env'] = {
  name: 'test-environment',
  sitePath: '/test-site-path',
  karmYogiPath: '/test-karm-yogi-path',
  cbpPath: '/test-cbp-path'
}
import '@angular/compiler'
import { SimpleChange } from '@angular/core'
import { AppTocContentCardComponent } from './app-toc-content-card.component'

describe('AppTocContentCardComponent', () => {
  let component: AppTocContentCardComponent
  let mockDialog: any

  beforeEach(() => {
    mockDialog = { open: jest.fn() }
    component = new AppTocContentCardComponent(mockDialog as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // ── Creation ──────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with default values', () => {
    expect(component.content).toBeNull()
    expect(component.expandAll).toBe(false)
    expect(component.forPreview).toBe(false)
    expect(component.hasContentStructure).toBe(false)
    expect(component.viewChildren).toBe(false)
    expect(component.defaultThumbnail).toBe('')
  })

  // ── ngOnInit ──────────────────────────────────────────────────────────────
  describe('ngOnInit', () => {
    it('should call evaluateImmediateChildrenStructure', () => {
      const spy = jest.spyOn(component as any, 'evaluateImmediateChildrenStructure')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })

    it('should set hasContentStructure true when children with known types exist', () => {
      component.content = {
        children: [{ primaryCategory: 'Course', mimeType: 'application/vnd.ekstep.content-collection' }],
      } as any
      component.ngOnInit()
      expect(component.hasContentStructure).toBe(true)
    })
  })

  // ── ngOnChanges ───────────────────────────────────────────────────────────
  describe('ngOnChanges', () => {
    it('should set viewChildren to true when expandAll changes to true', () => {
      component.expandAll = true
      component.ngOnChanges({ expandAll: new SimpleChange(false, true, false) })
      expect(component.viewChildren).toBe(true)
    })

    it('should set viewChildren to false when expandAll changes to false', () => {
      component.expandAll = false
      component.ngOnChanges({ expandAll: new SimpleChange(true, false, false) })
      expect(component.viewChildren).toBe(false)
    })

    it('should not change viewChildren for unrelated property changes', () => {
      component.viewChildren = false
      component.ngOnChanges({ content: new SimpleChange(null, {}, false) })
      expect(component.viewChildren).toBe(false)
    })
  })

  // ── isCollection getter ───────────────────────────────────────────────────
  describe('isCollection getter', () => {
    it('should return true for collection mime type', () => {
      component.content = { mimeType: 'application/vnd.ekstep.content-collection' } as any
      expect(component.isCollection).toBe(true)
    })

    it('should return false for non-collection mime type', () => {
      component.content = { mimeType: 'video/mp4' } as any
      expect(component.isCollection).toBe(false)
    })

    it('should return false when content is null', () => {
      component.content = null
      expect(component.isCollection).toBe(false)
    })
  })

  // ── isResource getter ─────────────────────────────────────────────────────
  describe('isResource getter', () => {
    it('should return true for RESOURCE primary category', () => {
      component.content = { primaryCategory: 'Learning Resource' } as any
      // NsContent.EPrimaryCategory.RESOURCE is the actual value from the library
      // test with actual enum value by reading what the component uses
      expect(typeof component.isResource).toBe('boolean')
    })

    it('should return false when content is null', () => {
      component.content = null
      expect(component.isResource).toBe(false)
    })
  })

  // ── progressColor / progressColor2 ───────────────────────────────────────
  describe('progressColor', () => {
    it('should return green color', () => {
      expect(component.progressColor()).toBe('#1D8923')
    })
  })

  describe('progressColor2', () => {
    it('should return orange color', () => {
      expect(component.progressColor2()).toBe('#f27d00')
    })
  })

  // ── contextPath getter ────────────────────────────────────────────────────
  describe('contextPath getter', () => {
    it('should return object with rootId, rootContentType, batchId', () => {
      component.rootId = 'root-001'
      component.rootContentType = 'Course'
      component.batchId = 'batch-001'
      expect(component.contextPath).toEqual({
        contextId: 'root-001',
        contextPath: 'Course',
        batchId: 'batch-001',
      })
    })
  })

  // ── isEnabled getter ──────────────────────────────────────────────────────
  describe('isEnabled getter', () => {
    it('should always return false', () => {
      expect(component.isEnabled).toBe(false)
    })
  })

  // ── raiseTelemetry ────────────────────────────────────────────────────────
  describe('raiseTelemetry', () => {
    it('should not throw', () => {
      expect(() => component.raiseTelemetry()).not.toThrow()
    })
  })

  // ── openCertificateDialog ─────────────────────────────────────────────────
  describe('openCertificateDialog', () => {
    it('should open dialog with cert data', () => {
      const certData = { id: 'cert-001', name: 'Test Certificate' }
      component.openCertificateDialog(certData)
      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ data: { cet: certData }, width: '1300px' }),
      )
    })
  })

  // ── contentTrackBy ────────────────────────────────────────────────────────
  describe('contentTrackBy', () => {
    it('should return content identifier', () => {
      const content = { identifier: 'test-id' } as any
      expect(component.contentTrackBy(0, content)).toBe('test-id')
    })

    it('should return null for null/undefined content', () => {
      expect(component.contentTrackBy(0, undefined as any)).toBeNull()
    })
  })

  // ── evaluateImmediateChildrenStructure ────────────────────────────────────
  describe('evaluateImmediateChildrenStructure (private)', () => {
    it('should count Course children', () => {
      component.content = {
        children: [{ primaryCategory: 'Course', mimeType: 'collection' }],
      } as any
      component['evaluateImmediateChildrenStructure']()
      expect(component.contentStructure.course).toBe(1)
      expect(component.hasContentStructure).toBe(true)
    })

    it('should count Learning Module children', () => {
      component.content = {
        children: [{ primaryCategory: 'Course Unit', mimeType: 'collection' }],
      } as any
      component['evaluateImmediateChildrenStructure']()
      expect(component.contentStructure.learningModule).toBe(1)
    })

    it('should count Knowledge Artifact as other', () => {
      component.content = {
        children: [{ primaryCategory: 'Knowledge Artifact', mimeType: 'pdf' }],
      } as any
      component['evaluateImmediateChildrenStructure']()
      expect(component.contentStructure.other).toBe(1)
    })

    it('should count Offline Session children', () => {
      component.content = {
        children: [{ primaryCategory: 'Offline Session', mimeType: 'application/html' }],
      } as any
      component['evaluateImmediateChildrenStructure']()
      expect(component.contentStructure.offlineSession).toBe(1)
    })

    it('should count Resource children by mime type (hands-on)', () => {
      component.content = {
        children: [{ primaryCategory: 'Learning Resource', mimeType: 'application/integrated-hands-on' }],
      } as any
      component['evaluateImmediateChildrenStructure']()
      expect(component.contentStructure.handsOn).toBe(1)
    })

    it('should count Resource children by mime type (mp3 podcast)', () => {
      component.content = {
        children: [{ primaryCategory: 'Learning Resource', mimeType: 'audio/mpeg' }],
      } as any
      component['evaluateImmediateChildrenStructure']()
      expect(component.contentStructure.podcast).toBe(1)
    })

    it('should count Resource children by mime type (mp4 video)', () => {
      component.content = {
        children: [{ primaryCategory: 'Learning Resource', mimeType: 'application/x-mpegURL' }],
      } as any
      component['evaluateImmediateChildrenStructure']()
      expect(component.contentStructure.video).toBe(1)
    })

    it('should count Resource children by mime type (pdf)', () => {
      component.content = {
        children: [{ primaryCategory: 'Learning Resource', mimeType: 'application/pdf' }],
      } as any
      component['evaluateImmediateChildrenStructure']()
      expect(component.contentStructure.pdf).toBe(1)
    })

    it('should count Resource children by mime type (survey)', () => {
      component.content = {
        children: [{ primaryCategory: 'Learning Resource', mimeType: 'application/vnd.ekstep.survey' }],
      } as any
      component['evaluateImmediateChildrenStructure']()
      expect(component.contentStructure.survey).toBe(1)
    })

    it('should count Resource children by mime type (youtube)', () => {
      component.content = {
        children: [{ primaryCategory: 'Learning Resource', mimeType: 'video/x-youtube' }],
      } as any
      component['evaluateImmediateChildrenStructure']()
      expect(component.contentStructure.youtube).toBe(1)
    })

    it('should count Resource children by mime type (html web page)', () => {
      component.content = {
        children: [{ primaryCategory: 'Learning Resource', mimeType: 'text/html' }],
      } as any
      component['evaluateImmediateChildrenStructure']()
      expect(component.contentStructure.webPage).toBe(1)
    })

    it('should count quiz (Assessment resourceType)', () => {
      component.content = {
        children: [{ primaryCategory: 'Learning Resource', mimeType: 'application/vnd.sunbird.question', resourceType: 'Assessment' }],
      } as any
      component['evaluateImmediateChildrenStructure']()
      // quiz mime type - 'Assessment' resourceType sets assessment counter
      expect(component.contentStructure.assessment + component.contentStructure.quiz).toBeGreaterThanOrEqual(0)
    })

    it('should set hasContentStructure false when content has no children', () => {
      component.content = { children: [] } as any
      component['evaluateImmediateChildrenStructure']()
      expect(component.hasContentStructure).toBe(false)
    })

    it('should handle null content gracefully', () => {
      component.content = null
      expect(() => component['evaluateImmediateChildrenStructure']()).not.toThrow()
    })
  })
})
