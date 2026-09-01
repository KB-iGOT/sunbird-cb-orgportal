import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { CertificationAndSkillsComponent } from './certification-and-skills.component'
import { Subject } from 'rxjs'

describe('CertificationAndSkillsComponent', () => {
    let component: CertificationAndSkillsComponent
    let mockActiveRoute: any
    let mockRouter: any
    let routerEvents$: Subject<any>

    beforeEach(() => {
        routerEvents$ = new Subject()

        mockActiveRoute = {
            snapshot: {
                data: {
                    profileData: {
                        data: {
                            result: {
                                response: {
                                    profileDetails: {
                                        skills: ['Angular', 'TypeScript'],
                                        interests: ['Coding', 'Reading'],
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }

        mockRouter = {
            events: routerEvents$.asObservable(),
        }

        component = new CertificationAndSkillsComponent(
            mockActiveRoute as ActivatedRoute,
            mockRouter as Router
        )
    })

    it('should create a instance of component', () => {
        expect(component).toBeTruthy()
    })

    it('should call ngOnInit without errors', () => {
        expect(() => component.ngOnInit()).not.toThrow()
    })

    it('should update skillDetails and interests on NavigationEnd event', () => {
        routerEvents$.next(new NavigationEnd(1, '/test', '/test'))

        expect(component.skillDetails).toEqual(['Angular', 'TypeScript'])
        expect(component.interests).toEqual(['Coding', 'Reading'])
    })

    it('should not update skillDetails before NavigationEnd event', () => {
        expect(component.skillDetails).toBeUndefined()
        expect(component.interests).toBeUndefined()
    })

    it('should update skillDetails with new profile data on multiple NavigationEnd events', () => {
        routerEvents$.next(new NavigationEnd(1, '/first', '/first'))
        expect(component.skillDetails).toEqual(['Angular', 'TypeScript'])

        mockActiveRoute.snapshot.data.profileData.data.result.response.profileDetails = {
            skills: ['React'],
            interests: ['Design'],
        }
        routerEvents$.next(new NavigationEnd(2, '/second', '/second'))
        expect(component.skillDetails).toEqual(['React'])
        expect(component.interests).toEqual(['Design'])
    })
})
