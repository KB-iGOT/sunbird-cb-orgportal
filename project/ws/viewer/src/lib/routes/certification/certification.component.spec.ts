jest.mock('@sunbird-cb/collection', () => ({
  NsContent: {},
  WidgetContentService: jest.fn(),
}))

import { of } from 'rxjs'
import { CertificationComponent } from './certification.component'

describe('CertificationComponent', () => {
  let component: CertificationComponent
  let mockActivatedRoute: any
  let mockContentSvc: any

  const mockCertData = {
    identifier: 'cert-001',
    name: 'Test Certification',
    artifactUrl: 'https://example.com/cert.pdf',
  }

  beforeEach(() => {
    mockActivatedRoute = {
      data: of({ content: { data: mockCertData } }),
    }
    mockContentSvc = {
      setS3Cookie: jest.fn().mockReturnValue({ toPromise: jest.fn().mockResolvedValue(undefined) }),
    }
    component = new CertificationComponent(mockActivatedRoute, mockContentSvc)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with defaults', () => {
    expect(component.isFetchingDataComplete).toBe(false)
    expect(component.certificationData).toBeNull()
  })

  describe('ngOnInit', () => {
    it('should load certification data from route', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.certificationData).toEqual(mockCertData)
    })

    it('should set isFetchingDataComplete to true after loading', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(component.isFetchingDataComplete).toBe(true)
    })

    it('should call setS3Cookie when artifactUrl contains content-store', async () => {
      const s3CertData = { ...mockCertData, artifactUrl: 'https://example.com/content-store/cert.pdf' }
      mockActivatedRoute.data = of({ content: { data: s3CertData } })
      component = new CertificationComponent(mockActivatedRoute, mockContentSvc)
      component.ngOnInit()
      await new Promise(r => setTimeout(r, 0))
      expect(mockContentSvc.setS3Cookie).toHaveBeenCalledWith('cert-001')
    })

    it('should not call setS3Cookie when artifactUrl does not contain content-store', async () => {
      component.ngOnInit()
      await Promise.resolve()
      expect(mockContentSvc.setS3Cookie).not.toHaveBeenCalled()
    })

    it('should handle route error gracefully', () => {
      mockActivatedRoute.data = { subscribe: (_cb: any, err: any) => err('error') }
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe from route data subscription', () => {
      component.ngOnInit()
      const unsubSpy = jest.fn()
        ; (component as any).routeDataSubscription = { unsubscribe: unsubSpy }
      component.ngOnDestroy()
      expect(unsubSpy).toHaveBeenCalled()
    })

    it('should handle null subscription gracefully', () => {
      ; (component as any).routeDataSubscription = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })
})
