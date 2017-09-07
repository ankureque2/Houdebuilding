import { Component, OnInit, NgZone, ViewChild, AfterViewInit } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController, PopoverController, Content} from 'ionic-angular';
import {PlotsService} from '../../providers/plotsservice';
import {SubLocation} from '../br.classes/sublocation';
import {ConstructionStage, ConstructionStageHeader} from '../br.classes/constructionstage'
import {Database} from '../../providers/database';
import {GetPlotsResponseMessage, SubLocationsList, GetStagesResponseMessage, GetPlotProgressResponseMessage, StagesList} from '../../providers/plotsserviceresponse'
import {PlotPage}  from '../plot/plot';
import {StageListPage}  from '../stagelist/stagelist';
import {Sites} from '../sites/sites';
import {PopoverPage} from './popoverpage';
import {DownloadedSite}  from '../sites/site';
import {RegistrationInfo} from '../register/registrationdata';
import{RegistrationService} from "../../providers/registration-service";
/*
  Generated class for the DetailsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'sublocations.html'
})

export class SublocationsPage implements OnInit, AfterViewInit{
  site: DownloadedSite;
  token : string;
  relay: string;
  plots : SubLocation[]; 
  download: boolean;
  ResponseData: any;
  filteredList : SubLocation[];
  loader: any;
  debugModeOn: Boolean;
  @ViewChild(Content) content: Content;
constructor(private nav: NavController,
            public params: NavParams,           
            private dataservice: Database,
            private sublocationservice: PlotsService,
            private regService: RegistrationService,
            public toastCtrl: ToastController,
            private loadingCtrl: LoadingController,
            private popoverCtrl: PopoverController) {
    
            this.site = <DownloadedSite> this.params.get("site");
            this.token = this.params.get("token");
         }  
    
    public ngOnInit() {
        console.log("selected site- " +  this.site.recordID);
        this.getAccessInfo();
        this.getAppSettings();
        this.populatePlots();
      }

reloadContent(){
setTimeout(() => {     
       this.content.resize();
    }, 100);
}

public ngAfterViewInit() {
 return Promise.resolve(true);
 }
    
  ionViewWillEnter (){
           
  }  

 private populatePlots(): void {   
     try{
            this.loader = this.loadingCtrl.create({
                                        content: "Please wait...Populating plots.",
                                        spinner : "bubbles",
                                        showBackdrop: false,
                                        dismissOnPageChange : false,      
                                    });
        this.loader.present();
         this.dataservice.getPlots(this.site.recordID).then((result) => {
                this.filteredList = <SubLocation[]> result;
                this.plots =  <SubLocation[]> result;         
                this.download = (this.plots.length < 1);            
         if (this.loader){
                    this.loader.dismiss().catch(() => { });
                }       
        }, (error) => {
                console.log("ERROR: ", error.message);
                if (this.loader){
                     this.loader.dismiss().catch(() => { });
                }                
      });
     }
     catch(exept) {
          console.log(exept);
     }
     
    }

    presentPopover(myEvent) {
        if (this.plots.length > 0 && ! this.download ){
           let popover = this.popoverCtrl.create(PopoverPage, {siteID: this.site.recordID,  token:this.token, relay: this.relay});
              popover.present({
                ev: myEvent
              });
              popover.onDidDismiss((data) => {
                if (data && data.deleted && data.deleted === true){        
                  this.nav.setRoot(Sites,{token: this.token});           
                } 
                if (data && data.refresh && data.refresh === true){
                  this.populatePlots();
                }
              });
        }     
    }
    
  searchPlots(ev: any) {
       // set val to the value of the searchbar
    let val = ev.target.value;
    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {    
      this.filteredList = this.plots.filter((item) => {
        return (item.primaryName.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    }
    else{
      this.filteredList = this.plots;
    }
  }

  downloadSite(){    
     if (this.token){
          this.getDataFromHousebuilding();
     }
     else{
        this.getAccessInfo().then((data) =>
          { 
            this.getDataFromHousebuilding();
          }, (error) =>{
              
          });     
     }       
  }

 getDataFromHousebuilding(){
   this.loader = this.loadingCtrl.create({
                                        content: "Please wait...Downloading Site data.",
                                        spinner : "bubbles",
                                        showBackdrop: false,
                                        dismissOnPageChange : false,      
                                    });
  this.loader.present();  
   this.dataservice.saveSite(this.site, true);
   this.validateToken().then(()=>{
      this.loader.data.content = "Please wait.. Downloading Plot Data";
      this.sublocationservice.getPlots(this.token, this.relay, this.site.recordID, this.debugModeOn).subscribe(data => 
        { this.ResponseData = data;                                         
          let returnMessage  = <GetPlotsResponseMessage> this.ResponseData;
          let plotdata = <SubLocationsList> returnMessage.Locations;  
          let plotList = plotdata.returnData;
          if (plotList && plotList.length > 0){
             //  console.log(plotList.length);
               this.loader.data.content = "Please wait.. Saving Plot Data";
           this.dataservice.saveAllPlots(plotList, this.site.recordID).then((data) => {                                                                          
                  this.loader.data.content = "Please wait.. Downloading Stage Data";
                 this.sublocationservice.getStages(this.token, this.relay, this.site.recordID, this.debugModeOn).subscribe(data => 
                    {this.ResponseData = data;
                      let returnMessage  = <GetStagesResponseMessage> this.ResponseData;
                      let stageData = <StagesList> returnMessage.Stages;
                      let headers = stageData.stageHeaderData;
                      let stages = stageData.stageData;  
                      // console.log(stageData.stageHeaderCount +  "headers and " + stageData.stageCount + " stages inserted");
                        this.loader.data.content = "Please wait.. Saving Stage Data"; 
                      if (stageData.stageHeaderCount > 0 && stageData.stageCount > 0)
                        {
                          this.dataservice.saveAllHeadersAndStages(headers, stages, this.site.recordID).then((saved)=>{
                           this.loader.data.content = "Please wait.. Downloading Budget Progress  Data";
                              this.sublocationservice.getPlotProgress(this.token, this.relay, this.site.recordID, this.debugModeOn).subscribe((progressRespData:any) => {                   
                                 let progressData = progressRespData.BudgetData;
                                   this.loader.data.content = "Please wait.. Saving Budget Progress  Data";
                                 // console.log(progressRespData.MessageCode  + " - " + progressData.returnCode + "-" + progressData.returnCount + " - " + progressData.appMeasureReturnCount);                                              
                                if(progressRespData.MessageCode === 0){
                                  //console.log(progressData.appMeasureReturnData);
                                  this.dataservice.InsertAllPlotStageProgressAndAppMeasureItems(progressData.returnData, progressData.appMeasureReturnData).then((progSaved)=>{
                                      
                                       this.loader.data.content = "Please wait.. Populating Plots";                                     
                                       this.dataservice.getPlots(this.site.recordID).then((result) => {
                                       this.filteredList = <SubLocation[]> result;
                                       this.plots =  <SubLocation[]> result;         
                                       this.download = (this.plots.length < 1);    
                                       this.content.scrollToTop(300);
                                       this.reloadContent();     
                                      this.loader.dismiss();
                                    }, (error) => {
                                            console.log("ERROR: ", error.message);
                                            this.loader.dismiss();
                                  });    
                                },(error) =>{
                                      this.loader.dismiss();
                                      console.log(error);
                                      this.showErrorOccuredMessage(error.message);
                                  });
                                }else{
                                   console.log("nothing to save");
                                  this.showWarningOccuredMessage("No progress information received");
                                  this.loader.dismiss();
                                  this.populatePlots();
                                   this.content.scrollToTop(300);
                                       this.reloadContent(); 
                                }                        
                            },
                            (error) => {
                              this.showErrorOccuredMessage(error.message);
                               this.populatePlots();
                                   this.content.scrollToTop(300);
                                       this.reloadContent(); 
                                console.log(error);                          
                            });                                
                                },(error)=>{
                                  this.loader.dismiss();
                                   this.populatePlots();
                                   this.content.scrollToTop(300);
                                   this.reloadContent(); 
                              });         
                        }   
                        else{        
                            this.showWarningOccuredMessage("No constuction stage information received.");    
                             this.loader.dismiss();
                             this.populatePlots(); 
                            this.content.scrollToTop(300);
                            this.reloadContent();    

                        }       
                }, (error) => {
                          console.log(error);
                          this.showErrorOccuredMessage(error.message);
                          this.loader.dismiss();
                          this.populatePlots();
                          this.content.scrollToTop(300);
                          this.reloadContent(); 
                });
            },
              (error) =>{
                  console.log(error);
              });   
           }
           else{
                  this.showWarningOccuredMessage(" No plot information received.");                       
                  this.loader.dismiss();
            }                
       }, (error) => {
                      console.log(error);
                      this.showErrorOccuredMessage(error.message);
                       this.loader.dismiss();
               });  
     }, (error) =>{
       this.loader.dismiss();
       this.showErrorOccuredMessage(error.message);
     });      
 }
  // downloadPlots(){  
  //      this.getAccessInfo()
  //         this.loader = this.loadingCtrl.create({
  //                                       content: "Please wait...Downloading Site data.",
  //                                       spinner : "bubbles",
  //                                       showBackdrop: false,
  //                                       dismissOnPageChange : true,      
  //                                   });
  //           this.loader.present();
  //           let errorMsg: any;

  //           this.dataservice.saveSite(this.site, true);
  //           this.sublocationservice.getPlots(this.token, this.site.recordID)
  //                    .subscribe(data => {this.ResponseData = data; 
                                         
  //                 let returnMessage  = <GetPlotsResponseMessage> this.ResponseData;
  //                 let plotdata = <SubLocationsList> returnMessage.Locations;  
  //                 let plotList = plotdata.returnData;
  //               if (plotList && plotList.length > 0){
  //                     this.plots = new Array <SubLocation>();
  //                            this.loader.data.content = "Please wait.. Saving Plot Data";
  //                             for (let pl of plotList)
  //                              {
  //                                 let l = new SubLocation(pl.recordID, this.site.recordID, pl.primaryName, 
  //                                                          pl.shortCode, pl.houseTypeName, pl.houseTypeAltNAme, pl.locationOrder);                    
  //                                   this.dataservice.savePlot(l.recordID, l.siteID, l.primaryName,
  //                                                                 l.shortCode, l.houseTypeName, l.houseTypeAltName, l.locationOrder).
  //                                                                 then((data) => {
  //                                                                     this.plots.push(l);
  //                                                                 });                                                                
  //                                   } 
  //                     this.getStages();
  //                   }
  //               else{
  //                      this.showWarningOccuredMessage("This Site has no Plots");                       
  //                     this.loader.dismiss();
  //               }
                       
                  
  //              }, (error) => {
  //                     console.log(error);
  //                     this.showErrorOccuredMessage(error.message);
  //                      this.loader.dismiss();
  //              });      
  //     }      

//  getStages(){  
//                    this.loader.data.content = "Please wait.. Downloading Stage Data";
//                  this.sublocationservice.getStages(this.token, this.site.recordID)
//                             .subscribe(data => {this.ResponseData = data;
                 
//                   let returnMessage  = <GetStagesResponseMessage> this.ResponseData;
//                   let stageData = <StagesList> returnMessage.Stages;
//                   let headers = stageData.stageHeaderData;
//                   let stages = stageData.stageData;  
//                     this.loader.data.content = "Please wait.. Saving Stage Data";           
//                 for (let header of headers)
//                 {
//                   this.dataservice.saveConstructionStageHeader(header.recordID, this.site.recordID, header.name,
//                                                                 header.buildOrder);
//                 }

//                 for (let stage of stages)
//                 {
//                   this.dataservice.saveConstructionStage(stage.constructionStageID, stage.constructionHeaderID,
//                                                          this.site.recordID, stage.description, stage.buildOrder);
//                 }

//               console.log(stageData.stageHeaderCount +  "headers and " + stageData.stageCount + " stages inserted");                

//               if (stageData.stageHeaderCount > 0 && stageData.stageCount > 0)
//               {                
//                 //this.getProgress();
//                 this.getAllPlotProgress();
//               }
//               else{        
//                 this.showWarningOccuredMessage("This Site has no constuction stages");
//                 this.filteredList = this.plots;
//                this.download = (this.plots.length < 1);
//                this.loader.dismiss();
//               }
                                      
//             }, (error) => {
//                       console.log(error);
//                       this.showErrorOccuredMessage(error.message);
//                        this.loader.dismiss();});   
//       }  

//  getProgress(){    

//         this.dataservice.getPlots(this.site.recordID).then((result) => {      
//                               let processPlots = <SubLocation[]> result;
//                               this.getPlotProgress(processPlots);                  
//           }, (error) => {
//                 console.log("ERROR: ", error.message);
//                  this.showErrorOccuredMessage(error.message);
//                  this.loader.dismiss();
//             });                  
//   }

showWarningOccuredMessage(errMessage: string){
     let toast = this.toastCtrl.create({
          message: 'Budget data download finished with following warning' + ' - ' + errMessage,
          duration: 10000,
          position: 'top',
          showCloseButton: true,
         closeButtonText: 'Close'
      });
      toast.present();
   }

showErrorOccuredMessage(errMessage: string){
     let toast = this.toastCtrl.create({
          message: 'Error occured while Saving Budget data' + ' - ' + errMessage,
          duration: 10000,
          position: 'top',
          showCloseButton: true,
         closeButtonText: 'Close'
      });
      toast.present();
   }

// getPlotProgress(plots: SubLocation[]){    
//    if (plots && plots.length > 0)
//    {    
//      var targetPlot = plots.shift(); 
//         if (!this.loader)
//         {
//           this.loader = this.loadingCtrl.create({
//                                               content: "Please wait...Saving " + targetPlot.primaryName + " budget Progress.",
//                                               showBackdrop: false,
//                                               spinner : "bubbles",
//                                               dismissOnPageChange : true,      
//                                           });      
//           this.loader.present();
//         }  
//     console.log("site:" + this.site.recordID + " plotId: " + targetPlot.recordID);
//            this.sublocationservice.getPlotProgress(this.token, targetPlot.recordID)
//                       .subscribe(data => {                      
//                          this.ResponseData = data;                     
//                          let returnMessage  = <GetPlotProgressResponseMessage> this.ResponseData;
//                          let progressData = returnMessage.BudgetData;
//                         console.log(returnMessage.MessageCode  + " - " + progressData.returnCount + " - " + progressData.appMeasureReturnCount);
//                         //console.log(progressData);
//                          if (progressData.returnCode == 0 && progressData.returnCount && progressData.returnCount > 0)
//                            {                    
//                              let plotsProgress = progressData.returnData;               
                            
//                                for (let progress of plotsProgress)
//                                {
//                                  if(progress){
//                                    this.dataservice.insertPlotConstructionStage(progress.plotID, progress.constructionStageID, progress.currentWorkProgress).
//                                    then((data) => {
                                                                        
//                                    },
//                                    (error) => {
//                                      console.log(error);
//                                    }); 
//                                  }                                                  
//                                }                                                      
//                            }
//                            if (progressData.returnCode === 0 && progressData.appMeasureReturnData && progressData.appMeasureReturnCount > 0){
//                                 let AppmeasureItems = progressData.appMeasureReturnData;
//                                 for (let app of AppmeasureItems){
//                                   if (app){
//                                     this.dataservice.insertAppmeasureItem(app.recordID, app.subLocationID, app.constructionStageID,               
//                                                                           app.description , app.units, app.MOSqty, app.resQty, app.prgQty);
//                                   }
//                                 }
//                            }                                                          
//                        },
//                        (error) => {
//                            console.log(error);                                
//                        }, () =>{         
//                          if (plots && plots.length > 0){
//                             this.getPlotProgress(plots);
//                          }  
//                          else{
//                             if(this.loader){
//                               this.loader.dismiss();
//                            }          
//                            console.log("finished - ");
//                           this.populatePlots();
                                           
//                          }         
//                        }); 
//    }
//   else{ 
//         console.log("all done" + this.plots.length);
//         this.filteredList = this.plots;
//         this.download = (this.plots.length < 1);    
//         if(this.loader){ 
//         this.loader.dismiss();
//         }   
//  }
// }

// getAllPlotProgress(){    
  
//         if (!this.loader)
//         {
//           this.loader = this.loadingCtrl.create({
//                                               content: "Please wait...Saving  budget Progress.",
//                                               showBackdrop: false,
//                                               spinner : "bubbles",
//                                               dismissOnPageChange : true,      
//                                           });      
//           this.loader.present();
//         } 
//         else{
//            this.loader.data.content = "Please wait.. Downloading Budget Progress  Data";
//         } 
    
//            this.sublocationservice.getPlotProgress(this.token, this.site.recordID)
//                       .subscribe((data:any) => {                      
//                         // this.ResponseData = data;                     
//                         // let returnMessage  = <GetPlotProgressResponseMessage> data;
//                          let progressData = data.BudgetData;
//                         console.log(data.MessageCode  + " - " + progressData.returnCode + "-" + progressData.returnCount + " - " + progressData.appMeasureReturnCount);
//                                                //console.log(progressData);
                        
//                          if (progressData.returnCode == 0 && progressData.returnCount && progressData.returnCount > 0)
//                            {                    
//                            //  let plotsProgress = progressData.returnData;               
//                              this.loader.data.content = "Please wait.. Saving Budget Progress  Data";
//                                for (let progress of progressData.returnData)
//                                {
//                                  if(progress){
//                                    this.dataservice.insertPlotConstructionStage(progress.plotID, progress.constructionStageID, progress.currentWorkProgress);                                   
//                                  }                                                  
//                                }                                                      
//                            }
//                            if (progressData.returnCode === 0 && progressData.appMeasureReturnData && progressData.appMeasureReturnCount > 0){
//                                // let AppmeasureItems = progressData.appMeasureReturnData;
//                                 for (let app of progressData.appMeasureReturnData){
//                                   if (app){
//                                     this.dataservice.insertAppmeasureItem(app.recordID, app.subLocationID, app.constructionStageID,               
//                                                                           app.description , app.units, app.MOSQty, app.reqQty, app.prgQty);
//                                   }
//                                 }
//                            }
//                               console.log("data saved");
//                               if (this.plots && this.plots.length > 0){
//                                 (console.log("we have plots - " + this.plots.length));
//                                 this.filteredList = new Array<SubLocation>();
//                                 this.filteredList = this.plots;
//                                 this.download = false;
//                                 this.content.resize();
//                                  if(this.loader){
//                                     this.loader.dismiss();
//                                   }                                                    
//                               }
//                               else{
//                                 console.log("we dont have plots");

//                                 this.dataservice.getPlots(this.site.recordID).then((result) => {
//                                                       this.filteredList = new Array<SubLocation>();
//                                                       this.plots = new Array<SubLocation>();
//                                                       this.filteredList = <SubLocation[]> result;
//                                                       this.plots =  <SubLocation[]> result;
//                                                     this.download = (this.plots.length < 1);
//                                                     console.log("reload completed");
//                                                     this.content.resize();
//                                                     if(this.loader){
//                                                       this.loader.dismiss();
//                                                     }
//                                                 },
//                                                 (plerror)=>{
//                                                   console.log(plerror);
//                                                       if(this.loader){
//                                                       this.loader.dismiss();
//                                                     }
//                                                 });
//                               }
                        
//                         console.log("code end");                     
//                        },
//                        (error) => {
//                            console.log(error);                          
//                        }); 
//    }

openPlot(plotID: number, siteID: number){
     let plot = this.plots.find(p=>p.recordID == plotID);
     this.nav.push(StageListPage,{siteID: siteID, plot: plot, plots: this.filteredList})
   }

getAccessInfo(){
      return new Promise((resolve, reject) => {
            this.dataservice.getActivationInfo().then((result) => {
                let activationData = <RegistrationInfo> result;                      
                      this.token = activationData.accesstoken;  
                      this.relay = activationData.relaychannel.toString();  
                     resolve(this.token);                                                                   
            }, (error) => {
                reject(error);
            });
         });
   }

  getAppSettings(){
     this.dataservice.getAppSettings().then((settings: any)=>{
       this.debugModeOn = settings.DebugModeOn;
     });
   } 

validateToken(){   
  return new Promise((resolve, reject) =>{
      this.regService.ValidateToken(this.token,  this.debugModeOn).then((data: any) =>{
                  this.relay = data.RelayChannel.toString();                 
                      resolve(data);
                    },
                    (error)=>{
                      reject(error);
                    });      
        });            
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
                                    default:
                                  reason = 'Error occured';
                                }
              return reason;                   
}

}