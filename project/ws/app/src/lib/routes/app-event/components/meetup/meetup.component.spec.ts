import { Subject } from 'rxjs'
import { MeetupComponent } from './meetup.component'

describe('MeetupComponent', () => {
    let component: MeetupComponent
    let mockConfigSvc: any
    let mockValSvc: any
    let isLtMedium$: Subject<boolean>
    let isXSmall$: Subject<boolean>

    beforeEach(() => {
        isLtMedium$ = new Subject<boolean>()
        isXSmall$ = new Subject<boolean>()
        mockConfigSvc = { pageNavBar: { color: '#fff' } }
        mockValSvc = {
            isLtMedium$,
            isXSmall$,
        }
        component = new MeetupComponent(mockConfigSvc, mockValSvc)
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should set pageNavbar from configSvc.pageNavBar', () => {
        expect(component.pageNavbar).toBe(mockConfigSvc.pageNavBar)
    })

    it('should initialize navBarTitle to iGOT Meetup Platform', () => {
        expect(component.navBarTitle).toBe('iGOT Meetup Platform')
    })

    describe('ngOnInit()', () => {
        it('should set navBarTitle to empty string when isLtMedium$ emits true', () => {
            component.ngOnInit()
            isLtMedium$.next(true)
            expect(component.navBarTitle).toBe('')
        })

        it('should keep navBarTitle when isLtMedium$ emits false', () => {
            component.navBarTitle = 'iGOT Meetup Platform'
            component.ngOnInit()
            isLtMedium$.next(false)
            expect(component.navBarTitle).toBe('iGOT Meetup Platform')
        })

        it('should set navBarTitle to empty string when isXSmall$ emits true', () => {
            component.ngOnInit()
            isXSmall$.next(true)
            expect(component.navBarTitle).toBe('')
        })

        it('should keep navBarTitle when isXSmall$ emits false', () => {
            component.navBarTitle = 'iGOT Meetup Platform'
            component.ngOnInit()
            isXSmall$.next(false)
            expect(component.navBarTitle).toBe('iGOT Meetup Platform')
        })

        it('should set screenSubscription', () => {
            component.ngOnInit()
            expect(component.screenSubscription).toBeTruthy()
        })
    })
})
