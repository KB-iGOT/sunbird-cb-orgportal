import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityCompetencyComponent } from './community-competency.component';

describe('CommunityCompetencyComponent', () => {
  let component: CommunityCompetencyComponent;
  let fixture: ComponentFixture<CommunityCompetencyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommunityCompetencyComponent]
    });
    fixture = TestBed.createComponent(CommunityCompetencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
