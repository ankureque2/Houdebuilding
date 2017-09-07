export class HouseBuildService{
BaseUrl: string;
RegisterDeviceUrl: string;
ValidateTokenUrl: string;
GetPlotsUrl: string;
GetSitesUrl: string;
GetStagesUrl: string;
GetPlotProgressUrl: string;
SiteRemovedUrl: string;
SubmitProgressUrl: string;
SubmitSiteMessagesUrl: string;
SubmitPhotoUrl: string;
RolloverCheckUrl : string;

constructor(relaychannel: string, debugModeOn: Boolean){
    let testURL = 'https://relaytest';
    let liveURL = 'https://relay';
   // this.BaseUrl = 'https://relaytest0.eque2.com';
   if (debugModeOn.toString() === "true"){
          this.BaseUrl = testURL + relaychannel + '.eque2.com'; 
        //  console.log("test");
   }else{
         this.BaseUrl = liveURL + relaychannel + '.eque2.com'; 
         // console.log("live");
   } 

    this.RegisterDeviceUrl = this.BaseUrl + '/api/devicetokens/activatedevice';    
    this.ValidateTokenUrl = this.BaseUrl + '/api/devicetokens/validate';
    this.GetSitesUrl = this.BaseUrl + '/api/devicemessages/postonpremise/2';
    this.GetStagesUrl = this.BaseUrl+ '/api/devicemessages/postonpremise/3';
    this.GetPlotsUrl = this.BaseUrl + '/api/devicemessages/postonpremise/4';
    this.GetPlotProgressUrl = this.BaseUrl+ '/api/devicemessages/postonpremise/5';
    this.SiteRemovedUrl = this.BaseUrl + '/api/devicemessages/postonpremise/7';  
    this.SubmitProgressUrl = this.BaseUrl + '/api/devicemessages/postonpremise/8';
    this.SubmitSiteMessagesUrl = this.BaseUrl + '/api/devicemessages/postonpremise/10';
    this.SubmitPhotoUrl = this.BaseUrl + '/api/devicemessages/postonpremise/11';
    this.RolloverCheckUrl = this.BaseUrl + '/api/devicemessages/postonpremise/12';
    

    //https://relaytest0.eque2.com
    
 }   
}