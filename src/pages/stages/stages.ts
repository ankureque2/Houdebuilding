import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, ModalController, ToastController} from 'ionic-angular';
import {ConstructionStage, ConstructionStageHeader} from '../br.classes/constructionstage';
import {NotesPage} from '../notes/notes';
import {GalleryPage} from '../gallery/gallery';
import {Database} from "../../providers/database"; 
import {SubLocation, PlotStageProgress, PlotStageDetails} from '../br.classes/sublocation';
import {StageFilterPipe} from './stage.pipe';
import {Camera, ImagePicker, File, Diagnostic } from 'ionic-native';
import {AppmeasureitemsPage} from '../appmeasureitems/appmeasureitems';
declare var cordova: any;
import {StageHeaderPanel} from './stageheaderpanel';
import {UserSettings} from '../br.classes/usersettings';
import {StageAppMeasureCount} from '../br.classes/appmeasureitem'
/*
  Generated class for the StagesPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'stageheaders',
  inputs: ['headers', 'plotID', 'siteID','userSettings'],
  templateUrl: 'stages.html', 
})
export class StagesPage implements OnInit {
 public headers: StageHeaderPanel[];

  progress: PlotStageDetails[];
  filteredProgress: PlotStageDetails[];
  stages: ConstructionStage[];
  plotID: number;
  siteID: number;
  progressDate: string;
  userSettings : UserSettings;
  stageAppMeasureCount: StageAppMeasureCount[];
  imageQuality: number;
constructor (private dataservice: Database, private modalController : ModalController, 
             private navCtrl: NavController, private toastCtrl: ToastController) {
    
  }

ngOnInit() : void {  
      this.dataservice.getSiteConstructionStages(this.siteID).then((result)=>{        
      this.stages  = <ConstructionStage[]> result; 
      this.progressDate = new Date().toISOString();    
      this.getPlotProgress();
      },
    (error) => {
                console.log("ERROR: ", error.message);
            });   
}

getAppSettings(){
    this.dataservice.getAppSettings().then((setting: any )=>{
                            this.imageQuality = setting.ImageQuality;
                            }, (error) =>{
                                this.imageQuality = 100;
                            });
}
public ngAfterViewInit() {

}

public getPlotProgress(){
    let appMeasureCount : {stageID: number, itemCount: number}[]
    this.dataservice.getAppMeasureItemsCountForPlot(this.plotID).then((result)=>
                                                    { 
                                                      this.stageAppMeasureCount = <StageAppMeasureCount[]> result;                                                      
                                                    }, (error) =>{
                                                              console.log("ERROR: ", error.message);   
                                                    });
  this.dataservice.getPlotProgress(this.plotID).then((result) => {
         let plotProgress = <PlotStageProgress[]> result;           
         this.progress = PlotStageDetails.CreatePlotStagesDetails(this.stages, this.plotID, plotProgress, this.stageAppMeasureCount);      
          console.log("stagecount" + this.stages.length + " - progressCount- " + plotProgress.length);  
          this.filteredProgress = new Array<PlotStageDetails>();
          for (let detail of this.progress){
               var filteredOut = false;                                         
               if (this.userSettings.HideCompletedStages.toString()=== 'true' && detail.currentProgress === 100) {
                    filteredOut = true;
                }   
               if (this.userSettings.ShowStagesWithAppmeasureItemsOnly.toString() === 'true' && detail.AppMeasureCount === 0){
                   filteredOut = true;
                  }                                                                                  
               if (!filteredOut){
                   this.filteredProgress.push(detail);
                 }                   
          }
      }
     ,(error) => {
                  console.log("ERROR: ", error.message);
     });    
}

public applyFilter(){
       this.filteredProgress = new Array<PlotStageDetails>();
        for (let detail of this.progress){
              var filteredOut = false;                                         
             if (this.userSettings.HideCompletedStages.toString()=== 'true' && detail.currentProgress === 100) {
                    filteredOut = true;
                }   
             if (this.userSettings.ShowStagesWithAppmeasureItemsOnly.toString() === 'true' && detail.AppMeasureCount === 0){
                   filteredOut = true;
                 }                                                                                  
             if (!filteredOut){
                   this.filteredProgress.push(detail);
                 }                   
          }
  }

onProgressValueEntered(stage: PlotStageDetails, newValue: number){
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

toggleDetails(accord: StageHeaderPanel) {  
 let data = this.progress.filter(p=>p.ConStageHeaderID === accord.stageID);
 if (data && data.length > 0){   
  accord.noStages = false;
 }
 else{
   accord.noStages = true;
 }
    if (accord.showDetails) {
              accord.showDetails = false;
              accord.icon = 'ios-add-circle-outline';
      } else {
              accord.showDetails = true;
              accord.icon = 'ios-remove-circle-outline';
         }    
  }

checkCameraPermissions(progress: PlotStageDetails){
  Diagnostic.isCameraPresent().then((present) =>{
    if (present){
         Diagnostic.isCameraAuthorized().then((authorized) => {
                if(authorized)
                    this.takePicture(progress);
                else {
                  Diagnostic.requestCameraAuthorization().then((status) => {
                      if(status == Diagnostic.permissionStatus.GRANTED)
                        this.takePicture(progress);
                      else {
                          // Permissions not granted
                          // Therefore, create and present toast
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
    else{
       this.toastCtrl.create(
                              {
                                  message: "There is No camera harware available on this device", 
                                  position: "bottom",
                                  showCloseButton: true,
                                  closeButtonText: "Close",
                                  duration: 5000
                              }
                          ).present();
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
  //console.log(progressID);
   var param = {plotID: progress.PlotID, stageID: progress.ConStageID};
   let modal = this.modalController.create(GalleryPage,param);
   modal.present();
}

 showAppMeasureItems(progress: PlotStageDetails){
  var param = {plotID: progress.PlotID, stageID: progress.ConStageID, progressDate: this.progressDate};
     let modal = this.modalController.create(AppmeasureitemsPage,param);
     modal.present();
  }
}

