import { TestBed } from '@angular/core/testing';

import { ExploreContentService } from './explore-content.service';

describe('ExploreContentService', () => {
  let service: ExploreContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExploreContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
