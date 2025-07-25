import { ComponentFixture, TestBed } from '@angular/core/testing'
import { InitialAvatarComponent } from './initial-avatar.component'

describe('InitialAvatarComponent', () => {
    let component: InitialAvatarComponent
    let fixture: ComponentFixture<InitialAvatarComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InitialAvatarComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(InitialAvatarComponent)
        component = fixture.componentInstance
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    describe('ngOnInit', () => {
        it('should call ngOnInit without errors', () => {
            expect(() => component.ngOnInit()).not.toThrow()
        })
    })

    describe('getInitials', () => {
        it('should return empty string when name is not provided', () => {
            component.name = ''
            expect(component.getInitials()).toBe('')
        })

        it('should return empty string when name is null', () => {
            component.name = null as any
            expect(component.getInitials()).toBe('')
        })

        it('should return empty string when name is undefined', () => {
            component.name = undefined as any
            expect(component.getInitials()).toBe('')
        })

        it('should return first and last initials for full name', () => {
            component.name = 'Christy B Fernandes'
            expect(component.getInitials()).toBe('CF')
        })

        it('should return first initial only for single name', () => {
            component.name = 'Christy'
            expect(component.getInitials()).toBe('C')
        })

        it('should return first and last initials for two names', () => {
            component.name = 'John Doe'
            expect(component.getInitials()).toBe('JD')
        })

        it('should return first and last initials for four names', () => {
            component.name = 'Mary Jane Watson Parker'
            expect(component.getInitials()).toBe('MP')
        })

        it('should handle names with extra spaces', () => {
            component.name = '  John   Doe  '
            expect(component.getInitials()).toBe('JD')
        })

        it('should handle names with special characters', () => {
            component.name = 'Jean-Claude Van Damme'
            expect(component.getInitials()).toBe('JD')
        })

        it('should handle single character names', () => {
            component.name = 'A B'
            expect(component.getInitials()).toBe('AB')
        })

        it('should return uppercase initials', () => {
            component.name = 'john doe'
            expect(component.getInitials()).toBe('JD')
        })

        it('should handle names with numbers', () => {
            component.name = 'John2 Doe3'
            expect(component.getInitials()).toBe('JD')
        })

        it('should handle names with hyphenated surnames', () => {
            component.name = 'Anna Smith-Johnson'
            expect(component.getInitials()).toBe('AJ')
        })

        it('should handle names with apostrophes', () => {
            component.name = "John O'Connor"
            expect(component.getInitials()).toBe('JO')
        })
    })

    describe('Input property', () => {
        it('should accept name input', () => {
            const testName = 'Test Name'
            component.name = testName
            expect(component.name).toBe(testName)
        })
    })
})