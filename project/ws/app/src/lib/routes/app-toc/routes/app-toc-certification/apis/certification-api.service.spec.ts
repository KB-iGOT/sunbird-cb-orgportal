import { HttpClient, HttpParams } from '@angular/common/http'
import { of, throwError } from 'rxjs'
import { CertificationApiService } from './certification-api.service'
import {
    ICertificationMeta,
    IAccLocation,
    ITestCenterSlotList,
    ICertificationSendResponse,
    ICertificationRequestItem,
    ICertificationUserPrivileges
} from '../models/certification.model'

describe('CertificationApiService', () => {
    let service: CertificationApiService
    let httpClient: jest.Mocked<HttpClient>

    const mockBaseUrl = '/apis/protected/v8/certifications'

    beforeEach(() => {
        httpClient = {
            get: jest.fn(),
            post: jest.fn(),
            delete: jest.fn(),
            patch: jest.fn(),
        } as any

        service = new CertificationApiService(httpClient)
    })

    it('should create', () => {
        expect(service).toBeTruthy()
    })

    describe('getCertificationInfo', () => {
        it('should get certification info', () => {
            const mockResponse: ICertificationMeta = { /* mock data */ } as ICertificationMeta
            const certId = 'cert123'

            httpClient.get.mockReturnValue(of(mockResponse))

            service.getCertificationInfo(certId).subscribe(response => {
                expect(response).toEqual(mockResponse)
                expect(httpClient.get).toHaveBeenCalledWith(
                    `${mockBaseUrl}/${certId}/bookingInfo`
                )
            })
        })
    })

    describe('getTestCenters', () => {
        it('should get test centers', () => {
            const mockResponse: IAccLocation[] = [{ /* mock data */ }] as IAccLocation[]
            const certId = 'cert123'

            httpClient.get.mockReturnValue(of(mockResponse))

            service.getTestCenters(certId).subscribe(response => {
                expect(response).toEqual(mockResponse)
                expect(httpClient.get).toHaveBeenCalledWith(
                    `${mockBaseUrl}/${certId}/testCenters`
                )
            })
        })
    })

    describe('getTestCenterSlots', () => {
        it('should get test center slots', () => {
            const mockResponse: ITestCenterSlotList = { /* mock data */ } as ITestCenterSlotList
            const certId = 'cert123'
            const location = 'loc123'
            const testCenter = 'tc123'

            httpClient.get.mockReturnValue(of(mockResponse))

            service.getTestCenterSlots(certId, location, testCenter).subscribe(response => {
                expect(response).toEqual(mockResponse)
                expect(httpClient.get).toHaveBeenCalledWith(
                    `${mockBaseUrl}/${certId}/locations/${location}/testCenters/${testCenter}/slots`
                )
            })
        })
    })

    describe('bookAccSlot', () => {
        it('should book ACC slot', () => {
            const mockResponse: ICertificationSendResponse = { /* mock data */ } as ICertificationSendResponse
            const certId = 'cert123'
            const slotNo = 1

            httpClient.post.mockReturnValue(of(mockResponse))

            service.bookAccSlot(certId, slotNo).subscribe(response => {
                expect(response).toEqual(mockResponse)
                expect(httpClient.post).toHaveBeenCalledWith(
                    `${mockBaseUrl}/${certId}/booking/${slotNo}`,
                    {}
                )
            })
        })
    })

    describe('cancelSlot', () => {
        it('should cancel slot without icfdId', () => {
            const mockResponse: ICertificationSendResponse = { /* mock data */ } as ICertificationSendResponse
            const certId = 'cert123'
            const slotNo = 1

            httpClient.delete.mockReturnValue(of(mockResponse))

            service.cancelSlot(certId, slotNo).subscribe(response => {
                expect(response).toEqual(mockResponse)
                expect(httpClient.delete).toHaveBeenCalledWith(
                    `${mockBaseUrl}/${certId}/slots/${slotNo}`,
                    { params: new HttpParams() }
                )
            })
        })

        it('should cancel slot with icfdId', () => {
            const mockResponse: ICertificationSendResponse = { /* mock data */ } as ICertificationSendResponse
            const certId = 'cert123'
            const slotNo = 1
            const icfdId = 123

            httpClient.delete.mockReturnValue(of(mockResponse))

            service.cancelSlot(certId, slotNo, icfdId).subscribe(response => {
                expect(response).toEqual(mockResponse)
                let params = new HttpParams().append('icfdId', '123')
                expect(httpClient.delete).toHaveBeenCalledWith(
                    `${mockBaseUrl}/${certId}/slots/${slotNo}`,
                    { params }
                )
            })
        })
    })

    describe('getApprovalItems', () => {
        it('should get approval items without type', () => {
            const mockResponse: ICertificationRequestItem[] = [{ /* mock data */ }] as ICertificationRequestItem[]

            httpClient.get.mockReturnValue(of(mockResponse))

            service.getApprovalItems().subscribe(response => {
                expect(response).toEqual(mockResponse)
                expect(httpClient.get).toHaveBeenCalledWith(
                    `${mockBaseUrl}/certificationApprovals`,
                    { params: new HttpParams() }
                )
            })
        })

        it('should get approval items with type', () => {
            const mockResponse: ICertificationRequestItem[] = [{ /* mock data */ }] as ICertificationRequestItem[]
            const type = 'test'

            httpClient.get.mockReturnValue(of(mockResponse))

            service.getApprovalItems(type).subscribe(response => {
                expect(response).toEqual(mockResponse)
                let params = new HttpParams().append('type', type)
                expect(httpClient.get).toHaveBeenCalledWith(
                    `${mockBaseUrl}/certificationApprovals`,
                    { params }
                )
            })
        })

        it('should handle error and return empty array', () => {
            httpClient.get.mockReturnValue(throwError(() => new Error('API Error')))

            service.getApprovalItems().subscribe(response => {
                expect(response).toEqual([])
            })
        })
    })

    describe('getDefaultAtDeskProctor', () => {
        it('should get default proctor', () => {
            const mockResponse: ICertificationUserPrivileges = {
                canProctorAtDesk: true,
                canApproveBudgetRequest: true,
                canVerifyResult: true,
                manager: 'test@example.com'
            }

            httpClient.get.mockReturnValue(of(mockResponse))

            service.getDefaultAtDeskProctor().subscribe(response => {
                expect(response).toEqual(mockResponse)
                expect(httpClient.get).toHaveBeenCalledWith(`${mockBaseUrl}/defaultProctor`)
            })
        })

        it('should handle error and return default values', () => {
            httpClient.get.mockReturnValue(throwError(() => new Error('API Error')))

            service.getDefaultAtDeskProctor().subscribe(response => {
                expect(response).toEqual({
                    canProctorAtDesk: false,
                    canApproveBudgetRequest: false,
                    canVerifyResult: false,
                    manager: ''
                })
            })
        })
    })

    describe('getCertificationRequests', () => {
        it('should get certification requests without type', () => {
            const mockResponse: ICertificationRequestItem[] = [{ /* mock data */ }] as ICertificationRequestItem[]
            const startDate = 1234567890
            const endDate = 1234567899

            httpClient.get.mockReturnValue(of(mockResponse))

            service.getCertificationRequests(startDate, endDate).subscribe(response => {
                expect(response).toEqual(mockResponse)
                let params = new HttpParams()
                    .append('startDate', startDate.toString())
                    .append('endDate', endDate.toString())
                expect(httpClient.get).toHaveBeenCalledWith(
                    `${mockBaseUrl}/certificationRequests`,
                    { params }
                )
            })
        })

        it('should get certification requests with type', () => {
            const mockResponse: ICertificationRequestItem[] = [{ /* mock data */ }] as ICertificationRequestItem[]
            const startDate = 1234567890
            const endDate = 1234567899
            const type = 'test'

            httpClient.get.mockReturnValue(of(mockResponse))

            service.getCertificationRequests(startDate, endDate, type).subscribe(response => {
                expect(response).toEqual(mockResponse)
                let params = new HttpParams()
                    .append('startDate', startDate.toString())
                    .append('endDate', endDate.toString())
                    .append('type', type)
                expect(httpClient.get).toHaveBeenCalledWith(
                    `${mockBaseUrl}/certificationRequests`,
                    { params }
                )
            })
        })
    })
})