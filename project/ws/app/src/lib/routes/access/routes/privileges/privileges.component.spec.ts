
import { PrivilegesComponent } from './privileges.component'

describe('PrivilegesComponent', () => {
    let component: PrivilegesComponent

    beforeEach(() => {
        component = new PrivilegesComponent()
    })

    it('should create a instance of component', () => {
        expect(component).toBeTruthy()
    })

    it('should initialize userMgmtData as empty array before ngOnInit', () => {
        expect(component.userMgmtData).toEqual([])
    })

    it('should initialize fracData as empty array before ngOnInit', () => {
        expect(component.fracData).toEqual([])
    })

    describe('ngOnInit()', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should populate userMgmtData with 5 entries', () => {
            expect(component.userMgmtData.length).toBe(5)
        })

        it('should have Create Users as first entry with checked=false', () => {
            expect(component.userMgmtData[0].key).toBe('Create Users')
            expect(component.userMgmtData[0].checked).toBe(false)
            expect(component.userMgmtData[0].enabled).toBe(true)
        })

        it('should have Activate Users with checked=true', () => {
            const entry = component.userMgmtData.find((d: any) => d.key === 'Activate Users')
            expect(entry).toBeDefined()
            expect(entry.checked).toBe(true)
        })

        it('should have Add/Remove Users with checked=true', () => {
            const entry = component.userMgmtData.find((d: any) => d.key === 'Add/Remove Users')
            expect(entry.checked).toBe(true)
        })

        it('should have Block Users with checked=false', () => {
            const entry = component.userMgmtData.find((d: any) => d.key === 'Block Users')
            expect(entry.checked).toBe(false)
        })

        it('should have Approve fields with checked=true', () => {
            const entry = component.userMgmtData.find((d: any) => d.key === 'Approve fields')
            expect(entry.checked).toBe(true)
        })

        it('should populate fracData with 5 entries', () => {
            expect(component.fracData.length).toBe(5)
        })

        it('should have Competencies entry with checked=true', () => {
            expect(component.fracData[0].key).toBe('competencies')
            expect(component.fracData[0].checked).toBe(true)
            expect(component.fracData[0].enabled).toBe(true)
        })

        it('should have Postions entry with checked=false', () => {
            const entry = component.fracData.find((d: any) => d.key === 'postions')
            expect(entry.checked).toBe(false)
        })

        it('should have Roles entry with checked=true', () => {
            const entry = component.fracData.find((d: any) => d.key === 'roles')
            expect(entry.checked).toBe(true)
        })

        it('should have Knowledge resources entry with checked=false', () => {
            const entry = component.fracData.find((d: any) => d.key === 'knowledge resources')
            expect(entry.checked).toBe(false)
        })

        it('should have Question bank entry with checked=true', () => {
            const entry = component.fracData.find((d: any) => d.key === 'question bank')
            expect(entry.checked).toBe(true)
        })
    })
})
