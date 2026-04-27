describe('BlendedService - High Coverage', () => {
    let service: any
    let http: any

    beforeEach(() => {
        http = {
            post: jest.fn(),
        }

        const { BlendedService } = require('./blended.service')

        service = new BlendedService(http)
    })

    // ---------------- GET BLENDED PROGRAMS ----------------
    it('should call getBlendedPrograms API', () => {
        http.post.mockReturnValue({
            subscribe: jest.fn(),
        })

        const req = { a: 1 }

        service.getBlendedPrograms(req).subscribe()

        expect(http.post).toHaveBeenCalledWith(
            '/apis/proxies/v8/sunbirdigot/read',
            req
        )
    })

    // ---------------- GET REQUESTS ----------------
    it('should call getRequests API', () => {
        http.post.mockReturnValue({
            subscribe: jest.fn(),
        })

        const req = { b: 2 }

        service.getRequests(req).subscribe()

        expect(http.post).toHaveBeenCalledWith(
            '/apis/proxies/v8/workflow/blendedprogram/search',
            req
        )
    })
})