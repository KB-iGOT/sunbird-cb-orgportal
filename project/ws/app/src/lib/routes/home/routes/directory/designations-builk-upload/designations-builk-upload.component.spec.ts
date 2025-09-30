import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignationsBuilkUploadComponent } from './designations-builk-upload.component';

describe('DesignationsBuilkUploadComponent', () => {
  let component: DesignationsBuilkUploadComponent;
  let fixture: ComponentFixture<DesignationsBuilkUploadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DesignationsBuilkUploadComponent]
    });
    fixture = TestBed.createComponent(DesignationsBuilkUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
