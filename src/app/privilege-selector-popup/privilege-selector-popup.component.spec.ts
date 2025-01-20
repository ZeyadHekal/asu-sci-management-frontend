import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivilegeSelectorPopupComponent } from './privilege-selector-popup.component';

describe('PrivilegeSelectorPopupComponent', () => {
  let component: PrivilegeSelectorPopupComponent;
  let fixture: ComponentFixture<PrivilegeSelectorPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivilegeSelectorPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivilegeSelectorPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
