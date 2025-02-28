import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';

import{RestClient} from "./../../rest-client.service"

import  {REST_CLIENT, provideRestClient, RestConnectionConfig} from "./../config"
import {
    RestConnection,
    RestPutAsset, RestGetAsset, 
    RestMethod, HeaderKey} from "./../../"

import { BackendResponse } from '../../../../../../playground/src/classes/backend-response';
import { ConnectionID } from '../../../../../../playground/src/enums/connection-id';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';


 describe('RestClient', () => {
      let service: RestClient
      let httpMock: HttpTestingController
      let connection: RestConnection<any>
      let putAsset : RestPutAsset<string>
      let getAsset :RestGetAsset<boolean>

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
      putAsset = connection.createPutAsset<string>({endpoint:"test/put", secured:true})
      getAsset = connection.createGetAsset<boolean>({endpoint:"test/get", secured:true})
      httpMock = TestBed.inject(HttpTestingController);
    });

   afterEach(() => {
      httpMock.verify();
  });

  it('should be created', () => {

    expect(getAsset).toBeTruthy();
    expect(putAsset).toBeTruthy();

  });

  it('should retain auth token until expired', fakeAsync(() => {
    const service = TestBed.inject(REST_CLIENT);
    const connection = service.getConnection(ConnectionID.BACKEND);

    const mockAuthResponse = { data: 'mock-token' };
    let tokenFetchCount = 0;

    connection.subscribeToTokenUpdates("test_connection").subscribe({
      next:(token:string|undefined)=>{
        if(token){
          tokenFetchCount++
        }
      },error:(err:any)=>{
        console.warn(err)
      }
    })

    connection.tokenAuthenticator()?.getToken("login", "password")
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

//



function assertTokenHeader(endpoint: string, expectedToken: string|undefined) {
        const req = httpMock.expectOne(endpoint);
        expect(req.request.headers.has(HeaderKey.AUTHORIZATION)).toBeTrue();
        if(expectedToken){
            expect(req.request.headers.get(HeaderKey.AUTHORIZATION)).toBe(`Bearer ${expectedToken}`);
        }else{
            expect(req.request.headers.get(HeaderKey.AUTHORIZATION)).toBe(null);
        }
    }


})