import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityDashboardComponent } from './community-dashboard.component';

describe('CommunityDashboardComponent', () => {
  let component: CommunityDashboardComponent;
  let fixture: ComponentFixture<CommunityDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommunityDashboardComponent]
    });
    fixture = TestBed.createComponent(CommunityDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
