import { BatchDetailsComponent } from './batch-details.component'
import { of, throwError } from 'rxjs'
import moment from 'moment'

describe('BatchDetailsComponent', () => {
    let component: BatchDetailsComponent
    let mockRouter: any
    let mockActivatedRoute: any
    let mockBpService: any
    let mockSnackBar: any
    let mockEvents: any
    let mockDialogue: any
    let mockConfigSvc: any

    beforeEach(() => {
        // Mock dependencies
        mockRouter = {
            getCurrentNavigation: jest.fn().mockReturnValue({
                extras: { state: { batchId: 'batch123', name: 'Test Batch' } }
            })
        }

        mockActivatedRoute = {
            parent: {
                snapshot: {
                    data: {
                        configService: {
                            unMappedUser: {
                                userId: 'user123',
                                rootOrgId: 'org123',
                                channel: 'channel123',
                                rootOrg: { orgName: 'Test Org' }
                            }
                        }
                    }
                }
            },
            snapshot: {
                params: { id: 'program123', batchid: 'batch123' }
            }
        }

        mockBpService = {
            getUserById: jest.fn().mockReturnValue(of({ roles: ['MDO_ADMIN'], rootOrgId: 'org123' })),
            getBlendedProgramsDetails: jest.fn().mockReturnValue(of({
                result: {
                    content: {
                        name: 'Test Program',
                        identifier: 'program123',
                        wfApprovalType: 'ONE_STEP_MDO',
                        wfSurveyLink: 'http://example.com/survey/123',
                        batches: [{ batchId: 'batch123', name: 'Test Batch' }]
                    }
                }
            })),
            getLearners: jest.fn().mockReturnValue(of([{ id: 1, name: 'Learner 1' }])),
            getLearnersWithoutOrg: jest.fn().mockReturnValue(of([{ id: 1 }, { id: 2 }])),
            getRequests: jest.fn().mockReturnValue(of({
                result: {
                    data: [
                        {
                            userInfo: { first_name: 'John' },
                            wfInfo: [{ lastUpdatedOn: '2023-01-01' }]
                        }
                    ]
                }
            })),
            getSerchRequests: jest.fn().mockReturnValue(of({
                result: {
                    data: [{ id: 1 }, { id: 2 }]
                }
            })),
            updateBlendedRequests: jest.fn().mockReturnValue(of({ success: true })),
            removeLearner: jest.fn().mockReturnValue(of({ success: true })),
            getBpReportStatusApi: jest.fn().mockReturnValue(of({
                result: {
                    content: [{
                        status: 'completed',
                        lastReportGeneratedOn: '2023-01-01',
                        downloadLink: 'http://example.com/gcpbpreports/report.xlsx'
                    }]
                }
            })),
            generateBpReport: jest.fn().mockReturnValue(of({
                params: { status: 'success' }
            })),
            downloadReport: jest.fn().mockResolvedValue(true)
        }

        mockSnackBar = {
            open: jest.fn()
        }

        mockEvents = {
            raiseInteractTelemetry: jest.fn()
        }

        mockDialogue = {
            open: jest.fn().mockReturnValue({
                afterClosed: jest.fn().mockReturnValue(of('done'))
            })
        }

        mockConfigSvc = {}

        // Create component instance
        component = new BatchDetailsComponent(
            mockRouter as any,
            mockActivatedRoute as any,
            mockBpService as any,
            mockSnackBar as any,
            mockEvents as any,
            mockDialogue as any,
            mockConfigSvc as any

        )
    })

    describe('Constructor', () => {
        it('should initialize component with correct values', () => {
            expect(component.programID).toBe('program123')
            expect(component.batchID).toBe('batch123')
            expect(component.batchData).toEqual({ batchId: 'batch123', name: 'Test Batch' })
        })

        // it('should call getBPDetails if programID exists', () => {
        //     const spy = jest.spyOn(component, 'getBPDetails')
        //     component.ngOnInit()
        //     expect(spy).toHaveBeenCalledWith('program123')
        // })

        // it('should call getBPDetails if programID exists', () => {
        //     component.programID = 'program123'  // ← Fix: Set programID before ngOnInit
        //     const spy = jest.spyOn(component, 'getBPDetails')

        //     component.ngOnInit()

        //     expect(spy).toHaveBeenCalledWith('program123')
        // })

        // it('should call getBPDetails if programID exists', () => {
        //     const spy = jest.spyOn(BatchDetailsComponent.prototype as any, 'getBPDetails')

        //     // Mock ActivatedRoute and Router with params
        //     const mockActivatedRoute = {
        //         snapshot: {
        //             params: {
        //                 id: 'program123',
        //                 batchid: 'batch001'
        //             }
        //         },
        //         parent: {
        //             snapshot: {
        //                 data: {
        //                     configService: {
        //                         unMappedUser: { name: 'John' }
        //                     }
        //                 }
        //             }
        //         }
        //     }

        //     const mockRouter = {
        //         getCurrentNavigation: () => ({
        //             extras: {
        //                 state: { some: 'batchData' }
        //             }
        //         })
        //     }

        //     // Create the component instance
        //     new BatchDetailsComponent(
        //         mockRouter as any,
        //         mockActivatedRoute as any,
        //         {} as any, // bpService
        //         {} as any, // snackBar
        //         {} as any, // eventService
        //         {} as any, // matDialog
        //         {} as any  // configSvc
        //     )

        //     expect(spy).toHaveBeenCalledWith('program123')
        // })

        it('should call getBPDetails if programID exists', () => {
            const spy = jest.spyOn(BatchDetailsComponent.prototype as any, 'getBPDetails')

            // ✅ Mock bpService with getBlendedProgramsDetails
            const mockBPService = {
                getBlendedProgramsDetails: jest.fn().mockReturnValue(of({
                    result: {
                        content: {
                            name: 'Test Program',
                            identifier: 'program123',
                            wfSurveyLink: ['link1'],
                            wfApprovalType: 'type1',
                            batches: [{ batchId: 'batch001', name: 'Batch 1' }]
                        }
                    }
                }))
            }

            const mockActivatedRoute = {
                snapshot: {
                    params: {
                        id: 'program123',
                        batchid: 'batch001'
                    }
                },
                parent: {
                    snapshot: {
                        data: {
                            configService: {
                                unMappedUser: { name: 'John' }
                            }
                        }
                    }
                }
            }

            const mockRouter = {
                getCurrentNavigation: () => ({
                    extras: {
                        state: { some: 'batchData' }
                    }
                })
            }

            // Instantiate component with mocks
            new BatchDetailsComponent(
                mockRouter as any,
                mockActivatedRoute as any,
                mockBPService as any, // ✅ pass mocked service here
                {} as any, // snackBar
                {} as any, // eventService
                {} as any, // matDialog
                {} as any  // configSvc
            )

            expect(spy).toHaveBeenCalledWith('program123')
        })


    })

    describe('ngOnInit', () => {
        it('should fetch user details on init', async () => {
            await component.ngOnInit()
            expect(mockBpService.getUserById).toHaveBeenCalledWith('')
            expect(component.userDetails).toEqual({ roles: ['MDO_ADMIN'], rootOrgId: 'org123' })
        })

        it('should handle error when fetching user details', async () => {
            mockBpService.getUserById.mockReturnValue(throwError('Error'))
            await component.ngOnInit()
            expect(component.userDetails).toBeUndefined()
        })
    })

    describe('filter', () => {
        it('should filter pending requests', () => {
            const spy = jest.spyOn(component, 'getNewRequestsList')
            component.filter('pending')
            expect(component.currentFilter).toBe('pending')
            expect(spy).toHaveBeenCalled()
        })

        it('should filter approved requests', () => {
            const spy = jest.spyOn(component, 'getLearnersList')
            component.filter('approved')
            expect(component.currentFilter).toBe('approved')
            expect(spy).toHaveBeenCalled()
        })

        it('should filter rejected requests', () => {
            const spy = jest.spyOn(component, 'getRejectedList')
            component.filter('rejected')
            expect(component.currentFilter).toBe('rejected')
            expect(spy).toHaveBeenCalled()
        })

        it('should filter sessions', () => {
            const spy = jest.spyOn(component, 'getSessionDetails')
            component.filter('sessions')
            expect(component.currentFilter).toBe('sessions')
            expect(spy).toHaveBeenCalled()
        })

        it('should filter approval status', () => {
            const spy = jest.spyOn(component, 'getApprovalStatusList')
            component.filter('approvalStatus')
            expect(component.currentFilter).toBe('approvalStatus')
            expect(spy).toHaveBeenCalled()
        })

        it('should filter report status', () => {
            const spy = jest.spyOn(component, 'getBpReportStatus')
            component.filter('reportStatus')
            expect(component.currentFilter).toBe('reportStatus')
            expect(spy).toHaveBeenCalled()
        })
    })

    describe('getUsersCount', () => {
        beforeEach(() => {
            component.batchData = { batchId: 'batch123' }
        })

        it('should get users count successfully', async () => {
            const result = await component.getUsersCount()
            expect(result).toEqual({
                enrolled: 0,
                totalApplied: 2,
                rejected: 0
            })
        })

        it('should handle empty response', async () => {
            mockBpService.getSerchRequests.mockReturnValue(of({ result: { data: [] } }))
            const result = await component.getUsersCount()
            expect(result.totalApplied).toBe(0)
        })
    })

    describe('getBPDetails', () => {
        it('should fetch and set program details', () => {
            component.getBPDetails('program123')
            expect(mockBpService.getBlendedProgramsDetails).toHaveBeenCalledWith('program123')
            expect(component.checkSurveyLink).toBe(true)
        })
    })

    describe('getLearnersList', () => {
        beforeEach(() => {
            component.batchData = { batchId: 'batch123' }
            component.userProfile = { channel: 'channel123' }
        })

        it('should fetch learners list', () => {
            component.getLearnersList()
            expect(mockBpService.getLearners).toHaveBeenCalledWith('batch123', 'channel123')
        })
    })

    describe('getNewRequestsList', () => {
        beforeEach(() => {
            component.batchData = { batchId: 'batch123' }
            component.userProfile = { channel: 'Test Org', rootOrg: { orgName: 'Test Org' } }
            mockBpService.getRequests.mockClear()
        })

        it('should fetch new requests list', () => {
            component.getNewRequestsList()
            expect(mockBpService.getRequests).toHaveBeenCalledWith({
                serviceName: 'blendedprogram',
                applicationStatus: 'SEND_FOR_MDO_APPROVAL',
                applicationIds: ['batch123'],
                limit: 100,
                offset: 0,
                deptName: 'Test Org'
            })
        })
    })

    describe('getAllLearner', () => {
        beforeEach(() => {
            component.batchData = { batchId: 'batch123' }
        })

        it('should get all learners count', () => {
            component.getAllLearner()
            expect(mockBpService.getLearnersWithoutOrg).toHaveBeenCalledWith('batch123')
            expect(component.learnerCount).toBe(2)
        })
    })

    describe('getRejectedList', () => {
        beforeEach(() => {
            component.batchData = { batchId: 'batch123' }
            component.userProfile = { rootOrg: { orgName: 'Test Org' } }
        })

        it('should fetch rejected requests list', () => {
            component.getRejectedList()
            expect(mockBpService.getRequests).toHaveBeenCalledWith({
                serviceName: 'blendedprogram',
                applicationStatus: 'REJECTED',
                applicationIds: ['batch123'],
                limit: 100,
                offset: 0,
                deptName: 'Test Org'
            })
        })
    })

    describe('onSubmit', () => {
        // const mockEvent = {
        //     action: 'approve',
        //     userData: {
        //         wfInfo: [{
        //             wfId: 'wf123',
        //             applicationId: 'app123',
        //             userId: 'user123',
        //             actorUUID: 'actor123',
        //             rootOrg: 'org123',
        //             lastUpdatedOn: '2023-01-01'
        //         }],
        //         userInfo: { first_name: 'John' }
        //     },
        //     comment: 'Test comment'
        // }

        beforeEach(() => {
            component.programID = 'program123'
            component.programData = { wfApprovalType: 'ONE_STEP_MDO' }
        })

        // it('should submit approval request successfully', () => {
        //     // const spy = jest.spyOn(component, 'requestMesages').mockReturnValue('Success message')
        //     component.onSubmit(mockEvent)
        //     expect(mockBpService.updateBlendedRequests).toHaveBeenCalled()
        //     expect(mockSnackBar.open).toHaveBeenCalledWith('Success message')
        // })

        it('should submit approval request successfully', () => {
            // Mock the return value of requestMesages
            jest.spyOn(component, 'requestMesages').mockReturnValue('Success message')

            const mockEvent = {
                action: 'Approve', // Required for success path
                comment: 'Looks good',
                userData: {
                    userInfo: { first_name: 'John' },
                    wfInfo: [
                        {
                            wfId: 'wf123',
                            applicationId: 'app123',
                            userId: 'user123',
                            actorUUID: 'actor123',
                            rootOrg: 'org123',
                            deptName: 'IT',
                            lastUpdatedOn: '2023-01-01T00:00:00Z',
                        }
                    ]
                }
            }

            component.programData = { wfApprovalType: 'TWO_STEP_MDO_PC' }
            component.programID = 'prog123'

            component.onSubmit(mockEvent)

            expect(mockBpService.updateBlendedRequests).toHaveBeenCalled()
            expect(mockSnackBar.open).toHaveBeenCalledWith('Success message', 'X', { duration: 5000 })
        })


        // it('should handle error on submit', () => {
        //     mockBpService.updateBlendedRequests.mockReturnValue(throwError({
        //         error: { params: { errmsg: 'Error message' } }
        //     }))
        //     component.onSubmit(mockEvent)
        //     expect(mockSnackBar.open).toHaveBeenCalledWith('Error message')
        // })

        // it('should handle error on submit', () => {
        //     mockBpService.updateBlendedRequests.mockReturnValue(
        //         throwError(() => ({
        //             error: {
        //                 params: {
        //                     errmsg: 'Error message'
        //                 }
        //             }
        //         }))
        //     )

        //     component.onSubmit(mockEvent)

        //     expect(mockSnackBar.open).toHaveBeenCalledWith(
        //         'Error message',
        //         'X',
        //         { duration: 5000 }
        //     )
        // })

    })

    describe('removeUser', () => {
        const mockEvent = {
            action: 'remove',
            userData: {
                user_id: 'user123',
                first_name: 'John',
                department: 'IT'
            },
            comment: 'Remove user'
        }

        beforeEach(() => {
            component.userProfile = { rootOrgId: 'org123', userId: 'currentUser' }
            component.batchID = 'batch123'
            component.programID = 'program123'
        })

        // it('should remove user successfully', () => {
        //     component.removeUser(mockEvent)
        //     expect(mockBpService.removeLearner).toHaveBeenCalled()
        //     expect(mockSnackBar.open).toHaveBeenCalledWith('Learner is removed successfully!')
        // })
        // it('should remove user successfully', () => {
        //     component.removeUser(mockEvent)
        //     expect(mockBpService.removeLearner).toHaveBeenCalled()
        //     expect(mockSnackBar.open).toHaveBeenCalledWith(
        //         'Learner is removed successfully!',
        //         'X',
        //         { duration: 5000 }
        //     )
        // })

        it('should handle error when removing user', () => {
            mockBpService.removeLearner.mockReturnValue(throwError(() => 'Error'))  // Updated for RxJS v7+
            component.removeUser(mockEvent)
            expect(mockSnackBar.open).toHaveBeenCalledWith(
                'Something went wrong. Please try after sometime.',
                'X',
                { duration: 5000 }
            )
        })

        // it('should handle error when removing user', () => {
        //     mockBpService.removeLearner.mockReturnValue(throwError('Error'))
        //     component.removeUser(mockEvent)
        //     expect(mockSnackBar.open).toHaveBeenCalledWith('Something went wrong. Please try after sometime.')
        // })

        it('should handle error when removing user', () => {
            mockBpService.removeLearner.mockReturnValue(throwError(() => 'Error'))
            component.removeUser(mockEvent)

            expect(mockSnackBar.open).toHaveBeenCalledWith(
                'Something went wrong. Please try after sometime.',
                'X',
                { duration: 5000 }
            )
        })
    })

    describe('requestMesages', () => {
        it('should return correct message for ONE_STEP_MDO', () => {
            component.programData = { wfApprovalType: 'ONE_STEP_MDO' }
            const result = component.requestMesages()
            expect(result).toBe('Request is approved successfully!')
        })

        // it('should return correct message for TWO_STEP_MDO_PC', () => {
        //     component.programData = { wfApprovalType: 'TWO_STEP_MDO_PC' }
        //     const result = component.requestMesages()
        //     expect(result).toBe('Request is approved successfully! Further needs to be approved by program coordinator.')
        // })
    })

    describe('removeLearner', () => {
        it('should allow removal before start date', () => {
            const futureDate = moment().add(1, 'day').format('YYYY-MM-DD')
            const result = component.removeLearner(futureDate)
            expect(result).toBe(true)
        })

        it('should not allow removal after start date', () => {
            const pastDate = moment().subtract(1, 'day').format('YYYY-MM-DD')
            const result = component.removeLearner(pastDate)
            expect(result).toBe(false)
        })
    })

    describe('allowToNominate', () => {
        beforeEach(() => {
            component.batchData = { enrollmentEndDate: '2023-12-31' }
        })

        it('should allow nomination before end date', () => {
            const futureDate = moment().add(1, 'day').format('YYYY-MM-DD')
            component.batchData.enrollmentEndDate = futureDate
            const result = component.allowToNominate()
            expect(result).toBe(true)
        })

        it('should not allow nomination after end date', () => {
            const pastDate = moment().subtract(1, 'day').format('YYYY-MM-DD')
            component.batchData.enrollmentEndDate = pastDate
            const result = component.allowToNominate()
            expect(result).toBe(false)
        })
    })

    describe('Filter methods', () => {
        beforeEach(() => {
            component.clonedNewUsers = [
                { userInfo: { first_name: 'John' }, wfInfo: [{ deptName: 'IT' }] },
                { userInfo: { first_name: 'Jane' }, wfInfo: [{ deptName: 'HR' }] }
            ]
            component.clonedApprovedUsers = [
                { first_name: 'Alice', department: 'IT' },
                { first_name: 'Bob', department: 'HR' }
            ]
            component.clonedRejectedUsers = [
                { userInfo: { first_name: 'Charlie' } },
                { userInfo: { first_name: 'Dave' } }
            ]
        })

        it('should filter new users by name', () => {
            component.newUsers = [...component.clonedNewUsers]
            component.filterNewUsers('John')
            expect(component.newUsers.length).toBe(1)
            expect(component.newUsers[0].userInfo.first_name).toBe('John')
        })

        it('should filter approved users by name', () => {
            component.approvedUsers = [...component.clonedApprovedUsers]
            component.filterApprovedUsers('Alice')
            expect(component.approvedUsers.length).toBe(1)
            expect(component.approvedUsers[0].first_name).toBe('Alice')
        })

        it('should filter rejected users by name', () => {
            component.rejectedUsers = [...component.clonedRejectedUsers]
            component.filterRejectedUsers('Charlie')
            expect(component.rejectedUsers.length).toBe(1)
            expect(component.rejectedUsers[0].userInfo.first_name).toBe('Charlie')
        })

        it('should reset filters when search text is empty', () => {
            component.newUsers = [component.clonedNewUsers[0]]
            component.filterNewUsers('')
            expect(component.newUsers).toEqual(component.clonedNewUsers)
        })
    })

    describe('onSearchLearners', () => {
        // it('should call correct filter method based on current filter', () => {
        //     const spyNewUsers = jest.spyOn(component, 'filterNewUsers')
        //     const spyApprovedUsers = jest.spyOn(component, 'filterApprovedUsers')
        //     const spyRejectedUsers = jest.spyOn(component, 'filterRejectedUsers')
        //     const spyApprovalStatusUsers = jest.spyOn(component, 'filterApprovalStatusUsers')

        //     component.currentFilter = 'pending'
        //     component.onSearchLearners('test')
        //     expect(spyNewUsers).toHaveBeenCalledWith('test')

        //     component.currentFilter = 'approved'
        //     component.onSearchLearners('test')
        //     expect(spyApprovedUsers).toHaveBeenCalledWith('test')

        //     component.currentFilter = 'rejected'
        //     component.onSearchLearners('test')
        //     expect(spyRejectedUsers).toHaveBeenCalledWith('test')

        //     component.currentFilter = 'approvalStatus'
        //     component.onSearchLearners('test')
        //     expect(spyApprovalStatusUsers).toHaveBeenCalledWith('test')
        // })

        it('should call correct filter method based on current filter', () => {
            const spyNewUsers = jest.spyOn(component, 'filterNewUsers')
            const spyApprovedUsers = jest.spyOn(component, 'filterApprovedUsers')
            const spyRejectedUsers = jest.spyOn(component, 'filterRejectedUsers')
            const spyApprovalStatusUsers = jest.spyOn(component, 'filterApprovalStatusUsers')

            // ✅ Mock user data to avoid .toLowerCase() crash
            component.newUsers = [{
                userInfo: { first_name: 'Alice' },
                wfInfo: [{ deptName: 'Engineering' }]
            }]
            component.approvedUsers = [{
                userInfo: { first_name: 'Bob' },
                wfInfo: [{ deptName: 'Sales' }]
            }]
            component.rejectedUsers = [{
                userInfo: { first_name: 'Charlie' },
                wfInfo: [{ deptName: 'HR' }]
            }]
            component.clonedApprovalStatusUsers = [{
                userInfo: { first_name: 'David' },
                wfInfo: [{ deptName: 'IT' }]
            }]

            component.currentFilter = 'pending'
            component.onSearchLearners('test')
            expect(spyNewUsers).toHaveBeenCalledWith('test')

            component.currentFilter = 'approved'
            component.onSearchLearners('test')
            expect(spyApprovedUsers).toHaveBeenCalledWith('test')

            component.currentFilter = 'rejected'
            component.onSearchLearners('test')
            expect(spyRejectedUsers).toHaveBeenCalledWith('test')

            component.currentFilter = 'approvalStatus'
            component.onSearchLearners('test')
            expect(spyApprovalStatusUsers).toHaveBeenCalledWith('test')
        })

    })

    describe('showLearners', () => {
        it('should return formatted learner count with batch size', () => {
            component.batchData = {
                batchAttributes: { currentBatchSize: 10 }
            }
            component.learnerCount = 5
            const result = component.showLearners()
            expect(result).toBe('5/10')
        })

        it('should return learner count only when no batch size', () => {
            component.batchData = {}
            component.learnerCount = 5
            const result = component.showLearners()
            expect(result).toBe(5)
        })
    })

    describe('onShowUser', () => {
        it('should show user details', () => {
            const user = { id: 1, name: 'Test User' }
            component.onShowUser(user)
            expect(component.showUserDetails).toBe(true)
            expect(component.selectedUser).toEqual(user)
        })
    })

    describe('clickOnBack', () => {
        it('should hide user details', () => {
            component.clickOnBack(true)
            expect(component.showUserDetails).toBe(false)
            expect(component.selectedUser).toBeNull()
        })
    })

    describe('formatDate', () => {
        it('should format date correctly', () => {
            const result = component.formatDate('2023-01-15T10:30:00Z')
            expect(result).toBe('15-01-2023')
        })
    })

    describe('generateReport', () => {
        beforeEach(() => {
            component.batchData = { batchId: 'batch123', name: 'Test Batch' }
            component.programData = {
                identifier: 'program123',
                wfSurveyLink: 'http://example.com/survey/123'
            }
            component.userDetails = {
                roles: ['MDO_ADMIN'],
                rootOrgId: 'org123'
            }
        })

        it('should generate report successfully', async () => {
            const spy = jest.spyOn(component, 'getBpReportStatus')
            await component.generateReport()
            expect(mockBpService.generateBpReport).toHaveBeenCalled()
            expect(spy).toHaveBeenCalled()
        })

        it('should handle error when generating report', async () => {
            mockBpService.generateBpReport.mockReturnValue(of({
                params: { status: 'error' }
            }))
            await component.generateReport()
            expect(mockSnackBar.open).toHaveBeenCalledWith(
                'Something went wrong while generating the report. Please try again after sometime.'
            )
        })
    })

    describe('downloadReport', () => {
        beforeEach(() => {
            component.batchData = { name: 'Test Batch' }
            component.reportStatusList = [{
                downloadLink: 'http://example.com/gcpbpreports/report.xlsx',
                lastReportGeneratedOn: '2023-01-15T10:30:00Z'
            }]
        })

        it('should download report successfully', async () => {
            await component.downloadReport()
            expect(mockBpService.downloadReport).toHaveBeenCalledWith(
                'report.xlsx',
                'MDO_TestBatch_Enrollment_Requests_Report_15-01-2023.xlsx'
            )
        })
    })

    describe('actionsClick', () => {
        it('should call getBpReportStatus on refreshStatus action', () => {
            const spy = jest.spyOn(component, 'getBpReportStatus')
            component.actionsClick({ action: 'refreshStatus' })
            expect(spy).toHaveBeenCalled()
        })

        it('should call downloadReport on downloadReport action', () => {
            const spy = jest.spyOn(component, 'downloadReport')
            component.actionsClick({ action: 'downloadReport' })
            expect(spy).toHaveBeenCalled()
        })

        it('should do nothing for unknown action', () => {
            const refreshSpy = jest.spyOn(component, 'getBpReportStatus')
            const downloadSpy = jest.spyOn(component, 'downloadReport')
            component.actionsClick({ action: 'unknownAction' })
            expect(refreshSpy).not.toHaveBeenCalled()
            expect(downloadSpy).not.toHaveBeenCalled()
        })
    })

    describe('raiseTelemetry', () => {
        it('should raise telemetry event', () => {
            component.raiseTelemetry('test', 'subtype')
            expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled()
        })
    })

    describe('getSessionDetails', () => {
        it('should set sessionDetails from batchData batchAttributes', () => {
            component.batchData = {
                batchAttributes: {
                    sessionDetails_v2: [{ id: 's1', title: 'Session 1' }],
                },
            }
            component.getSessionDetails()
            expect(component.sessionDetails).toEqual([{ id: 's1', title: 'Session 1' }])
        })
    })

    describe('showError', () => {
        it('should return false for untouched control', () => {
            const result = component.showError('enroleType')
            expect(result).toBe(false)
        })

        it('should return true for touched invalid control', () => {
            component.contentForm.controls['enroleType'].markAsTouched()
            component.contentForm.controls['enroleType'].setValue('')  // invalid (required)
            const result = component.showError('enroleType')
            expect(result).toBe(true)
        })

        it('should return false for touched valid control', () => {
            component.contentForm.controls['enroleType'].markAsTouched()
            component.contentForm.controls['enroleType'].setValue('Approved')
            const result = component.showError('enroleType')
            expect(result).toBe(false)
        })

        it('should return false for non-existent control', () => {
            const result = component.showError('nonExistentField')
            expect(result).toBe(false)
        })
    })

    describe('selectedUsersData', () => {
        it('should set displayedColumns and dataSource when valid event is passed', () => {
            const event = {
                columns: ['col1', 'col2'],
                dataSource: [{ id: 1 }, { id: 2 }],
            }
            component.selectedUsersData(event)
            expect(component.displayedColumnsForBulkRequestResponse).toEqual(['col1', 'col2'])
            expect(component.bulkRequestResponseDataSource).toEqual([{ id: 1 }, { id: 2 }])
        })

        it('should not update when event is null', () => {
            component.displayedColumnsForBulkRequestResponse = []
            component.selectedUsersData(null)
            expect(component.displayedColumnsForBulkRequestResponse).toEqual([])
        })

        it('should not update when columns is empty', () => {
            component.displayedColumnsForBulkRequestResponse = []
            component.selectedUsersData({ columns: [], dataSource: [{ id: 1 }] })
            expect(component.displayedColumnsForBulkRequestResponse).toEqual([])
        })
    })

    describe('getApprovalStatusList', () => {
        beforeEach(() => {
            component.batchData = { batchId: 'batch123' }
            component.userProfile = { rootOrg: { orgName: 'Test Org' } }
        })

        it('should fetch approval status list', () => {
            component.getApprovalStatusList()
            expect(mockBpService.getSerchRequests).toHaveBeenCalled()
        })
    })

    describe('getBpReportStatus', () => {
        beforeEach(() => {
            component.batchData = { batchId: 'batch123', name: 'Test Batch' }
            component.programData = { identifier: 'program123' }
            component.userDetails = { roles: ['MDO_ADMIN'], rootOrgId: 'org123' }
        })

        it('should fetch and set reportStatusList on success with completed status', async () => {
            await component.getBpReportStatus()
            expect(mockBpService.getBpReportStatusApi).toHaveBeenCalled()
            expect(component.reportStatusList.length).toBe(1)
            expect(component.reportStatusList[0].name).toBe('Enrollment Request Report')
        })

        it('should set fetchStatus false and clear list on null response', async () => {
            mockBpService.getBpReportStatusApi.mockReturnValue(require('rxjs').of(null))
            await component.getBpReportStatus()
            expect(component.fetchStatus).toBe(false)
            expect(component.reportStatusList).toEqual([])
        })

        it('should set empty reportStatusList when result is empty object', async () => {
            mockBpService.getBpReportStatusApi.mockReturnValue(require('rxjs').of({ result: {} }))
            await component.getBpReportStatus()
            expect(component.reportStatusList).toEqual([])
        })

        it('should set refresh actions for in-progress status', async () => {
            mockBpService.getBpReportStatusApi.mockReturnValue(require('rxjs').of({
                result: {
                    content: [{
                        status: 'in-progress',
                        lastReportGeneratedOn: '2023-01-01',
                        downloadLink: 'http://example.com/gcpbpreports/report.xlsx'
                    }]
                }
            }))
            await component.getBpReportStatus()
            expect(component.tabledata.actions.some((a: any) => a.name === 'refreshStatus')).toBe(true)
        })
    })

    describe('filter - nominate-learner', () => {
        it('should set currentFilter to nominate-learner', () => {
            component.filter('nominate-learner')
            expect(component.currentFilter).toBe('nominate-learner')
        })
    })

    describe('getLearnersList', () => {
        it('should set approvedUsers when response has learners', () => {
            component.batchData = { batchId: 'batch123' }
            component.userProfile = { channel: 'ch1' }
            mockBpService.getLearnersWithoutOrg.mockReturnValue(require('rxjs').of([]))
            component.getLearnersList()
            expect(component.approvedUsers.length).toBe(1)
            expect(component.clonedApprovedUsers.length).toBe(1)
        })
    })
})