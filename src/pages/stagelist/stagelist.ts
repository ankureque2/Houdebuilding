import {Component, AfterViewInit, ViewChild } from '@angular/core';
import {NavController, NavParams, PopoverController, LoadingController, Content, ModalController, ToastController} from 'ionic-angular';
import {SubLocation, PlotStageProgress, PlotStageDetails} from '../br.classes/sublocation';
import {ConstructionStage, ConstructionStageHeader} from '../br.classes/constructionstage';
import {Database} from "../../providers/database";
import {StagesPage} from "../stages/stages";
import {PlotFilterPage} from '../plot/plotfilteroptions';
import {UserSettings} from '../br.classes/usersettings';
import {PlotOptionsPage} from '../plot/plotoptions';
import {StageAppMeasureCount} from '../br.classes/appmeasureitem'
import {NotesPage} from '../notes/notes';
import {GalleryPage} from '../gallery/gallery';
import {Camera, ImagePicker, File, Keyboard, Diagnostic , ImagePickerOptions} from 'ionic-native';
import {AppmeasureitemsPage} from '../appmeasureitems/appmeasureitems';
declare var cordova: any;

@Component({
  selector: 'page-stagelist',
  templateUrl: 'stagelist.html'
})
export class StageListPage implements AfterViewInit {
  plots: SubLocation[];
  siteID: number;
  plotID: number;
  plot: SubLocation; 
  showAppOnlyStages: Boolean;
  hideCompletedStages: Boolean;
  showFooter: boolean;
  stages: ConstructionStage[];
  stageAppMeasureCount: StageAppMeasureCount[];
  plotStageProgress: PlotStageDetails[];
  filteredStageProgress: PlotStageDetails[];
  progressDate: string;
  imageQuality: number;
  @ViewChild(Content) content: Content;
loader: any;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private dataservice: Database,  private popoverCtrl: PopoverController,
              private loadingCtrl: LoadingController, private keyboard: Keyboard,
              private modalController: ModalController, private toastCtrl: ToastController ) {
     
      this.siteID = <number> this.navParams.get("siteID");
      this.plots = <SubLocation[]>this.navParams.get("plots");
      this.plot = <SubLocation> this.navParams.get("plot");     
      this.plotID = this.plot.recordID;  
      this.showFooter = true;   
      this.loadUserSettings();   
  }

public ngAfterViewInit() {

}

 public ionViewDidEnter(){    
     this.progressDate = new Date().toISOString();    
      Keyboard.onKeyboardShow().subscribe(()=>{this.keyboardShowHandler()})
      Keyboard.onKeyboardHide().subscribe(()=>{this.keyboardHideHandler()})
  }

showPlotOptions(myEvent){
    let popover = this.popoverCtrl.create(PlotOptionsPage, {plot: this.plot, plots: this.plots, stageview: true});
        popover.present({
        ev: myEvent
      });

      popover.onDidDismiss((data) => {
        if (data){
         if (data.reset === true){
            console.log(data);
            this.loadUserSettings();
            this.getPlotProgress();
         }
        }       
      });
  }

showFilter(myEvent){
     let popover = this.popoverCtrl.create(PlotFilterPage, {appOnly: this.showAppOnlyStages, 
                                              hideCompleted: this.hideCompletedStages});
          popover.present({
          ev: myEvent
      });
      popover.onDidDismiss((data) => {
        if (data){        
                this.loader = this.loadingCtrl.create({
                                          content: "Please wait...loading plot progress.",
                                          spinner : "bubbles",
                                          showBackdrop: false,
                                          dismissOnPageChange : false
                                      });
                this.loader.present();     
                this.showAppOnlyStages = data.appOnly;
                this.hideCompletedStages = data.hideCompleted;
                this.filteredStageProgress = new Array<PlotStageDetails>();
                for (let detail of this.plotStageProgress){
                      var filteredOut = false;                                        
                    if (this.hideCompletedStages.toString()=== 'true' && detail.currentProgress === 100)
                     {
                      filteredOut = true;
                      }   
                    if (this.showAppOnlyStages.toString() === 'true' && detail.AppMeasureCount === 0){
                          filteredOut = true;
                    }                                                                                
                        if (!filteredOut){
                             this.filteredStageProgress.push(detail);
                        }                             
                }
                this.dataservice.saveUserSettings(this.showAppOnlyStages, this.hideCompletedStages);                 
                 this.loader.dismiss();       
        }       
      });
  } 

reloadContent(){
    setTimeout(() => {     
       this.content.resize();
    }, 300);
}

getStages(){
      this.dataservice.getSiteConstructionStages(this.siteID).then((result)=>{        
      this.stages  = <ConstructionStage[]> result; });
}

 ionViewDidLoad() {
    this.loader = this.loadingCtrl.create({
                                          content: "Please wait...loading plot progress.",
                                          spinner : "bubbles",
                                          showBackdrop: false,
                                          dismissOnPageChange : false
                                      });
      this.loader.present();     
      this.getStages();
      this.getPlotProgress();     
  }

 public getPlotProgress(){
    let appMeasureCount : {stageID: number, itemCount: number}[]
    this.dataservice.getAppMeasureItemsCountForPlot(this.plotID).then((result)=> { 
                this.stageAppMeasureCount = <StageAppMeasureCount[]> result;    
                        this.dataservice.getPlotProgress(this.plotID).then((result) => {
                                let plotProgress = <PlotStageProgress[]> result;    
                                this.plotStageProgress = new Array<PlotStageDetails>();
                                this.filteredStageProgress = new Array<PlotStageDetails>();                             
                                for (let stage of this.stages){
                                        let progress = plotProgress.find(p=>p.ConStageID === stage.constructionStageID);
                                        if(progress){
                                              let appcount = this.stageAppMeasureCount.find(a=>a.StageID === progress.ConStageID);                                        
                                              let detail : PlotStageDetails;
                                        if (appcount){
                                            detail = new PlotStageDetails(progress.SubLocationID, progress.ConStageID, stage.constructionHeaderID, stage.description, progress, appcount.AppItemCount);
                                        }else{
                                            detail = new PlotStageDetails(progress.SubLocationID, progress.ConStageID, stage.constructionHeaderID, stage.description, progress, 0);
                                        }               
                                            this.plotStageProgress.push(detail);                                          
                                            var filteredOut = false;                                          
                                            if (this.hideCompletedStages.toString()=== 'true' && detail.currentProgress === 100)
                                            {
                                                filteredOut = true;
                                            }   
                                            if (this.showAppOnlyStages.toString() === 'true' && detail.AppMeasureCount === 0){
                                                filteredOut = true;
                                            }                                                                                  
                                            if (!filteredOut){
                                                    this.filteredStageProgress.push(detail);
                                            }                                    
                                        }                                 
                                }                                
                                 
                                if (this.loader){
                                       this.loader.dismiss().catch(() => { });
                                }                               
                              }
                            ,(error) => {
                                          console.log("ERROR: ", error.message);
                                           if (this.loader){
                                                     this.loader.dismiss().catch(() => { });
                                                 }   
                                       });
                          }, (error) =>{
                                   console.log("ERROR: ", error.message);   
                                      if (this.loader){
                                             this.loader.dismiss().catch(() => { });
                                        }   
                              }); 
}


 keyboardShowHandler(){   
        this.showFooter = false;
        this.reloadContent();
} 

keyboardHideHandler(){   

   this.showFooter = true;
   this.reloadContent();
}

loadUserSettings(){
    this.dataservice.getUserSettings().then((result: any) =>
                    {                       
                      if (result){
                      this.showAppOnlyStages = result.ShowStagesWithAppmeasureItemsOnly;
                      this.hideCompletedStages = result.HideCompletedStages;                     
                      }else{
                        this.showAppOnlyStages = false;
                         this.hideCompletedStages =false;
                      }
                      this.reloadContent();
                   },
                    (error) =>{
                      this.showAppOnlyStages = false;
                         this.hideCompletedStages =false;
                    });
                     this.dataservice.getAppSettings().then((setting: any )=>{
                            this.imageQuality = setting.ImageQuality;
                            }, (error) =>{
                                this.imageQuality = 100;
                            });
 }

 onProgressValueEntered(stage: PlotStageDetails, newValue: number){
     console.log(newValue);
    if (newValue <= 999 && newValue >= 0){
        stage.newProgressDate = this.progressDate;
        stage.newProgress = newValue;
        this.dataservice.updatePlotConstructionStage(stage.PlotID, stage.ConStageID, newValue, this.progressDate);
    }
    else{   
          this.dataservice.getPlotStageProgress(stage.PlotID, stage.ConStageID).then((result)=> 
              {
                let originalData = <PlotStageProgress> result;
                stage.newProgress = originalData.NewWorkProgress;                 
              },
              (error)=>{

              });    
    }
     this.reloadContent();    
}

changeProgressValue(stage: PlotStageDetails, progress: number){
    if(stage.HasProgress)
    {
      stage.newProgress = progress;
      stage.newProgressDate = this.progressDate;
      this.dataservice.updatePlotConstructionStage(stage.PlotID, stage.ConStageID, progress, this.progressDate); 
    }    
}

increaseProgressValue(stage:PlotStageDetails){
  if(stage.HasProgress && stage.newProgress < 100){
     stage.newProgress += 1
     stage.newProgressDate = this.progressDate;  
     this.dataservice.updatePlotConstructionStage(stage.PlotID, stage.ConStageID, stage.newProgress, this.progressDate);
  }
}

decreaseProgressValue(stage:PlotStageDetails){
  if(stage.HasProgress  && stage.newProgress > 0){
      stage.newProgress = stage.newProgress -1;
      stage.newProgressDate = this.progressDate;
      this.dataservice.updatePlotConstructionStage(stage.PlotID, stage.ConStageID, stage.newProgress, this.progressDate);
  }
}

checkCameraPermissions(progress: PlotStageDetails){
      Diagnostic.isCameraAuthorized().then((authorized) => {
          if(authorized)
              this.takePicture(progress);
          else {
              Diagnostic.requestCameraAuthorization().then((status) => {
                  if(status == Diagnostic.permissionStatus.GRANTED)
                     this.takePicture(progress);
                  else {
                      // Permissions not granted
                        this.toastCtrl.create(
                          {
                              message: "Cannot access camera", 
                              position: "bottom",
                              showCloseButton: true,
                              closeButtonText: "Close",
                              duration: 5000
                          }
                      ).present();
                  }
              });
          }
      });
}

takePicture(progress: PlotStageDetails) {
 if (!this.imageQuality){
     this.imageQuality = 100;
 }
   var options = {
      quality : this.imageQuality,
            destinationType : Camera.DestinationType.DATA_URL,
            sourceType : Camera.PictureSourceType.CAMERA,
            allowEdit : false,
            encodingType: Camera.EncodingType.JPEG,           
            correctOrientation: true, 
            saveToPhotoAlbum: true
              };
       Camera.getPicture(options).then(dataURI => {           
        //console.log(dataURI)
            if (dataURI){                               
                    this.dataservice.savePlotConstructionStageAttachments(progress.PlotID, progress.ConStageID, dataURI, new Date().toISOString()).then((data) =>
                     {
                      console.log("image saved");           
              
                    }, (error) =>{
                      console.log(error);
                    });
                  }                   
            }          
        , error => {
            console.log("ERROR -> " + JSON.stringify(error));
        });       
  }

  takeNotes(progressID: number) {
     var param = {progressID: progressID};
     let modal = this.modalController.create(NotesPage,param);
        modal.present();
  }

private openGallery (progress: PlotStageDetails): void { 
  if (!this.imageQuality){
     this.imageQuality = 100;
  }
 var options = {
      quality : this.imageQuality,
            destinationType : Camera.DestinationType.DATA_URL,
            sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit : false,
            encodingType: Camera.EncodingType.JPEG,           
            correctOrientation: true, 
            saveToPhotoAlbum: false
              };
       Camera.getPicture(options).then(dataURI => {           
       // console.log(dataURI)
         this.dataservice.savePlotConstructionStageAttachments(progress.PlotID, progress.ConStageID, dataURI, new Date().toISOString()).then((data) =>
                     {
                      console.log("image saved");           
              
                    }, (error) =>{
                      console.log(error);
                    });                 
        }, error => {
            console.log("ERROR -> " + JSON.stringify(error));
        });    
}

SaveFileToApplcationStorageDirectory(fileUri : string)  {
    return new Promise((resolve, reject) => {
    var sourceDirectory = fileUri.substring(0, fileUri.lastIndexOf('/') + 1);
            var sourceFileName = fileUri.substring(fileUri.lastIndexOf('/') + 1, fileUri.length);
            sourceFileName = sourceFileName.split('?').shift();
            File.copyFile(sourceDirectory, sourceFileName, cordova.file.externalApplicationStorageDirectory, sourceFileName).then((result: any) => {
          resolve(result);
            }, (err) => {
            reject(err);
          });
      });
}

getFileInfo(fileDirectory: string, fileName: string){
   File.resolveDirectoryUrl(fileDirectory).then((result:any)=>
    {         
            File.getFile(result, fileName, {create: true, exclusive: false} ).then((fileInfo) => 
            {
              fileInfo.getMetadata(success, fail);  

            function success(metadata) {
              console.log("Last Modified: " + metadata.modificationTime);
              return metadata;                  
             }
              function fail(error) {
                  alert(error.code);
              }            
            }, (error) => {
                  console.log(error);
            });
            
          },(err) => {
            alert(JSON.stringify(err));
          });
 }

showSelectedImages(progress: PlotStageDetails){
 var param = {plotID: progress.PlotID, stageID: progress.ConStageID};
   let modal = this.modalController.create(GalleryPage,param);
   modal.present();

}

 showAppMeasureItems(progress: PlotStageDetails){
  var param = {plotID: progress.PlotID, stageID: progress.ConStageID, progressDate: this.progressDate};
     let modal = this.modalController.create(AppmeasureitemsPage,param);
      modal.present();
  }

    showNextPlot(){
     let newPlot: SubLocation 
     let index = this.plots.indexOf(this.plot); 
    if (index < this.plots.length -1){
        newPlot = this.plots[index + 1];
        this.changeCurrentPlot(newPlot);   
    }        
  }

  showPrevPlot(){
    let prvPlot : SubLocation;
     let index = this.plots.indexOf(this.plot); 
      if(index > 0){
          prvPlot = this.plots[index -1]; 
           this.changeCurrentPlot(prvPlot);
      }           
  }

  changeCurrentPlot(cPlot: SubLocation){
    let loader = this.loadingCtrl.create({
                                          content: "Please wait...loading plot progress.",
                                          spinner : "bubbles",
                                          showBackdrop: false,
                                          dismissOnPageChange : false
                                      });
   loader.present();
    this.plot = cPlot;
    this.plotID = cPlot.recordID;   
    this.getPlotProgress();
    loader.dismiss();
  }

}
