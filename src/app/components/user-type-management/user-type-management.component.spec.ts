import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTypeManagementComponent } from './user-type-management.component';

describe('UserTypeManagementComponent', () => {
  let component: UserTypeManagementComponent;
  let fixture: ComponentFixture<UserTypeManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTypeManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserTypeManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
