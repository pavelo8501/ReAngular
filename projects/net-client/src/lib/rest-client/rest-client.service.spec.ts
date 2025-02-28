import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { RestClient } from './rest-client.service';
import { RestConnectionConfig, REST_CLIENT } from './classes/config';
import { ConnectionID, BackendResponse } from './../../../../playground';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HeaderKey } from './enums';
import { RestMethod } from './classes/rest-assets';
import { provideRestClient } from "./classes/config/index"
import { TokenSubjectException } from './classes/security/token-subject.exception';

describe('RestClient', () => {
  let service: RestClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
        provideRestClient(
          { production: false },
          new RestConnectionConfig(
            ConnectionID.BACKEND_API,
            "",
            new BackendResponse<any>(),
            { getTokenEndpoint: "auth/login", refreshTokenEndpoint: "auth/refresh", method: RestMethod.POST }))
      ]
    });
    service = TestBed.inject(RestClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // ensures no outstanding requests
    service.getConnection(ConnectionID.BACKEND_API).closeConnections(true)

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should provide RestClient properly', () => {
    const service = TestBed.inject(REST_CLIENT);
    expect(service).toBeTruthy();
    expect(service).toBeInstanceOf(RestClient);
  });




});


