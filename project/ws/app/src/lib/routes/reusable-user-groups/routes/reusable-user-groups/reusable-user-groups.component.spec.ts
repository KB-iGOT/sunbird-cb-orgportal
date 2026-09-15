import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ReusableUserGroupsComponent } from './reusable-user-groups.component'

describe('ReusableUserGroupsComponent', () => {
  let component: ReusableUserGroupsComponent
  let fixture: ComponentFixture<ReusableUserGroupsComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReusableUserGroupsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
    fixture = TestBed.createComponent(ReusableUserGroupsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
