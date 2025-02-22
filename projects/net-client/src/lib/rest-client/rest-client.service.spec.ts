import { TestBed } from '@angular/core/testing';

import { RESTClient } from './rest-client.service';

describe('RESTClient', () => {
  let service: RESTClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RESTClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
