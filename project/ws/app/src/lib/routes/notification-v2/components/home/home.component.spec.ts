import { of, throwError } from 'rxjs'
import { HomeComponent } from './home.component'
import { ENotificationType, INotification } from '../../models/notifications.model'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeNotification(overrides: Partial<INotification> = {}): INotification {
    return {
        classifiedAs: ENotificationType.Action,
        eventId: 'share_content' as any,
        message: 'Test notification',
        notificationId: 'notif-001',
        receivedOn: new Date('2024-01-01'),
        seen: false,
        seenOn: new Date('2024-01-01'),
        targetData: {},
        userId: 'user-001',
        ...overrides,
    }
}

// ─── Static mock data ─────────────────────────────────────────────────────────

const mockActionNotifData = {
    data: [makeNotification({ notificationId: 'a1' }), makeNotification({ notificationId: 'a2' })],
    page: 'page-action-2',
}

const mockInfoNotifData = {
    data: [makeNotification({ classifiedAs: ENotificationType.Information, notificationId: 'i1' })],
    page: 'page-info-2',
}

// ─── Mock services ────────────────────────────────────────────────────────────

const mockConfigSvc = {
    pageNavBar: { background: 'primary' },
}

const mockNotificationApi = {
    getNotifications: jest.fn(),
    getCount: jest.fn(),
    updateNotificationSeenStatus: jest.fn(),
}

const mockNotificationSvc = {
    mapRoute: jest.fn(),
}

const mockRouter = {
    navigate: jest.fn(),
}

// ─── Factory: creates a fresh component with isolated mock state ──────────────

function createComponent(): HomeComponent {
    return new HomeComponent(
        mockConfigSvc as any,
        mockNotificationApi as any,
        mockNotificationSvc as any,
        mockRouter as any,
    )
}

// ─── Default setup: stubs all API calls so ngOnInit doesn't interfere ─────────

function setupDefaultMocks() {
    mockNotificationApi.getNotifications.mockReturnValue(of({ data: [], page: '' }))
    mockNotificationApi.getCount.mockReturnValue(of(0))
    mockNotificationApi.updateNotificationSeenStatus.mockReturnValue(of({}))
    mockNotificationSvc.mapRoute.mockReturnValue(undefined)
    mockRouter.navigate.mockResolvedValue(true)
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('HomeComponent', () => {
    let component: HomeComponent

    beforeEach(() => {
        jest.clearAllMocks()
        setupDefaultMocks()
        component = createComponent()
    })

    // ─── Constructor ─────────────────────────────────────────────────────────

    describe('Constructor', () => {
        it('should create an instance of the component', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize pageNavbar from configSvc.pageNavBar', () => {
            expect(component.pageNavbar).toEqual(mockConfigSvc.pageNavBar)
        })

        it('should initialize showMarkAsRead to false', () => {
            expect(component.showMarkAsRead).toBe(false)
        })

        it('should initialize actionNotifications as empty array', () => {
            // Component was created with empty mock return; array starts empty
            expect(Array.isArray(component.actionNotifications)).toBe(true)
        })

        it('should initialize infoNotifications as empty array', () => {
            expect(Array.isArray(component.infoNotifications)).toBe(true)
        })

        it('should initialize actionNotificationsFetchStatus as "none" from constructor', () => {
            // constructor sets 'none'; ngOnInit is not called by beforeEach
            const fresh = createComponent()
            // before ngOnInit the status is 'none'
            expect(fresh.actionNotificationsFetchStatus).toBe('none')
        })

        it('should initialize infoNotificationsFetchStatus as "none" from constructor', () => {
            const fresh = createComponent()
            expect(fresh.infoNotificationsFetchStatus).toBe('none')
        })

        it('should initialize actionNotificationsNextPage as undefined from constructor', () => {
            const fresh = createComponent()
            expect(fresh.actionNotificationsNextPage).toBeUndefined()
        })

        it('should initialize infoNotificationsNextPage as undefined from constructor', () => {
            const fresh = createComponent()
            expect(fresh.infoNotificationsNextPage).toBeUndefined()
        })
    })

    // ─── ngOnInit ────────────────────────────────────────────────────────────

    describe('ngOnInit', () => {
        it('should call fetchActionNotifications on init', () => {
            const spy = jest.spyOn(component, 'fetchActionNotifications')
            component.ngOnInit()
            expect(spy).toHaveBeenCalled()
        })

        it('should call fetchInfoNotifications on init', () => {
            const spy = jest.spyOn(component, 'fetchInfoNotifications')
            component.ngOnInit()
            expect(spy).toHaveBeenCalled()
        })

        it('should call getCount on init', () => {
            const spy = jest.spyOn(component, 'getCount')
            component.ngOnInit()
            expect(spy).toHaveBeenCalled()
        })
    })

    // ─── fetchActionNotifications ────────────────────────────────────────────

    describe('fetchActionNotifications', () => {
        beforeEach(() => {
            // Reset state so each test starts fresh
            component.actionNotifications = []
            component.actionNotificationsNextPage = undefined
            jest.clearAllMocks()
        })

        it('should set status to "done" on success', () => {
            mockNotificationApi.getNotifications.mockReturnValue(of(mockActionNotifData))
            component.fetchActionNotifications()
            expect(component.actionNotificationsFetchStatus).toBe('done')
        })

        it('should concat received notifications into actionNotifications', () => {
            mockNotificationApi.getNotifications.mockReturnValue(of(mockActionNotifData))
            component.fetchActionNotifications()
            expect(component.actionNotifications).toEqual(mockActionNotifData.data)
        })

        it('should accumulate notifications across multiple fetches', () => {
            mockNotificationApi.getNotifications.mockReturnValue(of(mockActionNotifData))
            component.fetchActionNotifications()
            // 2 items added; fetch again
            mockNotificationApi.getNotifications.mockReturnValue(of(mockActionNotifData))
            component.fetchActionNotifications()
            expect(component.actionNotifications.length).toBe(4)
        })

        it('should update actionNotificationsNextPage from response', () => {
            mockNotificationApi.getNotifications.mockReturnValue(of(mockActionNotifData))
            component.fetchActionNotifications()
            expect(component.actionNotificationsNextPage).toBe('page-action-2')
        })

        it('should set status to "error" on API failure', () => {
            mockNotificationApi.getNotifications.mockReturnValue(
                throwError(() => new Error('Network error')),
            )
            component.fetchActionNotifications()
            expect(component.actionNotificationsFetchStatus).toBe('error')
        })

        it('should call getNotifications with Action type and pageSize 5', () => {
            mockNotificationApi.getNotifications.mockReturnValue(of(mockActionNotifData))
            component.fetchActionNotifications()
            expect(mockNotificationApi.getNotifications).toHaveBeenCalledWith(
                ENotificationType.Action,
                5,
                undefined,
            )
        })

        it('should pass nextPage token on subsequent fetch', () => {
            mockNotificationApi.getNotifications.mockReturnValue(of(mockActionNotifData))
            component.fetchActionNotifications()
            // nextPage is now 'page-action-2'; call again
            jest.clearAllMocks()
            mockNotificationApi.getNotifications.mockReturnValue(of({ data: [], page: '' }))
            component.fetchActionNotifications()
            expect(mockNotificationApi.getNotifications).toHaveBeenCalledWith(
                ENotificationType.Action,
                5,
                'page-action-2',
            )
        })
    })

    // ─── fetchInfoNotifications ───────────────────────────────────────────────

    describe('fetchInfoNotifications', () => {
        beforeEach(() => {
            component.infoNotifications = []
            component.infoNotificationsNextPage = undefined
            jest.clearAllMocks()
        })

        it('should set infoNotificationsFetchStatus to "done" on success', () => {
            mockNotificationApi.getNotifications.mockReturnValue(of(mockInfoNotifData))
            component.fetchInfoNotifications()
            expect(component.infoNotificationsFetchStatus).toBe('done')
        })

        it('should concat received notifications into infoNotifications', () => {
            mockNotificationApi.getNotifications.mockReturnValue(of(mockInfoNotifData))
            component.fetchInfoNotifications()
            expect(component.infoNotifications).toEqual(mockInfoNotifData.data)
        })

        it('should update infoNotificationsNextPage from response', () => {
            mockNotificationApi.getNotifications.mockReturnValue(of(mockInfoNotifData))
            component.fetchInfoNotifications()
            expect(component.infoNotificationsNextPage).toBe('page-info-2')
        })

        it('should set status to "error" on API failure', () => {
            mockNotificationApi.getNotifications.mockReturnValue(
                throwError(() => new Error('API error')),
            )
            component.fetchInfoNotifications()
            expect(component.infoNotificationsFetchStatus).toBe('error')
        })

        it('should call getNotifications with Information type and pageSize 5', () => {
            mockNotificationApi.getNotifications.mockReturnValue(of(mockInfoNotifData))
            component.fetchInfoNotifications()
            expect(mockNotificationApi.getNotifications).toHaveBeenCalledWith(
                ENotificationType.Information,
                5,
                undefined,
            )
        })

        it('should pass nextPage token on subsequent fetch', () => {
            mockNotificationApi.getNotifications.mockReturnValue(of(mockInfoNotifData))
            component.fetchInfoNotifications()
            jest.clearAllMocks()
            mockNotificationApi.getNotifications.mockReturnValue(of({ data: [], page: '' }))
            component.fetchInfoNotifications()
            expect(mockNotificationApi.getNotifications).toHaveBeenCalledWith(
                ENotificationType.Information,
                5,
                'page-info-2',
            )
        })
    })

    // ─── onClickNotification ──────────────────────────────────────────────────

    describe('onClickNotification', () => {
        it('should call updateNotificationSeenStatus when notification is not seen', () => {
            const notification = makeNotification({ seen: false })
            component.onClickNotification(notification)
            expect(mockNotificationApi.updateNotificationSeenStatus).toHaveBeenCalledWith(
                notification.notificationId,
                notification.classifiedAs,
            )
        })

        it('should mark notification.seen = true after updateNotificationSeenStatus succeeds', () => {
            const notification = makeNotification({ seen: false })
            mockNotificationApi.updateNotificationSeenStatus.mockReturnValue(of({}))
            component.onClickNotification(notification)
            expect(notification.seen).toBe(true)
        })

        it('should NOT call updateNotificationSeenStatus when notification is already seen', () => {
            const notification = makeNotification({ seen: true })
            component.onClickNotification(notification)
            expect(mockNotificationApi.updateNotificationSeenStatus).not.toHaveBeenCalled()
        })

        it('should call notificationSvc.mapRoute for unseen notification', () => {
            const notification = makeNotification({ seen: false })
            component.onClickNotification(notification)
            expect(mockNotificationSvc.mapRoute).toHaveBeenCalledWith(notification)
        })

        it('should call notificationSvc.mapRoute for already-seen notification', () => {
            const notification = makeNotification({ seen: true })
            component.onClickNotification(notification)
            expect(mockNotificationSvc.mapRoute).toHaveBeenCalledWith(notification)
        })
    })

    // ─── getCount ─────────────────────────────────────────────────────────────

    describe('getCount', () => {
        it('should set showMarkAsRead to true when count > 0', () => {
            component.showMarkAsRead = false
            mockNotificationApi.getCount.mockReturnValue(of(5))
            component.getCount()
            expect(component.showMarkAsRead).toBe(true)
        })

        it('should NOT set showMarkAsRead when count is 0', () => {
            component.showMarkAsRead = false
            mockNotificationApi.getCount.mockReturnValue(of(0))
            component.getCount()
            expect(component.showMarkAsRead).toBe(false)
        })

        it('should NOT set showMarkAsRead when count is negative', () => {
            component.showMarkAsRead = false
            mockNotificationApi.getCount.mockReturnValue(of(-1))
            component.getCount()
            expect(component.showMarkAsRead).toBe(false)
        })

        it('should call notificationApi.getCount', () => {
            mockNotificationApi.getCount.mockReturnValue(of(2))
            component.getCount()
            expect(mockNotificationApi.getCount).toHaveBeenCalled()
        })
    })

    // ─── readAllNotifications ─────────────────────────────────────────────────

    describe('readAllNotifications', () => {
        beforeEach(() => {
            component.actionNotifications = [
                makeNotification({ notificationId: 'a1', seen: false }),
                makeNotification({ notificationId: 'a2', seen: false }),
            ]
            component.infoNotifications = [
                makeNotification({ notificationId: 'i1', seen: false }),
            ]
            mockNotificationApi.updateNotificationSeenStatus.mockReturnValue(of({}))
        })

        it('should call updateNotificationSeenStatus with no args', () => {
            component.readAllNotifications()
            expect(mockNotificationApi.updateNotificationSeenStatus).toHaveBeenCalledWith()
        })

        it('should set showMarkAsRead to false', () => {
            component.showMarkAsRead = true
            component.readAllNotifications()
            expect(component.showMarkAsRead).toBe(false)
        })

        it('should mark all actionNotifications as seen', () => {
            component.readAllNotifications()
            component.actionNotifications.forEach((n: INotification) => {
                expect(n.seen).toBe(true)
            })
        })

        it('should mark all infoNotifications as seen', () => {
            component.readAllNotifications()
            component.infoNotifications.forEach((n: INotification) => {
                expect(n.seen).toBe(true)
            })
        })

        it('should call router.navigate with a timestamp queryParam', () => {
            component.readAllNotifications()
            expect(mockRouter.navigate).toHaveBeenCalledWith(
                [],
                expect.objectContaining({
                    queryParams: expect.objectContaining({ ts: expect.any(Number) }),
                }),
            )
        })

        it('should handle empty actionNotifications and infoNotifications gracefully', () => {
            component.actionNotifications = []
            component.infoNotifications = []
            expect(() => component.readAllNotifications()).not.toThrow()
        })
    })
})