describe('ExploreContentService - High Coverage', () => {
  let service: any
  let http: any

  beforeEach(() => {
    http = {
      post: jest.fn(),
      get: jest.fn(),
    }

    const { ExploreContentService } = require('./explore-content.service')
    service = new ExploreContentService(http)
  })

  // ---------------- GET ALL CONTENT ----------------
  it('should call getAllContent API', () => {
    http.post.mockReturnValue({
      subscribe: jest.fn(),
    })

    const req = { a: 1 }

    service.getAllContent(req).subscribe()

    expect(http.post).toHaveBeenCalledWith(
      '/apis/proxies/v8/sunbirdigot/v4/search',
      req
    )
  })

  // ---------------- EXTENDED CONTENT ----------------
  it('should call extendedContentRead API with id', () => {
    http.get.mockReturnValue({
      subscribe: jest.fn(),
    })

    const id = '123'

    service.extendedContentRead(id).subscribe()

    expect(http.get).toHaveBeenCalledWith(
      `/apis/proxies/v8/extended/content/v1/read/${id}`
    )
  })
})