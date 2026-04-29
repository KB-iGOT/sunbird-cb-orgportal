import { AppTocCertificationComponent } from './app-toc-certification.component'

describe('AppTocCertificationComponent', () => {
    let component: AppTocCertificationComponent
    let mockActivatedRoute: any
    let mockCertificationService: any
    let mockCertificationApiService: any

    beforeEach(() => {
        mockActivatedRoute = {
            snapshot: {
                params: {},
            },
        }

        mockCertificationService = {
            getCertificationMeta: jest.fn(),
            getContentMeta: jest.fn(),
        }

        mockCertificationApiService = {
            getCertificationInfo: jest.fn(),
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





    it('should not call getCertificationInfo if content is not defined on onSlotCancel', () => {
        component.content = null

        component.onSlotCancel()

        expect(mockCertificationApiService.getCertificationInfo).not.toHaveBeenCalled()
    })

    it('should complete subscriptions on ngOnDestroy', () => {
        const nextSpy = jest.spyOn(component.subscriptionSubject$, 'next')
        const completeSpy = jest.spyOn(component.subscriptionSubject$, 'complete')

        component.ngOnDestroy()

        expect(nextSpy).toHaveBeenCalled()
        expect(completeSpy).toHaveBeenCalled()
    })
})