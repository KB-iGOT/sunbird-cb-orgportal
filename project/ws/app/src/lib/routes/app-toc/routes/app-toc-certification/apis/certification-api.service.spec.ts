import { HttpParams } from '@angular/common/http'
import { of, throwError } from 'rxjs'
import { CertificationApiService } from './certification-api.service'

describe('CertificationApiService', () => {
    let service: CertificationApiService
    let httpClient: any

    const BASE = '/apis/protected/v8/certifications'

    beforeEach(() => {
        httpClient = {
            get: jest.fn(),
            post: jest.fn(),
            delete: jest.fn(),
            patch: jest.fn(),
        }
        service = new CertificationApiService(httpClient)
    })

    it('should create', () => {
        expect(service).toBeTruthy()
    })

    describe('getCertificationInfo', () => {
        it('should call GET with correct URL', (done) => {
            httpClient.get.mockReturnValue(of({ id: 'cert123' }))
            service.getCertificationInfo('cert123').subscribe(res => {
                expect(httpClient.get).toHaveBeenCalledWith(`${BASE}/cert123/bookingInfo`)
                expect(res).toEqual({ id: 'cert123' })
                done()
            })
        })
    })

    describe('getTestCenters', () => {
        it('should call GET with correct URL', (done) => {
            httpClient.get.mockReturnValue(of([{ name: 'Center A' }]))
            service.getTestCenters('cert123').subscribe(res => {
                expect(httpClient.get).toHaveBeenCalledWith(`${BASE}/cert123/testCenters`)
                expect(res).toEqual([{ name: 'Center A' }])
                done()
            })
        })
    })

    describe('getTestCenterSlots', () => {
        it('should call GET with correct URL', (done) => {
            httpClient.get.mockReturnValue(of({ slots: [] }))
            service.getTestCenterSlots('cert123', 'loc1', 'tc1').subscribe(res => {
                expect(httpClient.get).toHaveBeenCalledWith(
                    `${BASE}/cert123/locations/loc1/testCenters/tc1/slots`
                )
                expect(res).toEqual({ slots: [] })
                done()
            })
        })
    })

    describe('bookAccSlot', () => {
        it('should call POST with correct URL and body', (done) => {
            httpClient.post.mockReturnValue(of({ success: true }))
            service.bookAccSlot('cert123', 2).subscribe(res => {
                expect(httpClient.post).toHaveBeenCalledWith(`${BASE}/cert123/booking/2`, {})
                expect(res).toEqual({ success: true })
                done()
            })
        })
    })

    describe('getCountries', () => {
        it('should call GET /countries', (done) => {
            httpClient.get.mockReturnValue(of([{ code: 'IN' }]))
            service.getCountries().subscribe(res => {
                expect(httpClient.get).toHaveBeenCalledWith(`${BASE}/countries`)
                expect(res).toEqual([{ code: 'IN' }])
                done()
            })
        })
    })

    describe('getAtDeskLocations', () => {
        it('should call GET with country code', (done) => {
            httpClient.get.mockReturnValue(of([{ name: 'Delhi' }]))
            service.getAtDeskLocations('IN').subscribe(res => {
                expect(httpClient.get).toHaveBeenCalledWith(`${BASE}/countries/IN/locations`)
                expect(res).toEqual([{ name: 'Delhi' }])
                done()
            })
        })
    })

    describe('getAtDeskSlots', () => {
        it('should call GET /slots', (done) => {
            httpClient.get.mockReturnValue(of([{ slotId: 1 }]))
            service.getAtDeskSlots().subscribe(res => {
                expect(httpClient.get).toHaveBeenCalledWith(`${BASE}/slots`)
                expect(res).toEqual([{ slotId: 1 }])
                done()
            })
        })
    })

    describe('bookAtDeskSlot', () => {
        it('should call POST with booking body', (done) => {
            const booking: any = { date: '2026-01-01', location: 'Delhi' }
            httpClient.post.mockReturnValue(of({ success: true }))
            service.bookAtDeskSlot('cert123', booking).subscribe(res => {
                expect(httpClient.post).toHaveBeenCalledWith(`${BASE}/cert123/atDeskBooking`, booking)
                expect(res).toEqual({ success: true })
                done()
            })
        })
    })

    describe('cancelSlot', () => {
        it('should call DELETE without icfdId', (done) => {
            httpClient.delete.mockReturnValue(of({ success: true }))
            service.cancelSlot('cert123', 1).subscribe(res => {
                expect(httpClient.delete).toHaveBeenCalledWith(
                    `${BASE}/cert123/slots/1`,
                    { params: new HttpParams() }
                )
                expect(res).toEqual({ success: true })
                done()
            })
        })

        it('should call DELETE with icfdId appended to params', (done) => {
            httpClient.delete.mockReturnValue(of({ success: true }))
            service.cancelSlot('cert123', 1, 999).subscribe(res => {
                expect(httpClient.delete).toHaveBeenCalledWith(
                    `${BASE}/cert123/slots/1`,
                    { params: new HttpParams().append('icfdId', '999') }
                )
                expect(res).toEqual({ success: true })
                done()
            })
        })
    })

    describe('getCurrencies', () => {
        it('should call GET /currencies', (done) => {
            httpClient.get.mockReturnValue(of([{ code: 'USD' }]))
            service.getCurrencies().subscribe(res => {
                expect(httpClient.get).toHaveBeenCalledWith(`${BASE}/currencies`)
                expect(res).toEqual([{ code: 'USD' }])
                done()
            })
        })
    })

    describe('sendBudgetApprovalRequest', () => {
        it('should call POST with budget request body', (done) => {
            const budgetReq: any = { amount: 5000, currency: 'USD' }
            httpClient.post.mockReturnValue(of({ success: true }))
            service.sendBudgetApprovalRequest('cert123', budgetReq).subscribe(res => {
                expect(httpClient.post).toHaveBeenCalledWith(`${BASE}/cert123/budgetRequest`, budgetReq)
                expect(res).toEqual({ success: true })
                done()
            })
        })
    })

    describe('cancelBudgetApprovalRequest', () => {
        it('should call DELETE on budgetRequest URL', (done) => {
            httpClient.delete.mockReturnValue(of({ success: true }))
            service.cancelBudgetApprovalRequest('cert123').subscribe(res => {
                expect(httpClient.delete).toHaveBeenCalledWith(`${BASE}/cert123/budgetRequest`)
                expect(res).toEqual({ success: true })
                done()
            })
        })
    })

    describe('sendExternalProof', () => {
        it('should call POST with FormData', (done) => {
            const formData = new FormData()
            httpClient.post.mockReturnValue(of({ success: true }))
            service.sendExternalProof('cert123', formData).subscribe(res => {
                expect(httpClient.post).toHaveBeenCalledWith(`${BASE}/cert123/result`, formData)
                expect(res).toEqual({ success: true })
                done()
            })
        })
    })

    describe('deleteExternalProof', () => {
        it('should call DELETE with documentUrl param', (done) => {
            httpClient.delete.mockReturnValue(of({ success: true }))
            service.deleteExternalProof('cert123', 'http://doc-url').subscribe(res => {
                expect(httpClient.delete).toHaveBeenCalledWith(
                    `${BASE}/cert123/document`,
                    { params: { documentUrl: 'http://doc-url' } }
                )
                expect(res).toEqual({ success: true })
                done()
            })
        })
    })

    describe('submitOrWithdrawVerificationRequest', () => {
        it('should call PATCH with action param', (done) => {
            const resultData: any = { proofUrl: 'http://proof' }
            httpClient.patch.mockReturnValue(of({ success: true }))
            service.submitOrWithdrawVerificationRequest('cert123', resultData, 'submit' as any).subscribe(res => {
                expect(httpClient.patch).toHaveBeenCalledWith(
                    `${BASE}/cert123/result`,
                    resultData,
                    { params: new HttpParams().append('action', 'submit') }
                )
                expect(res).toEqual({ success: true })
                done()
            })
        })
    })

    describe('getUploadedDocument', () => {
        it('should call GET with documentUrl param', (done) => {
            httpClient.get.mockReturnValue(of({ content: 'doc' }))
            service.getUploadedDocument('http://doc-url').subscribe(res => {
                expect(httpClient.get).toHaveBeenCalledWith(
                    `${BASE}/submittedDocument`,
                    { params: new HttpParams().append('documentUrl', 'http://doc-url') }
                )
                expect(res).toEqual({ content: 'doc' })
                done()
            })
        })
    })

    describe('getApprovalItems', () => {
        it('should call GET without type', (done) => {
            httpClient.get.mockReturnValue(of([{ id: 'item1' }]))
            service.getApprovalItems().subscribe(res => {
                expect(httpClient.get).toHaveBeenCalledWith(
                    `${BASE}/certificationApprovals`,
                    { params: new HttpParams() }
                )
                expect(res).toEqual([{ id: 'item1' }])
                done()
            })
        })

        it('should call GET with type appended to params', (done) => {
            httpClient.get.mockReturnValue(of([{ id: 'item1' }]))
            service.getApprovalItems('budget').subscribe(res => {
                expect(httpClient.get).toHaveBeenCalledWith(
                    `${BASE}/certificationApprovals`,
                    { params: new HttpParams().append('type', 'budget') }
                )
                expect(res).toEqual([{ id: 'item1' }])
                done()
            })
        })

        it('should return empty array on error', (done) => {
            httpClient.get.mockReturnValue(throwError(new Error('API Error')))
            service.getApprovalItems().subscribe(res => {
                expect(res).toEqual([])
                done()
            })
        })
    })

    describe('getCertificationRequests', () => {
        it('should call GET without type', (done) => {
            httpClient.get.mockReturnValue(of([{ id: 'req1' }]))
            service.getCertificationRequests(1000, 2000).subscribe(res => {
                expect(httpClient.get).toHaveBeenCalledWith(
                    `${BASE}/certificationRequests`,
                    { params: new HttpParams().append('startDate', '1000').append('endDate', '2000') }
                )
                expect(res).toEqual([{ id: 'req1' }])
                done()
            })
        })

        it('should call GET with type', (done) => {
            httpClient.get.mockReturnValue(of([{ id: 'req1' }]))
            service.getCertificationRequests(1000, 2000, 'budget').subscribe(res => {
                expect(httpClient.get).toHaveBeenCalledWith(
                    `${BASE}/certificationRequests`,
                    {
                        params: new HttpParams()
                            .append('startDate', '1000')
                            .append('endDate', '2000')
                            .append('type', 'budget'),
                    }
                )
                expect(res).toEqual([{ id: 'req1' }])
                done()
            })
        })

        it('should not append type when type is null', (done) => {
            httpClient.get.mockReturnValue(of([]))
            service.getCertificationRequests(1000, 2000, null).subscribe(res => {
                expect(httpClient.get).toHaveBeenCalledWith(
                    `${BASE}/certificationRequests`,
                    { params: new HttpParams().append('startDate', '1000').append('endDate', '2000') }
                )
                expect(res).toEqual([])
                done()
            })
        })
    })

    describe('sendAtDeskProctorAction', () => {
        it('should call POST with icfdId and approver action', (done) => {
            const action: any = { approved: true }
            httpClient.post.mockReturnValue(of({ success: true }))
            service.sendAtDeskProctorAction(42, action).subscribe(res => {
                expect(httpClient.post).toHaveBeenCalledWith(`${BASE}/atDeskRequests/42`, action)
                expect(res).toEqual({ success: true })
                done()
            })
        })
    })

    describe('sendBudgetApproverAction', () => {
        it('should call POST with sino and ecdpId params', (done) => {
            const action: any = { approved: true }
            httpClient.post.mockReturnValue(of({ success: true }))
            service.sendBudgetApproverAction('cert123', 10, 20, action).subscribe(res => {
                expect(httpClient.post).toHaveBeenCalledWith(
                    `${BASE}/cert123/budgetRequestApproval`,
                    action,
                    { params: new HttpParams().append('sino', '10').append('ecdpId', '20') }
                )
                expect(res).toEqual({ success: true })
                done()
            })
        })
    })

    describe('sendResultVerificationAction', () => {
        it('should call POST on resultVerificationRequests URL', (done) => {
            const action: any = { verified: true }
            httpClient.post.mockReturnValue(of({ success: true }))
            service.sendResultVerificationAction('cert123', action).subscribe(res => {
                expect(httpClient.post).toHaveBeenCalledWith(
                    `${BASE}/cert123/resultVerificationRequests`,
                    action
                )
                expect(res).toEqual({ success: true })
                done()
            })
        })
    })

    describe('getPastCertifications', () => {
        it('should call GET without status', (done) => {
            httpClient.get.mockReturnValue(of([{ id: 'past1' }]))
            service.getPastCertifications().subscribe(res => {
                expect(httpClient.get).toHaveBeenCalledWith(
                    `${BASE}`,
                    { params: new HttpParams() }
                )
                expect(res).toEqual([{ id: 'past1' }])
                done()
            })
        })

        it('should call GET with status appended to params', (done) => {
            httpClient.get.mockReturnValue(of([{ id: 'past1' }]))
            service.getPastCertifications('completed' as any).subscribe(res => {
                expect(httpClient.get).toHaveBeenCalledWith(
                    `${BASE}`,
                    { params: new HttpParams().append('status', 'completed') }
                )
                expect(res).toEqual([{ id: 'past1' }])
                done()
            })
        })
    })

    describe('getCertificationSubmissions', () => {
        it('should call GET on submissions URL', (done) => {
            httpClient.get.mockReturnValue(of({ certificationId: 'cert123' }))
            service.getCertificationSubmissions('cert123').subscribe(res => {
                expect(httpClient.get).toHaveBeenCalledWith(`${BASE}/cert123/submissions`)
                expect(res).toEqual({ certificationId: 'cert123' })
                done()
            })
        })
    })

    describe('getCertificationUserPrivileges', () => {
        it('should call GET on privileges URL with emailId', (done) => {
            httpClient.get.mockReturnValue(of({ canProctorAtDesk: true }))
            service.getCertificationUserPrivileges('test@example.com').subscribe(res => {
                expect(httpClient.get).toHaveBeenCalledWith(`${BASE}/test@example.com/privileges`)
                expect(res).toEqual({ canProctorAtDesk: true })
                done()
            })
        })
    })

    describe('getDefaultAtDeskProctor', () => {
        it('should return proctor data on success', (done) => {
            const mockPrivileges: any = {
                canProctorAtDesk: true,
                canApproveBudgetRequest: true,
                canVerifyResult: true,
                manager: 'mgr@example.com',
            }
            httpClient.get.mockReturnValue(of(mockPrivileges))
            service.getDefaultAtDeskProctor().subscribe(res => {
                expect(httpClient.get).toHaveBeenCalledWith(`${BASE}/defaultProctor`)
                expect(res).toEqual(mockPrivileges)
                done()
            })
        })

        it('should return default privileges object on error', (done) => {
            httpClient.get.mockReturnValue(throwError(new Error('API Error')))
            service.getDefaultAtDeskProctor().subscribe(res => {
                expect(res).toEqual({
                    canProctorAtDesk: false,
                    canApproveBudgetRequest: false,
                    canVerifyResult: false,
                    manager: '',
                })
                done()
            })
        })
    })
})
