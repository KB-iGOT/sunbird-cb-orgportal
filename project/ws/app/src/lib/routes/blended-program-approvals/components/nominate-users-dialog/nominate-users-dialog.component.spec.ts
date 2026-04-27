import { of, throwError } from 'rxjs'
import { NominateUsersDialogComponent } from './nominate-users-dialog.component'
import { BlendedApporvalService } from '../../services/blended-approval.service'
import { DialogConfirmComponent } from '../../../../../../../../../src/app/component/dialog-confirm/dialog-confirm.component'
import { UsersService } from '../../../users/services/users.service'

describe('NominateUsersDialogComponent', () => {
    let component: NominateUsersDialogComponent
    let usersServiceMock: any
    let blendedApprovalServiceMock: any
    let dialogMock: any
    let dialogRefMock: any
    let snackBarMock: any
    let configSvcMock: any

    const mockData = {
        orgId: 'org1',
        learners: [{ user_id: 'user1' }, { user_id: 'user2' }],
        courseId: 'course1',
        applicationId: 'app1',
        totalBatchCount: 10,
        wfApprovalType: 'twoStepMDOAndPCApproval',
    }

    const mockUserData = {
        content: [
            {
                id: 'user3',
                firstName: 'Test',
                maskedEmail: 'test@example.com',
                rootOrgName: 'Test Org',
                profileDetails: { employmentDetails: { departmentName: 'IT' } },
            },
            {
                id: 'user4',
                firstName: 'User',
                maskedEmail: 'user@example.com',
                rootOrgName: 'Test Org',
                profileDetails: null,
            },
        ],
    }

    function createComponent(data = mockData) {
        component = new NominateUsersDialogComponent(
            dialogRefMock,
            usersServiceMock,
            configSvcMock,
            dialogMock,
            data,
            blendedApprovalServiceMock,
            snackBarMock
        )
    }

    beforeEach(() => {
        usersServiceMock = {
            getAllUsers: jest.fn().mockReturnValue(of(mockUserData)),
        }

        blendedApprovalServiceMock = {
            nominateLearners: jest.fn().mockReturnValue(of([{ result: { status: 'OK' } }])),
            getSerchRequests: jest.fn().mockReturnValue(
                of({ result: { data: [{ id: 1 }, { id: 2 }] } })
            ),
            inviteUserToBatch: jest.fn().mockReturnValue(of({ result: { data: [{ status: 'APPROVED' }] } })),
        }

        dialogMock = {
            open: jest.fn().mockReturnValue({ afterClosed: jest.fn().mockReturnValue(of(false)) }),
        }

        dialogRefMock = { close: jest.fn() }
        snackBarMock = { open: jest.fn() }

        configSvcMock = {
            userProfile: { departmentName: 'Test Department' },
        }

        createComponent()
    })

    afterEach(() => jest.clearAllMocks())

    // ─── creation ────────────────────────────────────────────────────────────────

    it('should create the component', () => {
        expect(component).toBeTruthy()
    })

    // ─── ngOnInit ────────────────────────────────────────────────────────────────

    describe('ngOnInit', () => {
        it('should call getAllUsers with default filter object', () => {
            const spy = jest.spyOn(component, 'getAllUsers')
            component.ngOnInit()
            expect(spy).toHaveBeenCalledWith({
                request: {
                    query: '',
                    filters: { rootOrgId: mockData.orgId, status: 1 },
                    limit: 100,
                    offset: 0,
                },
            })
        })
    })

    // ─── getAllUsers ──────────────────────────────────────────────────────────────

    describe('getAllUsers', () => {
        const filterObj = {
            request: {
                query: '',
                filters: { rootOrgId: 'org1', status: 1 },
                limit: 100,
                offset: 0,
            },
        }

        it('should call usersService.getAllUsers with filterObj', () => {
            component.getAllUsers(filterObj)
            expect(usersServiceMock.getAllUsers).toHaveBeenCalledWith(filterObj)
        })

        it('should filter out already-enrolled learners', () => {
            // user1, user2 are already in learners; only user3, user4 should appear
            component.getAllUsers(filterObj)
            expect(component.filteredUsers.length).toBe(2)
            const ids = component.filteredUsers.map((u: any) => u.userId)
            expect(ids).toContain('user3')
            expect(ids).toContain('user4')
        })

        it('should set deptName from employmentDetails when profileDetails exists', () => {
            component.getAllUsers(filterObj)
            const u = component.filteredUsers.find((u: any) => u.userId === 'user3')
            expect(u.deptName).toBe('IT')
        })

        it('should set deptName from rootOrgName when profileDetails is null', () => {
            component.getAllUsers(filterObj)
            const u = component.filteredUsers.find((u: any) => u.userId === 'user4')
            expect(u.deptName).toBe('Test Org')
        })

        it('should set displayLoader to false after response', () => {
            component.getAllUsers(filterObj)
            expect(component.displayLoader).toBe(false)
        })

        it('should exclude user whose id matches an existing learner', () => {
            usersServiceMock.getAllUsers.mockReturnValue(
                of({ content: [{ id: 'user1', firstName: 'A', maskedEmail: 'a@b.com', rootOrgName: 'Org', profileDetails: null }] })
            )
            component.getAllUsers(filterObj)
            expect(component.filteredUsers.length).toBe(0)
        })
    })

    // ─── searchUsers ─────────────────────────────────────────────────────────────

    describe('searchUsers', () => {
        it('should call getAllUsers with trimmed lowercase query', () => {
            const spy = jest.spyOn(component, 'getAllUsers')
            component.searchUsers({ value: '  Test Search  ' })
            expect(spy).toHaveBeenCalledWith({
                request: {
                    query: 'test search',
                    filters: { rootOrgId: 'org1', status: 1 },
                },
            })
        })

        it('should call getAllUsers with empty query when value is empty', () => {
            const spy = jest.spyOn(component, 'getAllUsers')
            component.searchUsers({ value: '' })
            expect(spy).toHaveBeenCalledWith({
                request: {
                    query: '',
                    filters: { rootOrgId: 'org1', status: 1 },
                },
            })
        })

        it('should call getAllUsers with empty query when value is falsy', () => {
            const spy = jest.spyOn(component, 'getAllUsers')
            component.searchUsers({ value: null })
            expect(spy).toHaveBeenCalledWith({
                request: {
                    query: '',
                    filters: { rootOrgId: 'org1', status: 1 },
                },
            })
        })
    })

    // ─── getUsersCount ────────────────────────────────────────────────────────────

    describe('getUsersCount', () => {
        it('should return userscount with totalApplied from response data', async () => {
            const result = await component.getUsersCount()
            expect(blendedApprovalServiceMock.getSerchRequests).toHaveBeenCalledWith({
                serviceName: ['blendedprogram'],
                applicationStatus: ['SEND_FOR_PC_APPROVAL', 'SEND_FOR_MDO_APPROVAL', 'APPROVED'],
                applicationIds: ['app1'],
                limit: 100,
                offset: 0,
            })
            expect(result).toEqual({ enrolled: 0, totalApplied: 2, rejected: 0 })
        })

        it('should return zeroed userscount when response is empty', async () => {
            blendedApprovalServiceMock.getSerchRequests.mockReturnValue(of({}))
            const result = await component.getUsersCount()
            expect(result).toEqual({ enrolled: 0, totalApplied: 0, rejected: 0 })
        })

        it('should return zeroed userscount when result.data is empty array', async () => {
            blendedApprovalServiceMock.getSerchRequests.mockReturnValue(of({ result: { data: [] } }))
            const result = await component.getUsersCount()
            expect(result).toEqual({ enrolled: 0, totalApplied: 0, rejected: 0 })
        })

        it('should return undefined when data has no applicationId', async () => {
            createComponent({ ...mockData, applicationId: undefined as any })
            const result = await component.getUsersCount()
            expect(result).toBeUndefined()
        })

        it('should handle getSerchRequests rejecting', async () => {
            blendedApprovalServiceMock.getSerchRequests.mockReturnValue(throwError('err'))
            const result = await component.getUsersCount()
            expect(result).toEqual({ enrolled: 0, totalApplied: 0, rejected: 0 })
        })
    })

    // ─── closeDiaogBox ────────────────────────────────────────────────────────────

    describe('closeDiaogBox', () => {
        it('should close the dialog with "close"', () => {
            component.closeDiaogBox()
            expect(dialogRefMock.close).toHaveBeenCalledWith('close')
        })
    })

    // ─── addLearners ──────────────────────────────────────────────────────────────

    describe('addLearners', () => {
        beforeEach(() => {
            // getUsersCount returns totalApplied=2, totalBatchCount=10 → differenceCount=8
            blendedApprovalServiceMock.getSerchRequests.mockReturnValue(
                of({ result: { data: [{ id: 1 }, { id: 2 }] } })
            )
        })

        it('should do nothing when no users are selected', async () => {
            (component.selection as any).clear()
            await component.addLearners()
            expect(blendedApprovalServiceMock.inviteUserToBatch).not.toHaveBeenCalled()
        })

        it('should open dialogue when selection exceeds differenceCount', async () => {
            // differenceCount = 10 - 2 = 8; select 9 users
            for (let i = 0; i < 9; i++) {
                ; (component.selection as any).select({ userId: `u${i}` })
            }
            await component.addLearners()
            expect(dialogMock.open).toHaveBeenCalled()
            expect(blendedApprovalServiceMock.inviteUserToBatch).not.toHaveBeenCalled()
        })

        it('should call inviteUserToBatch when selection fits within limit', async () => {
            ; (component.selection as any).select({ userId: 'uA' })
            blendedApprovalServiceMock.inviteUserToBatch.mockReturnValue(
                of({ result: { data: [{ status: 'APPROVED' }] } })
            )
            await component.addLearners()
            expect(blendedApprovalServiceMock.inviteUserToBatch).toHaveBeenCalled()
        })

        it('should close dialogRef with "done" on success', async () => {
            ; (component.selection as any).select({ userId: 'uA' })
            blendedApprovalServiceMock.inviteUserToBatch.mockReturnValue(
                of({ result: { data: [{ status: 'APPROVED' }] } })
            )
            await component.addLearners()
            expect(dialogRefMock.close).toHaveBeenCalledWith('done')
        })

        it('should show success snackbar when all approved', async () => {
            ; (component.selection as any).select({ userId: 'uA' })
            blendedApprovalServiceMock.inviteUserToBatch.mockReturnValue(
                of({ result: { data: [{ status: 'APPROVED' }] } })
            )
            await component.addLearners()
            expect(snackBarMock.open).toHaveBeenCalledWith('1 user added successfully', 'OK', { duration: 4000 })
        })

        it('should use plural "users" when multiple are approved', async () => {
            ; (component.selection as any).select({ userId: 'uA' })
                ; (component.selection as any).select({ userId: 'uB' })
            blendedApprovalServiceMock.inviteUserToBatch.mockReturnValue(
                of({ result: { data: [{ status: 'APPROVED' }, { status: 'APPROVED' }] } })
            )
            await component.addLearners()
            expect(snackBarMock.open).toHaveBeenCalledWith('2 users added successfully', 'OK', { duration: 4000 })
        })

        it('should show mixed message when success and failures exist', async () => {
            ; (component.selection as any).select({ userId: 'uA' })
                ; (component.selection as any).select({ userId: 'uB' })
            blendedApprovalServiceMock.inviteUserToBatch.mockReturnValue(
                of({ result: { data: [{ status: 'APPROVED' }, { status: 'ALREADY_EXISTS' }] } })
            )
            await component.addLearners()
            const callArg = snackBarMock.open.mock.calls[0][0] as string
            expect(callArg).toContain('added successfully')
            expect(callArg).toContain('already enrolled')
            expect(snackBarMock.open).toHaveBeenCalledWith(expect.any(String), 'OK', { duration: 6000 })
        })

        it('should show failure-only message when all fail', async () => {
            ; (component.selection as any).select({ userId: 'uA' })
            blendedApprovalServiceMock.inviteUserToBatch.mockReturnValue(
                of({ result: { data: [{ status: 'BATCH_FULL' }] } })
            )
            await component.addLearners()
            expect(snackBarMock.open).toHaveBeenCalledWith(
                expect.stringContaining('Nomination failed'),
                'OK',
                { duration: 6000 }
            )
        })

        it('should handle SCHEDULE_CONFLICT status', async () => {
            ; (component.selection as any).select({ userId: 'uA' })
            blendedApprovalServiceMock.inviteUserToBatch.mockReturnValue(
                of({ result: { data: [{ status: 'SCHEDULE_CONFLICT' }] } })
            )
            await component.addLearners()
            const callArg = snackBarMock.open.mock.calls[0][0] as string
            expect(callArg).toContain('schedule conflict')
        })

        it('should handle other failure status', async () => {
            ; (component.selection as any).select({ userId: 'uA' })
            blendedApprovalServiceMock.inviteUserToBatch.mockReturnValue(
                of({ result: { data: [{ status: 'UNKNOWN_STATUS' }] } })
            )
            await component.addLearners()
            const callArg = snackBarMock.open.mock.calls[0][0] as string
            expect(callArg).toContain('failed')
        })

        it('should handle plural already_exists', async () => {
            ; (component.selection as any).select({ userId: 'uA' })
                ; (component.selection as any).select({ userId: 'uB' })
            blendedApprovalServiceMock.inviteUserToBatch.mockReturnValue(
                of({ result: { data: [{ status: 'ALREADY_EXISTS' }, { status: 'ALREADY_EXISTS' }] } })
            )
            await component.addLearners()
            const callArg = snackBarMock.open.mock.calls[0][0] as string
            expect(callArg).toContain('users already enrolled')
        })

        it('should handle plural BATCH_FULL', async () => {
            ; (component.selection as any).select({ userId: 'uA' })
                ; (component.selection as any).select({ userId: 'uB' })
            blendedApprovalServiceMock.inviteUserToBatch.mockReturnValue(
                of({ result: { data: [{ status: 'BATCH_FULL' }, { status: 'BATCH_FULL' }] } })
            )
            await component.addLearners()
            const callArg = snackBarMock.open.mock.calls[0][0] as string
            expect(callArg).toContain('users failed (batch full)')
        })

        it('should handle plural SCHEDULE_CONFLICT', async () => {
            ; (component.selection as any).select({ userId: 'uA' })
                ; (component.selection as any).select({ userId: 'uB' })
            blendedApprovalServiceMock.inviteUserToBatch.mockReturnValue(
                of({ result: { data: [{ status: 'SCHEDULE_CONFLICT' }, { status: 'SCHEDULE_CONFLICT' }] } })
            )
            await component.addLearners()
            const callArg = snackBarMock.open.mock.calls[0][0] as string
            expect(callArg).toContain('users failed (schedule conflict)')
        })

        it('should handle plural other failures', async () => {
            ; (component.selection as any).select({ userId: 'uA' })
                ; (component.selection as any).select({ userId: 'uB' })
            blendedApprovalServiceMock.inviteUserToBatch.mockReturnValue(
                of({ result: { data: [{ status: 'FOO' }, { status: 'BAR' }] } })
            )
            await component.addLearners()
            const callArg = snackBarMock.open.mock.calls[0][0] as string
            expect(callArg).toContain('users failed')
        })

        it('should show fallback message when response.data is not array', async () => {
            ; (component.selection as any).select({ userId: 'uA' })
            blendedApprovalServiceMock.inviteUserToBatch.mockReturnValue(
                of({ result: { data: null } })
            )
            await component.addLearners()
            expect(snackBarMock.open).toHaveBeenCalledWith(
                'User is successfully added to the invitee list',
                'OK',
                { duration: 4000 }
            )
        })

        it('should show fallback message when response has no result', async () => {
            ; (component.selection as any).select({ userId: 'uA' })
            blendedApprovalServiceMock.inviteUserToBatch.mockReturnValue(of({}))
            await component.addLearners()
            expect(snackBarMock.open).toHaveBeenCalledWith(
                'User is successfully added to the invitee list',
                'OK',
                { duration: 4000 }
            )
        })

        it('should show error snackbar when inviteUserToBatch throws', async () => {
            ; (component.selection as any).select({ userId: 'uA' })
            blendedApprovalServiceMock.inviteUserToBatch.mockReturnValue(throwError('err'))
            await component.addLearners()
            expect(snackBarMock.open).toHaveBeenCalledWith(
                'Some error occurred! Please try again',
                'OK',
                { duration: 6000 }
            )
        })
    })
})

// ─── BlendedApporvalService direct tests (covers transitive lines) ────────────

describe('BlendedApporvalService', () => {
    let service: BlendedApporvalService
    let mockHttp: any

    beforeEach(() => {
        mockHttp = {
            get: jest.fn().mockReturnValue(of({})),
            post: jest.fn().mockReturnValue(of({})),
        }
        service = new BlendedApporvalService(mockHttp as any)
    })

    it('should create', () => { expect(service).toBeTruthy() })

    it('getBlendedProgramsDetails should GET correct url', () => {
        service.getBlendedProgramsDetails('p1').subscribe()
        expect(mockHttp.get).toHaveBeenCalledWith('/apis/proxies/v8/action/content/v3/read/p1')
    })

    it('getLearners should GET with batchId and orgName', () => {
        service.getLearners('b1', 'org1').subscribe()
        expect(mockHttp.get).toHaveBeenCalledWith('/apis/protected/v8/cohorts/course/getUsersForBatch/b1/org1')
    })

    it('getLearnersWithoutOrg should GET with batchId only', () => {
        service.getLearnersWithoutOrg('b1').subscribe()
        expect(mockHttp.get).toHaveBeenCalledWith('/apis/protected/v8/cohorts/course/getUsersForBatch/b1')
    })

    it('getRequests should POST', () => {
        service.getRequests({ key: 'v' }).subscribe()
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/workflow/blendedprogram/search', { key: 'v' })
    })

    it('getSerchRequests should POST', () => {
        service.getSerchRequests({ key: 'v' }).subscribe()
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/workflow/blendedprogram/searchV2/mdo', { key: 'v' })
    })

    it('updateBlendedRequests should POST', () => {
        service.updateBlendedRequests({ id: '1' }).subscribe()
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/workflow/blendedprogram/update/mdo', { id: '1' })
    })

    it('getUserById with id should GET /read/userid', () => {
        mockHttp.get.mockReturnValue(of({ result: { response: { name: 'A' } } }))
        service.getUserById('u1').subscribe()
        expect(mockHttp.get).toHaveBeenCalledWith('/apis/proxies/v8/api/user/v2/read/u1')
    })

    it('getUserById with empty string should GET /read/', () => {
        mockHttp.get.mockReturnValue(of({ result: { response: {} } }))
        service.getUserById('').subscribe()
        expect(mockHttp.get).toHaveBeenCalledWith('/apis/proxies/v8/api/user/v2/read/')
    })

    it('downloadCert should GET cert url', () => {
        service.downloadCert('c1').subscribe()
        expect(mockHttp.get).toHaveBeenCalledWith('/apis/protected/v8/cohorts/course/batch/cert/download//c1')
    })

    it('getSurveyByUserID should POST', () => {
        service.getSurveyByUserID({ userId: 'u1' }).subscribe()
        expect(mockHttp.post).toHaveBeenCalledWith('apis/proxies/v8/forms/searchForms', { userId: 'u1' })
    })

    it('getSubmissionsByUserId should POST', () => {
        service.getSubmissionsByUserId({ id: 'u1' }).subscribe()
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/forms/v2/submissions/search', { id: 'u1' })
    })

    it('nominateLearners should POST', () => {
        service.nominateLearners({ learners: [] }).subscribe()
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/workflow/blendedprogram/admin/enrol', { learners: [] })
    })

    it('removeLearner should POST with headers', () => {
        service.removeLearner({ userId: 'u1' }).subscribe()
        expect(mockHttp.post).toHaveBeenCalledWith(
            '/apis/proxies/v8/workflow/blendedprogram/remove/approved/user',
            { userId: 'u1' },
            expect.any(Object)
        )
    })

    it('fetchBlendedUserCount should POST and return promise', async () => {
        mockHttp.post.mockReturnValue(of({ count: 5 }))
        const result = await service.fetchBlendedUserCount({ id: '1' })
        expect(result).toEqual({ count: 5 })
    })

    it('getBpReportStatusApi should POST', () => {
        service.getBpReportStatusApi({ id: 'r1' }).subscribe()
        expect(mockHttp.post).toHaveBeenCalledWith('apis/proxies/v8/bp/v1/bpreport/status', { id: 'r1' })
    })

    it('generateBpReport should POST', () => {
        service.generateBpReport({ id: 'r1' }).subscribe()
        expect(mockHttp.post).toHaveBeenCalledWith('apis/proxies/v8/bp/v1/generate/report', { id: 'r1' })
    })

    it('downloadReport should GET and create a link', () => {
        const mockLink = { href: '', download: '', click: jest.fn() }
        document.createElement = jest.fn().mockReturnValue(mockLink)
        window.URL.createObjectURL = jest.fn().mockReturnValue('blob:url')
        window.URL.revokeObjectURL = jest.fn()
        mockHttp.get.mockReturnValue(of(new Blob(['data'])))
        service.downloadReport('file.xlsx', 'report.xlsx')
        expect(mockHttp.get).toHaveBeenCalled()
        expect(mockLink.click).toHaveBeenCalled()
    })

    it('getSurveyByFormId should GET with formId', () => {
        service.getSurveyByFormId('f1').subscribe()
        expect(mockHttp.get).toHaveBeenCalledWith('/apis/proxies/v8/forms/v2/getFormById?formId=f1')
    })

    it('inviteUserToBatch should POST', () => {
        service.inviteUserToBatch({ batchId: 'b1' }).subscribe()
        expect(mockHttp.post).toHaveBeenCalledWith('apis/proxies/v8/workflow/blendedprogram/nominate', { batchId: 'b1' })
    })
})

// ─── DialogConfirmComponent direct tests (covers transitive lines) ────────────

describe('DialogConfirmComponent', () => {
    let mockDialogRef: any

    beforeEach(() => {
        mockDialogRef = { close: jest.fn() }
    })

    it('should set default ok and cancel when not provided', () => {
        const data: any = { title: 'Test', body: 'Body' }
        new DialogConfirmComponent(data, mockDialogRef)
        expect(data.ok).toBe('Yes')
        expect(data.cancel).toBe('No')
    })

    it('should not override ok/cancel when already set', () => {
        const data: any = { title: 'T', body: 'B', ok: 'Confirm', cancel: 'Dismiss' }
        new DialogConfirmComponent(data, mockDialogRef)
        expect(data.ok).toBe('Confirm')
        expect(data.cancel).toBe('Dismiss')
    })

    it('confirmed should close dialogRef with true', () => {
        const data: any = { title: 'T', body: 'B' }
        const comp = new DialogConfirmComponent(data, mockDialogRef)
        comp.confirmed()
        expect(mockDialogRef.close).toHaveBeenCalledWith(true)
    })
})

// ─── UsersService direct tests (covers transitive lines) ─────────────────────

describe('UsersService', () => {
    let service: UsersService
    let mockHttp: any

    beforeEach(() => {
        mockHttp = {
            get: jest.fn().mockReturnValue(of({ result: { response: {} } })),
            post: jest.fn().mockReturnValue(of({ result: { response: {} } })),
            patch: jest.fn().mockReturnValue(of({})),
        }
        service = new UsersService(mockHttp as any)
    })

    it('should create', () => { expect(service).toBeTruthy() })

    it('getAllUsers should POST to search endpoint', () => {
        service.getAllUsers({ filters: {} }).subscribe()
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/search', { filters: {} })
    })

    it('getAllUsersV3 should POST to v3 search endpoint', () => {
        service.getAllUsersV3({ filters: {} }).subscribe()
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v3/search', { filters: {} })
    })

    it('getMyDepartment should GET', () => {
        service.getMyDepartment().subscribe()
        expect(mockHttp.get).toHaveBeenCalled()
    })

    it('createUser should POST', () => {
        service.createUser({ name: 'A' }).subscribe()
        expect(mockHttp.post).toHaveBeenCalledWith('apis/protected/v8/user/profileDetails/createUser', { name: 'A' })
    })

    it('getUserById with id should GET', () => {
        mockHttp.get.mockReturnValue(of({ result: { response: { name: 'A' } } }))
        service.getUserById('u1').subscribe()
        expect(mockHttp.get).toHaveBeenCalledWith('/apis/proxies/v8/api/user/v2/read/u1')
    })

    it('getUserById with empty id should GET profileRegistry v2', () => {
        mockHttp.get.mockReturnValue(of({ result: { response: {} } }))
        service.getUserById('').subscribe()
        expect(mockHttp.get).toHaveBeenCalledWith('/apis/proxies/v8/api/user/v2/read')
    })

    it('createUserById should POST', () => {
        service.createUserById('u1', { x: 1 }).subscribe()
        expect(mockHttp.post).toHaveBeenCalled()
    })

    it('addUserToRole should POST', () => {
        service.addUserToRole({ role: 'admin' }).subscribe()
        expect(mockHttp.post).toHaveBeenCalledWith('/apis/proxies/v8/user/private/v1/assign/role', { role: 'admin' })
    })

    it('getWfHistoryByAppId should GET', () => {
        service.getWfHistoryByAppId('app1').subscribe()
        expect(mockHttp.get).toHaveBeenCalled()
    })

    it('onSearchUserByEmail should POST', () => {
        service.onSearchUserByEmail('a@b.com', {}).subscribe()
        expect(mockHttp.post).toHaveBeenCalled()
    })

    it('blockUser should PATCH', () => {
        service.blockUser({ id: 'u1' }).subscribe()
        expect(mockHttp.patch).toHaveBeenCalled()
    })

    it('deActiveUser should POST', () => {
        service.deActiveUser({ id: 'u1' }).subscribe()
        expect(mockHttp.post).toHaveBeenCalled()
    })

    it('activeUser should PATCH', () => {
        service.activeUser({ id: 'u1' }).subscribe()
        expect(mockHttp.patch).toHaveBeenCalled()
    })

    it('deleteUser should PATCH', () => {
        service.deleteUser({ id: 'u1' }).subscribe()
        expect(mockHttp.patch).toHaveBeenCalled()
    })

    it('newBlockUser should POST with userId and requestedBy', () => {
        service.newBlockUser('admin', 'u1').subscribe()
        expect(mockHttp.post).toHaveBeenCalledWith(
            '/apis/proxies/v8/user/v1/block',
            { request: { userId: 'u1', requestedBy: 'admin' } }
        )
    })

    it('newUnBlockUser should POST with userId and requestedBy', () => {
        service.newUnBlockUser('admin', 'u1').subscribe()
        expect(mockHttp.post).toHaveBeenCalledWith(
            '/apis/proxies/v8/user/v1/unblock',
            { request: { userId: 'u1', requestedBy: 'admin' } }
        )
    })

    it('getAllKongUsers should POST', () => {
        service.getAllKongUsers({ filters: {} }).subscribe()
        expect(mockHttp.post).toHaveBeenCalled()
    })

    it('getAllRoleUsers should POST with role filter', () => {
        service.getAllRoleUsers('dep1', 'admin').subscribe()
        expect(mockHttp.post).toHaveBeenCalled()
    })

    it('getRolesCountsApi should POST', () => {
        service.getRolesCountsApi({ key: 'v' }).subscribe()
        expect(mockHttp.post).toHaveBeenCalled()
    })

    it('getTotalRoleUsers should POST', () => {
        service.getTotalRoleUsers('dep1', 'admin').subscribe()
        expect(mockHttp.post).toHaveBeenCalled()
    })

    it('searchIgotDesignation should POST', () => {
        service.searchIgotDesignation({}).subscribe()
        expect(mockHttp.post).toHaveBeenCalled()
    })

    it('searchDesignation should POST', () => {
        service.searchDesignation({}).subscribe()
        expect(mockHttp.post).toHaveBeenCalled()
    })

    it('updateUserDetails should POST', () => {
        service.updateUserDetails({ name: 'A' }).subscribe()
        expect(mockHttp.post).toHaveBeenCalled()
    })
})
