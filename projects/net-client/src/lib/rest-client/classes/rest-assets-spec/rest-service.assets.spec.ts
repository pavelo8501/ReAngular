import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';

import { RestClient } from "../../rest-client.service"
import { REST_CLIENT, provideRestClient, RestConnectionConfig } from "./../config"
import { RestConnection, RestMethod, TokenSubjectException } from "../.."

import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MockedResponse } from '../../test-setup/mocked-response.model';
import { ConnectionID } from '../../test-setup/mocked-connection.enum';


describe('RestClient', () => {
  let service: RestClient
  let httpMock: HttpTestingController
  let connection: RestConnection<any>

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
    service = TestBed.inject(REST_CLIENT);
    connection = service.getConnection(ConnectionID.MOCKED)
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.getConnection(ConnectionID.MOCKED).closeConnections(true)
  });


  it('should initialize ServiceAssets properly', () => {
    const service = TestBed.inject(REST_CLIENT);
    const connection = service.getConnection(ConnectionID.MOCKED)
    expect(connection.serviceAssets.length).toBe(2)
    expect(connection.tokenAuthenticator()?.endpoint ?? "").toBe("auth/login")
    expect(connection.tokenRefresher()?.endpoint ?? "").toBe("auth/refresh")
  })

  it('should fetch token from API', fakeAsync(() => {
    const service = TestBed.inject(REST_CLIENT);
    const connection = service.getConnection(ConnectionID.MOCKED)
    const mockResponse = { data: 'test-token' };

    connection.subscribeToTokenUpdates("TestBed").subscribe(token => {
      if (token) {
        expect(token).toEqual('test-token');
      }
    });
    connection.tokenAuthenticator()?.getToken("login", "password")

    const req = httpMock.expectOne('/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
    tick();
    connection.closeConnections(true)
  }));


})