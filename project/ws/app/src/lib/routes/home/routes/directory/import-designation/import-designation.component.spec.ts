import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportDesignationComponent } from './import-designation.component';

describe('ImportDesignationComponent', () => {
  let component: ImportDesignationComponent;
  let fixture: ComponentFixture<ImportDesignationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImportDesignationComponent]
    });
    fixture = TestBed.createComponent(ImportDesignationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
