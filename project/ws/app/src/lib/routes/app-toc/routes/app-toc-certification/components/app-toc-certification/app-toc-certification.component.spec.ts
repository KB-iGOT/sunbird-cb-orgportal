jest.mock('@ws-widget/collection', () => ({
    NsContent: {},
}), { virtual: true })

import { of, throwError } from 'rxjs'
import { AppTocCertificationComponent } from './app-toc-certification.component'

describe('AppTocCertificationComponent', () => {
    let component: AppTocCertificationComponent
    let mockActivatedRoute: any
    let mockCertificationService: any
    let mockCertificationApiService: any

    beforeEach(() => {
        mockActivatedRoute = {
            snapshot: { params: {} },
        }

        mockCertificationService = {
            getCertificationMeta: jest.fn().mockReturnValue(of({ id: 'cert-1', name: 'Test Cert' })),
            getContentMeta: jest.fn().mockReturnValue(of({ identifier: 'content-1', name: 'Test Content' })),
        }

        mockCertificationApiService = {
            getCertificationInfo: jest.fn().mockReturnValue(of({ id: 'cert-1' })),
        }

        component = new AppTocCertificationComponent(
            mockActivatedRoute,
            mockCertificationService,
            mockCertificationApiService,
        )
    })

    it('should create the component', () => {
        expect(component).toBeTruthy()
    })

    it('should initialize with default values', () => {
        expect(component.fetchStatus).toBe('none')
        expect(component.certificationFetchSubject).toBeDefined()
        expect(component.subscriptionSubject$).toBeDefined()
    })

    describe('ngOnInit', () => {
        it('should call subscribeToContentResolve and set content', () => {
            component.ngOnInit()
            expect(mockCertificationService.getContentMeta).toHaveBeenCalledWith(mockActivatedRoute)
            expect(component.content).toEqual({ identifier: 'content-1', name: 'Test Content' })
        })

        it('should call subscribeToCertificationResolve and set certification', () => {
            component.ngOnInit()
            expect(mockCertificationService.getCertificationMeta).toHaveBeenCalledWith(mockActivatedRoute)
            expect(component.certification).toEqual({ id: 'cert-1', name: 'Test Cert' })
            expect(component.fetchStatus).toBe('done')
        })

        it('should set fetchStatus to error when getCertificationMeta fails', () => {
            mockCertificationService.getCertificationMeta.mockReturnValue(throwError('error'))
            component.ngOnInit()
            expect(component.fetchStatus).toBe('error')
        })

        it('should not update content when getContentMeta fails', () => {
            mockCertificationService.getContentMeta.mockReturnValue(throwError('error'))
            component.ngOnInit()
            expect(component.content).toBeUndefined()
        })
    })

    describe('onSlotCancel', () => {
        it('should call getCertificationInfo when content is defined', () => {
            component.content = { identifier: 'content-1' } as any
            component.ngOnInit()
            component.onSlotCancel()
            expect(mockCertificationApiService.getCertificationInfo).toHaveBeenCalledWith('content-1')
        })

        it('should not call getCertificationInfo if content is null', () => {
            component.content = null
            component.onSlotCancel()
            expect(mockCertificationApiService.getCertificationInfo).not.toHaveBeenCalled()
        })

        it('should update certification on successful getCertificationInfo', () => {
            const certData = { id: 'new-cert' }
            mockCertificationApiService.getCertificationInfo.mockReturnValue(of(certData))
            component.content = { identifier: 'content-1' } as any
            component.onSlotCancel()
            expect(component.certification).toEqual(certData)
        })
    })

    describe('certificationFetchSubject', () => {
        it('should update certification when subject emits and content exists', () => {
            const certData = { id: 'fetched-cert' }
            mockCertificationApiService.getCertificationInfo.mockReturnValue(of(certData))
            component.content = { identifier: 'content-1' } as any
            component.ngOnInit()
            component.certificationFetchSubject.next(true)
            expect(mockCertificationApiService.getCertificationInfo).toHaveBeenCalledWith('content-1')
        })

        it('should fall back to existing certification on API error', () => {
            mockCertificationApiService.getCertificationInfo.mockReturnValue(throwError('api-error'))
            component.content = { identifier: 'content-1' } as any
            component.ngOnInit()
            // ngOnInit sets certification via getCertificationMeta; catchError returns of(this.certification)
            const expectedFallback = component.certification
            component.certificationFetchSubject.next(true)
            expect(component.certification).toEqual(expectedFallback)
        })
    })

    describe('ngOnDestroy', () => {
        it('should complete subscriptions on ngOnDestroy', () => {
            const nextSpy = jest.spyOn(component.subscriptionSubject$, 'next')
            const completeSpy = jest.spyOn(component.subscriptionSubject$, 'complete')
            component.ngOnDestroy()
            expect(nextSpy).toHaveBeenCalled()
            expect(completeSpy).toHaveBeenCalled()
        })

        it('should stop subscriptions after destroy', () => {
            component.ngOnInit()
            component.ngOnDestroy()
            expect(() => component.certificationFetchSubject.next(true)).not.toThrow()
        })
    })
})
