import { FileDownloadService } from './file-download.service'

describe('FileDownloadService', () => {
    let service: FileDownloadService
    let mockWindow: any
    let mockDocument: any
    let mockAnchorElement: any

    beforeEach(() => {
        mockAnchorElement = {
            style: { display: '' },
            setAttribute: jest.fn(),
            click: jest.fn(),
        }

        mockWindow = {
            atob: jest.fn(),
            navigator: {},
            URL: {
                createObjectURL: jest.fn().mockReturnValue('blob:mock-url'),
            },
        }

        mockDocument = {
            createElement: jest.fn().mockReturnValue(mockAnchorElement),
            body: {
                appendChild: jest.fn(),
                removeChild: jest.fn(),
            },
        }

        service = new FileDownloadService(mockWindow as Window, mockDocument as Document)
    })

    afterEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()
    })

    it('should create an instance of the service', () => {
        expect(service).toBeTruthy()
    })

    describe('base64ToBlob', () => {
        it('should return a Blob when valid base64 string is provided', () => {
            const fakeDecoded = 'hello'
            mockWindow.atob.mockReturnValue(fakeDecoded)

            const result = service.base64ToBlob('aGVsbG8=')

            expect(mockWindow.atob).toHaveBeenCalledWith('aGVsbG8=')
            expect(result).toBeInstanceOf(Blob)
        })

        it('should return null when atob throws an error', () => {
            mockWindow.atob.mockImplementation(() => {
                throw new Error('Invalid base64')
            })

            const result = service.base64ToBlob('invalid!!base64')

            expect(result).toBeNull()
        })
    })

    describe('saveBlobToDevice', () => {
        it('should use msSaveOrOpenBlob for IE and return true', () => {
            const msSaveOrOpenBlob = jest.fn()
            mockWindow.navigator = { msSaveOrOpenBlob }
            const blob = new Blob(['test'])

            const result = service.saveBlobToDevice(blob, 'test.pdf')

            expect(msSaveOrOpenBlob).toHaveBeenCalledWith(blob, 'test.pdf')
            expect(result).toBe(true)
        })

        it('should create anchor element and trigger download for non-IE browsers', () => {
            const blob = new Blob(['test'])

            const result = service.saveBlobToDevice(blob, 'document.pdf')

            expect(mockDocument.createElement).toHaveBeenCalledWith('a')
            expect(mockAnchorElement.style.display).toBe('none')
            expect(mockDocument.body.appendChild).toHaveBeenCalledWith(mockAnchorElement)
            expect(mockWindow.URL.createObjectURL).toHaveBeenCalled()
            expect(mockAnchorElement.setAttribute).toHaveBeenCalledWith('href', 'blob:mock-url')
            expect(mockAnchorElement.setAttribute).toHaveBeenCalledWith('download', 'document.pdf')
            expect(mockAnchorElement.click).toHaveBeenCalled()
            expect(mockDocument.body.removeChild).toHaveBeenCalledWith(mockAnchorElement)
            expect(result).toBe(true)
        })

        it('should return false when an error occurs', () => {
            mockDocument.createElement.mockImplementation(() => {
                throw new Error('DOM error')
            })
            const blob = new Blob(['test'])

            const result = service.saveBlobToDevice(blob, 'document.pdf')

            expect(result).toBe(false)
        })
    })

    describe('saveFile', () => {
        it('should return observable of empty object when blob is valid and saved successfully', (done) => {
            const fakeDecoded = 'hello'
            mockWindow.atob.mockReturnValue(fakeDecoded)

            service.saveFile('aGVsbG8=', 'document.pdf').subscribe({
                next: (res) => {
                    expect(res).toEqual({})
                    done()
                },
                error: () => done.fail('Should not throw error'),
            })
        })

        it('should return throwError when base64ToBlob returns null', (done) => {
            mockWindow.atob.mockImplementation(() => {
                throw new Error('Invalid base64')
            })

            service.saveFile('invalid', 'document.pdf').subscribe({
                next: () => done.fail('Should not emit value'),
                error: (err) => {
                    expect(err).toEqual({})
                    done()
                },
            })
        })

        it('should return throwError when saveBlobToDevice returns false', (done) => {
            const fakeDecoded = 'hello'
            mockWindow.atob.mockReturnValue(fakeDecoded)
            mockDocument.createElement.mockImplementation(() => {
                throw new Error('DOM error')
            })

            service.saveFile('aGVsbG8=', 'document.pdf').subscribe({
                next: () => done.fail('Should not emit value'),
                error: (err) => {
                    expect(err).toEqual({})
                    done()
                },
            })
        })
    })
})