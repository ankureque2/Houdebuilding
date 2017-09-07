import { Component } from '@angular/core';
import {ViewController, LoadingController, NavParams, ToastController, NavController, ModalController, AlertController} from 'ionic-angular';
import {PlotPage} from './plot';
import {StageListPage} from '../stagelist/stagelist';
import {CopyProgressPage} from '../copyprogress/copyprogress';
import {SubLocation } from '../br.classes/sublocation';
import {Database} from '../../providers/database';


@Component({
  template: `
    <ion-list>     
      <button ion-item text-wrap  *ngIf='stageView' (click)="showHeaderView()"><ion-icon item-left name="list"></ion-icon>Show Stage Header View</button>
      <button ion-item (click)="showProgressResetQuestion(plotID)"><ion-icon item-left name="refresh"></ion-icon>Reset Progress</button>
      <button ion-item text-wrap (click)="showAppMeasureResetQuestion(plotID)"><ion-icon item-left name="ios-refresh-circle-outline"></ion-icon>Reset Appmeasure items</button>
      <button ion-item (click)="copyProgress()"><ion-icon item-left name="copy"></ion-icon>Copy Progress</button>     
    </ion-list>
  `
})
export class PlotOptionsPage {
plotID: number;
plot: SubLocation;
stageView: boolean;
plots: SubLocation[];

constructor(private nav: NavController,
              private viewCtrl: ViewController,
              private loadingCtrl: LoadingController,
              private  params: NavParams,
              private database : Database,
              private toastCtrl: ToastController,
              private modalController: ModalController,
              private alertCtrl: AlertController) {

    this.plot = <SubLocation> params.get("plot");
    this.plots = <SubLocation[]> params.get("plots");
    this.stageView = <boolean> params.get("stageview");
    this.plotID = this.plot.recordID;
  }

  close() {
    this.viewCtrl.dismiss();
  }

 showProgressResetQuestion(plotID : number){
    let alert = this.alertCtrl.create({
        title: 'Confirm reset',
        message: 'Do you wish to reset all of your stage progress data for this plot?',
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
            this.resetPlotProgress(plotID);
            }
          }
        ]
      });
  alert.present();
}

  resetPlotProgress(plotID : number){
  let loader = this.loadingCtrl.create({
                                          content: "Please wait...resetting plot progress.",
                                          showBackdrop: false,
                                          dismissOnPageChange : true
                                      });
    loader.present();
    this.database.resetPlotProgressForSubLocation(plotID).then((data) =>
         { 
            loader.dismiss();       
             this.viewCtrl.dismiss({reset: true});
          }, 
       (error) =>{
                  loader.dismiss();
                  this.showMessage("Error occured while clearing progress");
                 });
  }

  copyProgress(){
    let remainingPlots = new Array<SubLocation>();
    remainingPlots = this.plots.filter(p=>p.recordID !== this.plotID);
         var param = {plot: this.plot,  plots: remainingPlots};
    let modal = this.modalController.create(CopyProgressPage, param);
    modal.present();  
     this.viewCtrl.dismiss();
  }

  showAppMeasureResetQuestion(plotID : number){
    let alert = this.alertCtrl.create({
        title: 'Confirm reset',
        message: 'Do you wish to reset all of your AppMeasure Items progress for this plot?',
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
            this.resetAppMeasureItems(plotID);
            }
          }
        ]
      });
  alert.present();
}

resetAppMeasureItems(plotID : number){
       let loader = this.loadingCtrl.create({
                                          content: "Please wait...resetting appmeasure items.",
                                          showBackdrop: false,
                                          dismissOnPageChange : true
                                      });
    loader.present();
    this.database.resetAppmeasureItemsForPlot(plotID).then((data) =>
         { 
            loader.dismiss();       
             this.viewCtrl.dismiss({reset: true});
          }, 
       (error) =>{
                  loader.dismiss();
                  this.showMessage("Error occured while clearing appmeasure items")
                 });
}

 showMessage(message: string){
       let toast = this.toastCtrl.create({
          message: message,
          duration: 3000,
          position: 'bottom'
      });
      toast.present();
   } 

   showHeaderView(){   
     let param = {siteID: this.plot.siteID, plot: this.plot,  plots: this.plots};
      let modal = this.modalController.create(PlotPage, param);
      modal.onDidDismiss(() =>{
        this.viewCtrl.dismiss({reset: true});
      });
    modal.present();  
    //  this.nav.push(PlotPage,{siteID: this.plot.siteID, plot: this.plot,  plots: this.plots});
    // this.viewCtrl.dismiss();
   }

 showStageView(){     
     this.nav.push(StageListPage,{siteID: this.plot.siteID, plot: this.plot,  plots: this.plots});
     this.viewCtrl.dismiss();
   }


}