import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';

import { RestClient } from "../../rest-client.service"
import { REST_CLIENT, provideRestClient, RestConnectionConfig } from "./../config"
import { RestConnection, RestMethod, TokenSubjectException } from "../.."

import { BackendResponse } from './../../../../../../playground/src/app/models/api-response';
import { ConnectionID } from './../../../../../../playground/src/app/enums/connection-id';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';


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
            ConnectionID.BACKEND_API,
            "",
            new BackendResponse<any>(),
            { getTokenEndpoint: "auth/login", refreshTokenEndpoint: "auth/refresh", method: RestMethod.POST }))
      ]
    });
    service = TestBed.inject(REST_CLIENT);
    connection = service.getConnection(ConnectionID.BACKEND_API)
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.getConnection(ConnectionID.BACKEND_API).closeConnections(true)
  });


  it('should initialize ServiceAssets properly', () => {
    const service = TestBed.inject(REST_CLIENT);
    const connection = service.getConnection(ConnectionID.BACKEND_API)
    expect(connection.serviceAssets.length).toBe(2)
    expect(connection.tokenAuthenticator()?.endpoint ?? "").toBe("auth/login")
    expect(connection.tokenRefresher()?.endpoint ?? "").toBe("auth/refresh")
  })

  it('should fetch token from API', fakeAsync(() => {
    const service = TestBed.inject(REST_CLIENT);
    const connection = service.getConnection(ConnectionID.BACKEND_API)
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