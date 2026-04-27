describe('ApprovalsService - High Coverage', () => {
    let service: any
    let http: any
    let configSrv: any

    beforeEach(() => {
        http = {
            post: jest.fn(),
            get: jest.fn(),
        }

        configSrv = {
            sitePath: '/base-url',
        }

        const { ApprovalsService } = require('./approvals.service')

        service = new ApprovalsService(http, configSrv)
    })

    // ---------------- GET APPROVALS ----------------
    it('should call getApprovals API', () => {
        http.post.mockReturnValue({
            subscribe: jest.fn(),
        })

        const req = { a: 1 }

        service.getApprovals(req).subscribe()

        expect(http.post).toHaveBeenCalledWith(
            '/apis/protected/v8/workflowhandler/applicationsSearch',
            req
        )
    })

    // ---------------- GET APPROVAL LIST ----------------
    it('should call getApprovalsList API', () => {
        http.post.mockReturnValue({
            subscribe: jest.fn(),
        })

        const req = { b: 2 }

        service.getApprovalsList(req).subscribe()

        expect(http.post).toHaveBeenCalledWith(
            '/apis/protected/v8/workflowhandler/profileApprovalSearch',
            req
        )
    })

    // ---------------- PROFILE CONFIG ----------------
    it('should get profile config', async () => {
        const mockResponse = Promise.resolve({ data: 'config' })

        http.get.mockReturnValue({
            toPromise: jest.fn().mockReturnValue(mockResponse),
        })

        const result = await service.getProfileConfig()

        expect(http.get).toHaveBeenCalledWith('/base-url/feature/approvals.json')
        expect(result).toBeDefined()
    })

    // ---------------- WORKFLOW ----------------
    it('should call handleWorkflow', () => {
        http.post.mockReturnValue({
            subscribe: jest.fn(),
        })

        const req = { c: 3 }

        service.handleWorkflow(req).subscribe()

        expect(http.post).toHaveBeenCalledWith(
            'apis/protected/v8/workflowhandler/transition',
            req
        )
    })

    // ---------------- WORKFLOW V2 ----------------
    it('should call handleWorkflowV2', () => {
        http.post.mockReturnValue({
            subscribe: jest.fn(),
        })

        const req = { d: 4 }

        service.handleWorkflowV2(req).subscribe()

        expect(http.post).toHaveBeenCalledWith(
            '/apis/protected/v8/workflowhandler/v2/transition',
            req
        )
    })
})