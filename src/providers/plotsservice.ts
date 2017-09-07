import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/delay';
import {HouseBuildService} from './housebuildingservice';

/*
  Generated class for the Plotsservice provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class PlotsService {
  data: any;
  errorMsg: any;
  constructor(public http: Http) {
     this.data = null;
    this.errorMsg = null;
  }

getPlots(token: string, relay: string, siteID: number, debugModeOn: Boolean){

    let hbservice = new HouseBuildService(relay,debugModeOn); 
        let headers = new Headers();
          headers.append('Content-Type', 'application/json');
          headers.append('Authorization', 'Bearer ' + token);
          let options = new RequestOptions({ headers: headers });
    return   this.http.post(hbservice.GetPlotsUrl,JSON.stringify(siteID), options)
            .map(res => res.json());
  }

getStages(token: string, relay: string, siteID: number, debugModeOn: Boolean){
     let hbservice = new HouseBuildService(relay,debugModeOn); 
        let headers = new Headers();
          headers.append('Content-Type', 'application/json');
          headers.append('Authorization', 'Bearer ' + token);
          let options = new RequestOptions({ headers: headers });
    return   this.http.post(hbservice.GetStagesUrl,JSON.stringify(siteID), options)
            .map(res => res.json());
  }

  getPlotProgress(token: string, relay: string, plotID: number, debugModeOn: Boolean){
    //  return new Promise((resolve, reject) => {
    //     let hbservice = new HouseBuildService(); 
    //     let headers = new Headers();
    //       headers.append('Content-Type', 'application/json');
    //       headers.append('Authorization', 'Bearer ' + token);
    //       let options = new RequestOptions({ headers: headers });
    //     this.http.post(hbservice.GetPlotProgressUrl,JSON.stringify(plotID), options)
    //         .map(res => res.json()) 
    //       .subscribe(data => {        
    //       this.data = data;
    //       resolve(this.data);
    //     }, error => {reject(error)});
    //  });
      
       let hbservice = new HouseBuildService(relay, debugModeOn); 
         let headers = new Headers();
           headers.append('Content-Type', 'application/json');
           headers.append('Authorization', 'Bearer ' + token);
           let options = new RequestOptions({ headers: headers });
     return   this.http.post(hbservice.GetPlotProgressUrl,JSON.stringify(plotID), options)
             .map(res => res.json());

  }  
}
