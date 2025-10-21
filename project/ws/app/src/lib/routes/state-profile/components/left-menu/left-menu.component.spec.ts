import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Subject, BehaviorSubject } from 'rxjs'

import { StepService } from '../../services/step.service'
import { EventService, WsEvents } from '@sunbird-cb/utils-v2'
import { SetupLeftMenuComponent } from './left-menu.component'
import { NSProfileDataV3 } from '../../models/state-profile.models'

// Mock services
const mockStepService = {
    currentStep: new BehaviorSubject(1),
    skiped: new Subject()
}

const mockEventService = {
    raiseInteractTelemetry: jest.fn()
}

describe('SetupLeftMenuComponent', () => {
    let component: SetupLeftMenuComponent
    let fixture: ComponentFixture<SetupLeftMenuComponent>
    let stepService: StepService
    let eventService: EventService

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SetupLeftMenuComponent],
            providers: [
                { provide: StepService, useValue: mockStepService },
                { provide: EventService, useValue: mockEventService }
            ]
        }).compileComponents()

        fixture = TestBed.createComponent(SetupLeftMenuComponent)
        component = fixture.componentInstance
        stepService = TestBed.inject(StepService)
        eventService = TestBed.inject(EventService)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Component Initialization', () => {
        it('should create the component', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize with default values', () => {
            expect(component.currentStep).toBe(1)
            expect(component['routerSubscription']).toBeNull()
        })

        it('should have tabsData input property', () => {
            const mockTabsData: NSProfileDataV3.IProfileTab[] = [
                { name: 'Tab 1', url: '/tab1' } as unknown as NSProfileDataV3.IProfileTab,
                { name: 'Tab 2', url: '/tab2' } as unknown as NSProfileDataV3.IProfileTab
            ]

            component.tabsData = mockTabsData
            expect(component.tabsData).toEqual(mockTabsData)
        })
    })

    describe('ngOnInit', () => {
        it('should subscribe to stepService.currentStep', () => {
            const subscriptionSpy = jest.spyOn(stepService.currentStep, 'subscribe')

            component.ngOnInit()

            expect(subscriptionSpy).toHaveBeenCalled()
        })

        it('should update currentStep when stepService.currentStep emits', () => {
            component.ngOnInit()

            mockStepService.currentStep.next(3)

            expect(component.currentStep).toBe(3)
        })

        it('should unsubscribe from existing routerSubscription before creating new one', () => {
            const mockSubscription = {
                unsubscribe: jest.fn()
            }
            component['routerSubscription'] = mockSubscription as any

            component.ngOnInit()

            expect(mockSubscription.unsubscribe).toHaveBeenCalled()
        })

        it('should not throw error when routerSubscription is null', () => {
            component['routerSubscription'] = null

            expect(() => component.ngOnInit()).not.toThrow()
        })
    })

    describe('ngOnDestroy', () => {
        it('should unsubscribe from routerSubscription if it exists', () => {
            const mockSubscription = {
                unsubscribe: jest.fn()
            }
            component['routerSubscription'] = mockSubscription as any

            component.ngOnDestroy()

            expect(mockSubscription.unsubscribe).toHaveBeenCalled()
        })

        it('should not throw error when routerSubscription is null', () => {
            component['routerSubscription'] = null

            expect(() => component.ngOnDestroy()).not.toThrow()
        })
    })

    describe('menuClick', () => {
        it('should set stepService.skiped to false', () => {
            const nextSpy = jest.spyOn(mockStepService.skiped, 'next')
            const mockTab = { name: 'Test Tab' }

            component.menuClick(mockTab)

            expect(nextSpy).toHaveBeenCalledWith(false)
        })

        it('should raise interact telemetry with correct parameters', () => {
            const mockTab = { name: 'Test Tab' }

            component.menuClick(mockTab)

            expect(eventService.raiseInteractTelemetry).toHaveBeenCalledWith(
                {
                    type: WsEvents.EnumInteractTypes.CLICK,
                    subType: WsEvents.EnumInteractSubTypes.SIDE_MENU,
                    id: 'testTab-menu'
                },
                {}
            )
        })

        it('should handle tab name with spaces correctly in telemetry id', () => {
            const mockTab = { name: 'Profile Settings' }

            component.menuClick(mockTab)

            expect(eventService.raiseInteractTelemetry).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'profileSettings-menu'
                }),
                {}
            )
        })

        it('should handle tab name with special characters correctly', () => {
            const mockTab = { name: 'User-Profile & Settings' }

            component.menuClick(mockTab)

            expect(eventService.raiseInteractTelemetry).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'userProfileSettings-menu'
                }),
                {}
            )
        })
    })

    describe('getLink', () => {
        it('should return the provided url', () => {
            const testUrl = '/test-url'

            const result = component.getLink(testUrl)

            expect(result).toBe(testUrl)
        })

        it('should return empty string when empty string is provided', () => {
            const result = component.getLink('')

            expect(result).toBe('')
        })

        it('should return url with query parameters', () => {
            const testUrl = '/test-url?param=value'

            const result = component.getLink(testUrl)

            expect(result).toBe(testUrl)
        })

        it('should handle relative urls', () => {
            const testUrl = '../relative-path'

            const result = component.getLink(testUrl)

            expect(result).toBe(testUrl)
        })
    })

    describe('Integration Tests', () => {
        it('should properly initialize and handle step changes', () => {
            component.ngOnInit()

            expect(component.currentStep).toBe(1)

            mockStepService.currentStep.next(5)

            expect(component.currentStep).toBe(5)
        })

        it('should handle complete workflow of menu click', () => {
            const mockTab = { name: 'Dashboard' }
            const skipedNextSpy = jest.spyOn(mockStepService.skiped, 'next')

            component.menuClick(mockTab)

            expect(skipedNextSpy).toHaveBeenCalledWith(false)
            expect(eventService.raiseInteractTelemetry).toHaveBeenCalledWith(
                {
                    type: WsEvents.EnumInteractTypes.CLICK,
                    subType: WsEvents.EnumInteractSubTypes.SIDE_MENU,
                    id: 'dashboard-menu'
                },
                {}
            )
        })
    })

    describe('Edge Cases', () => {
        it('should handle undefined tab in menuClick', () => {
            expect(() => component.menuClick(undefined)).not.toThrow()
        })

        it('should handle null tab in menuClick', () => {
            expect(() => component.menuClick(null)).not.toThrow()
        })

        it('should handle tab without name property', () => {
            const mockTab = { id: 'test' }

            expect(() => component.menuClick(mockTab)).not.toThrow()
        })

        it('should handle multiple rapid currentStep changes', () => {
            component.ngOnInit()

            mockStepService.currentStep.next(2)
            mockStepService.currentStep.next(3)
            mockStepService.currentStep.next(4)

            expect(component.currentStep).toBe(4)
        })
    })
})