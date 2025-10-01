import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserBulkTransferComponent } from './user-bulk-transfer.component';

describe('UserBulkTransferComponent', () => {
  let component: UserBulkTransferComponent;
  let fixture: ComponentFixture<UserBulkTransferComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserBulkTransferComponent]
    });
    fixture = TestBed.createComponent(UserBulkTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
