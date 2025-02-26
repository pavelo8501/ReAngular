import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RestClient } from './rest-client.service';
import { BackendResponse } from '../../../../playground/src/classes/backend-response';
import { RestConnectionConfig, REST_CLIENT } from './classes/config';
import { ConnectionID } from '../../../../playground/src/enums/connection-id';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HeaderKey } from './enums';
import { RestMethod } from './classes/rest-assets';
import { provideRestClient } from "./classes/config/index"
import {  } from './classes/exceptions';
import { TokenSubjectException } from './classes/security/token-subject.exception';

describe('RestClient', () => {
  let service: RestClient;
 let httpMock: HttpTestingController;

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
         expect(connection.tokenAuthenticator()?.endpoint??"").toBe("auth/login")
         expect(connection.tokenRefresher()?.endpoint??"").toBe("auth/refresh")
    })

    it('should fetch token from API', fakeAsync(() => {
         const service = TestBed.inject(REST_CLIENT);
         const connection = service.getConnection(ConnectionID.BACKEND)
         const mockResponse = { data: 'test' };

        connection.tokenAuthenticator()?.getToken("login", "password")
        const handler  = connection.subscribeToTokenUpdates("test").subscribe(token => {
            if(token){
                 expect(token).toEqual('test');
            }
        });

        const req = httpMock.expectOne('/auth/login');
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
        tick();
        handler.unsubscribe()
   }));

    it('should retain auth token until expired', fakeAsync(() => {
        const service = TestBed.inject(REST_CLIENT);
        const connection = service.getConnection(ConnectionID.BACKEND);

        const mockAuthResponse = { data: 'mock-token' };
        let tokenFetchCount = 0;

        connection.tokenAuthenticator()?.getToken("login", "password")
        const handler  = connection.subscribeToTokenUpdates("test").subscribe(token => {
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
        handler.unsubscribe()
    }));

    it('should invalidate token and request new on Unauthenticated', fakeAsync(() => {
        const service = TestBed.inject(REST_CLIENT);
        const connection = service.getConnection(ConnectionID.BACKEND);

        const initialAuthResponse = { data: 'mock-token' };
        const newAuthResponse = { data: 'new-mock-token' };
        let tokenFetchCount = 0;

        connection.tokenAuthenticator()?.getToken("login", "password");
        let handler = connection.subscribeToTokenUpdates("test").subscribe(token => {
            if (token) tokenFetchCount++;
        });

        httpMock.expectOne('/auth/login').flush(initialAuthResponse);
        tick();

        const testsGet = connection.createGetAsset<string[]>({ endpoint: "api/tests", secured: true });
        testsGet.makeCall([]);
        httpMock.expectOne('/api/tests').flush(null, { status: 401, statusText: 'Unauthorized' });
        tick()

        httpMock.expectOne('/auth/login').flush(newAuthResponse);
        tick()
  
        const finalReq = httpMock.expectOne('/api/tests')
        expect(finalReq.request.headers.get(HeaderKey.AUTHORIZATION)).toBe('Bearer new-mock-token');

        expect(tokenFetchCount).toBe(3);
        handler.unsubscribe()
    }));

    it('should make an attempt to receive token from external', fakeAsync(() => {
        const service = TestBed.inject(REST_CLIENT);
        const connection = service.getConnection(ConnectionID.BACKEND);
        let tokenGrabbed:boolean = false
         connection.supplyToken(()=>{
            tokenGrabbed = true
            return "external-token"
        })
        const testsGet = connection.createGetAsset<string[]>({ endpoint: "api/tests", secured: true })
        testsGet.makeCall([]);
        assertTokenHeader('/api/tests', 'external-token');
        expect(tokenGrabbed).toBe(true)
        
    }));


    it('should close token observable by passing error after run out of options to aquire token', fakeAsync(() => {
        const service = TestBed.inject(REST_CLIENT);
        const connection = service.getConnection(ConnectionID.BACKEND);
        let tokenGrabbed:boolean = false
        let appropriateErrorReceived = false
        let observableClosed = false
        connection.supplyToken(()=>{
            tokenGrabbed = true
            return undefined
        })

        connection.subscribeToTokenUpdates("test").subscribe({
            next:(token:string|TokenSubjectException|undefined)=>{
                if (token instanceof TokenSubjectException) {
                    appropriateErrorReceived = true;
                }
            },
            error:(error) =>{
                console.warn(error)
            },
            complete:()=>{
                observableClosed = true
            }
        })

        const testsGet = connection.createGetAsset<string[]>({ endpoint: "api/tests", secured: true })
        testsGet.makeCall<string>([])
        tick()
         assertTokenHeader('/api/tests', undefined);
     
        expect(tokenGrabbed).toBe(true)
        expect(appropriateErrorReceived).toBe(true)
        expect(observableClosed).toBe(false)
        
    }));


   function assertTokenHeader(endpoint: string, expectedToken: string|undefined) {
        const req = httpMock.expectOne(endpoint);
        expect(req.request.headers.has(HeaderKey.AUTHORIZATION)).toBeTrue();
        if(expectedToken){
            expect(req.request.headers.get(HeaderKey.AUTHORIZATION)).toBe(`Bearer ${expectedToken}`);
        }else{
            expect(req.request.headers.get(HeaderKey.AUTHORIZATION)).toBe(null);
        }
    }

});


