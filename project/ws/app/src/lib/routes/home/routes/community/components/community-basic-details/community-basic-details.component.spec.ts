import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityBasicDetailsComponent } from './community-basic-details.component';

describe('CommunityBasicDetailsComponent', () => {
  let component: CommunityBasicDetailsComponent;
  let fixture: ComponentFixture<CommunityBasicDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommunityBasicDetailsComponent]
    });
    fixture = TestBed.createComponent(CommunityBasicDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
