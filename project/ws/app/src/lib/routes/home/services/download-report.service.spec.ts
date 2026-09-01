import { of, throwError } from 'rxjs'
import { HttpResponse } from '@angular/common/http'

describe('DownloadReportService - High Coverage', () => {
    let service: any
    let http: any
    let configSvc: any

    beforeEach(() => {
        http = {
            get: jest.fn(),
            post: jest.fn(),
        }

        configSvc = {
            sitePath: '/base-url',
        }

        const { DownloadReportService } = require('./download-report.service')
        service = new DownloadReportService(http, configSvc)
    })

    // ---------------- REPORT INFO ----------------
    it('should get report info', () => {
        http.get.mockReturnValue(of({ result: { a: 1 } }))

        service.getReportInfo().subscribe((res: any) => {
            expect(res.a).toBe(1)
        })
    })

    // ---------------- DOWNLOAD ----------------
    it('should download reports', () => {
        http.get.mockReturnValue(of({}))

        service.downloadReports().subscribe()

        expect(http.get).toHaveBeenCalled()
    })

    // ---------------- ADMINS ----------------
    it('should get admins list', () => {
        http.post.mockReturnValue(of({ result: { response: [1] } }))

        service.getAdminsList({}).subscribe((res: any) => {
            expect(res.length).toBe(1)
        })
    })

    it('should get access details', () => {
        http.get.mockReturnValue(of({ result: { response: { a: 1 } } }))

        service.getAccessDetails('test').subscribe((res: any) => {
            expect(res.a).toBe(1)
        })
    })

    it('should update access', () => {
        http.post.mockReturnValue(of({}))

        service.updateAccessToReports({}).subscribe()

        expect(http.post).toHaveBeenCalled()
    })

    // ---------------- SEARCH ORG ----------------
    it('should search orgs', () => {
        http.post.mockReturnValue(of({}))

        service.searchOrgs({}).subscribe()

        expect(http.post).toHaveBeenCalled()
    })

    it('should get orgs of department', () => {
        http.get.mockReturnValue(of({}))

        service.getOrgsOfDepartment('1').subscribe()

        expect(http.get).toHaveBeenCalled()
    })

    // ---------------- DOWNLOAD MULTIPLE ----------------
    it('should download reports for org ids (success)', () => {
        http.post.mockReturnValue(of(new HttpResponse({ status: 200 })))

        const data = [{ sbOrgId: '1' }, { sbOrgId: '2' }]

        service.downloadReportsForEachOrgId('1', data).subscribe((res: any) => {
            expect(res.length).toBe(2)
        })
    })

    it('should handle 500 error and convert to 404 response', () => {
        http.post.mockReturnValue(
            throwError(() => ({ status: 500 }))
        )

        const data = [{ sbOrgId: '2' }]

        service.downloadReportsForEachOrgId('1', data).subscribe((res: any) => {
            expect(res[0].status).toBe(404)
        })
    })

    it('should return empty when no valid orgs', () => {
        service.downloadReportsForEachOrgId('1', []).subscribe((res: any) => {
            expect(res.length).toBe(0)
        })
    })

    // ---------------- DEPARTMENT TYPE ----------------
    it('should get department type', () => {
        http.get.mockReturnValue(of({}))

        service.getDepartmentType().subscribe()

        expect(http.get).toHaveBeenCalled()
    })

    // ---------------- HIERARCHY ----------------
    it('should search org by hierarchy', () => {
        http.post.mockReturnValue(of({}))

        service.searchOrgByHierarchy({}).subscribe()

        expect(http.post).toHaveBeenCalled()
    })

    // ---------------- FORM READ ----------------
    it('should get form read success', () => {
        jest.spyOn(service, 'formReadData').mockReturnValue(of({
            result: { form: { data: { a: 1 } } },
        }))

        service.getFormReadForOrgSearch({}).subscribe((res: any) => {
            expect(res.a).toBe(1)
        })
    })

    it('should fallback to json when formRead fails', () => {
        jest.spyOn(service, 'formReadData').mockReturnValue(
            throwError(() => new Error('fail'))
        )

        http.get.mockReturnValue(of({ fallback: true }))

        service.getFormReadForOrgSearch({}).subscribe((res: any) => {
            expect(res.fallback).toBeTruthy()
        })
    })

    it('should handle fallback error also', () => {
        jest.spyOn(service, 'formReadData').mockReturnValue(
            throwError(() => new Error('fail'))
        )

        http.get.mockReturnValue(
            throwError(() => new Error('fail2'))
        )

        service.getFormReadForOrgSearch({}).subscribe((res: any) => {
            expect(res.error).toBeDefined()
        })
    })

    // ---------------- FORM READ DIRECT ----------------
    it('should call formReadData', () => {
        http.post.mockReturnValue(of({}))

        service.formReadData({}).subscribe()

        expect(http.post).toHaveBeenCalled()
    })
})