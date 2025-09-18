import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgHierarchyMappingComponent } from './org-hierarchy-mapping.component';

describe('OrgHierarchyMappingComponent', () => {
  let component: OrgHierarchyMappingComponent;
  let fixture: ComponentFixture<OrgHierarchyMappingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrgHierarchyMappingComponent]
    });
    fixture = TestBed.createComponent(OrgHierarchyMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
