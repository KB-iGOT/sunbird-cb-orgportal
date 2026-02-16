import { FileDownloadService } from "./file-download.service"


describe('FileDownloadService', () => {
    let component: FileDownloadService

    const window: Partial<Window> = {}
    const document: Partial<Document> = {}

    beforeAll(() => {
        component = new FileDownloadService(
            window as Window,
            document as Document
        )
    })

    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()
    })

    it('should create a instance of component', () => {
        expect(component).toBeTruthy()
    })
})