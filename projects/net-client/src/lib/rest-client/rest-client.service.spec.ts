import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RestClient } from './rest-client.service';
import { BackendResponse } from '../../../../playground/src/classes/backend-response';
import { provideRestClient, RestConnectionConfig, REST_CLIENT } from './classes/config';
import { ConnectionID } from '../../../../playground/src/enums/connection-id';
import { environment } from '../../../../playground/src/environments/environment.prod';
import { provideHttpClient, withFetch } from '@angular/common/http';

describe('RestClient', () => {
  let service: RestClient;
 let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers:[
             provideHttpClient(withFetch()),
             provideHttpClientTesting(),
             provideRestClient(
                   new RestConnectionConfig(
                        ConnectionID.BACKEND,
                        "",
                        new BackendResponse<any>(),
                        {getTokenEndpoint: "auth/login", refreshTokenEndpoint : "auth/refresh"}
                    )
                )
        ]
    });
    service = TestBed.inject(RestClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

   afterEach(() => {
    httpMock.verify(); // ensures no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

    it('should provide RestClient properly', () => {
        const service = TestBed.inject(REST_CLIENT);
        expect(service).toBeTruthy();
        expect(service).toBeInstanceOf(RestClient);
    });

    it('should initialize ServiceAssets properly', ()=>{
         const service = TestBed.inject(REST_CLIENT);
         const connection = service.getConnection(ConnectionID.BACKEND)
         expect(connection.serviceAssets.length).toBe(2)
         expect(connection.serviceAssets[0].endpoint).toBe("auth/login")
         expect(connection.serviceAssets[1].endpoint).toBe("auth/refresh")
    })

    it('should fetch token from API', () => {
         const service = TestBed.inject(REST_CLIENT);
         const connection = service.getConnection(ConnectionID.BACKEND)
         const mockResponse = 'test';

         connection.tokenAuthenticator()?.getToken("login", "password").subscribe((response)=>{
            expect(response).toEqual(mockResponse);
         })

        const req = httpMock.expectOne('/auth/login');
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
   });


});
