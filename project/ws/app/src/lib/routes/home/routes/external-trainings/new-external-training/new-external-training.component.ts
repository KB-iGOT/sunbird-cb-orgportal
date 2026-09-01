import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { ExternalTrainingsService } from '../../../services/external-trainings.service'
import { deliveryModeList as deliveryModes } from '../models/external-trainings.model'
import { mergeMap } from 'rxjs/operators'
import * as _ from 'lodash'
import { MatSnackBar } from '@angular/material/snack-bar'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { environment } from '../../../../../../../../../../src/environments/environment'

@Component({
  selector: 'ws-app-new-external-training',
  templateUrl: './new-external-training.component.html',
  styleUrls: ['./new-external-training.component.scss'],
  standalone: false
})
export class NewExternalTrainingComponent implements OnInit {
  trainingForm!: FormGroup
  selectedCompetencyList: any[] = []
  deliveryModeList = Object.entries(deliveryModes).map(([key, value]) => ({ key, value }))
  configSvc: any

  // Logo state variables
  defaultCertificateTemplateUrl = 'assets/images/sample/Course_completion_certificate_New4.svg'
  trainingName = ''
  mergedLogoUrl: string | null = null
  previewLogoUrl = ''
  logoFileName = ''
  logoUploaded = false
  isLogoMerging = false
  templateLoadFailed = false
  templateId = ''
  defaultTemplateUrl = ''

  //
  originalContentFile: any
  contentFile: any
  fileName = ''
  certificateUrl = ''
  safeCertificateUrl: SafeResourceUrl | null = null
  selectedLogoImage: string | ArrayBuffer | null = null
  private readonly TARGET_HEIGHT = 80;
  private readonly TARGET_Y_CENTER = -170;
  private readonly TARGET_X_START = 600;

  private readonly FILE_UPLOAD_MAX_SIZE = 1 * 1024 * 1024 // 1MB
  // tslint:disable-next-line: max-line-length
  noSpecialChar = new RegExp(/^[\u0900-\u097F\u0980-\u09FF\u0C00-\u0C7F\u0B80-\u0BFF\u0C80-\u0CFF\u0D00-\u0D7F\u0A80-\u0AFF\u0B00-\u0B7F\u0A00-\u0A7Fa-zA-Z0-9.,_\-\$\/\:\[\]\(\) '!&]+$/) //NOSONAR
  noSpecialCharMultiline = new RegExp(/^[\u0900-\u097F\u0980-\u09FF\u0C00-\u0C7F\u0B80-\u0BFF\u0C80-\u0CFF\u0D00-\u0D7F\u0A80-\u0AFF\u0B00-\u0B7F\u0A00-\u0A7Fa-zA-Z0-9.,_\-\$\/\:\[\]\(\) '!&\n\r]+$/) //NOSONAR
  specialCharList = `( a-z/A-Z , 0-9 . _ - $ / \ : [ ]' ' ! &)`

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private activeRoute: ActivatedRoute,
    private externalTrainingsSvc: ExternalTrainingsService,
    private matSnackBar: MatSnackBar,
    public sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    this.configSvc = this.activeRoute.snapshot.data['configService']
    this.previewLogoUrl = this.defaultCertificateTemplateUrl
    this.initializeForm()
    this.getDefaultTemplate()
  }

  getDefaultTemplate(): void {
    this.externalTrainingsSvc.getDefaultTemplate().subscribe({
      next: (res: any) => {
        const valueStr = _.get(res, 'result.response.value', '')
        try {
          const valueObj = JSON.parse(valueStr)
          let templateUrl = _.get(valueObj, 'template', '')
          if (templateUrl && (templateUrl.includes('static.') || templateUrl.includes('storage.googleapis.com')) && !templateUrl.includes('content-store')) {
            const splitURL = templateUrl.split('content')
            templateUrl = `${environment.mdoPath}/content-store/content${splitURL[1]}`
          }
          this.templateId = _.get(valueObj, 'identifier', '')
          let splitURL = templateUrl.split('/content-store')
          templateUrl = environment.portalsForNotifications.mdo + '/content-store/' + splitURL[1]
          this.defaultTemplateUrl = templateUrl

          if (templateUrl) {
            this.externalTrainingsSvc.fetchTemplateByUrl(templateUrl).subscribe({
              next: (blob: Blob) => {
                const file = new File([blob], 'CourseCertificate_Template.svg', { type: 'image/svg+xml' })
                this.originalContentFile = file
                this.contentFile = file
                this.fileName = file.name
                this.certificateUrl = URL.createObjectURL(file)
                this.safeCertificateUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.certificateUrl) // NOSONAR
                this.previewLogoUrl = this.certificateUrl
              },
              error: () => {
                this.templateLoadFailed = true
                this.openSnackbar('Failed to load certificate template SVG.')
              },
            })
          }
        } catch {
          this.templateLoadFailed = true
          this.openSnackbar('Failed to parse default certificate template response.')
        }
      },
      error: () => {
        this.templateLoadFailed = true
        this.openSnackbar('Failed to load default certificate template.')
      },
    })
  }

  initializeForm(): void {
    this.trainingForm = this.fb.group({
      trainingTitle: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(70), Validators.pattern(this.noSpecialChar)]],
      learningObjective: ['', [Validators.maxLength(500), Validators.pattern(this.noSpecialCharMultiline)]],
      deliveryMode: [''],
      learningHours: ['', [Validators.min(0), Validators.max(100)]],
      learningMinutes: ['', [Validators.min(0), Validators.max(59)]],
      trainingType: ['', Validators.required],
      partnerName: ['', [Validators.maxLength(70), Validators.pattern(this.noSpecialChar)]]
    }, { validators: [this.hundredHoursValidator] })
  }

  onNumberPaste(event: ClipboardEvent, controlName: string): void {
    event.preventDefault()
    const pasted = event.clipboardData?.getData('text') || ''
    const numeric = pasted.replace(/[^0-9]/g, '')
    if (numeric) {
      this.trainingForm.get(controlName)?.setValue(+numeric)
    }
  }

  onFileSelected(event: any): void {
    const input = event.target as HTMLInputElement
    if (input?.files?.[0]) {
      this.handleLogoUpload(input.files[0])
    }
  }

  private isValidFile(file: File): boolean {
    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml']
    const validExtensions = ['.png', '.jpg', '.jpeg', '.svg']
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    return validTypes.includes(file.type) || validExtensions.includes(extension)
  }

  private handleLogoUpload(file: File): void {
    if (!this.isValidFile(file)) {
      this.openSnackbar('Please upload a valid SVG, PNG, JPG, or  JPEG file.')
      return
    }

    if (file.size > this.FILE_UPLOAD_MAX_SIZE) {
      this.openSnackbar('Please upload a file less than 1 MB.')
      return
    }

    const fileName = file.name
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageData = event.target?.result

      this.logoFileName = fileName
      this.logoUploaded = true
      this.selectedLogoImage = imageData || null
      this.mergeLogo()
    }
    // SVG: read as text so it can be parsed and embedded as vector nodes.
    // PNG/JPEG: read as data URL to embed via <image href>.
    if (isSvg) {
      reader.readAsText(file)
    } else {
      reader.readAsDataURL(file)
    }
  }

  private mergeLogo(): void {
    if (!this.originalContentFile) {
      return
    }
    this.isLogoMerging = true
    try {
      const certificateReader = new FileReader()
      certificateReader.onload = (certEvent) => {
        const certificateSvgContent = certEvent.target?.result as string
        const logoDataUrl = this.selectedLogoImage as string
        this.processMergeLogo(certificateSvgContent, logoDataUrl)
      }
      certificateReader.readAsText(this.originalContentFile)
    } catch (error: any) {
      this.isLogoMerging = false
      this.openSnackbar(`Error processing files: ${error.message}`, 'close')
    }
  }

  // Process the actual logo merge operation
  private processMergeLogo(certificateSvgContent: string, logoSvgContent: string): void {
    try {
      // Update certificate with logo
      const updatedCertificateSvg = this.updateCertificateWithLogo(
        certificateSvgContent,
        logoSvgContent
      )

      // Create a new blob with the updated SVG content
      const updatedBlob = new Blob([updatedCertificateSvg], { type: 'image/svg+xml' })
      this.contentFile = new File(
        [updatedBlob],
        this.fileName || 'certificate.svg',
        { type: 'image/svg+xml' }
      )

      // Update certificate preview URL
      this.certificateUrl = URL.createObjectURL(updatedBlob)
      this.safeCertificateUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.certificateUrl) // NOSONAR
      this.previewLogoUrl = this.certificateUrl
      this.isLogoMerging = false

    } catch (error: any) {
      this.isLogoMerging = false
    }
  }

  // Embeds the uploaded logo at the ProvidersLogo_Placement location in the certificate SVG.
  // For SVG logos: parses and embeds as vector child nodes with transform.
  // For PNG/JPEG logos: embeds as an SVG <image> element using the data URL.
  private updateCertificateWithLogo(certificateSvgContent: string, logoData: string): string {
    const parser = new DOMParser()
    // Use text/html for lenient parsing — avoids strict XML errors from HTML entities.
    const htmlDoc = parser.parseFromString(certificateSvgContent, 'text/html')
    const certSvgEl = htmlDoc.querySelector('svg')

    if (!certSvgEl) {
      this.openSnackbar('Error parsing certificate SVG', 'close')
      return ''
    }

    // Find the ProvidersLogo_Placement group
    let logoGroup = htmlDoc.getElementById('ProvidersLogo_Placement')
    if (!logoGroup) {
      logoGroup = htmlDoc.querySelector('[id="ProvidersLogo_Placement"]')
    }
    if (!logoGroup) {
      logoGroup = htmlDoc.querySelector('g[id*="ProvidersLogo_Placement"]')
    }

    const newLogoGroup = htmlDoc.createElementNS('http://www.w3.org/2000/svg', 'g')
    newLogoGroup.setAttribute('id', 'ProvidersLogo_Placement')

    if (logoData.startsWith('data:')) {
      // --- Raster (PNG/JPEG): embed as SVG <image> with data URL ---
      const imageEl = htmlDoc.createElementNS('http://www.w3.org/2000/svg', 'image')
      imageEl.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', logoData)
      imageEl.setAttribute('href', logoData)
      imageEl.setAttribute('x', String(this.TARGET_X_START))
      imageEl.setAttribute('y', String(this.TARGET_Y_CENTER - this.TARGET_HEIGHT / 2))
      imageEl.setAttribute('height', String(this.TARGET_HEIGHT))
      imageEl.setAttribute('preserveAspectRatio', 'xMidYMid meet')
      newLogoGroup.appendChild(imageEl)
    } else {
      // --- SVG: parse and embed vector child nodes with scale/translate transform ---
      const logoHtmlDoc = parser.parseFromString(logoData, 'text/html')
      const logoSvgEl = logoHtmlDoc.querySelector('svg')

      if (!logoSvgEl) {
        this.openSnackbar('Invalid SVG logo: no <svg> element found', 'close')
        return ''
      }

      const viewBox = logoSvgEl.getAttribute('viewBox')
      let minX = 0, minY = 0, logoHeight = 100

      if (viewBox) {
        const vbParts = viewBox.split(/[\s,]+/).map(parseFloat)
        if (vbParts.length >= 4) {
          minX = vbParts[0]; minY = vbParts[1]
          logoHeight = vbParts[3]
        }
      } else {
        logoHeight = parseFloat(logoSvgEl.getAttribute('height') || '100')
      }

      if (logoHeight === 0) logoHeight = 100
      const scale = this.TARGET_HEIGHT / logoHeight
      const tx = this.TARGET_X_START - (minX * scale)
      const localCenterY = minY + (logoHeight / 2)
      const ty = this.TARGET_Y_CENTER - (localCenterY * scale)

      newLogoGroup.setAttribute('transform', `translate(${tx.toFixed(2)}, ${ty.toFixed(2)}) scale(${scale.toFixed(4)})`)

      for (const child of Array.from(logoSvgEl.childNodes)) {
        if (child.nodeType === 1) {
          newLogoGroup.appendChild(htmlDoc.importNode(child, true))
        }
      }
    }

    if (logoGroup && logoGroup.parentNode) {
      logoGroup.parentNode.replaceChild(newLogoGroup, logoGroup)
    } else {
      certSvgEl.appendChild(newLogoGroup)
    }

    const serializer = new XMLSerializer()
    return serializer.serializeToString(certSvgEl)
  }

  removeUploadedLogo(): void {
    this.mergedLogoUrl = null
    this.logoFileName = ''
    this.logoUploaded = false
    this.selectedLogoImage = null
    // Restore the original template
    this.contentFile = this.originalContentFile
    this.certificateUrl = URL.createObjectURL(this.originalContentFile)
    this.safeCertificateUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.certificateUrl) // NOSONAR
    this.previewLogoUrl = this.certificateUrl
  }

  onSelectedCompetencyChange(selectedCompetency: any): void {
    this.selectedCompetencyList = selectedCompetency
  }

  get buildPayload(): any {
    const form = this.trainingForm.value
    const eventType = _.get(form, 'deliveryMode') || ''
    const learningHours = _.get(form, 'learningHours') || 0
    const learningMinutes = _.get(form, 'learningMinutes') || 0
    const totalMinutes = (learningHours * 60) + learningMinutes
    const logoUrl = this.mergedLogoUrl || this.defaultCertificateTemplateUrl
    return {
      request: {
        event: {
          mimeType: 'application/html',
          locale: 'en',
          name: _.get(form, 'trainingTitle'),
          description: _.get(form, 'learningObjective'),
          category: 'externalTraining',
          resourceType: 'externalTraining',
          duration: totalMinutes * 60,
          createdBy: _.get(this.configSvc, 'userProfile.userId'),
          categoryType: _.get(form, 'trainingType'),
          sourceName: _.get(this.configSvc, 'unMappedUser.rootOrg.orgName'),
          orgLogo: logoUrl,
          code: 'externalTraining',
          eventType,
          createdFor: [_.get(this.configSvc, 'userProfile.rootOrgId')],
          channel: _.get(this.configSvc, 'userProfile.rootOrgId'),
          competencies_v6: this.selectedCompetencyList,
          trackable: {
            enabled: 'Yes',
            autoBatch: 'No',
          },
          creatorName: _.get(this.configSvc, 'userProfile.firstName'),
          createrEmail: _.get(this.configSvc, 'userProfileV2.email'),
          partnerName: _.get(form, 'partnerName'),
        },
      },
    }
  }

  onSubmit(): void {
    if (this.trainingForm.valid && this.selectedCompetencyList.length > 0 && this.templateId) {
      if (this.logoUploaded) {
        // Scenario 2: Merged template — create content asset, upload merged file, then create training
        const createContentPayload = {
          request: {
            content: {
              code: `${Date.now()}`,
              contentType: 'Asset',
              createdBy: _.get(this.configSvc, 'userProfile.userId'),
              creator: _.get(this.configSvc, 'userProfile.firstName'),
              mimeType: 'image/svg+xml',
              mediaType: 'image',
              name: (this.contentFile as File).name,
              language: ['English'],
              license: 'CC BY 4.0',
              primaryCategory: 'Asset',
            },
          },
        }

        this.externalTrainingsSvc.createContent(createContentPayload).pipe(
          mergeMap((createContentRes: any) => {
            const contentIdentifier = _.get(createContentRes, 'result.identifier', '')
            const uploadFormData = new FormData()
            uploadFormData.append(
              'data',
              this.contentFile as Blob,
              (this.contentFile as File).name.replace(/[^A-Za-z0-9_.]/g, ''),
            )
            return this.externalTrainingsSvc.uploadContent(contentIdentifier, uploadFormData)
          }),
          mergeMap((uploadRes: any) => {
            let certTemplateUrl = _.get(uploadRes, 'result.artifactUrl', '')
            let splitURL = certTemplateUrl.split('/content')
            certTemplateUrl = environment.portalsForNotifications.mdo + '/content-store/content/' + splitURL[1]
            const certTemplateId = _.get(uploadRes, 'result.identifier', '')
            const payload = this.buildPayload
            const formData = {
              ...payload,
              request: {
                ...payload.request,
                event: {
                  ...payload.request.event,
                  certTemplate: certTemplateUrl,
                  certTemplateId,
                },
              },
            }
            return this.externalTrainingsSvc.createExternalTraining(formData)
          }),
          mergeMap((createRes: any) => {
            const publishPayload = {
              request: {
                event: {
                  identifier: _.get(createRes, 'result.identifier'),
                  versionKey: _.get(createRes, 'result.versionKey'),
                },
              },
            }
            return this.externalTrainingsSvc.publishExternalTraining(publishPayload)
          })
        ).subscribe({
          next: (result) => {
            if (_.get(result, 'result.identifier')) {
              this.openSnackbar('Training created and published successfully.')
              this.externalTrainingsSvc.setTrainingName(this.trainingForm.value.trainingTitle)
              this.navigateToCreateBatch(_.get(result, 'result.identifier'))
            }
          },
          error: (err) => {
            const errorMessage = _.get(err, 'error.params.errmsg', 'An error occurred while creating the training.')
            this.openSnackbar(errorMessage)
          },
        })
      } else {
        // Scenario 1: Default template — create training directly
        const payload = this.buildPayload
        const formData = {
          ...payload,
          request: {
            ...payload.request,
            event: {
              ...payload.request.event,
              certTemplate: this.defaultTemplateUrl,
              certTemplateId: this.templateId,
            },
          },
        }

        this.externalTrainingsSvc.createExternalTraining(formData).pipe(
          mergeMap((createRes: any) => {
            const publishPayload = {
              request: {
                event: {
                  identifier: _.get(createRes, 'result.identifier'),
                  versionKey: _.get(createRes, 'result.versionKey'),
                },
              },
            }
            return this.externalTrainingsSvc.publishExternalTraining(publishPayload)
          })
        ).subscribe({
          next: (result) => {
            if (_.get(result, 'result.identifier')) {
              this.openSnackbar('Training created and published successfully.')
              this.externalTrainingsSvc.setTrainingName(this.trainingForm.value.trainingTitle)
              this.navigateToCreateBatch(_.get(result, 'result.identifier'))
            }
          },
          error: (err) => {
            const errorMessage = _.get(err, 'error.params.errmsg', 'An error occurred while creating the training.')
            this.openSnackbar(errorMessage)
          },
        })
      }
    } else {
      this.openSnackbar('Please fill all required fields, certificate template and select at least one competency.')
    }
  }

  navigateToCreateBatch(identifier: string): void {
    this.router.navigate(['app', 'home', 'external-trainings', identifier, 'create-batch'])
  }

  goBackToExternalTrainings(): void {
    this.router.navigate(['/app/home/external-trainings'])
  }

  openSnackbar(message: string, action: string = 'Close'): void {
    this.matSnackBar.open(message, action, {
      duration: 3000,
    })
  }



  hundredHoursValidator = (form: AbstractControl): ValidationErrors | null => {
    const hours = form.get('learningHours')?.value || 0
    const minutes = form.get('learningMinutes')?.value || 0
    return (hours === 100 && minutes > 0) ? { invalidHundredHours: true } : null
  }
}
