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
import { RequestError } from '../events';
import { RequestEvent } from '../events/models/request-event.class';
import { MockRecord } from './models/mock-record.class';

fdescribe('RestClient', () => {
      let service: RestClient
      let httpMock: HttpTestingController
      let connection: RestConnection<any>
      let putAsset : RestPutAsset<string>
      let getAsset :RestGetAsset<MockRecord[]>

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
    })

    service = TestBed.inject(REST_CLIENT);
    connection = service.getConnection(ConnectionID.BACKEND)
    putAsset = connection.createPutAsset<string>({endpoint:"api/put", secured:true})
    getAsset = connection.createGetAsset<MockRecord[]>({endpoint:"api/get", secured:true})
    httpMock = TestBed.inject(HttpTestingController);
  });

   afterEach(() => {
      httpMock.verify();
      connection.closeConnections(true)
  })

  it('should be created', () => {
    expect(getAsset).toBeTruthy();
    expect(putAsset).toBeTruthy();
  })

  it('should retain auth token between different method calls', fakeAsync(() => {
     
      const mockAuthResponse = { data: 'mock-token' };
      let tokenFetchCount = 0;

      const tokenUpdateHandler = connection.subscribeToTokenUpdates("test_connection").subscribe({
          next:(token:string|undefined)=>{
            if(token){
              tokenFetchCount++
              console.log(`INTEST TOKEN RECEIVED ${token}`)
            }
          },error:(err:any)=>{
            console.warn(err)
          }
      })

      connection.tokenAuthenticator()?.getToken("login", "password")
      httpMock.expectOne('/auth/login').flush(mockAuthResponse);
      tick()

      getAsset.makeCall([])
      assertTokenHeader('/api/get', 'mock-token');
      tick() 

      putAsset.makeCall(1, "SomeInput")
      assertTokenHeader('/api/put?id=1', 'mock-token');
      tick()
      expect(tokenFetchCount).toBe(1);
      tokenUpdateHandler.unsubscribe()
  }))


  it('should subscribe for errors properly', fakeAsync(() => {
    
    let unauthorizedFired = false
    let firedRequestEvent: RequestEvent|undefined = undefined
    const requestEventHandler = getAsset.subscribeForRequestEvents().subscribe({
      next:(event)=>{
        
        firedRequestEvent = event
        switch(event.error){
          case RequestError.SERVER_UNAUTHORIZED:
            unauthorizedFired = true
          break
        }
      }
    })

    tick()
    getAsset.makeCall([])
    httpMock.expectOne('/api/get').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(unauthorizedFired).toBe(true)


    tick()
    unauthorizedFired = false
    getAsset.makeCall([])
    httpMock.expectOne('/api/get').flush(null, { status: 500, statusText: 'ServerError' });
    expect(unauthorizedFired).toBe(false)
    expect(firedRequestEvent).toBeDefined()
    requestEventHandler.unsubscribe()

  }))


  it('getAsset should return proper data' , fakeAsync(() => {

    let recordsReceived = 0
    let responseCount = 0
    let receivedRecords : Array<MockRecord>  = []
    const getAssetHandler = getAsset.makeCall<MockRecord[]>([]).subscribe({
      next:(records)=>{
        console.log(`INTEST RECORDS RECEIVED`)
        console.log(records)
        responseCount++
        recordsReceived = records.length
        receivedRecords = records
      },
      error:(err)=>{
        console.warn(`INTEST RECORDS RECEIVED ERROR`)
        console.warn(err)
      }
    })

    tick()
    httpMock.expectOne('/api/get').flush(mockResponse());
    expect(recordsReceived).toBe(2)
    expect(responseCount).toBe(1)
    let firstRecord = receivedRecords[0]
    expect(firstRecord.id).toBe(1)
    expect(firstRecord.str).toBe("mock_1")
    expect(firstRecord.val).toBe(1)
    getAssetHandler.unsubscribe()
  }))

  function mockResponse():BackendResponse<MockRecord[]>{
   
    const payload = Array<MockRecord>(new MockRecord(1,"mock_1", 1), new MockRecord(2,"mock_2", 2))
    const response = new BackendResponse<MockRecord[]>()
    response.errorCode = 0
    response.msg = "ok"
    response.ok = true
    response.data = payload

    return response
  }

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