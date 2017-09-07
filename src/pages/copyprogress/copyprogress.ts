import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController, LoadingController, ToastController } from 'ionic-angular';
import {PlotStageProgress} from '../br.classes/sublocation';
import {SubLocation } from '../br.classes/sublocation';
import {Database} from '../../providers/database';

@Component({
  selector: 'page-copyprogress',
  templateUrl: 'copyprogress.html'
})
export class CopyProgressPage {
selectedPlot: SubLocation;
allPlots: SubLocation[];
copyPlots: number[];
 loader: any;
 constructor(public navCtrl: NavController, public navParams: NavParams, 
              private data: Database,  public viewCtrl: ViewController,
              private alertCtrl: AlertController, 
              private loadingCtrl: LoadingController,
                private toastCtrl: ToastController,) {
            
              this.selectedPlot = <SubLocation> navParams.get("plot");
              this.allPlots = <SubLocation[]> navParams.get("plots");
              this.copyPlots = new Array<number>();
      }


  ionViewDidLoad() {
   
  }

  plotSelected(ev: any, plot: SubLocation){
          let isSelected: boolean = Boolean(ev.checked);
          if (isSelected){
          if (! this.copyPlots.find(p=> p === plot.recordID))
            {
                this.copyPlots.push(plot.recordID);
            }
          }
          else{
            let index = this.copyPlots.indexOf(plot.recordID);
            this.copyPlots.splice(index, 1)
          }  
      }

  dismiss() {
    this.viewCtrl.dismiss();
    
  }

copyProgress(){
  
   let loader = this.loadingCtrl.create({
                                        content: "Please wait...Copying Plot Progress.",
                                        spinner: "bubbles",
                                        showBackdrop: false,
                                        dismissOnPageChange : true
                                    });
        this.loader = loader;
          this.loader.present();

  this.data.getPlotProgress(this.selectedPlot.recordID).then((result) =>{
      let plotProgress = <PlotStageProgress[]> result;
      let lastIndex : number = this.copyPlots.length -1;
    if (plotProgress && plotProgress.length > 0){      
       for(let i = 0; i < this.copyPlots.length; i++){       
           this.data.getPlotProgress(this.copyPlots[i]).then((copyToResults) =>{
            let copyToProgress =  <PlotStageProgress[]> copyToResults;
            for (let origProg of plotProgress){
              if (origProg.NewWorkProgress !== null){
                       let copyTostage = copyToProgress.find(sp=>sp.ConStageID === origProg.ConStageID);
                       if (copyTostage){
                         copyTostage.NewWorkProgress = origProg.NewWorkProgress;
                         copyTostage.progressDate = origProg.progressDate;
                         this.data.updatePlotConstructionStage(copyTostage.SubLocationID, copyTostage.ConStageID, copyTostage.NewWorkProgress, copyTostage.progressDate);
                       }
              }
              else{
                // let copyTostage = copyToProgress.find(sp=>sp.ConStageID === origProg.ConStageID);
              }              
            }
             if (lastIndex === i){
                  this.loader.dismiss();
                  this.showMessage("copy Progress completed successfully");
             }
           },(error) =>{
              this.showMessage("Error occured while processing copy progress");
           });
      }

    }

       
  },(error) =>{
        console.log(error);
        loader.dismiss();
        this.showMessage("Error occured while processing copy progress");
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


 showCopyQuestion(){
   if (this.copyPlots.length > 0){
     let alert = this.alertCtrl.create({
        title: 'Confirm Copy',
        message: 'Do you wish copy from ' + this.selectedPlot.primaryName + ' to selected plots ?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Copy',
            handler: () => {
            this.copyProgress();
            }
          }
        ]
      });
     alert.present();
   }
   else{
     let alert = this.alertCtrl.create({
        title: 'Copy Plot Progress',
        message: 'Select valid plots to copy progress',
        buttons: [
          {
            text: 'OK',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
         }
        ]
      });
     alert.present();
  
   }  
}

}
