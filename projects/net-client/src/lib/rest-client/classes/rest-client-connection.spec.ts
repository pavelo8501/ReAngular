import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { RestClient } from './../rest-client.service';
import{RestConnection} from "./rest-client-connection"
import { BackendResponse } from '../../../../../playground/src/classes/backend-response';
import { RestConnectionConfig, REST_CLIENT } from './../classes/config';
import { ConnectionID } from '../../../../../playground/src/enums/connection-id';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HeaderKey } from './../enums';
import { RestMethod } from './../classes/rest-assets';
import { provideRestClient } from "./../classes/config/index"
import { TokenSubjectException } from './../classes/security/token-subject.exception';


describe('RestClient', () => {
  let service: RestClient
  let httpMock: HttpTestingController
  let connection: RestConnection<any>

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers:[
             provideHttpClient(withFetch()),
             provideHttpClientTesting(),
             provideRestClient(
                {production:false},
                new RestConnectionConfig(
                    ConnectionID.BACKEND, 
                    "", 
                    new BackendResponse<any>(), 
                    {getTokenEndpoint: "auth/login", refreshTokenEndpoint : "auth/refresh", method: RestMethod.POST }))
        ]
    });
      service = TestBed.inject(REST_CLIENT);
      connection = service.getConnection(ConnectionID.BACKEND)
      httpMock = TestBed.inject(HttpTestingController);
    });

   afterEach(() => {
      httpMock.verify();
  });

  it('should be created', () => {

    expect(connection).toBeTruthy();
    expect(connection.serviceAssets.length).toBe(2)

  });
})