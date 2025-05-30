import { CardDetailsComponent } from './card-details.component'
import { ChangeDetectorRef } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { ISpeakerDetails } from '../../interfaces/speaker-details.model'
import { IUserDetails } from '../../interfaces/user-details.model'
import { IEventDetails } from '../../interfaces/event-details.model'

describe('CardDetailsComponent', () => {
    let component: CardDetailsComponent
    let mockChangeDetectorRef: jest.Mocked<ChangeDetectorRef>
    let mockRouter: jest.Mocked<Router>
    let mockActivatedRoute: jest.Mocked<ActivatedRoute>

    beforeEach(() => {
        // Create mocks
        mockChangeDetectorRef = {
            detectChanges: jest.fn(),
            markForCheck: jest.fn(),
            detach: jest.fn(),
            reattach: jest.fn(),
            checkNoChanges: jest.fn()
        } as jest.Mocked<ChangeDetectorRef>

        mockRouter = {
            navigate: jest.fn().mockResolvedValue(true),
            navigateByUrl: jest.fn(),
            createUrlTree: jest.fn(),
            serializeUrl: jest.fn(),
            parseUrl: jest.fn(),
            isActive: jest.fn(),
            url: '',
            events: {} as any,
            routerState: {} as any,
            errorHandler: {} as any,
            malformedUriErrorHandler: {} as any,
            onSameUrlNavigation: 'ignore',
            paramsInheritanceStrategy: 'emptyOnly',
            urlUpdateStrategy: 'deferred',
            relativeLinkResolution: 'legacy',
            config: [],
            urlHandlingStrategy: {} as any,
            routeReuseStrategy: {} as any,
            titleStrategy: {} as any,
            dispose: jest.fn(),
            resetConfig: jest.fn(),
            setUpLocationChangeListener: jest.fn(),
            getCurrentNavigation: jest.fn(),
            initialNavigation: jest.fn()
        } as unknown as jest.Mocked<Router>

        mockActivatedRoute = {
            snapshot: {} as any,
            url: {} as any,
            params: {} as any,
            queryParams: {} as any,
            fragment: {} as any,
            data: {} as any,
            outlet: '',
            component: null,
            routeConfig: null,
            root: {} as any,
            parent: null,
            firstChild: null,
            children: [],
            pathFromRoot: [],
            paramMap: {} as any,
            queryParamMap: {} as any,
            toString: jest.fn()
        } as unknown as jest.Mocked<ActivatedRoute>

        // Create component instance
        component = new CardDetailsComponent(
            mockChangeDetectorRef,
            mockActivatedRoute,
            mockRouter
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Component Initialization', () => {
        it('should create component with default values', () => {
            expect(component).toBeTruthy()
            expect(component.userDetails).toEqual([])
            expect(component.speakerDetails).toEqual([])
            expect(component.eventDetails).toEqual([])
            expect(component.cardType).toBe('user')
            expect(component.liveSpeaker).toEqual([])
            expect(component.sortedSpeaker).toEqual([])
            expect(component.navigationExtras).toEqual({})
            expect(component.currDate).toBeInstanceOf(Date)
        })

        it('should call ngOnInit without errors', () => {
            expect(() => component.ngOnInit()).not.toThrow()
        })
    })

    describe('sortSpeaker method', () => {
        it('should return -1 when first speaker has smaller startRemainingTime', () => {
            const speakerA: ISpeakerDetails = {
                sessionID: '1',
                startRemainingTime: 100,
                endRemaningTime: 200
            } as ISpeakerDetails

            const speakerB: ISpeakerDetails = {
                sessionID: '2',
                startRemainingTime: 300,
                endRemaningTime: 400
            } as ISpeakerDetails

            const result = component.sortSpeaker(speakerA, speakerB)
            expect(result).toBe(-1)
        })

        it('should return 1 when first speaker has larger startRemainingTime', () => {
            const speakerA: ISpeakerDetails = {
                sessionID: '1',
                startRemainingTime: 300,
                endRemaningTime: 400
            } as ISpeakerDetails

            const speakerB: ISpeakerDetails = {
                sessionID: '2',
                startRemainingTime: 100,
                endRemaningTime: 200
            } as ISpeakerDetails

            const result = component.sortSpeaker(speakerA, speakerB)
            expect(result).toBe(1)
        })

        it('should return 0 when speakers have equal startRemainingTime', () => {
            const speakerA: ISpeakerDetails = {
                sessionID: '1',
                startRemainingTime: 100,
                endRemaningTime: 200
            } as ISpeakerDetails

            const speakerB: ISpeakerDetails = {
                sessionID: '2',
                startRemainingTime: 100,
                endRemaningTime: 300
            } as ISpeakerDetails

            const result = component.sortSpeaker(speakerA, speakerB)
            expect(result).toBe(0)
        })

        it('should return 0 when startRemainingTime is undefined for either speaker', () => {
            const speakerA: ISpeakerDetails = {
                sessionID: '1',
                startRemainingTime: undefined,
                endRemaningTime: 200
            } as ISpeakerDetails

            const speakerB: ISpeakerDetails = {
                sessionID: '2',
                startRemainingTime: 100,
                endRemaningTime: 300
            } as ISpeakerDetails

            const result = component.sortSpeaker(speakerA, speakerB)
            expect(result).toBe(0)
        })
    })

    describe('convertMinutes method', () => {
        it('should convert milliseconds to hours and minutes correctly', () => {
            const minsRemaining = 3661000 // 1 hour and 1 minute in milliseconds
            const result = component.convertMinutes(minsRemaining)

            expect(result.hours).toBe(1)
            expect(result.mins).toBe(1)
        })

        it('should handle days conversion correctly', () => {
            const minsRemaining = 90061000 // 1 day, 1 hour, 1 minute in milliseconds
            const result = component.convertMinutes(minsRemaining)

            expect(result.hours).toBe(25) // 24 + 1
            expect(result.mins).toBe(1)
        })

        it('should handle zero minutes', () => {
            const minsRemaining = 0
            const result = component.convertMinutes(minsRemaining)

            expect(result.hours).toBe(0)
            expect(result.mins).toBe(0)
        })

        it('should handle partial minutes', () => {
            const minsRemaining = 30000 // 30 seconds in milliseconds
            const result = component.convertMinutes(minsRemaining)

            expect(result.hours).toBe(0)
            expect(result.mins).toBe(0)
        })
    })

    describe('ngAfterViewChecked method', () => {
        it('should sort speakerDetails and call sortedSpeakerFunction when speakerDetails exist', () => {
            const mockSpeakers: ISpeakerDetails[] = [
                {
                    sessionID: '1',
                    startRemainingTime: 300,
                    endRemaningTime: 400
                } as ISpeakerDetails,
                {
                    sessionID: '2',
                    startRemainingTime: 100,
                    endRemaningTime: 200
                } as ISpeakerDetails
            ]

            component.speakerDetails = mockSpeakers
            jest.spyOn(component, 'sortedSpeakerFunction')

            component.ngAfterViewChecked()

            expect(component.speakerDetails[0].sessionID).toBe('2') // Should be sorted
            expect(component.speakerDetails[1].sessionID).toBe('1')
            expect(component.sortedSpeakerFunction).toHaveBeenCalled()
            expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled()
        })

        it('should not call sortedSpeakerFunction when speakerDetails is empty', () => {
            component.speakerDetails = []
            jest.spyOn(component, 'sortedSpeakerFunction')

            component.ngAfterViewChecked()

            expect(component.sortedSpeakerFunction).not.toHaveBeenCalled()
            expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled()
        })

        it('should not call sortedSpeakerFunction when speakerDetails is undefined', () => {
            component.speakerDetails = undefined
            jest.spyOn(component, 'sortedSpeakerFunction')

            component.ngAfterViewChecked()

            expect(component.sortedSpeakerFunction).not.toHaveBeenCalled()
            expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled()
        })
    })

    describe('sortedSpeakerFunction method', () => {
        beforeEach(() => {
            component.sortedSpeaker = []
        })

        it('should separate ongoing and ended sessions correctly', () => {
            const mockSpeakers: ISpeakerDetails[] = [
                {
                    sessionID: '1',
                    startRemainingTime: -100, // Started
                    endRemaningTime: 200 // Not ended - ongoing session
                } as ISpeakerDetails,
                {
                    sessionID: '2',
                    startRemainingTime: -100, // Started
                    endRemaningTime: -50 // Ended - ended session
                } as ISpeakerDetails,
                {
                    sessionID: '3',
                    startRemainingTime: 100, // Not started yet
                    endRemaningTime: 300
                } as ISpeakerDetails
            ]

            component.speakerDetails = mockSpeakers
            component.sortedSpeakerFunction()

            // Should have 2 speakers in sortedSpeaker (not started + ended sessions)
            expect(component.sortedSpeaker).toHaveLength(2)
            expect(component.sortedSpeaker[0].sessionID).toBe('3') // Not started yet
            expect(component.sortedSpeaker[1].sessionID).toBe('2') // Ended session
            expect(component.navigationExtras.state).toEqual({ speakerDetails: component.sortedSpeaker })
        })

        it('should handle empty speakerDetails array', () => {
            component.speakerDetails = []
            component.sortedSpeakerFunction()

            expect(component.sortedSpeaker).toEqual([])
            expect(component.navigationExtras.state).toEqual({ speakerDetails: [] })
        })

        it('should handle undefined speakerDetails', () => {
            component.speakerDetails = undefined
            component.sortedSpeakerFunction()

            expect(component.sortedSpeaker).toEqual([])
            expect(component.navigationExtras.state).toEqual({ speakerDetails: [] })
        })

        it('should handle speakers with undefined time properties', () => {
            const mockSpeakers: ISpeakerDetails[] = [
                {
                    sessionID: '1',
                    startRemainingTime: undefined,
                    endRemaningTime: undefined
                } as ISpeakerDetails
            ]

            component.speakerDetails = mockSpeakers
            component.sortedSpeakerFunction()

            expect(component.sortedSpeaker).toHaveLength(1)
            expect(component.sortedSpeaker[0].sessionID).toBe('1')
        })
    })

    describe('onClickSessionCard method', () => {
        beforeEach(() => {
            component.sortedSpeaker = [
                {
                    sessionID: 'session-1',
                    startRemainingTime: 100,
                    endRemaningTime: 200
                } as ISpeakerDetails,
                {
                    sessionID: 'session-2',
                    startRemainingTime: 300,
                    endRemaningTime: 400
                } as ISpeakerDetails
            ]
        })

        it('should navigate to session details with correct parameters', () => {
            const index = 0
            component.onClickSessionCard(index)

            expect(component.navigationExtras.state).toEqual({
                sessionID: 'session-1'
            })
            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['../session-details', 1],
                {
                    state: { sessionID: 'session-1' },
                    relativeTo: mockActivatedRoute
                }
            )
        })

        it('should handle second item click correctly', () => {
            const index = 1
            component.onClickSessionCard(index)

            expect(component.navigationExtras.state).toEqual({
                sessionID: 'session-2'
            })
            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['../session-details', 2],
                {
                    state: { sessionID: 'session-2' },
                    relativeTo: mockActivatedRoute
                }
            )
        })

        it('should not navigate when index is out of bounds', () => {
            const index = 5
            component.onClickSessionCard(index)

            expect(mockRouter.navigate).not.toHaveBeenCalled()
        })

        it('should not navigate when sortedSpeaker is empty', () => {
            component.sortedSpeaker = []
            const index = 0
            component.onClickSessionCard(index)

            expect(mockRouter.navigate).not.toHaveBeenCalled()
        })

        it('should not navigate when index is negative', () => {
            const index = -1
            component.onClickSessionCard(index)

            expect(mockRouter.navigate).not.toHaveBeenCalled()
        })
    })

    describe('Input Properties', () => {
        it('should accept userDetails input', () => {
            const mockUserDetails: IUserDetails[] = [
                { id: '1', name: 'User 1' } as unknown as IUserDetails
            ]
            component.userDetails = mockUserDetails
            expect(component.userDetails).toBe(mockUserDetails)
        })

        it('should accept speakerDetails input', () => {
            const mockSpeakerDetails: ISpeakerDetails[] = [
                { sessionID: '1' } as ISpeakerDetails
            ]
            component.speakerDetails = mockSpeakerDetails
            expect(component.speakerDetails).toBe(mockSpeakerDetails)
        })

        it('should accept eventDetails input', () => {
            const mockEventDetails: IEventDetails[] = [
                { id: '1', title: 'Event 1' } as unknown as IEventDetails
            ]
            component.eventDetails = mockEventDetails
            expect(component.eventDetails).toBe(mockEventDetails)
        })

        it('should accept cardType input', () => {
            component.cardType = 'speaker'
            expect(component.cardType).toBe('speaker')
        })

        it('should accept liveSpeaker input', () => {
            const mockLiveSpeaker: ISpeakerDetails[] = [
                { sessionID: '1' } as ISpeakerDetails
            ]
            component.liveSpeaker = mockLiveSpeaker
            expect(component.liveSpeaker).toBe(mockLiveSpeaker)
        })
    })
})