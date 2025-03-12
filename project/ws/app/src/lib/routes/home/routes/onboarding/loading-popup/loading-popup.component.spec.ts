import { LoadingPopupComponent } from './loading-popup.component'
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog'

describe('LoadingPopupComponent', () => {
  let component: LoadingPopupComponent
  let dialogRefMock: MatDialogRef<LoadingPopupComponent>
  let dataMock: any

  beforeEach(() => {
    dialogRefMock = {
      close: jest.fn(),
    } as unknown as MatDialogRef<LoadingPopupComponent>

    dataMock = {
      type: ''
    }

    // Create the component instance
    component = new LoadingPopupComponent(dialogRefMock, dataMock)
  })

  describe('confirmed()', () => {
    it('should close dialog with startImporting when type is "import-igot-master-create"', () => {
      dataMock.type = 'import-igot-master-create'

      component.confirmed()

      expect(dialogRefMock.close).toHaveBeenCalledWith({
        startImporting: true
      })
    })

    it('should close dialog with reviewImporting set to false when type is "import-igot-master-review"', () => {
      dataMock.type = 'import-igot-master-review'

      component.confirmed()

      expect(dialogRefMock.close).toHaveBeenCalledWith({
        reviewImporting: false
      })
    })

    it('should close dialog with isDelete set to true when type is "delete"', () => {
      dataMock.type = 'delete'

      component.confirmed()

      expect(dialogRefMock.close).toHaveBeenCalledWith({
        isDelete: true
      })
    })
  })

  describe('rejected()', () => {
    it('should close dialog with close set to true when type is "import-igot-master-create"', () => {
      dataMock.type = 'import-igot-master-create'

      component.rejected()

      expect(dialogRefMock.close).toHaveBeenCalledWith({
        close: true
      })
    })

    it('should close dialog with reviewImporting set to true when type is "import-igot-master-review"', () => {
      dataMock.type = 'import-igot-master-review'

      component.rejected()

      expect(dialogRefMock.close).toHaveBeenCalledWith({
        reviewImporting: true
      })
    })

    it('should close dialog with isDelete set to false when type is "delete"', () => {
      dataMock.type = 'delete'

      component.rejected()

      expect(dialogRefMock.close).toHaveBeenCalledWith({
        isDelete: false
      })
    })
  })
})
