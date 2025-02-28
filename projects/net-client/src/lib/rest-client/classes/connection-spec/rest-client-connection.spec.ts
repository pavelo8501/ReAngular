import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { RestClient } from '../../rest-client.service';
import { RestConnection } from "../connection/rest-client-connection"
import { BackendResponse } from '../../../../../../playground/src/classes/backend-response';
import { RestConnectionConfig, REST_CLIENT } from '../config';
import { ConnectionID } from '../../../../../../playground/src/enums/connection-id';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HeaderKey } from '../../enums';
import { RestMethod } from '../rest-assets';
import { provideRestClient } from "../config/index"
import { TokenSubjectException } from '../security/token-subject.exception';


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
                        ConnectionID.BACKEND,
                        "",
                        new BackendResponse<any>(),
                        { getTokenEndpoint: "auth/login", refreshTokenEndpoint: "auth/refresh", method: RestMethod.POST }))
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

    // it('should close token observable by passing error after run out of options to aquire token', fakeAsync(() => {

    //     const service = TestBed.inject(REST_CLIENT);
    //       const connection = service.getConnection(ConnectionID.BACKEND);
    //       let tokenGrabbed:boolean = false
    //       let appropriateErrorReceived = false
    //       let observableClosed = false


    //       connection.overrideOnTokenRequest(()=>{
    //           tokenGrabbed = true
    //           return undefined
    //       })

    //       connection.subscribeToTokenUpdates("test").subscribe({
    //           next:(token:string|undefined)=>{
    //                 appropriateErrorReceived = true;
    //           },
    //           error:(error) =>{
    //               console.warn(error)
    //           },
    //           complete:()=>{
    //               observableClosed = true
    //           }
    //       })

    //       const testsGet = connection.createGetAsset<string[]>({ endpoint: "api/tests", secured: true })
    //       testsGet.makeCall<string>([])
    //       tick()

    //       expect(tokenGrabbed).toBe(true)
    //       expect(appropriateErrorReceived).toBe(true)
    //       expect(observableClosed).toBe(false)

    //   }));


    it('should make an attempt to receive token from external', fakeAsync(() => {
        const service = TestBed.inject(REST_CLIENT);
        const connection = service.getConnection(ConnectionID.BACKEND);
        let tokenGrabbed: boolean = false
        connection.overrideOnTokenRequest(() => {
            tokenGrabbed = true
            return "external-token"
        })
        const testsGet = connection.createGetAsset<string[]>({ endpoint: "api/tests", secured: true })
        let req = testsGet.makeCall([]);
        assertTokenHeader('/api/tests', 'external-token');
        expect(tokenGrabbed).toBe(true)

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

        const assetGet = connection.createGetAsset<string[]>({ endpoint: "api/tests", secured: true });
        assetGet.makeCall([]);
        httpMock.expectOne('/api/tests').flush(null, { status: 401, statusText: 'Unauthorized' });
        tick()

        assetGet.makeCall([]);
        httpMock.expectOne('/auth/login').flush(newAuthResponse);
        tick()

        const finalReq = httpMock.expectOne('/api/tests')
        expect(finalReq.request.headers.get(HeaderKey.AUTHORIZATION)).toBe('Bearer new-mock-token');

        expect(tokenFetchCount).toBe(3);
        handler.unsubscribe()
    }));


    function assertTokenHeader(endpoint: string, expectedToken: string | undefined) {
        const req = httpMock.expectOne(endpoint);
        expect(req.request.headers.has(HeaderKey.AUTHORIZATION)).toBeTrue();
        if (expectedToken) {
            expect(req.request.headers.get(HeaderKey.AUTHORIZATION)).toBe(`Bearer ${expectedToken}`);
        } else {
            expect(req.request.headers.get(HeaderKey.AUTHORIZATION)).toBe(null);
        }
    }

})