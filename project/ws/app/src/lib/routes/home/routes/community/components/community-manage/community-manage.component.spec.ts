import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityManageComponent } from './community-manage.component';

describe('CommunityManageComponent', () => {
  let component: CommunityManageComponent;
  let fixture: ComponentFixture<CommunityManageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommunityManageComponent]
    });
    fixture = TestBed.createComponent(CommunityManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
