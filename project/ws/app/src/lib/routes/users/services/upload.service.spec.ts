
import { HttpClient, HttpResponse } from '@angular/common/http'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
import { of, throwError } from 'rxjs'
import * as fileSaver from 'file-saver'
import { FileService } from './upload.service'

// Mock file-saver
jest.mock('file-saver', () => ({
    saveAs: jest.fn()
}))

describe('FileService', () => {
    let service: FileService
    let httpClientSpy: jest.Mocked<HttpClient>
    let matSnackBarSpy: jest.Mocked<MatSnackBar>

    beforeEach(() => {
        // Create mocks
        httpClientSpy = {
            post: jest.fn(),
            get: jest.fn(),
            delete: jest.fn()
        } as any

        matSnackBarSpy = {
            open: jest.fn()
        } as any

        // Create service instance
        service = new FileService(httpClientSpy, matSnackBarSpy)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('isLoading', () => {
        it('should return loading observable', (done) => {
            service.isLoading().subscribe(loading => {
                expect(typeof loading).toBe('boolean')
                done()
            })
        })
    })

    describe('upload', () => {
        it('should upload file and return response', (done) => {
            const mockResponse = { success: true }
            const formData = new FormData()
            httpClientSpy.post.mockReturnValue(of(mockResponse))

            service.upload('test.csv', formData).subscribe(response => {
                expect(response).toEqual(mockResponse)
                expect(httpClientSpy.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v2/bulkupload', formData)
                done()
            })
        })

        it('should handle upload error', (done) => {
            const formData = new FormData()
            httpClientSpy.post.mockReturnValue(throwError('Upload failed'))

            service.upload('test.csv', formData).subscribe({
                error: (error) => {
                    expect(error).toBe('Upload failed')
                    done()
                }
            })
        })
    })

    describe('download', () => {
        it('should download file with specified name', () => {
            const mockBlob = new Blob(['test content'])
            httpClientSpy.get.mockReturnValue(of(mockBlob))

            service.download('test-path', 'downloaded-file.csv')

            expect(httpClientSpy.get).toHaveBeenCalledWith('test-path', { responseType: 'blob' })
            expect(fileSaver.saveAs).toHaveBeenCalledWith(mockBlob, 'downloaded-file.csv')
        })
    })

    describe('downloadWithDispositionName', () => {
        it('should download file with custom filename', () => {
            const mockBlob = new Blob(['test content'])
            const mockResponse = new HttpResponse({
                body: mockBlob,
                headers: { get: jest.fn().mockReturnValue('attachment; filename="test.xlsx"') } as any
            })
            httpClientSpy.get.mockReturnValue(of(mockResponse))

            service.downloadWithDispositionName('test-path', 'custom-name.xlsx')

            expect(httpClientSpy.get).toHaveBeenCalledWith('test-path', {
                responseType: 'blob',
                observe: 'response'
            })
            expect(fileSaver.saveAs).toHaveBeenCalledWith(mockBlob, 'custom-name.xlsx')
        })

        it('should extract filename from Content-Disposition header', () => {
            const mockBlob = new Blob(['test content'])
            const mockResponse = new HttpResponse({
                body: mockBlob,
                headers: { get: jest.fn().mockReturnValue('attachment; filename="extracted.xlsx"') } as any
            })
            httpClientSpy.get.mockReturnValue(of(mockResponse))

            service.downloadWithDispositionName('test-path')

            expect(fileSaver.saveAs).toHaveBeenCalledWith(mockBlob, 'extracted.xlsx')
        })

        it('should use default filename when no Content-Disposition', () => {
            const mockBlob = new Blob(['test content'])
            const mockResponse = new HttpResponse({
                body: mockBlob,
                headers: { get: jest.fn().mockReturnValue(null) } as any
            })
            httpClientSpy.get.mockReturnValue(of(mockResponse))

            service.downloadWithDispositionName('test-path')

            expect(fileSaver.saveAs).toHaveBeenCalledWith(mockBlob, 'sample.xlsx')
        })

        it('should show error message on download failure', () => {
            httpClientSpy.get.mockReturnValue(throwError('Download failed'))

            service.downloadWithDispositionName('test-path')

            expect(matSnackBarSpy.open).toHaveBeenCalledWith('Could not download the file')
        })
    })

    describe('downloadReport', () => {
        it('should download report as CSV', () => {
            const mockResponse = {
                report: {
                    data: [1, 2, 3, 4, 5] // Mock byte array
                }
            }
            httpClientSpy.get.mockReturnValue(of(mockResponse))

            service.downloadReport('test-id', 'test-file.csv')

            expect(httpClientSpy.get).toHaveBeenCalledWith('/apis/protected/v8/admin/userRegistration/bulkUploadReport/test-id')
            expect(fileSaver.saveAs).toHaveBeenCalledWith(
                expect.any(Blob),
                'test-file-report.csv'
            )
        })
    })

    describe('remove', () => {
        it('should remove file from list', () => {
            const mockResponse = {}
            httpClientSpy.delete.mockReturnValue(of(mockResponse));

            // Mock private fileList property
            (service as any).fileList = ['file1.csv', 'file2.csv']
            const fileListSubject = (service as any).fileList$
            jest.spyOn(fileListSubject, 'next')

            service.remove('file1.csv')

            expect(httpClientSpy.delete).toHaveBeenCalledWith('/files/${fileName}')
            expect((service as any).fileList).toEqual(['file2.csv'])
            expect(fileListSubject.next).toHaveBeenCalledWith(['file2.csv'])
        })
    })

    describe('list', () => {
        it('should return file list observable', () => {
            const fileListSubject = (service as any).fileList$
            const result = service.list()

            expect(result).toBe(fileListSubject)
        })
    })

    describe('validateFile', () => {
        it('should return true for CSV files', () => {
            expect(service.validateFile('test.csv')).toBe(true)
            expect(service.validateFile('test.CSV')).toBe(true)
        })

        it('should return false for non-CSV files', () => {
            expect(service.validateFile('test.xlsx')).toBe(false)
            expect(service.validateFile('test.txt')).toBe(false)
            expect(service.validateFile('test.pdf')).toBe(false)
        })
    })

    describe('validateExcelFile', () => {
        it('should return true for valid Excel MIME types', () => {
            expect(service.validateExcelFile('application/vnd.ms-excel')).toBe(true)
            expect(service.validateExcelFile('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBe(true)
        })

        it('should return false for invalid MIME types', () => {
            expect(service.validateExcelFile('text/csv')).toBe(false)
            expect(service.validateExcelFile('application/pdf')).toBe(false)
        })
    })

    describe('getBulkUploadData', () => {
        it('should get bulk upload data', async () => {
            const mockResponse = { data: 'test' }
            httpClientSpy.get.mockReturnValue({ toPromise: () => Promise.resolve(mockResponse) } as any)

            const result = await service.getBulkUploadData()

            expect(result).toEqual(mockResponse)
            expect(httpClientSpy.get).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/bulkupload')
        })
    })

    describe('getBulkUploadDataV1', () => {
        it('should get bulk upload data for specific org', (done) => {
            const mockResponse = { data: 'test' }
            httpClientSpy.get.mockReturnValue(of(mockResponse))

            service.getBulkUploadDataV1('org123').subscribe(response => {
                expect(response).toEqual(mockResponse)
                expect(httpClientSpy.get).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/bulkupload/org123')
                done()
            })
        })
    })

    describe('getBulkApprovalUploadDataV1', () => {
        it('should get bulk approval upload data', (done) => {
            const mockResponse = { data: 'test' }
            httpClientSpy.get.mockReturnValue(of(mockResponse))

            service.getBulkApprovalUploadDataV1().subscribe(response => {
                expect(response).toEqual(mockResponse)
                expect(httpClientSpy.get).toHaveBeenCalledWith('/apis/proxies/v8/workflow/admin/bulkupdate/getstatus')
                done()
            })
        })
    })

    describe('uploadApproval', () => {
        it('should upload approval file', (done) => {
            const mockResponse = { success: true }
            const formData = new FormData()
            httpClientSpy.post.mockReturnValue(of(mockResponse))

            service.uploadApproval('test.csv', formData).subscribe(response => {
                expect(response).toEqual(mockResponse)
                expect(httpClientSpy.post).toHaveBeenCalledWith(
                    '/apis/proxies/v8/workflow/admin/v2/bulkupdate/transition',
                    formData
                )
                done()
            })
        })
    })

    describe('Bulk Upload Designation methods', () => {
        describe('downloadBulkUploadSampleFile', () => {
            it('should return sample file URL', () => {
                const result = service.downloadBulkUploadSampleFile('framework123')
                expect(result).toBe('/apis/proxies/v8/designation/v1/orgMapping/sample/framework123')
            })
        })

        describe('bulkUploadDesignation', () => {
            it('should upload designation file', (done) => {
                const mockResponse = { success: true }
                const formData = new FormData()
                httpClientSpy.post.mockReturnValue(of(mockResponse))

                service.bulkUploadDesignation('test.csv', formData, 'framework123', 'org456').subscribe(response => {
                    expect(response).toEqual(mockResponse)
                    expect(httpClientSpy.post).toHaveBeenCalledWith(
                        '/apis/proxies/v8/designation/v1/orgMapping/bulkUpload/org456/framework123',
                        formData
                    )
                    done()
                })
            })
        })

        describe('getBulkDesignationUploadData', () => {
            it('should get designation upload data', (done) => {
                const mockResponse = { data: 'test' }
                httpClientSpy.get.mockReturnValue(of(mockResponse))

                service.getBulkDesignationUploadData('rootOrg123').subscribe(response => {
                    expect(response).toEqual(mockResponse)
                    expect(httpClientSpy.get).toHaveBeenCalledWith(
                        '/apis/proxies/v8/designation/v1/orgMapping/bulkUpload/progress/details/rootOrg123'
                    )
                    done()
                })
            })
        })

        describe('getBulkDesignationStatus', () => {
            it('should return designation status URL', () => {
                const result = service.getBulkDesignationStatus('test-file.csv')
                expect(result).toBe('/apis/proxies/v8/designation/v1/orgMapping/download/test-file.csv')
            })
        })
    })

    describe('Bulk Upload Competency methods', () => {
        describe('downloadBulkUploadCompetencySampleFile', () => {
            it('should return competency sample file URL', () => {
                const result = service.downloadBulkUploadCompetencySampleFile('framework123')
                expect(result).toBe('/apis/proxies/v8/organisation/v1/getCompetencyDesignationMappingFile/sample/framework123')
            })
        })

        describe('bulkUploadCompetency', () => {
            it('should upload competency file', (done) => {
                const mockResponse = { success: true }
                const formData = new FormData()
                httpClientSpy.post.mockReturnValue(of(mockResponse))

                service.bulkUploadCompetency('test.csv', formData, 'framework123').subscribe(response => {
                    expect(response).toEqual(mockResponse)
                    expect(httpClientSpy.post).toHaveBeenCalledWith(
                        '/apis/proxies/v8/organisation/v1/competencyDesignationMappings/bulkUpload/framework123',
                        formData
                    )
                    done()
                })
            })
        })

        describe('getBulkCompetencyUploadData', () => {
            it('should get competency upload data', (done) => {
                const mockResponse = { data: 'test' }
                httpClientSpy.get.mockReturnValue(of(mockResponse))

                service.getBulkCompetencyUploadData('rootOrg123').subscribe(response => {
                    expect(response).toEqual(mockResponse)
                    expect(httpClientSpy.get).toHaveBeenCalledWith(
                        '/apis/proxies/v8/organisation/v1/competencyDesignationMappings/bulkUpload/progress/details/rootOrg123'
                    )
                    done()
                })
            })
        })

        describe('getBulkCompetencyStatus', () => {
            it('should return competency status URL', () => {
                const result = service.getBulkCompetencyStatus('test-file.csv')
                expect(result).toBe('/apis/proxies/v8/organisation/v1/competencyDesignationMappings/download/test-file.csv')
            })
        })
    })

    describe('private methods', () => {
        describe('getFilenameFromContentDisposition', () => {
            it('should extract filename from content disposition', () => {
                const service = new FileService(httpClientSpy, matSnackBarSpy)
                const result = (service as any).getFilenameFromContentDisposition('attachment; filename="test.xlsx"')
                expect(result).toBe('test.xlsx')
            })

            it('should return null for invalid content disposition', () => {
                const service = new FileService(httpClientSpy, matSnackBarSpy)
                const result = (service as any).getFilenameFromContentDisposition('invalid')
                expect(result).toBeNull()
            })

            it('should return null for null content disposition', () => {
                const service = new FileService(httpClientSpy, matSnackBarSpy)
                const result = (service as any).getFilenameFromContentDisposition(null)
                expect(result).toBeNull()
            })
        })
    })
})