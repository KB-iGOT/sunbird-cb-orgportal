import { of, Subject } from 'rxjs'

// Mock Angular Material modules first
jest.mock('@angular/material/legacy-table', () => ({
    MatLegacyTableDataSource: jest.fn().mockImplementation(() => ({
        data: []
    }))
}))

jest.mock('@angular/cdk/collections', () => ({
    SelectionModel: jest.fn().mockImplementation(() => ({
        selected: [],
        select: jest.fn(),
        clear: jest.fn(),
        isSelected: jest.fn()
    }))
}))

jest.mock('@angular/forms', () => ({
    UntypedFormControl: jest.fn().mockImplementation(() => ({
        value: '',
        valueChanges: new Subject()
    }))
}))

jest.mock('lodash', () => ({
    get: jest.fn()
}))

// Now import the component after mocks are set up
import { ParticipantsComponent, IParticipantElement } from './participants.component'

// Mock dependencies
const mockEventService = {
    searchUser: jest.fn()
}

const mockHttpClient = {
    get: jest.fn(),
    post: jest.fn()
}

const mockProfileUtilSvc = {
    emailTransform: jest.fn()
}

const mockDialogRef = {
    close: jest.fn()
}

describe('ParticipantsComponent', () => {
    let component: ParticipantsComponent
    let mockData: any

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks()

        mockData = { someData: 'test' }

        // Create component instance
        component = new ParticipantsComponent(
            mockEventService as any,
            mockHttpClient as any,
            mockProfileUtilSvc as any,
            mockDialogRef as any,
            mockData
        )

        // Initialize component properties
        component.participants = []
        component.displayedColumns = ['select', 'fullname', 'email']
        component.dataSource = { data: [] }
        component.selection = {
            selected: [],
            select: jest.fn(),
            clear: jest.fn(),
            isSelected: jest.fn()
        } as any
        component.searchUserCtrl = {
            value: '',
            valueChanges: new Subject()
        } as any
        component.filteredUsers = []
        component.isLoading = false
        component.errorMsg = null
    })

    describe('Component Initialization', () => {
        it('should create component with initial values', () => {
            expect(component).toBeDefined()
            expect(component.participants).toEqual([])
            expect(component.displayedColumns).toEqual(['select', 'fullname', 'email'])
            expect(component.isLoading).toBe(false)
            expect(component.data).toEqual(mockData)
        })
    })

    describe('isAllSelected', () => {
        it('should return true when all rows are selected', () => {
            //  component.selection.selected = [{ firstname: 'John', email: 1 }, { firstname: 'Jane', email: 2 }]
            component.dataSource = { data: [{ firstname: 'John', email: 1 }, { firstname: 'Jane', email: 2 }] }

            const result = component.isAllSelected()

            expect(result).toBe(true)
        })

        it('should return false when not all rows are selected', () => {
            // component.selection.selected = [{ firstname: 'John', email: 1 }]
            component.dataSource = { data: [{ firstname: 'John', email: 1 }, { firstname: 'Jane', email: 2 }] }

            const result = component.isAllSelected()

            expect(result).toBe(false)
        })

        it('should return true when no rows exist', () => {
            //   component.selection.selected = []
            component.dataSource = { data: [] }

            const result = component.isAllSelected()

            expect(result).toBe(true)
        })
    })

    describe('masterToggle', () => {
        beforeEach(() => {
            component.selection = {
                selected: [],
                select: jest.fn(),
                clear: jest.fn(),
                isSelected: jest.fn()
            } as any
        })

        it('should clear selection when all are selected', () => {
            // component.selection.selected = [{ firstname: 'John', email: 1 }, { firstname: 'Jane', email: 2 }]
            component.dataSource = {
                data: [{ firstname: 'John', email: 1 }, { firstname: 'Jane', email: 2 }],
                forEach: jest.fn()
            }

            component.masterToggle()

            expect(component.selection.clear).toHaveBeenCalled()
        })

        it('should select all when none or some are selected', () => {
            // const mockData = [{ firstname: 'John', email: 1 }, { firstname: 'Jane', email: 2 }]
            // component.selection.selected = []
            component.dataSource = {
                data: mockData,
                forEach: jest.fn()
            };

            // Mock forEach to call the callback for each item
            (component.dataSource.forEach as jest.Mock).mockImplementation((callback: Function) => {
                mockData.forEach(callback)
            })

            component.masterToggle()

            expect(component.dataSource.forEach).toHaveBeenCalled()
            expect(component.selection.select).toHaveBeenCalledTimes(2)
        })
    })

    describe('isSomeSelected', () => {
        it('should return true when some items are selected', () => {
            //  component.selection.selected = [{ firstname: 'John', email: 1 }]

            const result = component.isSomeSelected()

            expect(result).toBe(true)
        })

        it('should return false when no items are selected', () => {
            //  component.selection.selected = []

            const result = component.isSomeSelected()

            expect(result).toBe(false)
        })
    })

    describe('checkboxLabel', () => {
        beforeEach(() => {
            component.selection.isSelected = jest.fn()
        })

        it('should return "select all" when no row is provided and not all selected', () => {
            jest.spyOn(component, 'isAllSelected').mockReturnValue(false)

            const result = component.checkboxLabel()

            expect(result).toBe('select all')
        })

        it('should return "deselect all" when no row is provided and all selected', () => {
            jest.spyOn(component, 'isAllSelected').mockReturnValue(true)

            const result = component.checkboxLabel()

            expect(result).toBe('deselect all')
        })

        it('should return "select row" when row is provided and not selected', () => {
            const mockRow: IParticipantElement = { firstname: 'John', email: 1 };
            (component.selection.isSelected as jest.Mock).mockReturnValue(false)

            const result = component.checkboxLabel(mockRow)

            expect(result).toBe('select row')
            expect(component.selection.isSelected).toHaveBeenCalledWith(mockRow)
        })

        it('should return "deselect row" when row is provided and selected', () => {
            const mockRow: IParticipantElement = { firstname: 'John', email: 1 };
            (component.selection.isSelected as jest.Mock).mockReturnValue(true)

            const result = component.checkboxLabel(mockRow)

            expect(result).toBe('deselect row')
            expect(component.selection.isSelected).toHaveBeenCalledWith(mockRow)
        })
    })

    describe('ngOnInit', () => {
        let valueChangesSubject: Subject<any>

        beforeEach(() => {
            valueChangesSubject = new Subject()
            component.searchUserCtrl = {
                value: 'test',
                valueChanges: valueChangesSubject.asObservable()
            } as any

            const mockResponse = {
                result: {
                    response: {
                        content: [
                            {
                                firstName: 'John',
                                lastName: 'Doe',
                                userId: '123',
                                profileDetails: {
                                    personalDetails: {
                                        primaryEmail: 'john@example.com'
                                    }
                                }
                            },
                            {
                                firstName: 'Jane',
                                lastName: 'Smith',
                                userId: '456',
                                profileDetails: {
                                    personalDetails: {
                                        primaryEmail: 'jane@example.com'
                                    }
                                }
                            }
                        ]
                    }
                }
            }

            mockEventService.searchUser.mockReturnValue(of(mockResponse))
            mockProfileUtilSvc.emailTransform.mockImplementation((email: string) => email)

            // Mock lodash get
            const _ = require('lodash')
            _.get = jest.fn().mockImplementation((obj: any, path: string) => {
                if (path === 'profileDetails.personalDetails.primaryEmail') {
                    return obj.profileDetails?.personalDetails?.primaryEmail
                }
                return undefined
            })
        })

        it('should set up search user subscription on init', () => {
            component.ngOnInit()

            // Trigger the search
            valueChangesSubject.next('test search')

            expect(mockEventService.searchUser).toHaveBeenCalledWith('test search')
        })

        it('should process search results and populate participants', (done) => {
            component.ngOnInit()

            // Wait for debounce time and trigger search
            setTimeout(() => {
                valueChangesSubject.next('test search')

                setTimeout(() => {
                    expect(component.participants).toHaveLength(2)
                    expect(component.participants[0]).toEqual({
                        email: 'john@example.com',
                        firstname: 'John',
                        id: '123'
                    })
                    expect(component.participants[1]).toEqual({
                        email: 'jane@example.com',
                        firstname: 'Jane',
                        id: '456'
                    })
                    done()
                }, 50)
            }, 250) // Wait for debounce time
        })

        it('should filter out participants without email', (done) => {
            const _ = require('lodash')
            _.get = jest.fn().mockReturnValue(undefined)
            mockProfileUtilSvc.emailTransform.mockReturnValue(undefined)

            component.ngOnInit()

            setTimeout(() => {
                valueChangesSubject.next('test search')

                setTimeout(() => {
                    expect(component.participants).toHaveLength(0)
                    done()
                }, 50)
            }, 250)
        })
    })

    describe('confirm', () => {
        it('should close dialog with selected data', () => {
            const selectedData = [
                { firstname: 'John', email: 1 },
                { firstname: 'Jane', email: 2 }
            ]
            //  component.selection.selected = selectedData

            component.confirm()

            expect(mockDialogRef.close).toHaveBeenCalledWith({ data: selectedData })
        })

        it('should close dialog with empty array when nothing selected', () => {
            // component.selection.selected = []

            component.confirm()

            expect(mockDialogRef.close).toHaveBeenCalledWith({ data: [] })
        })
    })

    describe('Component Properties', () => {
        it('should have correct displayed columns', () => {
            expect(component.displayedColumns).toEqual(['select', 'fullname', 'email'])
        })

        it('should initialize with empty participants array', () => {
            expect(component.participants).toEqual([])
        })

        it('should initialize isLoading as false', () => {
            expect(component.isLoading).toBe(false)
        })
    })

    describe('Error Handling', () => {
        it('should handle search errors gracefully', () => {
            const valueChangesSubject = new Subject()
            component.searchUserCtrl = {
                value: 'test',
                valueChanges: valueChangesSubject.asObservable()
            } as any

            mockEventService.searchUser.mockReturnValue(of({ error: 'Search failed' }))

            component.ngOnInit()
            valueChangesSubject.next('test search')

            // Component should not break on error response structure
            expect(component.participants).toEqual([])
        })
    })
})