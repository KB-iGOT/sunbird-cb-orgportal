import { UploadService } from './upload.service'
import { HttpClient } from '@angular/common/http'
import { of } from 'rxjs'

// Mock endpoints
const API_END_POINTS = {
    GETPRFOILEDATA: 'apis/proxies/v8/api/user/v2/read',
    CREATE_ASSET: 'apis/proxies/v8/action/content/v3/create',
}

// Mock data
const mockProfileData = {
    id: '123',
    name: 'Test User',
    email: 'test@example.com'
}

const mockAssetRequest = {
    name: 'Sample Asset',
    mimeType: 'application/pdf',
    contentType: 'Resource'
}

const mockAssetResponse = {
    id: 'asset-001',
    status: 'created',
    type: 'document'
}

// Mock HttpClient
const mockHttpClient = {
    get: jest.fn(),
    post: jest.fn()
}

describe('UploadService (without TestBed)', () => {
    let service: UploadService

    beforeEach(() => {
        jest.clearAllMocks()
        service = new UploadService(mockHttpClient as unknown as HttpClient)
    })

    it('should create the service', () => {
        expect(service).toBeTruthy()
    })

    describe('getProfile', () => {
        it('should call HttpClient.get with correct URL', () => {
            mockHttpClient.get.mockReturnValue(of(mockProfileData))

            service.getProfile().subscribe()

            expect(mockHttpClient.get).toHaveBeenCalledWith(API_END_POINTS.GETPRFOILEDATA)
        })

        it('should return profile data', (done) => {
            mockHttpClient.get.mockReturnValue(of(mockProfileData))

            service.getProfile().subscribe(data => {
                expect(data).toEqual(mockProfileData)
                done()
            })
        })

        // it('should handle getProfile error', (done) => {
        //     const error = new Error('get error')
        //     mockHttpClient.get.mockReturnValue(throwError(() => error))

        //     service.getProfile().subscribe({
        //         next: () => done.fail('Expected error'),
        //         error: (err) => {
        //             expect(err.message).toBe('get error')
        //             done()
        //         }
        //     })
        // })
    })

    describe('crreateAsset', () => {
        it('should call HttpClient.post with correct URL and body', () => {
            mockHttpClient.post.mockReturnValue(of(mockAssetResponse))

            service.crreateAsset(mockAssetRequest).subscribe()

            expect(mockHttpClient.post).toHaveBeenCalledWith(
                API_END_POINTS.CREATE_ASSET,
                mockAssetRequest
            )
        })

        it('should return asset creation response', (done) => {
            mockHttpClient.post.mockReturnValue(of(mockAssetResponse))

            service.crreateAsset(mockAssetRequest).subscribe(data => {
                expect(data).toEqual(mockAssetResponse)
                done()
            })
        })

        // it('should handle crreateAsset error', (done) => {
        //     const error = new Error('create error')
        //     mockHttpClient.post.mockReturnValue(throwError(() => error))

        //     service.crreateAsset(mockAssetRequest).subscribe({
        //         next: () => done.fail('Expected error'),
        //         error: (err) => {
        //             expect(err.message).toBe('create error')
        //             done()
        //         }
        //     })
        // })
    })
})
