import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { SurveyFormComponent } from './survey-form.component'
import { of } from 'rxjs'

describe('SurveyFormComponent', () => {
    let component: SurveyFormComponent

    const activatedRoute: Partial<ActivatedRoute> = {
        data: of({
            pageData: {
                data: {
                    bulkUploadConfig: {
                        pageSize: 10,
                        pageSizeOptions: [10, 20, 30],
                    },
                },
            },
        }),
        snapshot: {
            data: {
                configService: {
                    userProfile: {
                        rootOrgId: 'sampleRootOrgId',
                        userProfileV2: {
                            email: 'test@example.com',
                            mobile: '1234567890',
                        },
                        orgReadData: {
                            frameworkid: 'sampleFrameworkId',
                        },
                    },
                },
            },
            url: [],
            params: {},
            queryParams: {},
            fragment: null,
            outlet: 'primary',
            component: null,
        } as unknown as ActivatedRouteSnapshot,
        url: [],
        params: {},
        queryParams: {},
        fragment: null,
        outlet: 'primary',
        component: null,
    } as unknown as ActivatedRoute

    const configSvc: Partial<ConfigurationsService> = {
        unMappedUser: {
            profileDetails: {
                get_started_tour: {
                    skipped: false,
                    visited: true,
                },
            },
        },
    }

    beforeAll(() => {
        component = new SurveyFormComponent(
            activatedRoute as ActivatedRoute,
            configSvc as ConfigurationsService,
        )
    })

    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()
        localStorage.clear()
    })

    it('should create an instance of the component', () => {
        expect(component).toBeTruthy()
    })

    it('should initialize survey data on ngOnInit', () => {
        component.ngOnInit()

    })

    it('should set isTourDone based on user profile details', () => {
        component.ngOnInit()
        expect(component.isTourDone).toBe(true)
    })

    it('should set localStorageFlag based on localStorage value', () => {
        localStorage.setItem('surveyPopup', 'true')
        component.ngOnInit()
        expect(component.localStorageFlag).toBe(true)

        localStorage.setItem('surveyPopup', 'false')
        component.ngOnInit()
        expect(component.localStorageFlag).toBe(false)
    })

    it('should set isSurveyPopup to false and update localStorage on closeCard', () => {
        component.isSurveyPopup = true
        component.localStorageFlag = true
        component.closeCard()

        expect(component.isSurveyPopup).toBe(false)
        expect(localStorage.getItem('surveyPopup')).toBe('false')
    })

    it('should close survey popup and update localStorage on clickedOut if target class contains main-survey', () => {
        component.isSurveyPopup = true
        component.localStorageFlag = true
        component.clickedOut({ target: { className: 'main-survey-content' } })

        expect(component.isSurveyPopup).toBe(false)
        expect(localStorage.getItem('surveyPopup')).toBe('false')
    })

    it('should not close survey popup if target class does not contain main-survey', () => {
        component.isSurveyPopup = true
        component.localStorageFlag = true
        component.clickedOut({ target: { className: 'other-class' } })

        expect(component.isSurveyPopup).toBe(true)
        expect(localStorage.getItem('surveyPopup')).toBeNull()
    })
})
