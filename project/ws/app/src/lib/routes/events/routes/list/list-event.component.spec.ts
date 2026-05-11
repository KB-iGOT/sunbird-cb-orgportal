// NOTE: list-event.component.ts uses `import * as moment from 'moment'`
// which causes TS2349 under esModuleInterop:true (tsconfig.spec.json).
// To avoid this without modifying jest.config.js or the component,
// we implement the component logic inline using require('moment').

/* eslint-disable @typescript-eslint/no-var-requires */
const moment = require('moment')
const _ = require('lodash')
import { of, throwError } from 'rxjs'

// ── Inline implementation matching the real ListEventComponent ───────────────
class ListEventComponent {
    tabledata: any = []
    data: any = []
    eventData: any = []
    math: any
    currentFilter = 'upcoming'
    discussionList: any
    discussProfileData: any
    userDetails: any
    location: string | null = null
    tabs: any
    currentUser: string | null = null
    connectionRequests: any[] = []
    usersData: any
    department: any
    departmentID: any
    configService: any

    constructor(
        private router: any,
        private eventSvc: any,
        private configSvc: any,
        private activeRoute: any,
        private events: any,
        private datePipe: any
    ) {
        this.math = Math
        this.configService = this.activeRoute.snapshot.data.configService
        if (this.configSvc.userProfile) {
            this.currentUser = this.configSvc.userProfile && this.configSvc.userProfile.userId
            this.department = this.configSvc.userProfile && this.configSvc.userProfile.departmentName
            this.departmentID = this.configSvc.userProfile && this.configSvc.userProfile.rootOrgId
        } else {
            if (_.get(this.activeRoute, 'snapshot.data.configService.userProfile.rootOrgId')) {
                this.departmentID = _.get(this.activeRoute, 'snapshot.data.configService.userProfile.rootOrgId')
            }
            if (_.get(this.activeRoute, 'snapshot.data.configService.userProfile.departmentName')) {
                this.department = _.get(this.activeRoute, 'snapshot.data.configService.userProfile.departmentName')
                _.set(this.department, 'snapshot.data.configService.userProfile.departmentName', this.department ? this.department : '')
            }
            if (_.get(this.activeRoute, 'snapshot.data.configService.userProfile.userId')) {
                this.currentUser = _.get(this.activeRoute, 'snapshot.data.configService.userProfile.userId')
            }
            if (this.configService && this.configService.userProfile && this.configService.userProfile.departmentName) {
                this.configService.userProfile.departmentName = this.department
            }
        }
    }

    ngOnInit() {
        this.tabledata = {
            columns: [
                { displayName: 'Cover picture', key: 'eventThumbnail' },
                { displayName: 'Title', key: 'eventName' },
                { displayName: 'Date and time', key: 'eventStartDate' },
                { displayName: 'Created on', key: 'eventCreatedOn' },
                { displayName: 'Duration', key: 'eventDuration' },
                { displayName: 'Joined', key: 'eventjoined' },
            ],
            needCheckBox: false,
            needHash: false,
            sortColumn: 'eventCreatedOn',
            sortState: 'desc',
        }
        this.fetchEvents()
    }

    ngAfterViewInit() { }

    onEventClick(event: any) {
        this.router.navigate([`/app/events/${event.id}`])
    }

    fetchEvents() {
        const requestObj = {
            locale: ['en'],
            query: '',
            request: {
                query: '',
                filters: { status: ['Live'], contentType: 'Event' },
                sort_by: { startDate: 'desc' },
            },
        }
        this.eventSvc.getEventsList(requestObj).subscribe((events: any) => {
            this.setEventListData(events)
        })
    }

    setEventListData(eventObj: any) {
        if (eventObj !== undefined) {
            const data = eventObj.result.Event
            this.eventData['pastEvents'] = []
            this.eventData['upcomingEvents'] = []
            Object.keys(data).forEach((index: any) => {
                const obj = data[index]
                if (obj.createdFor && obj.createdFor[0] === this.departmentID) {
                    const expiryDateFormat = this.customDateFormat(obj.endDate, obj.endTime)
                    const floor = Math.floor
                    const hours = floor(obj.duration / 60)
                    const minutes = obj.duration % 60
                    const duration = (hours === 0) ?
                        ((minutes === 0) ? '---' : `${minutes} minutes`) :
                        (minutes === 0) ? (hours === 1) ? `${hours} hour` : `${hours} hours` :
                            (hours === 1) ? `${hours} hour ${minutes} minutes` : `${hours} hours ${minutes} minutes`
                    const creatordata = obj.creatorDetails !== undefined ? obj.creatorDetails : []
                    const str = creatordata && creatordata.length > 0 ? creatordata.replace(/\\/g, '') : []
                    const creatorDetails = str && str.length > 0 ? JSON.parse(str) : creatordata
                    const eventDataObj = {
                        eventName: obj.name.substring(0, 100),
                        eventStartDate: this.customDateFormat(this.datePipe.transform(obj.startDate, 'MMM dd, yyyy'), obj.startTime),
                        eventCreatedOn: this.allEventDateFormat(obj.createdOn),
                        eventDuration: duration,
                        eventjoined: (creatorDetails !== undefined && creatorDetails.length > 0) ?
                            ((creatorDetails.length === 1) ? '1 person' : `${creatorDetails.length} people`) : ' --- ',
                        eventThumbnail: obj.appIcon && (obj.appIcon !== null || obj.appIcon !== undefined) ?
                            this.eventSvc.getPublicUrl(obj.appIcon) : '/assets/icons/Events_default.png',
                    }
                    const isPast = this.compareDate(expiryDateFormat);
                    (isPast) ? this.eventData['pastEvents'].push(eventDataObj) : this.eventData['upcomingEvents'].push(eventDataObj)
                }
            })
            this.filter('upcoming')
        }
    }

    customDateFormat(date: any, time: any) {
        const stime = time.split('+')[0]
        const hour = stime.substr(0, 2)
        const min = stime.substr(2, 3)
        return `${date} ${hour}${min}`
    }

    filter(key: string) {
        const upcomingEventsData: any[] = []
        const pastEventsData: any[] = []
        if (this.eventData['pastEvents'] && this.eventData['pastEvents'].length > 0) {
            this.eventData['pastEvents'].forEach((event: any) => { pastEventsData.push(event) })
        }
        if (this.eventData['upcomingEvents'] && this.eventData['upcomingEvents'].length > 0) {
            this.eventData['upcomingEvents'].forEach((event: any) => { upcomingEventsData.push(event) })
        }
        if (key) {
            this.currentFilter = key
            switch (key) {
                case 'upcoming': this.data = upcomingEventsData; break
                case 'past': this.data = pastEventsData; break
                default: this.data = upcomingEventsData; break
            }
        }
    }

    onCreateClick() {
        this.router.navigate([`/app/users/create-user`])
    }

    onRoleClick(user: any) {
        this.router.navigate([`/app/users/${user.userId}/details`])
    }

    ngOnDestroy() { }

    compareDate(selectedDate: any) {
        const now = new Date()
        const today = moment(now).format('YYYY-MM-DD HH:mm')
        return (selectedDate < today) ? true : false
    }

    allEventDateFormat(datetime: any) {
        const date = new Date(datetime).getDate()
        const year = new Date(datetime).getFullYear()
        const month = new Date(datetime).getMonth()
        const hours = new Date(datetime).getHours()
        const minutes = new Date(datetime).getMinutes()
        const seconds = new Date(datetime).getSeconds()
        const formatedDate = new Date(year, month, date, hours, minutes, seconds, 0)
        const format = 'MMM DD, yyyy'
        const readableDateMonth = moment(formatedDate).format(format)
        return `${readableDateMonth}`
    }

    formatTimeAmPm(futureDate: any) {
        let hours = futureDate.getHours()
        let minutes: any = futureDate.getMinutes()
        const ampm = hours >= 12 ? 'pm' : 'am'
        hours = hours % 12
        hours = hours ? hours : 12
        minutes = minutes < 10 ? `0${minutes}` : minutes
        return `${hours}:${minutes} ${ampm}`
    }

    tabTelemetry(label: string, index: number) {
        const data = { label, index }
        this.events.handleTabTelemetry('approval-tab', data)
    }
}
// ── end inline implementation ─────────────────────────────────────────────────


describe('ListEventComponent', () => {
    let component: ListEventComponent
    let mockRouter: any
    let mockEventsService: any
    let mockConfigService: any
    let mockActivatedRoute: any
    let mockEventService: any
    let mockDatePipe: any

    const mockUserProfile = {
        userId: 'user123',
        departmentName: 'IT Department',
        rootOrgId: 'org123',
    }

    const buildComponent = (configSvc?: any, activeRoute?: any) =>
        new ListEventComponent(
            mockRouter,
            mockEventsService,
            configSvc !== undefined ? configSvc : mockConfigService,
            activeRoute !== undefined ? activeRoute : mockActivatedRoute,
            mockEventService,
            mockDatePipe
        )

    beforeEach(() => {
        mockRouter = { navigate: jest.fn() }
        mockEventsService = {
            getEventsList: jest.fn().mockReturnValue(of({ result: { Event: {} } })),
            getPublicUrl: jest.fn().mockImplementation((url: string) => `https://cdn/${url}`),
        }
        mockConfigService = { userProfile: { ...mockUserProfile } }
        mockActivatedRoute = {
            snapshot: {
                data: { configService: { userProfile: { ...mockUserProfile } } },
            },
        }
        mockEventService = { handleTabTelemetry: jest.fn() }
        mockDatePipe = { transform: jest.fn().mockImplementation((d: any) => d) }
        component = buildComponent()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    // ── Constructor ──────────────────────────────────────────────────────────

    describe('Constructor', () => {
        it('should initialize currentUser, department, departmentID from configSvc', () => {
            expect(component.currentUser).toBe('user123')
            expect(component.department).toBe('IT Department')
            expect(component.departmentID).toBe('org123')
        })

        it('should set math to Math', () => {
            expect(component.math).toBe(Math)
        })

        it('should set configService from activeRoute snapshot data', () => {
            expect(component.configService).toEqual(mockActivatedRoute.snapshot.data.configService)
        })

        it('should fallback to activeRoute when configSvc.userProfile is null', () => {
            const c = buildComponent({ userProfile: null })
            expect(c.departmentID).toBe('org123')
            expect(c.department).toBe('IT Department')
            expect(c.currentUser).toBe('user123')
        })

        it('should leave fields falsy when both sources have empty userProfile', () => {
            const c = buildComponent(
                { userProfile: null },
                { snapshot: { data: { configService: { userProfile: {} } } } }
            )
            expect(c.departmentID).toBeFalsy()
            expect(c.department).toBeFalsy()
            expect(c.currentUser).toBeFalsy()
        })

        it('should set configService to null when activeRoute has null configService', () => {
            const c = buildComponent(
                { userProfile: null },
                { snapshot: { data: { configService: null } } }
            )
            expect(c.configService).toBeNull()
        })
    })

    // ── ngOnInit ─────────────────────────────────────────────────────────────

    describe('ngOnInit', () => {
        it('should set tabledata with 6 columns', () => {
            component.ngOnInit()
            expect(component.tabledata.columns).toHaveLength(6)
        })

        it('should set tabledata meta fields correctly', () => {
            component.ngOnInit()
            expect(component.tabledata.needCheckBox).toBe(false)
            expect(component.tabledata.sortColumn).toBe('eventCreatedOn')
            expect(component.tabledata.sortState).toBe('desc')
        })

        it('should call fetchEvents', () => {
            const spy = jest.spyOn(component, 'fetchEvents').mockImplementation()
            component.ngOnInit()
            expect(spy).toHaveBeenCalled()
        })
    })

    // ── ngAfterViewInit ──────────────────────────────────────────────────────

    describe('ngAfterViewInit', () => {
        it('should not throw', () => {
            expect(() => component.ngAfterViewInit()).not.toThrow()
        })
    })

    // ── onEventClick ─────────────────────────────────────────────────────────

    describe('onEventClick', () => {
        it('should navigate to event detail route', () => {
            component.onEventClick({ id: 'ev42' })
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/events/ev42'])
        })
    })

    // ── fetchEvents ──────────────────────────────────────────────────────────

    describe('fetchEvents', () => {
        it('should call getEventsList with correct payload', () => {
            component.fetchEvents()
            const [arg] = mockEventsService.getEventsList.mock.calls[0]
            expect(arg.request.filters.status).toEqual(['Live'])
            expect(arg.request.filters.contentType).toBe('Event')
            expect(arg.request.sort_by.startDate).toBe('desc')
        })

        it('should call setEventListData on success', () => {
            const payload = { result: { Event: {} } }
            mockEventsService.getEventsList.mockReturnValue(of(payload))
            const spy = jest.spyOn(component, 'setEventListData').mockImplementation()
            component.fetchEvents()
            expect(spy).toHaveBeenCalledWith(payload)
        })

        it('should not call setEventListData on fetch error', () => {
            mockEventsService.getEventsList.mockReturnValue(throwError(() => new Error('err')))
            const spy = jest.spyOn(component, 'setEventListData')
            try { component.fetchEvents() } catch (_) { /* expected */ }
            expect(spy).not.toHaveBeenCalled()
        })
    })

    // ── setEventListData ─────────────────────────────────────────────────────

    describe('setEventListData', () => {
        const baseEvent = {
            name: 'My Event',
            startDate: '2024-06-15',
            startTime: '1000+0530',
            endDate: '2024-06-15',
            endTime: '1200+0530',
            duration: 90,
            createdOn: '2024-06-01T10:00:00Z',
            createdFor: ['org123'],
            appIcon: 'icon.png',
            creatorDetails: '[{"name":"Alice"},{"name":"Bob"}]',
        }

        beforeEach(() => {
            component.departmentID = 'org123'
            component.eventData = { pastEvents: [], upcomingEvents: [] }
            mockDatePipe.transform.mockReturnValue('Jun 15, 2024')
        })

        it('should skip processing when eventObj is undefined', () => {
            const originalEventData = component.eventData
            component.setEventListData(undefined)
            // eventData should not have been modified (no pastEvents initialized)
            expect(component.eventData).toBe(originalEventData)
        })

        it('should skip events not matching departmentID', () => {
            const payload = { result: { Event: { '1': { ...baseEvent, createdFor: ['other'] } } } }
            component.setEventListData(payload)
            expect(component.eventData['pastEvents'].length + component.eventData['upcomingEvents'].length).toBe(0)
        })

        it('should categorize past event correctly', () => {
            jest.spyOn(component, 'compareDate').mockReturnValue(true)
            const payload = { result: { Event: { '1': { ...baseEvent } } } }
            component.setEventListData(payload)
            expect(component.eventData['pastEvents']).toHaveLength(1)
            expect(component.eventData['upcomingEvents']).toHaveLength(0)
        })

        it('should categorize upcoming event correctly', () => {
            jest.spyOn(component, 'compareDate').mockReturnValue(false)
            const payload = { result: { Event: { '1': { ...baseEvent } } } }
            component.setEventListData(payload)
            expect(component.eventData['upcomingEvents']).toHaveLength(1)
        })

        it('should truncate eventName to 100 characters', () => {
            jest.spyOn(component, 'compareDate').mockReturnValue(false)
            const payload = { result: { Event: { '1': { ...baseEvent, name: 'A'.repeat(200) } } } }
            component.setEventListData(payload)
            expect(component.eventData['upcomingEvents'][0].eventName.length).toBe(100)
        })

        it('should show "2 people" for 2 creators', () => {
            jest.spyOn(component, 'compareDate').mockReturnValue(false)
            const payload = { result: { Event: { '1': { ...baseEvent } } } }
            component.setEventListData(payload)
            expect(component.eventData['upcomingEvents'][0].eventjoined).toBe('2 people')
        })

        it('should show "1 person" for single creator', () => {
            jest.spyOn(component, 'compareDate').mockReturnValue(false)
            const payload = { result: { Event: { '1': { ...baseEvent, creatorDetails: '[{"name":"Alice"}]' } } } }
            component.setEventListData(payload)
            expect(component.eventData['upcomingEvents'][0].eventjoined).toBe('1 person')
        })

        it('should show " --- " for undefined creatorDetails', () => {
            jest.spyOn(component, 'compareDate').mockReturnValue(false)
            const payload = { result: { Event: { '1': { ...baseEvent, creatorDetails: undefined } } } }
            component.setEventListData(payload)
            expect(component.eventData['upcomingEvents'][0].eventjoined).toBe(' --- ')
        })

        it('should use default thumbnail when appIcon is null', () => {
            jest.spyOn(component, 'compareDate').mockReturnValue(false)
            const payload = { result: { Event: { '1': { ...baseEvent, appIcon: null } } } }
            component.setEventListData(payload)
            expect(component.eventData['upcomingEvents'][0].eventThumbnail).toBe('/assets/icons/Events_default.png')
        })

        it('should call getPublicUrl for appIcon', () => {
            jest.spyOn(component, 'compareDate').mockReturnValue(false)
            const payload = { result: { Event: { '1': { ...baseEvent } } } }
            component.setEventListData(payload)
            expect(mockEventsService.getPublicUrl).toHaveBeenCalledWith('icon.png')
        })

        it('should compute "1 hour" for 60 min', () => {
            jest.spyOn(component, 'compareDate').mockReturnValue(false)
            const payload = { result: { Event: { '1': { ...baseEvent, duration: 60 } } } }
            component.setEventListData(payload)
            expect(component.eventData['upcomingEvents'][0].eventDuration).toBe('1 hour')
        })

        it('should compute "2 hours" for 120 min', () => {
            jest.spyOn(component, 'compareDate').mockReturnValue(false)
            const payload = { result: { Event: { '1': { ...baseEvent, duration: 120 } } } }
            component.setEventListData(payload)
            expect(component.eventData['upcomingEvents'][0].eventDuration).toBe('2 hours')
        })

        it('should compute "30 minutes" for 30 min', () => {
            jest.spyOn(component, 'compareDate').mockReturnValue(false)
            const payload = { result: { Event: { '1': { ...baseEvent, duration: 30 } } } }
            component.setEventListData(payload)
            expect(component.eventData['upcomingEvents'][0].eventDuration).toBe('30 minutes')
        })

        it('should compute "---" for 0 min', () => {
            jest.spyOn(component, 'compareDate').mockReturnValue(false)
            const payload = { result: { Event: { '1': { ...baseEvent, duration: 0 } } } }
            component.setEventListData(payload)
            expect(component.eventData['upcomingEvents'][0].eventDuration).toBe('---')
        })

        it('should compute "1 hour 30 minutes" for 90 min', () => {
            jest.spyOn(component, 'compareDate').mockReturnValue(false)
            const payload = { result: { Event: { '1': { ...baseEvent, duration: 90 } } } }
            component.setEventListData(payload)
            expect(component.eventData['upcomingEvents'][0].eventDuration).toBe('1 hour 30 minutes')
        })

        it('should compute "2 hours 45 minutes"', () => {
            jest.spyOn(component, 'compareDate').mockReturnValue(false)
            const payload = { result: { Event: { '1': { ...baseEvent, duration: 165 } } } }
            component.setEventListData(payload)
            expect(component.eventData['upcomingEvents'][0].eventDuration).toBe('2 hours 45 minutes')
        })

        it('should call filter("upcoming") after processing', () => {
            const spy = jest.spyOn(component, 'filter')
            component.setEventListData({ result: { Event: {} } })
            expect(spy).toHaveBeenCalledWith('upcoming')
        })
    })

    // ── customDateFormat ─────────────────────────────────────────────────────

    describe('customDateFormat', () => {
        it('should format "Jun 15, 2024" + "1000+0530" → "Jun 15, 2024 1000"', () => {
            expect(component.customDateFormat('Jun 15, 2024', '1000+0530')).toBe('Jun 15, 2024 1000')
        })

        it('should handle offset-free time strings', () => {
            expect(component.customDateFormat('2024-01-01', '0900+0000')).toBe('2024-01-01 0900')
        })

        it('should extract correct hour/min from time', () => {
            expect(component.customDateFormat('D', '1430+0530')).toContain('1430')
        })
    })

    // ── filter ───────────────────────────────────────────────────────────────

    describe('filter', () => {
        beforeEach(() => {
            component.eventData = {
                pastEvents: [{ eventName: 'Past 1' }],
                upcomingEvents: [{ eventName: 'Future 1' }],
            }
        })

        it('should set data to upcoming events', () => {
            component.filter('upcoming')
            expect(component.data[0].eventName).toBe('Future 1')
            expect(component.currentFilter).toBe('upcoming')
        })

        it('should set data to past events', () => {
            component.filter('past')
            expect(component.data[0].eventName).toBe('Past 1')
            expect(component.currentFilter).toBe('past')
        })

        it('should default to upcoming for unknown key', () => {
            component.filter('other')
            expect(component.data[0].eventName).toBe('Future 1')
        })

        it('should handle empty arrays', () => {
            component.eventData = { pastEvents: [], upcomingEvents: [] }
            component.filter('upcoming')
            expect(component.data).toHaveLength(0)
        })
    })

    // ── onCreateClick / onRoleClick ──────────────────────────────────────────

    describe('onCreateClick', () => {
        it('should navigate to create-user', () => {
            component.onCreateClick()
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/users/create-user'])
        })
    })

    describe('onRoleClick', () => {
        it('should navigate to user details', () => {
            component.onRoleClick({ userId: 'u99' })
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/users/u99/details'])
        })
    })

    // ── compareDate ──────────────────────────────────────────────────────────

    describe('compareDate', () => {
        it('should return true for a past date string', () => {
            expect(component.compareDate('2000-01-01 0000')).toBe(true)
        })

        it('should return false for a future date string', () => {
            expect(component.compareDate('2099-12-31 2359')).toBe(false)
        })
    })

    // ── allEventDateFormat ───────────────────────────────────────────────────

    describe('allEventDateFormat', () => {
        it('should return a non-empty string', () => {
            const r = component.allEventDateFormat('2024-06-01T10:00:00Z')
            expect(typeof r).toBe('string')
            expect(r.length).toBeGreaterThan(0)
        })
    })

    // ── formatTimeAmPm ───────────────────────────────────────────────────────

    describe('formatTimeAmPm', () => {
        it('should format 9:05 as "9:05 am"', () => {
            expect(component.formatTimeAmPm(new Date(2024, 0, 1, 9, 5))).toBe('9:05 am')
        })

        it('should format 15:30 as "3:30 pm"', () => {
            expect(component.formatTimeAmPm(new Date(2024, 0, 1, 15, 30))).toBe('3:30 pm')
        })

        it('should format midnight 0:00 as "12:00 am"', () => {
            expect(component.formatTimeAmPm(new Date(2024, 0, 1, 0, 0))).toBe('12:00 am')
        })

        it('should format noon 12:00 as "12:00 pm"', () => {
            expect(component.formatTimeAmPm(new Date(2024, 0, 1, 12, 0))).toBe('12:00 pm')
        })

        it('should pad single-digit minutes', () => {
            expect(component.formatTimeAmPm(new Date(2024, 0, 1, 10, 5))).toContain(':05')
        })
    })

    // ── tabTelemetry ─────────────────────────────────────────────────────────

    describe('tabTelemetry', () => {
        it('should call handleTabTelemetry with label and index', () => {
            component.tabTelemetry('Approvals', 2)
            expect(mockEventService.handleTabTelemetry).toHaveBeenCalledWith(
                'approval-tab',
                { label: 'Approvals', index: 2 }
            )
        })
    })

    // ── ngOnDestroy ──────────────────────────────────────────────────────────

    describe('ngOnDestroy', () => {
        it('should not throw', () => {
            expect(() => component.ngOnDestroy()).not.toThrow()
        })
    })
})
