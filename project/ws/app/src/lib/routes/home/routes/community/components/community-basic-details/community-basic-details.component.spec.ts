import { CommunityBasicDetailsComponent } from './community-basic-details.component'
import { FormGroup, FormControl } from '@angular/forms'
import { DomSanitizer } from '@angular/platform-browser'
import { MatLegacySnackBar } from '@angular/material/legacy-snack-bar'

describe('CommunityBasicDetailsComponent', () => {
  let component: CommunityBasicDetailsComponent
  let mockSanitizer: Partial<DomSanitizer>
  let mockSnackBar: Partial<MatLegacySnackBar>

  jest.mock('@ckeditor/ckeditor5-build-classic', () => ({
    __esModule: true,
    default: {}
  }));

  beforeEach(() => {
    mockSanitizer = {
      bypassSecurityTrustHtml: jest.fn((html: string) => html)
    }

    mockSnackBar = {
      open: jest.fn()
    }

    component = new CommunityBasicDetailsComponent(
      mockSanitizer as DomSanitizer,
      mockSnackBar as MatLegacySnackBar
    )

    component.communityDetailsForm = new FormGroup({
      searchTopic: new FormControl(''),
      communityGuideLines: new FormControl(''),
      description: new FormControl('')
    })

    component.topicDataList = [
      { categoryName: 'Angular' },
      { categoryName: 'React' },
      { categoryName: 'Vue' }
    ]
  })

  it('should filter topicDataList based on searchTopic value', () => {
    component.ngOnInit()
    component.communityDetailsForm.get('searchTopic')!.setValue('ang')

    jest.advanceTimersByTime(300)  // simulate debounce

    expect(component.filterTopicDetails).toEqual([
      { categoryName: 'Angular' }
    ])
  })

  it('should validate communityGuideLines for minlength', () => {
    component.communityDetailsForm.get('communityGuideLines')!.setValue('short')
    component.communityDetailsForm.get('communityGuideLines')!.markAsTouched()

    const result = component.showValidationMsg('communityGuideLines', 'minlength')
    expect(result).toBe(true)
  })

  it('should validate communityGuideLines for maxlength', () => {
    const longText = '<p>' + 'x'.repeat(600) + '</p>'
    component.communityDetailsForm.get('communityGuideLines')!.setValue(longText)
    component.communityDetailsForm.get('communityGuideLines')!.markAsTouched()

    const result = component.showValidationMsg('communityGuideLines', 'maxlength')
    expect(result).toBe(true)
  })


  it('should call openSnackBar if non-image file uploaded', async () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    await component.handleFile(file, 'imageUrl')
    expect(mockSnackBar.open).toHaveBeenCalledWith('Please upload an image file')
  })


  it('should strip HTML and count characters correctly', () => {
    const htmlContent = '<p>Hello&nbsp;world</p>'
    const length = component.getEditorTextLength(htmlContent)
    expect(length).toBe(11)
  })


  it('should clear poster image', () => {
    component.communityDetailsForm.patchValue({ posterImageUrl: 'some-url' })
    component.previewUrl = 'some-url'

    component.emptyPosterImage()

    expect(component.communityDetailsForm.get('posterImageUrl')!.value).toBe('')
    expect(component.previewUrl).toBe('')
  })

  it('should clear image url', () => {
    component.communityDetailsForm.patchValue({ imageUrl: 'some-url' })
    component.previewImageUrl = 'some-url'

    component.emptyImageUrl()

    expect(component.communityDetailsForm.get('imageUrl')!.value).toBe('')
    expect(component.previewImageUrl).toBe('')
  })

})
