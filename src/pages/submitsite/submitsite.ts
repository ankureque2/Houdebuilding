import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController, LoadingController, ViewController} from 'ionic-angular';
import {Database} from '../../providers/database';
import {SiteService} from '../../providers/site-service';
import {Guid} from '../br.classes/guid';
import {AppMeasureItemNote} from '../br.classes/appmeasureitem'
import {Device} from 'ionic-native';
import {BudgetProgress, BudgetProgressNotes, AppMeasureProgress, SiteProgressRequest, SiteMessageRequest, AppmeasureProgressNotes} from '../../providers/progressupdaterequest';
import {SiteProgressResponse} from '../../providers/progressupdateresponse';
import {SiteProgressResults, BudgetProgressResult, AppMeasureProgressResult} from '../br.classes/siteprogressresult'
import {RegistrationInfo} from '../register/registrationdata';
import {PlotsService} from '../../providers/plotsservice';
import{RegistrationService} from "../../providers/registration-service";

@Component({
  selector: 'page-submitsite',
  templateUrl: 'submitsite.html'
})

export class SubmitSitePage {
siteID: number;
token: string;
relay: string;
progressDate: string;
currentDate: string;
submitCompleted: boolean;
hasWarnings: boolean;
StageWarnings: BudgetProgressResult[];
AppWarnings: AppMeasureProgressResult[];
disableSubmit: boolean;
debugModeOn: Boolean;
constructor(public navCtrl: NavController, public navParams: NavParams,
              private database : Database, private toastCtrl: ToastController,
              private siteService: SiteService, private alertCtrl: AlertController,
              private loadingCtrl: LoadingController, public viewCtrl: ViewController,
              private sublocationservice: PlotsService, private regService: RegistrationService) {
   
     this.siteID = <number> navParams.get("siteID");
     this.token = navParams.get("token");   
     this.currentDate = new Date().toISOString();
     this.progressDate = this.currentDate;
     this.submitCompleted = false;
     this.hasWarnings = false;
     this.disableSubmit = false;
     
  }

ionViewDidLoad() {   
    
          this.database.getActivationInfo().then((data) =>{
          let regInfo = <RegistrationInfo> data;
          this.token = regInfo.accesstoken;
          this.relay   = regInfo.relaychannel.toString();
        });     
     this.getAppSettings();
  }

dismiss() {
    this.viewCtrl.dismiss();
    
  }

getPreviousSiteResponseData(){
this.database.getSiteProgressResponseResults(this.siteID).then((data) => 
              {
                let progressResponseData = <SiteProgressResults> data;
                this.StageWarnings = progressResponseData.BudgetResult;
                this.AppWarnings = progressResponseData.AppmeasureItemsResult;           
              }, (error) =>{} 
    );
}

showSubmitQuestion(){
   this.disableSubmit = true;
    let alert = this.alertCtrl.create({
        title: 'Confirm submit',
        message: 'Do you wish submit Budget progress data to Housebuilding server?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
               this.disableSubmit = false;
            }
          },
          {
            text: 'Submit',
            handler: () => {
            this.rolloverBudgetDateCheck();
            }
          }
        ]
      });
  alert.present();
}

prepareSiteProgressData() {
  return  new Promise((resolve,reject) => {
  
    let budgetProgress: BudgetProgress[];   
    let appProgress: AppMeasureProgress[];
  
    this.database.getSiteBudgetProgress(this.siteID).then((result) =>{
         budgetProgress = <BudgetProgress[]> result;   

             this.database.getSiteAppmeasureProgress(this.siteID).then((result) => {
                appProgress = <AppMeasureProgress[]> result;                 
                      let request = new SiteProgressRequest();                          
                            request.progressData = budgetProgress;
                            request.appMeasureProgressData = appProgress;
                            resolve (request);
                  }, error =>{ 
                    reject(error);
                    });        
           },error=> { reject(error);
                }); 
  });
}

prepareSiteNotesData(){
  return  new Promise((resolve,reject) => {
      let budgetNotes: BudgetProgressNotes[];
      let appnotes : AppmeasureProgressNotes[];
      this.database.getSiteBudgetNotes(this.siteID).then((result) =>{
            budgetNotes = <BudgetProgressNotes[]> result;
             this.database.getSiteAppmeasureNotes(this.siteID).then((result) =>{
                    appnotes = <AppmeasureProgressNotes[]> result;
                      let request = new SiteMessageRequest();                          
                             request.siteID = this.siteID;                          
                            request.messageData = budgetNotes;
                            request.appMeasureMessageData = appnotes;
                            resolve (request);
                  }, error =>{ 
                    reject(error);
                    });
        }
        , error =>{ 
           reject(error);
        });
    });
}

rolloverBudgetDateCheck(){
  this.validateToken().then(()=>{
  this.siteService.getRollOverDateResponse(this.token, this.relay, this.siteID,this.progressDate, this.debugModeOn).subscribe((respData: any) => {  
  
    if (respData.MessageCode === 0){
        let resp:any = respData.Response;
        if (resp.returnMessage && resp.returnMessage !== ""){
                    let alert = this.alertCtrl.create({
                            title: 'Progress Date check',
                            message: resp.returnMessage  + ' Do you wish to continue?',
                            buttons: [
                              {
                                text: 'Cancel',
                                role: 'cancel',
                                handler: () => {
                                  console.log('Cancel clicked');
                                   this.disableSubmit = false;
                                }
                              },
                              {
                                text: 'Submit',
                                handler: () => {
                                this.submitSiteProgress();
                                }
                              }
                            ]
                          });
                      alert.present();
            }else{
              this.submitSiteProgress();
            }
        }
        else{
          let reason: string = this.MesageCodeDescription(respData.MessageCode);     
           this.disableSubmit = false;          
                    this.showMessage("Error occurred while submitting site data: " + reason);
        }
    }, (error)=>{   
        this.showMessage('Error occured while checking for Progress Date: ' + error.statusText);
         this.disableSubmit = false;
        console.log(error.statusText);
    });
  });
}

submitSiteProgress(){
      let loader = this.loadingCtrl.create({
                                          content: "Please wait...submitting site progress.",
                                          spinner : "bubbles",
                                          showBackdrop: false,
                                          dismissOnPageChange : false
                                      });
    loader.present();
     let deviceID: string = Device.uuid;
     let transactionID: string = Guid.newGuid();

    this.prepareSiteProgressData().then((data: any) => {
     // console.log("site data received");

        let request = <SiteProgressRequest> data;
        request.deviceID = deviceID;
        request.siteID = this.siteID;
        request.transactionID = transactionID;
        request.progressDate = this.progressDate;        
      if(request.progressData.length === 0 && request.appMeasureProgressData.length === 0){
             this.prepareSiteNotesData().then((data) =>{
                          let request = <SiteMessageRequest> data;
                            request.deviceID = deviceID;
                            request.siteID = this.siteID;
                            request.transactionID = transactionID;   
                            if (request.messageData.length > 0 || request.appMeasureMessageData.length> 0)
                            {
                               this.siteService.submitSiteProgressMessages(this.token, this.relay, request, this.debugModeOn).subscribe((data) => {
                                                         
                                  if (data.MessageCode === 0){                               
                                      this.database.deleteSiteNotes(this.siteID);                                 
                                    }
                                });
                            }     
                loader.data.content = "Refreshing Site Progress Data";                 
                this.refreshSiteData(loader, false);
                this.submitCompleted = true;                            
              });    
      } 
      else{
           this.siteService.submitSiteProgress(this.token, this.relay, request, this.debugModeOn).subscribe((respData) => {     
           //     console.log(respData);
           if (respData.MessageCode === 0){   
                        
               let siteResponse = <SiteProgressResponse> respData.ResponseList;
             
               this.database.InsertSiteProgressSubmitResponse(siteResponse, new Date().toISOString(), this.siteID).then((response) =>{
                        //  console.log("response saved");
                }, (error) => {
                  this.showMessage("Error occurred while saving  progress response");
                   this.disableSubmit = false;
                        loader.dismiss();                      
                });

              this.prepareSiteNotesData().then((data) =>{
                          let request = <SiteMessageRequest> data;
                            request.deviceID = deviceID;
                            request.siteID = this.siteID;
                            request.transactionID = transactionID;   
                            if (request.messageData.length > 0 || request.appMeasureMessageData.length> 0)
                            {
                               this.siteService.submitSiteProgressMessages(this.token, this.relay, request, this.debugModeOn).subscribe((data) => {
                               //  console.log(data);                          
                                  if (data.MessageCode === 0){                               
                                      this.database.deleteSiteNotes(this.siteID);                                 
                                    }
                                });
                            }   
                this.getPreviousSiteResponseData();
                this.submitCompleted = true;
                if (siteResponse.returnCount || siteResponse.appMeasureReturnCount ){
                        this.hasWarnings = true;                        
                        this.showMessage("Site Progress has been submitted with warning(s).");
                        loader.dismiss();               
                    }
                    else{
                        loader.data.content = "Refreshing Site Progress Data";
                        this.refreshSiteData(loader, false);                
                    }            
              });    
              }
              else{
                let reason: string = this.MesageCodeDescription(respData.MessageCode);
                loader.dismiss();
                this.showMessage("Error occurred while submitting site data: " + reason);
                 this.disableSubmit = false;
              }        
          },
          error =>{
            console.log(error);
            this.showMessage("Error occurred while submitting Site progress - " + error.message);
                      loader.dismiss();
                       this.disableSubmit = false;
          }, () => {
            console.log("completed");
          });
      }
        

    }, (error) => {
                   loader.dismiss();
            this.showMessage("Error occurred while collecting progress data");
             this.disableSubmit = false;
    });   
  }

btnRefreshData_clicked(){
  let loader = this.loadingCtrl.create({
                                          content: "Please wait..... Refreshing Site Progress Data.",
                                          spinner : "bubbles",
                                          showBackdrop: false,
                                          dismissOnPageChange : false
                                      });
    loader.present();
    this.refreshSiteData(loader, true);
}
MesageCodeDescription(code: number){
   let reason: string;
     switch(code){
                       case 1:
                                  reason = 'Housebuilding User account disabled.';
                                        break;
                                  case 2:
                                       reason = 'Housebuilding User account locked.';
                                       break;
                                  case 3:
                                       reason = 'No Locations found.';
                                       break;  
                                  case 4:
                                      reason = "Invalid payload."  ;
                                      break;
                                  case 5:
                                      reason = "No Stages found.";
                                      break;
                                  case 6:
                                      reason = "Internal Error.";
                                      break; 
                                  case 7:
                                      reason = "No approved Budget found.";
                                      break;
                                  case 8:
                                        reason = "Duplicate Image.";
                                        break;
                                  case 10:
                                      reason = "Budget processing in progress. Please try later.";
                                      break;
                                    default:
                                  reason = 'Unspecified Error';
                                }
              return reason;                   
}

showMessage(message){
       let toast = this.toastCtrl.create({
          message: message,
          duration: 7000,
          showCloseButton: true,
          closeButtonText: "Close",
          position: 'bottom'
      });
      toast.present();
   }
  
  refreshSiteData(loader: any, standAlone: boolean){
     loader.data.content = "Please wait.. Removing site data";
      this.database.removeSiteData(this.siteID, false, false).then((data) =>
        {                   
            loader.data.content = "Please wait.. Downloading Plot Data";
            this.sublocationservice.getPlots(this.token, this.relay,this.siteID, this.debugModeOn).subscribe((data : any) => {                                                   
                let plotdata: any =  data.Locations;  
                let plotList: any = plotdata.returnData;            
               // console.log("inserting plots count: " + plotList.lenght);
               loader.data.content = "Please wait.. Saving Plot Data";
                this.database.saveAllPlots(plotList, this.siteID).then((plSaved) =>{
                   loader.data.content = "Please wait.. Downloading Stage Data";
                 this.sublocationservice.getStages(this.token, this.relay,this.siteID, this.debugModeOn).subscribe((stagedata: any) => {         
                            let stageData: any =  stagedata.Stages;
                            let headers: any = stageData.stageHeaderData;
                            let stages: any = stageData.stageData;
                          loader.data.content = "Please wait.. Saving Stage Data";       
                  this.database.saveAllHeadersAndStages(headers, stages, this.siteID).then((sSaved)=>{
                      loader.data.content = "Please wait.. Downloading Budget Progress  Data";
                      this.sublocationservice.getPlotProgress(this.token, this.relay,this.siteID, this.debugModeOn).subscribe((responsedata: any) => {          
                         let progressData: any = responsedata.BudgetData;
                        console.log(responsedata.MessageCode  + " - " + progressData.returnCount + " - " + progressData.appMeasureReturnCount);
                        loader.data.content = "Please wait.. Saving Budget Progress  Data";
                          this.database.InsertAllPlotStageProgressAndAppMeasureItems(progressData.returnData, progressData.appMeasureReturnData).then((proSaved) =>
                          {
                              if (standAlone){
                                    this.showMessage("Site data has been refreshed.");
                                     this.viewCtrl.dismiss();
                              }
                              else{
                                this.showMessage("Site Progress has been submitted successfully and current site data has been refreshed.");
                              }
                             
                              loader.dismiss();
                          },
                          (error) =>{
                              loader.dismiss();
                          }); 
                      },(error)=>{
                         loader.dismiss();
                      });
                    },
                  (error) => {
                  console.log(error); 
                  loader.dismiss(); 
                  });
                },
              (error) => {
                console.log(error); 
                 loader.dismiss(); 
              });
             },
              (error) => {
                console.log(error); 
              loader.dismiss(); 
              });    
            },
              (error) => {
                console.log(error); 
              loader.dismiss(); 
              });    
          },
           (error) => {
            console.log(error); 
            loader.dismiss(); 
        });   
  }

validateToken(){   
  return new Promise((resolve, reject) =>{
      this.regService.ValidateToken(this.token, this.debugModeOn).then((data: any) =>{
                  this.relay = data.RelayChannel.toString();                
                      resolve(data);
                    },
                    (error)=>{
                      reject(error);
                    });      
        });            
  }

    getAppSettings(){
     this.database.getAppSettings().then((settings: any)=>{
       this.debugModeOn = settings.DebugModeOn;
     });
   } 

}
