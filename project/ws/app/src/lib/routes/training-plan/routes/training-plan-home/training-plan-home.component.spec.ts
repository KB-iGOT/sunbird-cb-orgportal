import { Subject } from 'rxjs'
import { TrainingPlanHomeComponent } from './training-plan-home.component'

describe('TrainingPlanHomeComponent', () => {
    let component: TrainingPlanHomeComponent
    let mockTpdsSvc: any
    let mockActiveRoute: any
    let moderatedSubject: Subject<any>

    beforeEach(() => {
        moderatedSubject = new Subject<any>()
        mockTpdsSvc = {
            moderatedCourseSelectStatus: moderatedSubject,
            currentUserDepartment: '',
        }
        mockActiveRoute = {
            snapshot: {
                data: {
                    configService: {
                        userProfileV2: { departmentName: 'Engineering' },
                    },
                },
            },
        }
        component = new TrainingPlanHomeComponent(mockTpdsSvc, mockActiveRoute)
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    describe('ngOnInit()', () => {
        it('should set configSvc from route snapshot data', () => {
            component.ngOnInit()
            expect(component.configSvc).toBe(mockActiveRoute.snapshot.data.configService)
        })

        it('should set currentUserDepartment from userProfileV2.departmentName', () => {
            component.ngOnInit()
            expect(mockTpdsSvc.currentUserDepartment).toBe('Engineering')
        })

        it('should set currentUserDepartment to empty when departmentName is missing', () => {
            mockActiveRoute.snapshot.data.configService.userProfileV2 = {}
            component.ngOnInit()
            expect(mockTpdsSvc.currentUserDepartment).toBe('')
        })

        it('should set currentUserDepartment to empty when configService is null', () => {
            mockActiveRoute.snapshot.data.configService = null
            component.ngOnInit()
            expect(mockTpdsSvc.currentUserDepartment).toBe('')
        })

        it('should set showModeratedNotification=true when status is truthy', () => {
            component.ngOnInit()
            moderatedSubject.next(true)
            expect(component.showModeratedNotification).toBe(true)
        })

        it('should set showModeratedNotification=false when status is falsy', () => {
            component.ngOnInit()
            moderatedSubject.next(false)
            expect(component.showModeratedNotification).toBe(false)
        })
    })

    describe('ngAfterViewInit()', () => {
        it('should not throw', () => {
            expect(() => component.ngAfterViewInit()).not.toThrow()
        })
    })

    describe('removeNotification()', () => {
        it('should set showModeratedNotification to false', () => {
            component.showModeratedNotification = true
            component.removeNotification()
            expect(component.showModeratedNotification).toBe(false)
        })
    })

    describe('ngOnDestroy()', () => {
        it('should unsubscribe', () => {
            component.ngOnInit()
            expect(() => component.ngOnDestroy()).not.toThrow()
        })
    })
})