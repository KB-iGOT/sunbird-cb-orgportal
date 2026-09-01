
import { MatDialogRef } from '@angular/material/dialog'
import { MatTableDataSource } from '@angular/material/table'
import { SelectedUserDialogComponent } from './selected-user-dialog.component'

describe('SelectedUserDialogComponent', () => {
    let component: SelectedUserDialogComponent
    let mockDialogRef: jest.Mocked<MatDialogRef<SelectedUserDialogComponent>>
    let mockData: any

    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()

        mockDialogRef = {
            close: jest.fn(),
        } as any

        mockData = {
            userData: [
                { fullName: 'Alice', email: 'alice@test.com', ministry: 'Edu', status: 'Active', mobile: '9999999999' },
                { fullName: 'Bob', email: 'bob@test.com', ministry: 'Health', status: 'Inactive', mobile: '8888888888' },
            ],
        }

        component = new SelectedUserDialogComponent(
            mockDialogRef,
            mockData
        )
    })

    it('should create a instance of component', () => {
        expect(component).toBeTruthy()
    })

    it('should expose correct displayedColumns', () => {
        expect(component.displayedColumns).toEqual(['fullName', 'email', 'ministry', 'status', 'mobile'])
    })

    it('should initialise dataSource as empty MatTableDataSource before ngOnInit', () => {
        expect(component.dataSource).toBeInstanceOf(MatTableDataSource)
    })

    it('should populate dataSource with userData on ngOnInit', () => {
        component.ngOnInit()
        expect(component.dataSource.data).toEqual(mockData.userData)
        expect(component.dataSource.data.length).toBe(2)
    })

    it('should apply filter to dataSource when applyTableFilter is called', () => {
        component.ngOnInit()
        const event = { target: { value: '  Alice  ' } } as unknown as Event
        component.applyTableFilter(event)
        expect(component.dataSource.filter).toBe('alice')
    })

    it('should apply empty string filter correctly', () => {
        component.ngOnInit()
        const event = { target: { value: '' } } as unknown as Event
        component.applyTableFilter(event)
        expect(component.dataSource.filter).toBe('')
    })

    it('should expose dialogRef as public property', () => {
        expect(component.dialogRef).toBe(mockDialogRef)
    })

    it('should expose data as public property', () => {
        expect(component.data).toBe(mockData)
    })
})
