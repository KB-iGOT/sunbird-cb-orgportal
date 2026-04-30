import { UserCreationComponent } from "./user-creation.component"

describe('UserCreationComponent', () => {
    let component: UserCreationComponent

    beforeEach(() => {
        component = new UserCreationComponent()
    })

    it('should create a instance of component', () => {
        expect(component).toBeTruthy()
    })

    it('should have default tabSelected as "Bulk Creation"', () => {
        expect(component.tabSelected).toBe('Bulk Creation')
    })

    it('should call ngOnInit without errors', () => {
        expect(() => component.ngOnInit()).not.toThrow()
    })

    it('should update tabSelected when handleTabChanged is called', () => {
        const mockEvent = { tab: { textLabel: 'Single Creation' } } as any
        component.handleTabChanged(mockEvent)
        expect(component.tabSelected).toBe('Single Creation')
    })

    it('should update tabSelected with different tab label', () => {
        const mockEvent = { tab: { textLabel: 'Bulk Creation' } } as any
        component.handleTabChanged(mockEvent)
        expect(component.tabSelected).toBe('Bulk Creation')
    })
})