import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';
import {HouseBuildService} from './housebuildingservice';
import {AppMeasureProgress, BudgetProgress, BudgetProgressNotes, SiteProgressRequest, SiteMessageRequest} from './progressupdaterequest';
import {BudgetImage} from './progressimagerequest'
import {RollOverDateRequest } from './rolloverdaterequest';

@Injectable()
export class SiteService {
  data: any;
  errorMsg: any;
  constructor(private http: Http) {
    this.data = null;
    this.errorMsg = null;
  }

  getSites(token: string, relay:string, debugModeOn: Boolean){

    let hbservice = new HouseBuildService(relay,debugModeOn); 
        let headers = new Headers();
          headers.append('Content-Type', 'application/json');
          headers.append('Authorization', 'Bearer ' + token);
          let options = new RequestOptions({ headers: headers });
        // this.http.post(hbservice.GetSitesUrl, options).map(res=> res.json());
        //RequestId:'2',
      return    this.http.post(hbservice.GetSitesUrl,'', options)
            .map(res => res.json());
  }

  siteRemoved(token:string, relay:string, siteID: number, debugModeOn: Boolean){
        let hbservice = new HouseBuildService(relay,debugModeOn); 
        let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            headers.append('Authorization', 'Bearer ' + token);
            let options = new RequestOptions({ headers: headers });
     
      return  this.http.post(hbservice.SiteRemovedUrl,JSON.stringify(siteID), options)
              .map(res => res.json());    
  }

  submitSiteProgress(token: string, relay:string, data:SiteProgressRequest, debugModeOn: Boolean){
     let hbservice = new HouseBuildService(relay,debugModeOn); 
        let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            headers.append('Authorization', 'Bearer ' + token);
            let options = new RequestOptions({ headers: headers });
        return  this.http.post(hbservice.SubmitProgressUrl,JSON.stringify(data), options)
              .map(res => res.json());    

  }

   submitSiteProgressMessages(token: string, relay:string, data:SiteMessageRequest, debugModeOn: Boolean){
     let hbservice = new HouseBuildService(relay,debugModeOn); 
        let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            headers.append('Authorization', 'Bearer ' + token);
            let options = new RequestOptions({ headers: headers });
        return  this.http.post(hbservice.SubmitSiteMessagesUrl,JSON.stringify(data), options)
              .map(res => res.json());    

  }

  submitSiteProgressPhoto(token: string, relay:string, data: BudgetImage, debugModeOn: Boolean){
    // console.log("photo service begin");
     try{
      let hbservice = new HouseBuildService(relay,debugModeOn); 
        let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            headers.append('Authorization', 'Bearer ' + token);
            let options = new RequestOptions({ headers: headers });
           // console.log("photo service");
             return  this.http.post(hbservice.SubmitPhotoUrl,JSON.stringify(data), options)
              .map(res => res.json()); 
     }
     catch(e){
       console.log(e);
     }
  }

  getRollOverDateResponse(token: string, relay:string, siteID: number, date: string, debugModeOn: Boolean){
    let hbservice = new HouseBuildService(relay,debugModeOn); 
    let requestdata = new RollOverDateRequest();
        requestdata.siteID = siteID;
        requestdata.progressDate = date;
         let headers = new Headers();
           headers.append('Content-Type', 'application/json');
           headers.append('Authorization', 'Bearer ' + token);
           let options = new RequestOptions({ headers: headers });
     return   this.http.post(hbservice.RolloverCheckUrl,JSON.stringify(requestdata), options)
             .map(res => res.json());
  }


}

