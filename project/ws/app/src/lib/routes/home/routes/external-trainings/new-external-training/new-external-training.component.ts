import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { ExternalTrainingsService } from '../../../services/external-trainings.service'
import { deliveryModeList as deliveryModes } from '../models/external-trainings.model'
import { mergeMap } from 'rxjs/operators'
import * as _ from 'lodash'
import { MatLegacySnackBar } from '@angular/material/legacy-snack-bar'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { environment } from '../../../../../../../../../../src/environments/environment'

@Component({
  selector: 'ws-app-new-external-training',
  templateUrl: './new-external-training.component.html',
  styleUrls: ['./new-external-training.component.scss']
})
export class NewExternalTrainingComponent implements OnInit {
  trainingForm!: FormGroup
  selectedCompetencyList: any[] = []
  deliveryModeList = deliveryModes
  configSvc: any

  // Logo state variables
  defaultCertificateTemplateUrl = 'assets/images/sample/Course_completion_certificate_New4.svg'
  trainingName = ''
  mergedLogoUrl: string | null = null
  previewLogoUrl = ''
  logoFileName = ''
  logoUploaded = false
  isLogoMerging = false
  templateId = ''
  defaultTemplateUrl = ''

  //
  originalContentFile: any
  contentFile: any
  fileName = ''
  certificateUrl = ''
  safeCertificateUrl: SafeResourceUrl | null = null
  selectedLogoImage: string | ArrayBuffer | null = null
  private readonly TARGET_HEIGHT = 100;
  private readonly TARGET_Y_CENTER = 300;
  private readonly TARGET_X_START = 2250;

  private readonly FILE_UPLOAD_MAX_SIZE = 1 * 1024 * 1024 // 1MB
  // tslint:disable-next-line: max-line-length
  noSpecialChar = new RegExp(/^[\u0900-\u097F\u0980-\u09FF\u0C00-\u0C7F\u0B80-\u0BFF\u0C80-\u0CFF\u0D00-\u0D7F\u0A80-\u0AFF\u0B00-\u0B7F\u0A00-\u0A7Fa-zA-Z0-9.,_\-\$\/\:\[\]\(\) '!]+$/) //NOSONAR
  noSpecialCharMultiline = new RegExp(/^[\u0900-\u097F\u0980-\u09FF\u0C00-\u0C7F\u0B80-\u0BFF\u0C80-\u0CFF\u0D00-\u0D7F\u0A80-\u0AFF\u0B00-\u0B7F\u0A00-\u0A7Fa-zA-Z0-9.,_\-\$\/\:\[\]\(\) '!\n\r]+$/) //NOSONAR

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private activeRoute: ActivatedRoute,
    private externalTrainingsSvc: ExternalTrainingsService,
    private matSnackBar: MatLegacySnackBar,
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
                this.safeCertificateUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.certificateUrl)
                this.previewLogoUrl = this.certificateUrl
              },
              error: () => {
                this.openSnackbar('Failed to load certificate template SVG.')
              },
            })
          }
        } catch {
          this.openSnackbar('Failed to parse default certificate template response.')
        }
      },
      error: () => {
        this.openSnackbar('Failed to load default certificate template.')
      },
    })
  }

  initializeForm(): void {
    this.trainingForm = this.fb.group({
      trainingTitle: ['', [Validators.required, Validators.maxLength(70), Validators.pattern(this.noSpecialChar)]],
      learningObjective: ['', [Validators.maxLength(500), Validators.pattern(this.noSpecialCharMultiline)]],
      deliveryMode: [''],
      learningHours: ['', [Validators.min(1), Validators.pattern(/^[1-9]\d*$/)]],
      trainingType: ['', Validators.required],
      partnerName: ['', [Validators.maxLength(70), Validators.pattern(this.noSpecialChar)]]
    })
  }

  onFileSelected(event: any): void {
    const input = event.target as HTMLInputElement
    if (input?.files?.[0]) {
      this.handleLogoUpload(input.files[0])
    }
  }

  private isValidFile(file: File): boolean {
    return file.name.toLowerCase().endsWith('.svg') || file.type === 'image/svg+xml'
  }

  private handleLogoUpload(file: File): void {
    if (!this.isValidFile(file)) {
      this.openSnackbar('Please upload a valid SVG file.')
      return
    }

    if (file.size > this.FILE_UPLOAD_MAX_SIZE) {
      this.openSnackbar('Please upload a file less than 1 MB.')
      return
    }

    const fileName = file.name
    // const uploadedDate = new Date().toLocaleDateString()

    // Read file as data URL for preview
    const reader = new FileReader()
    reader.onload = (event) => {
      const imageData = event.target?.result

      this.logoFileName = fileName
      this.logoUploaded = true
      this.selectedLogoImage = imageData || null
      this.mergeLogo()
    }
    reader.readAsDataURL(file)
  }

  private mergeLogo(): void {
    try {
      const certificateReader = new FileReader()
      certificateReader.onload = (certEvent) => {
        const certificateSvgContent = certEvent.target?.result as string

        // If selectedLogoImage is a data URL, we need to convert it
        if (typeof this.selectedLogoImage === 'string' && this.selectedLogoImage.startsWith('data:')) {
          // Extract the base64 content and decode it
          const base64Content = this.selectedLogoImage.split(',')[1]
          const binaryString = atob(base64Content)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          const logoBlob = new Blob([bytes])
          const logoReader = new FileReader()
          logoReader.onload = (logoEvent) => {
            this.processMergeLogo(certificateSvgContent, logoEvent.target?.result as string)
          }
          logoReader.readAsText(logoBlob)
        }
      }
      certificateReader.readAsText(this.originalContentFile)
    } catch (error: any) {
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
      this.safeCertificateUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.certificateUrl)
      this.previewLogoUrl = this.certificateUrl

    } catch (error: any) { }
  }

  // Extracts the logo and places it at the ProvidersLogo_Placement location in the certificate
  private updateCertificateWithLogo(certificateSvgContent: string, logoSvgContent: string): string {
    const parser = new DOMParser()
    const certDoc = parser.parseFromString(certificateSvgContent, 'image/svg+xml')

    // Check for parsing errors in certificate
    if (certDoc.querySelector('parsererror')) {
      this.openSnackbar('Error parsing certificate SVG', 'close')
      return ''
    }

    // Find the ProvidersLogo_Placement group
    let logoGroup = certDoc.getElementById('ProvidersLogo_Placement')
    if (!logoGroup) {
      logoGroup = certDoc.querySelector('[id="ProvidersLogo_Placement"]')
    }
    if (!logoGroup) {
      logoGroup = certDoc.querySelector('g[id*="ProvidersLogo_Placement"]')
    }

    // Parse the new logo SVG
    const logoDoc = parser.parseFromString(logoSvgContent, 'image/svg+xml')
    if (logoDoc.querySelector('parsererror')) {
      this.openSnackbar('Error parsing logo SVG', 'close')
      return ''
    }

    const logoSvg = logoDoc.querySelector('svg')
    if (!logoSvg) {
      this.openSnackbar('Invalid logo SVG structure: No <svg> tag found', 'close')
      return ''
    }

    // Create a new group for the logo
    const newLogoGroup = certDoc.createElementNS('http://www.w3.org/2000/svg', 'g')
    newLogoGroup.setAttribute('id', 'ProvidersLogo_Placement')

    // --- Dimension Extraction & Alignment Logic ---
    const viewBox = logoSvg.getAttribute('viewBox')
    let minX = 0, minY = 0, logoWidth = 100, logoHeight = 100

    if (viewBox) {
      const vbParts = viewBox.split(/[\s,]+/).map(parseFloat)
      if (vbParts.length >= 4) {
        minX = vbParts[0]
        minY = vbParts[1]
        logoWidth = vbParts[2]
        logoHeight = vbParts[3]
      }
    } else {
      // Fallback to width/height attributes if viewBox is missing
      const wAttr = logoSvg.getAttribute('width')
      const hAttr = logoSvg.getAttribute('height')

      // Attempt to parse pixel values, ignoring 'px'
      logoWidth = wAttr ? parseFloat(wAttr) : 100
      logoHeight = hAttr ? parseFloat(hAttr) : 100
    }

    // 1. Calculate Scale to match target height
    if (logoHeight === 0) logoHeight = 100
    const scale = this.TARGET_HEIGHT / logoHeight

    // 2. Calculate Translate X
    // Rendered Left = (minX * scale) + tx => tx = TargetLeft - (minX * scale)
    const tx = this.TARGET_X_START - (minX * scale)

    // 3. Calculate Translate Y
    // Rendered Center Y = ((minY + height/2) * scale) + ty => ty = TargetCenterY - (LocalCenterY * scale)
    const localCenterY = minY + (logoHeight / 2)
    const ty = this.TARGET_Y_CENTER - (localCenterY * scale)

    const newTransform = `translate(${tx.toFixed(2)}, ${ty.toFixed(2)}) scale(${scale.toFixed(4)})`
    newLogoGroup.setAttribute('transform', newTransform)

    // We clone nodes to avoid modifying the parsed source logic references directly during iteration
    const logoChildren = Array.from(logoSvg.childNodes)

    for (const child of logoChildren) {
      if (child.nodeType === 1) {
        const importedNode = certDoc.importNode(child, true) as Element

        if (importedNode.tagName.toLowerCase() === 'svg') {
          if (!importedNode.getAttribute('width')) {
            importedNode.setAttribute('width', logoWidth.toString())
          }
          if (!importedNode.getAttribute('height')) {
            importedNode.setAttribute('height', logoHeight.toString())
          }
          if (!importedNode.getAttribute('viewBox') && viewBox) {
            importedNode.setAttribute('viewBox', viewBox)
          }
        }

        newLogoGroup.appendChild(importedNode)
      }
    }

    if (logoGroup && logoGroup.parentNode) {
      logoGroup.parentNode.replaceChild(newLogoGroup, logoGroup)
    } else {
      // If no existing group, append to the root SVG element
      const rootSvg = certDoc.querySelector('svg')
      if (rootSvg) {
        rootSvg.appendChild(newLogoGroup)
      }
    }

    const serializer = new XMLSerializer()
    return serializer.serializeToString(certDoc)
  }

  removeUploadedLogo(): void {
    this.mergedLogoUrl = null
    this.logoFileName = ''
    this.logoUploaded = false
    this.selectedLogoImage = null
    // Restore the original template
    this.contentFile = this.originalContentFile
    this.certificateUrl = URL.createObjectURL(this.originalContentFile)
    this.safeCertificateUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.certificateUrl)
    this.previewLogoUrl = this.certificateUrl
  }

  onSelectedCompetencyChange(selectedCompetency: any): void {
    this.selectedCompetencyList = selectedCompetency
  }

  get buildPayload(): any {
    const form = this.trainingForm.value
    const eventType = _.get(form, 'deliveryMode') || ''
    const learningHours = _.get(form, 'learningHours') || 0
    const logoUrl = this.mergedLogoUrl || this.defaultCertificateTemplateUrl
    return {
      request: {
        event: {
          mimeType: 'application/html',
          locale: 'en',
          name: _.get(form, 'trainingTitle'),
          description: _.get(form, 'learningObjective'),
          category: 'externalTraining',
          duration: learningHours * 3600,
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
}
