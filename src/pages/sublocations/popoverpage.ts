import {Component} from '@angular/core';
import {ViewController, LoadingController, AlertController, ModalController,NavParams, ToastController} from 'ionic-angular';
import {Database} from '../../providers/database';
import {SiteService} from '../../providers/site-service';
import {PlotsService} from '../../providers/plotsservice';
import {Guid} from '../br.classes/guid';
import {AppMeasureItemNote} from '../br.classes/appmeasureitem'
import {Device, File, FileReader, FileEntry, DirectoryEntry} from 'ionic-native';
import {BudgetProgress, BudgetProgressNotes, AppMeasureProgress, SiteProgressRequest} from '../../providers/progressupdaterequest';
import {SiteProgressResponse} from '../../providers/progressupdateresponse';
import {SubLocationConStageImage} from '../br.classes/sublocationconstageattachments'; 
import {BudgetImage} from  '../../providers/progressimagerequest';
import {PlotStageProgress} from '../br.classes/sublocation';
import {SubmitSitePage} from '../submitsite/submitsite';
import {ProgressresultsPage} from '../progressresult/progressresults';

@Component({
  template: `
    <ion-list>          
      <button ion-item (click)="showSubmitPage()"><ion-icon item-left name="cloud-upload"></ion-icon>Submit Site Progress</button>   
      <button ion-item text-wrap (click)="showSubmitImagesQuestion()"><ion-icon item-left name="photos"></ion-icon>Submit Progress Photos</button> 
      <button ion-item text-wrap (click)="showPreviousResults(siteID)"><ion-icon item-left name="paper"></ion-icon>Progress Submit Results</button>
      <button ion-item (click)="showStageResetQuestion(siteID)"><ion-icon item-left name="refresh"></ion-icon>Reset Progress</button>
      <button ion-item text-wrap (click)="showAppMeasureResetQuestion()"><ion-icon item-left name="ios-refresh-circle-outline"></ion-icon>Reset AppMeasure Items</button>   
      <button ion-item text-wrap (click)="RedownloadSiteQuestion()"><ion-icon item-left name="cloud-download"></ion-icon>Redownload Site</button>   
      <button ion-item (click)="presentConfirmDelete(siteID)"><ion-icon item-left name="trash"></ion-icon>Delete Site</button>      
    </ion-list>
  `
})
export class PopoverPage {
siteID: number;
token: string;
relay: string;
debugModeOn: Boolean;
constructor(private viewCtrl: ViewController,
              private loadingCtrl: LoadingController,
              private  params: NavParams,
              private database : Database,
              private toastCtrl: ToastController,
              private siteService: SiteService,
              private alertCtrl: AlertController,
              private modalController : ModalController,
              private sublocationservice: PlotsService)
              {

    this.siteID = <number> params.get("siteID");
    this.token = params.get("token");   
    this.relay = params.get("relay");  
     
      this.getAccessInfo();
      this.getAppSettings();   
  }

  close() {
    this.viewCtrl.dismiss();
  }

  showSubmitPage(){
    var param = {siteID: this.siteID,  token:this.token};
    let modal = this.modalController.create(SubmitSitePage, param);
    modal.present();  
     this.viewCtrl.dismiss();
  }

 showSubmitImagesQuestion(){
    let alert = this.alertCtrl.create({
        title: 'Confirm submit',
        message: 'Do you wish to submit Budget progress photos to Housebuilding server?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Submit',
            handler: () => {
            this.SendBudgetProgressImages();
            }
          }
        ]
      });
  alert.present();
}

RedownloadSiteQuestion(){
 let alert = this.alertCtrl.create({
        title: 'Confirm Redownload',
        message: 'Do you wish to Redownload Site from Housebuilding server?  This will reset all new progress values, notes and images for this site',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Redownload',
            handler: () => {
            this.RedownloadSite();
            }
          }
        ]
      });
  alert.present();
}

showDownloadErrorOccuredMessage(errMessage: string){
     let toast = this.toastCtrl.create({
          message: 'Error occured while downloading Site' + ' - ' + errMessage,
          duration: 10000,
          position: 'top',
          showCloseButton: true,
         closeButtonText: 'Close'
      });
      toast.present();
   }

showDownloadWarningOccuredMessage(errMessage: string){
     let toast = this.toastCtrl.create({
          message: 'Site download finished with following warning' + ' - ' + errMessage,
          duration: 10000,
          position: 'top',
          showCloseButton: true,
         closeButtonText: 'Close'
      });
      toast.present();
   }  

RedownloadSite(){
     let loader = this.loadingCtrl.create({
                                        content: "Please wait.. Removing site data",
                                        spinner : "bubbles",
                                        showBackdrop: false,
                                        dismissOnPageChange : false                                       
                                    });
          loader.present(); 
    
      this.database.removeSiteData(this.siteID, false, true).then((data) =>
        {                   
            loader.data.content = "Please wait.. Downloading Plot Data";
            this.sublocationservice.getPlots(this.token, this.relay, this.siteID, this.debugModeOn).subscribe((data : any) => {                                                   
                let plotdata: any =  data.Locations;  
                let plotList: any = plotdata.returnData;            
               // console.log("inserting plots count: " + plotList.lenght);
               loader.data.content = "Please wait.. Saving Plot Data";
                this.database.saveAllPlots(plotList, this.siteID).then((plSaved) =>{
                   loader.data.content = "Please wait.. Downloading Stage Data";
                 this.sublocationservice.getStages(this.token, this.relay,  this.siteID, this.debugModeOn).subscribe((stagedata: any) => {         
                            let stageData: any =  stagedata.Stages;
                            let headers: any = stageData.stageHeaderData;
                            let stages: any = stageData.stageData;
                          loader.data.content = "Please wait.. Saving Stage Data";       
                  this.database.saveAllHeadersAndStages(headers, stages, this.siteID).then((sSaved)=>{
                      loader.data.content = "Please wait.. Downloading Budget Progress  Data";
                      this.sublocationservice.getPlotProgress(this.token, this.relay, this.siteID, this.debugModeOn).subscribe((responsedata: any) => {          
                         let progressData: any = responsedata.BudgetData;
                      //  console.log(responsedata.MessageCode  + " - " + progressData.returnCount + " - " + progressData.appMeasureReturnCount);
                      if(responsedata.MessageCode === 0){
                            loader.data.content = "Please wait.. Saving Budget Progress  Data";
                       
                          this.database.InsertAllPlotStageProgressAndAppMeasureItems(progressData.returnData, progressData.appMeasureReturnData).then((proSaved) =>
                          {                             
                              this.showMessage("Site data has been redownloaded.");
                              loader.dismiss();
                              this.viewCtrl.dismiss({refresh: true});                             
                          },
                          (error) =>{
                               this.showDownloadErrorOccuredMessage(error.message);
                              loader.dismiss({refresh: true});
                          });
                      }
                       else{
                            this.showDownloadWarningOccuredMessage("no progress information received");
                            loader.dismiss({refresh: true});
                       }
               
                      },(error)=>{
                         this.showDownloadErrorOccuredMessage(error.message);
                         loader.dismiss({refresh: true});
                      });
                    },
                  (error) => {
                  console.log(error); 
                   this.showDownloadErrorOccuredMessage(error.message);
                  loader.dismiss({refresh: true}); 
                  });
                },
              (error) => {
                console.log(error); 
                 this.showDownloadErrorOccuredMessage(error.message);
                 loader.dismiss({refresh: true}); 
              });
             },
              (error) => {
                console.log(error); 
                 this.showDownloadErrorOccuredMessage(error.message);
              loader.dismiss({refresh: true}); 
              });    
            },
              (error) => {
                console.log(error); 
                this.showDownloadErrorOccuredMessage(error.message);
              loader.dismiss({refresh: true}); 
              });    
          },
           (error) => {
            console.log(error); 
            loader.dismiss({refresh: true}); 
        }); 
}

SendBudgetProgressImages(){
   let loader = this.loadingCtrl.create({
                                        content: "Please wait...Submitting Site Progress Photos.",
                                         spinner : "bubbles",
                                        showBackdrop: false,
                                        dismissOnPageChange : false       
                                    });
    loader.present();
  let  stageImages: SubLocationConStageImage[];         
  this.database.getSiteProgressImages(this.siteID).then((data) =>
             {
                console.log("got images");   
              try{
                  stageImages = <SubLocationConStageImage[]> data;

              }
              catch(e){
                console.log(e);
              }         
             // console.log(this.debugModeOn);                                 
            if (stageImages.length > 0 ){               
                let  totalImages = stageImages.length;
                let processedImages: number = 0;
                 loader.data.content = "Please wait..... Processing " + totalImages + " image(s).";
                for (let photo of stageImages)
                  {                                                               
                   let sourceFileName: string = Guid.newGuid() + ".jpg";    
                   this.database.getImageByRecordID(photo.RecordID).then((base64: any) =>{
                   let budgetPhoto = new BudgetImage(this.siteID, photo.SublocationID, photo.ConStageID,
                                                      base64, photo.PhotoDateTime, sourceFileName) ;                                                  
                        //let imageprocessCount: number =  stageImages.indexOf(photo);                       
                        try{
                        //  console.log("trying image" + sourceFileName);
                               this.siteService.submitSiteProgressPhoto(this.token, this.relay, budgetPhoto, this.debugModeOn).subscribe((data) =>                                                                  
                                       {     
                                        // console.log(data);                                                                                                                               
                                          if (data.MessageCode === 0 || data.MessageCode === 8){
                                                 processedImages += 1;
                                                 this.database.deletePlotConstructionStageAttachment(photo.RecordID);
                                         }
                                             if (stageImages.indexOf(photo)=== stageImages.length - 1){
                                                    loader.dismiss(); 
                                                    this.showMessage(processedImages + " image(s) out of "+ totalImages + " sent successfully.");                                                           
                                              }                                                                                            
                                      }, (error) => {
                                                      if (stageImages.indexOf(photo)=== stageImages.length - 1){
                                                            loader.dismiss(); 
                                                            this.showMessage(processedImages + " image(s) out of "+ totalImages + " sent successfully.");                                                              
                                                     }        
                                                               console.log(error);                                                                     
                                           });
                        }
                        catch(e){
                                    if (stageImages.indexOf(photo)=== stageImages.length - 1){
                                         if(loader){
                                         loader.dismiss();
                                         this.showMessage(processedImages + " image(s) out of "+ totalImages + " sent successfully.");
                                        }
                                     }          
                        }              
                          },(error) =>{
                                console.log(error);
                          });         
                      }                                      
                    }
                else{
                      this.showMessage("There are no images to upload!");
                      loader.dismiss();
                  }                             
                },
                (error) =>{
                  console.log(error);
                   loader.dismiss();
                }); 
}

prepareSiteData() {
  return  new Promise((resolve,reject) => {
  
    let budgetProgress: BudgetProgress[];
    let budgetNotes: BudgetProgressNotes[];
    let appProgress: AppMeasureProgress[];
    let appnotes : AppMeasureItemNote[];

    this.database.getSiteBudgetProgress(this.siteID).then((result) =>{
         budgetProgress = <BudgetProgress[]> result;
          this.database.getSiteBudgetNotes(this.siteID).then((result) =>{
            budgetNotes = <BudgetProgressNotes[]> result;
             this.database.getSiteAppmeasureProgress(this.siteID).then((result) => {
                appProgress = <AppMeasureProgress[]> result;
                  this.database.getSiteAppmeasureNotes(this.siteID).then((result) =>{
                    appnotes = <AppMeasureItemNote[]> result;
                      let request = new SiteProgressRequest();                          
                            request.progressData = budgetProgress;
                            request.appMeasureProgressData = appProgress;
                            resolve (request);
                  }, error =>{ 
                    reject(error);
                    });
             },error=> { reject(error);
               });
          },error=> { reject(error);
                  });
      },error=> { reject(error);
                }); 
  });
}

submitSiteProgress(){
      let loader = this.loadingCtrl.create({
                                          content: "Please wait...submitting site progress.",
                                          showBackdrop: false,
                                          dismissOnPageChange : true
                                      });
    loader.present();
     let deviceID: string = Device.uuid;
    let transactionID: string = Guid.newGuid();

    this.prepareSiteData().then((data) => {
      let request = <SiteProgressRequest> data;
      request.deviceID = deviceID;
      request.transactionID = transactionID;
    
       this.siteService.submitSiteProgress(this.token, this.relay, request, this.debugModeOn).subscribe((data) => {

        let siteResponse = <SiteProgressResponse> data;
          this.database.InsertSiteProgressSubmitResponse(siteResponse, new Date().toISOString(), this.siteID).then((response) =>{
              loader.dismiss();
          }, (error) => {
             this.showMessage("Error occured while saving  progress response - ");
                  loader.dismiss();
          });  

          if (siteResponse.returnCode === 0){
                this.database.resetPlotProgressForSite(this.siteID);
                this.database.resetAppmeasureItemsForSite(this.siteID);
                this.showMessage("Site Progress has been submitted successfuly");
          }
      },
       error =>{
         this.showMessage("Error occured while submitting Site progress - " + error.message);
                  loader.dismiss();

      }, () => {
        console.log("completed");
      });
    }, (error) => {
            this.showMessage("Error occured while collecting progress data");
    }); 
    
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
  
  showStageResetQuestion(siteID : number){
    let alert = this.alertCtrl.create({
        title: 'Confirm reset',
        message: 'Do you wish to reset all of your stage progress data?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Reset',
            handler: () => {
            this.resetSiteProgress(siteID);
            }
          }
        ]
      });
  alert.present();
}

resetSiteProgress(siteID : number){
  let loader = this.loadingCtrl.create({
                                          content: "Please wait...resetting site progress.",
                                          showBackdrop: false,
                                          dismissOnPageChange : true
                                      });
    loader.present();
    this.database.resetPlotProgressForSite(siteID).then((data) =>
         { 
            loader.dismiss();
          }, 
       (error) =>{
                  loader.dismiss();
                 });
  }


showAppMeasureResetQuestion(){
    let alert = this.alertCtrl.create({
        title: 'Confirm reset',
        message: 'Do you wish to reset all of your AppMeasure Items progress?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Reset',
            handler: () => {
            this.resetAppMeasureItems();
            }
          }
        ]
      });
  alert.present();
}

 resetAppMeasureItems(){
      let loader = this.loadingCtrl.create({
                                          content: "Please wait...resetting appmeasure items.",
                                          showBackdrop: false,
                                          dismissOnPageChange : true
                                      });
    loader.present();
    this.database.resetAppmeasureItemsForSite(this.siteID).then((data) =>
         { 
            loader.dismiss();
          }, 
       (error) =>{
                  loader.dismiss();
                 });
  }

showPreviousResults(siteID: number){

var param = {siteID: this.siteID};
    let modal = this.modalController.create(ProgressresultsPage, param);
    modal.present();
     this.viewCtrl.dismiss();
}

presentConfirmDelete(siteID: number) {
  let alert = this.alertCtrl.create({
    title: 'Confirm Delete',
    message: 'Do you wish to delete the Site?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      },
      {
        text: 'Delete',
        handler: () => {
         this.removeSite(siteID);
        }
      }
    ]
  });
  alert.present();
}

removeSite(siteID: number){    

        let loader = this.loadingCtrl.create({
          content: "Please wait...Removing Site Data",
          showBackdrop: false,
          dismissOnPageChange : true,      
        });
      loader.present();
  
      this.database.removeSiteData(siteID, true, true).then((data) =>
        {                   
           this.siteService.siteRemoved(this.token, this.relay, siteID, this.debugModeOn).subscribe(data => {
             loader.dismiss();
              this.showSiteDeletedMessage(); 
                  this.viewCtrl.dismiss({deleted: true})
              }, error => {
                loader.dismiss();
                this.showDeleteErrorOccuredMessage();
                this.viewCtrl.dismiss({deleted: true});
           });      
         },(error) => {
           loader.dismiss();
           this.showDeleteErrorOccuredMessage();
         });
   }

    showSiteDeletedMessage(){
       let toast = this.toastCtrl.create({
          message: 'Site removed successfully',
           duration: 5000,
          showCloseButton: true,
          closeButtonText: "Close",
          position: 'bottom'
      });
      toast.present();
   }

   showDeleteErrorOccuredMessage(){
     let toast = this.toastCtrl.create({
          message: 'Error occured while removing the Site',
           duration: 7000,
          showCloseButton: true,
          closeButtonText: "Close",
          position: 'bottom'
      });
      toast.present();
   }

  getAccessInfo(){
      return new Promise((resolve, reject) => {
            this.database.getActivationInfo().then((result : any) => {                                
                      this.token = result.accesstoken;  
                      this.relay = result.relaychannel.toString();  
                     resolve(this.token);                                                                   
            }, (error) => {
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