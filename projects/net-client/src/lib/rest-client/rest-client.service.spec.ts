import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { RestClient } from './rest-client.service';
import { RestConnectionConfig, REST_CLIENT } from './classes/config';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RestMethod } from './classes/rest-assets';
import { provideRestClient } from "./classes/config/index"
import { MockedResponse } from './test-setup/mocked-response.model';
import { ConnectionID } from './test-setup/mocked-connection.enum';

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
            ConnectionID.MOCKED,
            "",
            new MockedResponse<any>(),
            { getTokenEndpoint: "auth/login", refreshTokenEndpoint: "auth/refresh", method: RestMethod.POST }))
      ]
    });
    service = TestBed.inject(RestClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // ensures no outstanding requests
    service.getConnection(ConnectionID.MOCKED).closeConnections(true)

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


