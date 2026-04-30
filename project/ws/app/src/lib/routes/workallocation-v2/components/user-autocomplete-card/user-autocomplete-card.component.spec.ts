import { UserAutocompleteCardComponent } from "./user-autocomplete-card.component"
import { EventEmitter } from '@angular/core'

describe('UserAutocompleteCardComponent', () => {
    let component: UserAutocompleteCardComponent

    beforeEach(() => {
        component = new UserAutocompleteCardComponent()
    })

    it('should create a instance of component', () => {
        expect(component).toBeTruthy()
    })

    it('should call ngOnInit without errors', () => {
        expect(() => component.ngOnInit()).not.toThrow()
    })

    it('should initialize userClick as EventEmitter', () => {
        expect(component.userClick).toBeInstanceOf(EventEmitter)
    })

    it('should emit userClick event when userClickHandler is called', () => {
        const emitSpy = jest.spyOn(component.userClick, 'emit')
        const mockUser = { id: '1', name: 'Test User', email: 'test@test.com' }
        component.userClickHandler(mockUser)
        expect(emitSpy).toHaveBeenCalledWith(mockUser)
    })

    it('should emit undefined when userClickHandler is called with undefined', () => {
        const emitSpy = jest.spyOn(component.userClick, 'emit')
        component.userClickHandler(undefined)
        expect(emitSpy).toHaveBeenCalledWith(undefined)
    })

    it('should accept user input property', () => {
        const mockUser = { id: '2', name: 'Another User' }
        component.user = mockUser
        expect(component.user).toEqual(mockUser)
    })
})