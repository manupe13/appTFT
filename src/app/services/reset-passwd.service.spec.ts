import { TestBed } from '@angular/core/testing';

import { ResetPasswdService } from './reset-passwd.service';

describe('ResetPasswdService', () => {
  let service: ResetPasswdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResetPasswdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
