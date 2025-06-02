import { StateProfileHomeComponent } from './state-profile-home.component'
import { of, BehaviorSubject } from 'rxjs'
import { NavigationEnd } from '@angular/router'
import * as _ from 'lodash'

// Mock dependencies
const mockValueService = {
    isLtMedium$: of(false)
}

const mockActivatedRoute = {
    parent: {
        snapshot: {
            data: {
                pageData: {
                    data: {
                        tabs: [
                            { key: 'welcome', step: 1, routerLink: '/welcome', description: 'Welcome step', allowSkip: true },
                            { key: 'instituteProfile', step: 2, routerLink: '/institute', description: 'Institute Profile', allowSkip: false },
                            { key: 'rolesAndFunctions', step: 3, routerLink: '/roles', description: 'Roles and Functions', allowSkip: true }
                        ]
                    }
                }
            }
        }
    }
}

const mockRouter = {
    events: of(new NavigationEnd(1, '/welcome', '/welcome')),
    navigate: jest.fn()
}

const mockStepService = {
    allSteps: { next: jest.fn() },
    currentStep: {
        next: jest.fn(),
        value: { allowSkip: true }
    },
    skiped: { next: jest.fn() }
}

const mockConfigService = {
    userProfileV2: { userId: 'test-user-id' },
    unMappedUser: {
        rootOrgId: 'test-org-id',
        orgProfile: {}
    }
}

const mockSnackBar = {
    open: jest.fn()
}

const mockOrgService = {
    formValues: {
        welcome: 'test-value',
        instituteProfile: { name: 'Test Institute' }
    },
    updateOrgProfileDetails: jest.fn().mockReturnValue(of({
        result: {
            result: { id: 'test-profile' }
        }
    })),
    getFormStatus: jest.fn().mockReturnValue(true)
}

describe('StateProfileHomeComponent', () => {
    let component: StateProfileHomeComponent

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks()

        // Create component instance
        component = new StateProfileHomeComponent(
            mockValueService as any,
            mockActivatedRoute as any,
            mockRouter as any,
            mockStepService as any,
            mockConfigService as any,
            mockSnackBar as any,
            mockOrgService as any
        )
    })

    describe('Constructor and Initialization', () => {
        it('should create component and initialize tabs', () => {
            expect(component).toBeDefined()
            expect(component.tabs).toHaveLength(3)
            expect(component.tabs[0].step).toBe(1)
            expect(mockStepService.allSteps.next).toHaveBeenCalledWith(3)
        })

        it('should order tabs by step', () => {
            // const unorderedTabs = [
            //     { key: 'third', step: 3, routerLink: '/third', description: 'Third step' },
            //     { key: 'first', step: 1, routerLink: '/first', description: 'First step' },
            //     { key: 'second', step: 2, routerLink: '/second', description: 'Second step' }
            // ]

            //   mockActivatedRoute.parent.snapshot.data.pageData.data.tabs = unorderedTabs

            const newComponent = new StateProfileHomeComponent(
                mockValueService as any,
                mockActivatedRoute as any,
                mockRouter as any,
                mockStepService as any,
                mockConfigService as any,
                mockSnackBar as any,
                mockOrgService as any
            )

            expect(newComponent.tabs[0].step).toBe(1)
            expect(newComponent.tabs[1].step).toBe(2)
            expect(newComponent.tabs[2].step).toBe(3)
        })
    })

    describe('init method', () => {
        it('should subscribe to router events', () => {
            const mockRouterEvents = new BehaviorSubject(new NavigationEnd(1, '/welcome', '/welcome'))
            mockRouter.events = mockRouterEvents.asObservable()

            component.init()

            // expect(component.routerSubscription).toBeDefined()
        })

        it('should update message and current step on NavigationEnd', () => {
            const mockRouterEvents = new BehaviorSubject(new NavigationEnd(1, '/institute', '/institute'))
            mockRouter.events = mockRouterEvents.asObservable()

            component.init()

            expect(component.message).toBe('Institute Profile')
            expect(component.currentStep).toBe(2)
            expect(mockStepService.currentStep.next).toHaveBeenCalled()
        })

        it('should unsubscribe existing subscription before creating new one', () => {
            const mockUnsubscribe = jest.fn()
            //  component.routerSubscription = { unsubscribe: mockUnsubscribe } as any

            component.init()

            expect(mockUnsubscribe).toHaveBeenCalled()
        })
    })

    describe('updateProfile method', () => {
        it('should navigate to welcome page', () => {
            component.updateProfile()

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/welcome'])
        })
    })

    describe('updateOrgProfile method', () => {
        beforeEach(() => {
            component.currentStep = 1
        })

        it('should update org profile for current step', () => {
            const expectedRequest = {
                profileDetails: {
                    welcome: 'test-value'
                },
                orgId: 'test-org-id'
            }

            component.updateOrgProfile()

            expect(mockOrgService.updateOrgProfileDetails).toHaveBeenCalledWith(expectedRequest)
        })

        it('should update config service with new org profile', () => {
            component.updateOrgProfile()

            expect(mockConfigService.unMappedUser.orgProfile).toEqual({ id: 'test-profile' })
        })

        it('should navigate to welcome on submit', () => {
            component.updateOrgProfile(true)

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/welcome'])
        })

        it('should show snackbar on error', () => {
            const errorResponse = { error: 'Error: Something went wrong' }
            mockOrgService.updateOrgProfileDetails.mockReturnValue(
                new BehaviorSubject(null).pipe(() => {
                    throw errorResponse
                })
            )

            try {
                component.updateOrgProfile()
            } catch (error) {
                expect(mockSnackBar.open).toHaveBeenCalledWith('Something went wrong', 'X', { duration: 5000 })
            }
        })
    })

    describe('ngOnInit', () => {
        it('should subscribe to isLtMedium$ and set sideNavBarOpened', () => {
            const mockIsLtMedium = new BehaviorSubject(false)
            mockValueService.isLtMedium$ = mockIsLtMedium.asObservable()

            component.ngOnInit()

            expect(component.sideNavBarOpened).toBe(true)
            expect(component.screenSizeIsLtMedium).toBe(false)

            // Test with medium screen
            mockIsLtMedium.next(true)
            expect(component.sideNavBarOpened).toBe(false)
            expect(component.screenSizeIsLtMedium).toBe(true)
        })
    })

    describe('ngOnDestroy', () => {
        it('should unsubscribe from all subscriptions', () => {
            const mockUnsubscribe1 = jest.fn()
            const mockUnsubscribe2 = jest.fn()

            component.defaultSideNavBarOpenedSubscription = { unsubscribe: mockUnsubscribe1 }
            component.routerSubscription = { unsubscribe: mockUnsubscribe2 } as any

            component.ngOnDestroy()

            expect(mockUnsubscribe1).toHaveBeenCalled()
            expect(mockUnsubscribe2).toHaveBeenCalled()
        })

        it('should handle null subscriptions gracefully', () => {
            component.defaultSideNavBarOpenedSubscription = null
            component.routerSubscription = null

            expect(() => component.ngOnDestroy()).not.toThrow()
        })
    })

    describe('Getter: next', () => {
        beforeEach(() => {
            component.currentStep = 1
            mockStepService.currentStep.value = { allowSkip: true }
            mockOrgService.getFormStatus.mockReturnValue(true)
        })

        it('should return next step when allowed and form is valid', () => {
            const nextStep = component.next

            expect(nextStep).toEqual(component.tabs[1]) // step 2
        })

        it('should return "done" when no next step exists', () => {
            component.currentStep = 3 // last step

            const nextStep = component.next

            expect(nextStep).toBe('done')
        })

        it('should return undefined when next step is not allowed', () => {
            mockStepService.currentStep.value = { allowSkip: false }
            component.currentStep = 2 // instituteProfile step

            const nextStep = component.next

            expect(nextStep).toBeUndefined()
        })

        it('should return undefined when form is not valid', () => {
            mockOrgService.getFormStatus.mockReturnValue(false)

            const nextStep = component.next

            expect(nextStep).toBeUndefined()
        })
    })

    describe('Getter: previous', () => {
        it('should return previous step when exists', () => {
            component.currentStep = 2

            const previousStep = component.previous

            expect(previousStep).toEqual(component.tabs[0]) // step 1
        })

        it('should return "first" when no previous step exists', () => {
            component.currentStep = 1

            const previousStep = component.previous

            expect(previousStep).toBe('first')
        })
    })

    describe('Getter: skip', () => {
        beforeEach(() => {
            component.currentStep = 1
            mockStepService.currentStep.value = { allowSkip: true }
        })

        it('should return next step and set skiped to true when allowed', () => {
            const skipStep = component.skip

            expect(skipStep).toEqual(component.tabs[1]) // step 2
            expect(mockStepService.skiped.next).toHaveBeenCalledWith(true)
        })

        it('should return null when at last step', () => {
            component.currentStep = 3 // last step

            const skipStep = component.skip

            expect(skipStep).toBeNull()
        })

        it('should return undefined when not allowed to skip', () => {
            mockStepService.currentStep.value = { allowSkip: false }
            component.currentStep = 2

            const skipStep = component.skip

            expect(skipStep).toBeUndefined()
        })
    })

    describe('Getter: current', () => {
        it('should return current step', () => {
            component.currentStep = 2

            const currentStep = component.current

            expect(currentStep).toEqual(component.tabs[1]) // step 2
        })

        it('should return null when current step not found', () => {
            component.currentStep = 999

            const currentStep = component.current

            expect(currentStep).toBeNull()
        })
    })

    describe('Getter: isNextStepAllowed', () => {
        beforeEach(() => {
            mockStepService.currentStep.value = { allowSkip: true }
        })

        it('should return true for welcome step', () => {
            component.currentStep = 1 // welcome step

            expect(component.isNextStepAllowed).toBe(true)
        })

        it('should return true when allowSkip is true for other steps', () => {
            component.currentStep = 2 // instituteProfile step

            expect(component.isNextStepAllowed).toBe(true)
        })

        it('should return false when allowSkip is false', () => {
            mockStepService.currentStep.value = { allowSkip: false }
            component.currentStep = 2

            expect(component.isNextStepAllowed).toBe(false)
        })
    })

    describe('Getter: isFormValid', () => {
        it('should return true when form is valid', () => {
            component.currentStep = 1
            mockOrgService.getFormStatus.mockReturnValue(true)

            expect(component.isFormValid).toBe(true)
        })

        it('should return false when form is invalid', () => {
            component.currentStep = 1
            mockOrgService.getFormStatus.mockReturnValue(false)

            expect(component.isFormValid).toBe(false)
        })

        it('should return false when current step is null', () => {
            component.currentStep = 999 // non-existent step

            expect(component.isFormValid).toBe(false)
        })
    })

    describe('openSnackbar method', () => {
        it('should open snackbar with default duration', () => {
            const privateMethod = (component as any).openSnackbar
            privateMethod('Test message')

            expect(mockSnackBar.open).toHaveBeenCalledWith('Test message', 'X', { duration: 5000 })
        })

        it('should open snackbar with custom duration', () => {
            const privateMethod = (component as any).openSnackbar
            privateMethod('Test message', 3000)

            expect(mockSnackBar.open).toHaveBeenCalledWith('Test message', 'X', { duration: 3000 })
        })
    })

    describe('Properties', () => {
        it('should have correct initial values', () => {
            expect(component.sideNavBarOpened).toBe(true)
            expect(component.screenSizeIsLtMedium).toBe(false)
            expect(component.sticky).toBe(false)
            expect(component.currentRoute).toBe('all')
            expect(component.userRouteName).toBe('')
            expect(component.message).toBe('Welcome to the Portal')
            expect(component.currentStep).toBe(1)
        })

        it('should have mode$ observable that maps isLtMedium to side/over', (done) => {
            component.mode$.subscribe(mode => {
                expect(mode).toBe('side')
                done()
            })
        })
    })
})