import { ComponentFixture, TestBed } from '@angular/core/testing'

import { UploadLogoDialogComponent } from './upload-logo-dialog.component'

describe('UploadLogoDialogComponent', () => {
  let component: UploadLogoDialogComponent
  let fixture: ComponentFixture<UploadLogoDialogComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadLogoDialogComponent]
    })
      .compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadLogoDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})