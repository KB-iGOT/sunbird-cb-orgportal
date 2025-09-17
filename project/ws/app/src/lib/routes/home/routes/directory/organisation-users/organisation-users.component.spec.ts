import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationUsersComponent } from './organisation-users.component';

describe('OrganisationUsersComponent', () => {
  let component: OrganisationUsersComponent;
  let fixture: ComponentFixture<OrganisationUsersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrganisationUsersComponent]
    });
    fixture = TestBed.createComponent(OrganisationUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
