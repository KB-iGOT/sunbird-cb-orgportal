import { MatDialogRef } from '@angular/material/dialog'
import { UntypedFormControl } from '@angular/forms'
import { ViewUsersComponent } from './view-users.component'

describe('ViewUsersComponent', () => {
    let component: ViewUsersComponent
    let mockDialogRef: jest.Mocked<MatDialogRef<ViewUsersComponent>>

    const mockData = {
        userArray: [
            { UserName: 'Alice', id: 1 },
            { UserName: 'Bob', id: 2 },
            { UserName: 'Charlie', id: 3 },
        ],
        noOfUser: '3',
    }

    beforeEach(() => {
        mockDialogRef = { close: jest.fn() } as any
        component = new ViewUsersComponent(mockDialogRef, mockData)
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should set userData from injected data', () => {
        expect(component.userData).toBe(mockData)
    })

    it('should have searchControl as UntypedFormControl', () => {
        expect(component.searchControl).toBeInstanceOf(UntypedFormControl)
    })

    describe('ngOnInit', () => {
        it('should set userDataList from userData.userArray', () => {
            component.ngOnInit()
            expect(component.userDataList).toEqual(mockData.userArray)
        })

        it('should filter userDataList on searchControl valueChanges', () => {
            component.ngOnInit()
            component.searchControl.setValue('ali')
            expect(component.userDataList).toEqual([{ UserName: 'Alice', id: 1 }])
        })

        it('should be case-insensitive in filtering', () => {
            component.ngOnInit()
            component.searchControl.setValue('BOB')
            expect(component.userDataList).toEqual([{ UserName: 'Bob', id: 2 }])
        })

        it('should return all users when filter clears', () => {
            component.ngOnInit()
            component.searchControl.setValue('ali')
            component.searchControl.setValue('')
            expect(component.userDataList.length).toBe(3)
        })
    })

    describe('clear()', () => {
        it('should reset searchControl to empty string', () => {
            component.ngOnInit()
            component.searchControl.setValue('test')
            component.clear()
            expect(component.searchControl.value).toBe('')
        })
    })

    describe('close()', () => {
        it('should call dialogRef.close()', () => {
            component.close()
            expect(mockDialogRef.close).toHaveBeenCalled()
        })
    })
})
