import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUploadOrgComponent } from './bulk-upload-org.component';

describe('BulkUploadOrgComponent', () => {
  let component: BulkUploadOrgComponent;
  let fixture: ComponentFixture<BulkUploadOrgComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BulkUploadOrgComponent]
    });
    fixture = TestBed.createComponent(BulkUploadOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
