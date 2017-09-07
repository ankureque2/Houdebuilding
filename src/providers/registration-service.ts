import {Http,  Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from  'rxjs/Rx';
import { Injectable } from '@angular/core';
import {HouseBuildService} from './housebuildingservice';
import{RegistrationRequest, RegistrationResponse} from './registrationrequest';

@Injectable()
export class RegistrationService {
      
    static get parameters() {
        return [[Http]];
    }
   data: any;
   errorMsg: any;
    constructor(private http: Http) {
         this.data = null
    }
  
Activate(activationCode: string, deviceName: string, debugModeOn: Boolean) {
    // don't have the data yet
    return new Promise(resolve => {
        var service = new HouseBuildService('0', debugModeOn);
        let body = new RegistrationRequest(activationCode, deviceName);      
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var url = service.RegisterDeviceUrl;
        return this.http.post(url, JSON.stringify(body), { headers: headers })
                           .map(res => res.json())
        .subscribe(data => {        
          this.data = data;
          resolve(this.data);
        }, error => this.errorMsg = error);
    });        
  }

 ValidateToken(token: string, debugModeOn: Boolean){
       return new Promise(resolve => {
        var service = new HouseBuildService('0', debugModeOn);        
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var url = service.ValidateTokenUrl;
        return this.http.post(url, JSON.stringify({Token : token}), { headers: headers })
                           .map(res => res.json())
        .subscribe(data => {        
          this.data = data;
          resolve(this.data);
        }, error => { this.errorMsg = error
                    console.log(error);
     });
    });        
 }

};