import { Component, Inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { WidgetContentService } from '../../../_services/widget-content.service'
import { ImageTransform } from 'ngx-image-cropper'

@Component({
  selector: 'ws-widget-upload-logo-dialog',
  templateUrl: './upload-logo-dialog.component.html',
  styleUrls: ['./upload-logo-dialog.component.scss']
})
export class UploadLogoDialogComponent {
  imageChangedEvent: any = null
  croppedImage: any = null
  imageFileBase64: any = ''
  fileName = ''
  cropimageFile!: File
  maxFileSize = 5 // MB
  uploadedLogo = ''
  rootOrgId = ''
  orgName = ''
  isLoading = false

  transform: ImageTransform = {}
  zoomValue: number = 1  // Default zoom

  constructor(
    private dialogRef: MatDialogRef<UploadLogoDialogComponent>,
    private widgetService: WidgetContentService,
    private matSnackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { file: File, orgName?: string, rootOrgId?: string }
  ) {
    this.loadFile(data?.file)
    if (data?.file?.name) this.fileName = data.file.name
    if (data?.orgName) this.orgName = data.orgName
    if (data?.rootOrgId) this.rootOrgId = data.rootOrgId
  }

  loadFile(file: File): void {
    if (!file?.type?.startsWith('image/')) {
      this.matSnackBar.open('Invalid file type', 'X', { panelClass: ['error'] })
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      this.imageChangedEvent = { target: { files: [file] } }
    }
    reader.onerror = () => {
      this.matSnackBar.open('Failed to read file. Please try again.')
    }
    reader.readAsDataURL(file)
  }

  onImageCropped(event: any): void {
    this.croppedImage = event?.base64
  }

  imageLoaded(): void { }
  cropperReady(): void { }
  loadImageFailed(): void { }

  onCancel(): void {
    this.dialogRef.close()
  }

  b64toBlob(dataURI: string): Blob {
    const byteString = atob(dataURI?.split(',')[1] || '')
    if (byteString) {
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString?.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      return new Blob([ab], { type: 'image/jpeg' })
    } else {
      return new Blob([], { type: 'image/jpeg' })
    }
  }

  onUpload(): void {
    if (!this.croppedImage) {
      this.matSnackBar.open('Please crop the image first.', 'X', { panelClass: ['error'] })
      return
    }
    this.isLoading = true
    const maxFileSize = this.maxFileSize * 1024 * 1024
    this.imageFileBase64 = this.croppedImage
    const file = new File([this.b64toBlob(this.imageFileBase64)], this.fileName, { type: 'image/png' })
    this.cropimageFile = file
    if (this.cropimageFile?.size < maxFileSize) {
      const formData = new FormData()
      formData.append('file', this.cropimageFile)
      this.widgetService.uploadOrgLogo(formData).subscribe({
        next: (response) => {
          if (response?.result?.qrcodepath) {
            this.uploadedLogo = response.result.qrcodepath
            const req = {
              organisationId: this.rootOrgId,
              orgName: this.orgName,
              logo: this.uploadedLogo,
            }
            this.widgetService.updateUrlLogo(req).subscribe({
              next: (res) => {
                this.isLoading = false
                if (res?.result?.response?.toLowerCase() === 'success') {
                  this.matSnackBar.open('Logo Updated Successfully')
                  this.dialogRef.close(this.uploadedLogo)
                }
              },
              error: (err) => {
                this.isLoading = false
                this.matSnackBar.open('Something went wrong, please try again later')
                console.error('Error:', err)
                this.dialogRef.close()
              },
            })
          } else {
            this.isLoading = false
          }
        },
        error: (error) => {
          this.isLoading = false
          console.error('Error:', error)
        },
      })
    } else {
      this.isLoading = false
      this.matSnackBar.open(`File size exceeds ${this.maxFileSize} MB. Please select a smaller file.`, 'X', { panelClass: ['error'] })
    }
  }
  zoomChange(value: number) {
    this.zoomValue = Math.min(Math.max(value, 0.3), 3)
    this.updateZoom()
  }

  zoomIn() {
    if (this.zoomValue < 3) {
      this.zoomValue = parseFloat((this.zoomValue + 0.05).toFixed(2))
      this.updateZoom()
    }
  }

  zoomOut() {
    if (this.zoomValue > 0.3) {
      this.zoomValue = parseFloat((this.zoomValue - 0.05).toFixed(2))
      this.updateZoom()
    }
  }

  updateZoom() {
    this.transform = {
      ...this.transform,
      scale: this.zoomValue
    }
  }
}
