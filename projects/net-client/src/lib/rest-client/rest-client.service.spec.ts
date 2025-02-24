import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RestClient } from './rest-client.service';
import { BackendResponse } from '../../../../playground/src/classes/backend-response';
import { provideRestClient, RestConnectionConfig, REST_CLIENT } from './classes/config';
import { ConnectionID } from '../../../../playground/src/enums/connection-id';
import { environment } from '../../../../playground/src/environments/environment.prod';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HeaderKey } from 'net-client';
import { RestMethod } from './enums/rest-method.enums';

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
                        {getTokenEndpoint: "auth/login", refreshTokenEndpoint : "auth/refresh", method : RestMethod.POST}
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
         const mockResponse = { data: 'test' };

        connection.tokenAuthenticator()?.getToken("login", "password")
        connection.tokenSubject.subscribe(token => {
           expect(token).toEqual('test');
        });
        
        const req = httpMock.expectOne('/auth/login');
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
   });

    it('should retain auth token until expired', fakeAsync(() => {
        const service = TestBed.inject(REST_CLIENT);
        const connection = service.getConnection(ConnectionID.BACKEND);

        const mockAuthResponse = { data: 'mock-token' };
        let tokenFetchCount = 0;

        connection.tokenAuthenticator()?.getToken("login", "password")
        connection.tokenSubject.subscribe(token => {
           if(token){tokenFetchCount ++ }
        });

        httpMock.expectOne('/auth/login').flush(mockAuthResponse);
        tick();

        const testsGet = connection.createGetAsset<string[]>({ endpoint: "api/tests", secured: true });
        testsGet.makeCall([]);
        assertTokenHeader('/api/tests', 'mock-token');

        tick(); 
        testsGet.makeCall([]);
        assertTokenHeader('/api/tests', 'mock-token');
        expect(tokenFetchCount).toBe(1);
    }));

 it('should invalidate ', fakeAsync(() => {
        const service = TestBed.inject(REST_CLIENT);
        const connection = service.getConnection(ConnectionID.BACKEND);

        const mockAuthResponse = { data: 'mock-token' };
        let tokenFetchCount = 0;

        connection.tokenAuthenticator()?.getToken("login", "password")
        connection.tokenSubject.subscribe(token => {
           if(token){tokenFetchCount ++ }
        });

        httpMock.expectOne('/auth/login').flush(mockAuthResponse);
        tick();

        const testsGet = connection.createGetAsset<string[]>({ endpoint: "api/tests", secured: true });
        testsGet.makeCall([]);
        assertTokenHeader('/api/tests', 'mock-token');

        tick(); 
        testsGet.makeCall([]);
        assertTokenHeader('/api/tests', 'mock-token');
        expect(tokenFetchCount).toBe(1);
    }));


   function assertTokenHeader(endpoint: string, expectedToken: string) {
        const req = httpMock.expectOne(endpoint);
        expect(req.request.headers.has(HeaderKey.AUTHORIZATION)).toBeTrue();
        expect(req.request.headers.get(HeaderKey.AUTHORIZATION)).toBe(`Bearer ${expectedToken}`);
    }

});


