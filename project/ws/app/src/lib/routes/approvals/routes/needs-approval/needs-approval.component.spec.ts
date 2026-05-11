// Mock @sunbird-cb/utils-v2 to avoid pdfjs and private-property type issues
jest.mock('@sunbird-cb/utils-v2', () => ({
    EventService: jest.fn(),
}))

import { NeedsApprovalComponent } from './needs-approval.component'
import { NeedApprovalsService } from '../../services/need-approvals.service'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
import { NavigationEnd } from '@angular/router'
import { TelemetryEvents } from '../../../../head/_services/telemetry.event.model'
import { of, Subject } from 'rxjs'

jest.mock('../../services/need-approvals.service')
jest.mock('@angular/material/legacy-dialog')
jest.mock('@angular/material/legacy-snack-bar')
jest.mock('@sunbird-cb/utils-v2')

describe('NeedsApprovalComponent', () => {
    let component: NeedsApprovalComponent
    let mockNeedApprovalsService: jest.Mocked<NeedApprovalsService>
    let mockActivatedRoute: any
    let mockRouter: any
    let mockEventService: any
    let mockDialog: jest.Mocked<MatDialog>
    let mockMatSnackBar: jest.Mocked<MatSnackBar>
    let routerEventsSubject: Subject<any>

    const mockProfileData = [
        { key: 'firstName', name: 'First Name' },
        { key: 'lastName', name: 'Last Name' },
        { key: 'email', name: 'Email' }
    ]

    const mockWorkflowData = {
        userInfo: { wid: 'user123' },
        wfInfo: [
            {
                wfId: 'wf1',
                userId: 'user456',
                applicationId: 'app123',
                updateFieldValues: JSON.stringify([
                    { fieldKey: 'field1', toValue: { firstName: 'John' } }
                ])
            }
        ]
    }

    beforeEach(() => {
        // Mock services
        mockNeedApprovalsService = {
            handleWorkflow: jest.fn()
        } as any

        mockEventService = {
            raiseInteractTelemetry: jest.fn()
        } as any

        mockDialog = {
            open: jest.fn()
        } as any

        mockMatSnackBar = {
            open: jest.fn()
        } as any

        routerEventsSubject = new Subject()

        mockActivatedRoute = {
            data: of({ pageData: { data: { profileData: mockProfileData } } }),
            snapshot: {
                data: {
                    workflowData: {
                        data: {
                            result: {
                                data: [mockWorkflowData]
                            }
                        }
                    }
                }
            }
        }

        mockRouter = {
            events: routerEventsSubject.asObservable()
        }

        // Create component instance
        component = new NeedsApprovalComponent(
            mockNeedApprovalsService,
            mockActivatedRoute,
            mockRouter,
            mockEventService,
            mockDialog,
            mockMatSnackBar
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Constructor', () => {
        it('should create component', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize profileData from route data', () => {
            expect(component.profileData).toEqual(mockProfileData)
        })

        it('should process workflow data on NavigationEnd event', () => {
            const navigationEndEvent = new NavigationEnd(1, '/test', '/test')

            routerEventsSubject.next(navigationEndEvent)

            expect(component.userwfData).toEqual(mockWorkflowData)
            expect(component.needApprovalList).toHaveLength(1)
            expect(component.needApprovalList[0]).toMatchObject({
                feildName: 'firstName',
                label: 'First Name',
                value: 'John',
                fieldKey: 'field1',
                wfId: 'wf1'
            })
        })

        it('should handle workflow data with no wfInfo', () => {
            const workflowDataWithoutWfInfo = { userInfo: { wid: 'user123' } }
            mockActivatedRoute.snapshot.data.workflowData.data.result.data = [workflowDataWithoutWfInfo]

            const navigationEndEvent = new NavigationEnd(1, '/test', '/test')
            routerEventsSubject.next(navigationEndEvent)

            expect(component.needApprovalList).toHaveLength(0)
        })

        it('should handle non-string updateFieldValues', () => {
            const workflowDataWithNonStringFields = {
                userInfo: { wid: 'user123' },
                wfInfo: [
                    {
                        wfId: 'wf1',
                        userId: 'user456',
                        applicationId: 'app123',
                        updateFieldValues: { not: 'a string' }
                    }
                ]
            }
            mockActivatedRoute.snapshot.data.workflowData.data.result.data = [workflowDataWithNonStringFields]

            const navigationEndEvent = new NavigationEnd(1, '/test', '/test')
            routerEventsSubject.next(navigationEndEvent)

            expect(component.needApprovalList).toHaveLength(0)
        })
    })

    describe('ngOnInit', () => {
        it('should call ngOnInit without errors', () => {
            expect(() => component.ngOnInit()).not.toThrow()
        })
    })

    describe('onClickHandleWorkflow', () => {
        let mockField: any
        let mockDialogRef: any
        let afterClosedSubject: Subject<any>

        beforeEach(() => {
            mockField = {
                wf: {
                    userId: 'user456',
                    applicationId: 'app123',
                    wfId: 'wf1',
                    updateFieldValues: JSON.stringify([{ fieldKey: 'field1', toValue: { firstName: 'John' } }])
                }
            }

            afterClosedSubject = new Subject()
            mockDialogRef = {
                afterClosed: jest.fn().mockReturnValue(afterClosedSubject.asObservable()),
                close: jest.fn()
            }

            mockDialog.open.mockReturnValue(mockDialogRef)
            component.userwfData = mockWorkflowData
        })

        it('should open approve dialog and handle approval', () => {
            const spy = jest.spyOn(component, 'onApproveOrRejectClick').mockImplementation()

            component.onClickHandleWorkflow(mockField, 'APPROVE')
            // trigger afterClosed AFTER req is initialized in the component
            afterClosedSubject.next(true)

            expect(mockDialog.open).toHaveBeenCalledWith(component.approveDialog, { width: '770px' })
            expect(spy).toHaveBeenCalledWith({
                action: 'APPROVE',
                state: 'SEND_FOR_APPROVAL',
                userId: 'user456',
                applicationId: 'app123',
                actorUserId: 'user123',
                wfId: 'wf1',
                serviceName: 'profile',
                updateFieldValues: [{ fieldKey: 'field1', toValue: { firstName: 'John' } }]
            })
        })

        it('should open reject dialog and handle rejection', () => {
            const spy = jest.spyOn(component, 'onApproveOrRejectClick').mockImplementation()

            component.onClickHandleWorkflow(mockField, 'REJECT')
            afterClosedSubject.next(true)

            expect(mockDialog.open).toHaveBeenCalledWith(component.rejectDialog, { width: '770px' })
            expect(spy).toHaveBeenCalledWith({
                action: 'REJECT',
                state: 'SEND_FOR_APPROVAL',
                userId: 'user456',
                applicationId: 'app123',
                actorUserId: 'user123',
                wfId: 'wf1',
                serviceName: 'profile',
                updateFieldValues: [{ fieldKey: 'field1', toValue: { firstName: 'John' } }]
            })
        })

        it('should close dialog when result is false', () => {
            const spy = jest.spyOn(component, 'onApproveOrRejectClick').mockImplementation()

            component.onClickHandleWorkflow(mockField, 'APPROVE')
            afterClosedSubject.next(false)

            expect(mockDialogRef.close).toHaveBeenCalled()
            expect(spy).not.toHaveBeenCalled()
        })

        it('should raise telemetry event', () => {
            component.onClickHandleWorkflow(mockField, 'APPROVE')

            expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
                {
                    type: TelemetryEvents.EnumInteractTypes.CLICK,
                    subType: TelemetryEvents.EnumInteractSubTypes.BTN_CONTENT,
                },
                {
                    id: 'app123',
                    type: TelemetryEvents.EnumIdtype.APPLICATION,
                }
            )
        })
    })

    describe('onApproveOrRejectClick', () => {
        beforeEach(() => {
            component.needApprovalList = [
                { wfId: 'wf1', name: 'Item 1' },
                { wfId: 'wf2', name: 'Item 2' }
            ]
        })

        it('should handle successful approval', () => {
            const mockResponse = {
                result: {
                    data: {
                        status: 'APPROVED',
                        wfIds: ['wf1']
                    }
                }
            }
            mockNeedApprovalsService.handleWorkflow.mockReturnValue(of(mockResponse))
            const openSnackBarSpy = jest.spyOn(component as any, 'openSnackBar')

            const req = { action: 'APPROVE', comment: 'Test comment' }
            component.comment = 'Test comment'
            component.onApproveOrRejectClick(req)

            expect(mockNeedApprovalsService.handleWorkflow).toHaveBeenCalledWith({
                action: 'APPROVE',
                comment: 'Test comment'
            })
            expect(openSnackBarSpy).toHaveBeenCalledWith('Request Approved')
            expect(component.comment).toBe('')
            expect(component.needApprovalList).toHaveLength(1)
            expect(component.needApprovalList[0].wfId).toBe('wf2')
        })

        it('should handle successful rejection', () => {
            const mockResponse = {
                result: {
                    data: {
                        status: 'REJECTED',
                        wfIds: ['wf1']
                    }
                }
            }
            mockNeedApprovalsService.handleWorkflow.mockReturnValue(of(mockResponse))
            const openSnackBarSpy = jest.spyOn(component as any, 'openSnackBar')

            const req = { action: 'REJECT' }
            component.comment = 'Rejection reason'
            component.onApproveOrRejectClick(req)

            expect(openSnackBarSpy).toHaveBeenCalledWith('Request Rejected Successfully')
        })
    })

    describe('openSnackBar', () => {
        it('should open snack bar with message', () => {
            const message = 'Test message';
            (component as any).openSnackBar(message)

            expect(mockMatSnackBar.open).toHaveBeenCalledWith(message)
        })
    })

    describe('onClickAllHandleWorkflow', () => {
        let mockApprovalList: any[]
        let mockDialogRef: any

        beforeEach(() => {
            mockApprovalList = [
                {
                    wf: {
                        userId: 'user456',
                        applicationId: 'app123',
                        wfId: 'wf1',
                        updateFieldValues: JSON.stringify([{ fieldKey: 'field1', toValue: { firstName: 'John' } }])
                    }
                },
                {
                    wf: {
                        userId: 'user456',
                        applicationId: 'app124',
                        wfId: 'wf2',
                        updateFieldValues: JSON.stringify([{ fieldKey: 'field2', toValue: { lastName: 'Doe' } }])
                    }
                }
            ]

            mockDialogRef = {
                afterClosed: jest.fn().mockReturnValue(of(true)),
                close: jest.fn()
            }

            mockDialog.open.mockReturnValue(mockDialogRef)
            component.userwfData = mockWorkflowData
        })

        it('should handle bulk approval', () => {
            const spy = jest.spyOn(component, 'onApproveOrRejectClick').mockImplementation()

            component.onClickAllHandleWorkflow(mockApprovalList, 'APPROVE')

            expect(mockDialog.open).toHaveBeenCalledWith(component.approveDialog, { width: '770px' })
            expect(spy).toHaveBeenCalledTimes(2)
        })

        it('should handle bulk rejection', () => {
            const spy = jest.spyOn(component, 'onApproveOrRejectClick').mockImplementation()

            component.onClickAllHandleWorkflow(mockApprovalList, 'REJECT')

            expect(mockDialog.open).toHaveBeenCalledWith(component.rejectDialog, { width: '770px' })
            expect(spy).toHaveBeenCalledTimes(2)
        })

        it('should handle empty approval list', () => {
            const spy = jest.spyOn(component, 'onApproveOrRejectClick').mockImplementation()

            component.onClickAllHandleWorkflow([], 'APPROVE')

            expect(spy).not.toHaveBeenCalled()
        })

        it('should close dialog when result is false', () => {
            mockDialogRef.afterClosed.mockReturnValue(of(false))
            const spy = jest.spyOn(component, 'onApproveOrRejectClick').mockImplementation()

            component.onClickAllHandleWorkflow(mockApprovalList, 'APPROVE')

            expect(mockDialogRef.close).toHaveBeenCalled()
            expect(spy).not.toHaveBeenCalled()
        })

        it('should raise telemetry event for bulk operations', () => {
            component.onClickAllHandleWorkflow(mockApprovalList, 'APPROVE')

            expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
                {
                    type: TelemetryEvents.EnumInteractTypes.CLICK,
                    subType: TelemetryEvents.EnumInteractSubTypes.BTN_CONTENT,
                },
                {
                    id: 'app124', // Should use the last applicationId
                    type: TelemetryEvents.EnumIdtype.APPLICATION,
                }
            )
        })

        it('should handle null approval list', () => {
            const spy = jest.spyOn(component, 'onApproveOrRejectClick').mockImplementation()

            component.onClickAllHandleWorkflow(null as any, 'APPROVE')

            expect(spy).not.toHaveBeenCalled()
        })
    })

    describe('Component Properties', () => {
        it('should initialize with default values', () => {
            const newComponent = new NeedsApprovalComponent(
                mockNeedApprovalsService,
                mockActivatedRoute,
                mockRouter,
                mockEventService,
                mockDialog,
                mockMatSnackBar
            )

            expect(newComponent.needApprovalList).toEqual([])
            expect(newComponent.wfHistory).toEqual([])
            expect(newComponent.comment).toBe('')
            expect(newComponent.listupdateFieldValues).toEqual([])
        })
    })
})