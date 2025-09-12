import { TestBed } from '@angular/core/testing';

import { OrgHierarchyService } from './org-hierarchy.service';

describe('OrgHierarchyService', () => {
  let service: OrgHierarchyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrgHierarchyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
