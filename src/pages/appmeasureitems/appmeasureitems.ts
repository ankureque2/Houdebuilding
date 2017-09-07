import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController, LoadingController, ActionSheetController } from 'ionic-angular';
import {Database} from "../../providers/database";
import {AppMeasureItem} from '../br.classes/appmeasureitem'; 
import {AppnotesPage} from '../appnotes/appnotes';
/*
  Generated class for the Appmeasureitems page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-appmeasureitems',
  templateUrl: 'appmeasureitems.html'
})
export class AppmeasureitemsPage {
plotID: number;
stageID: number;
appItems: AppMeasureItem[];
newProgressDate: string;

  constructor(public navCtrl: NavController, 
               public viewCtrl: ViewController,
              public navParams: NavParams,
              private database: Database,
              private modalControl: ModalController,
              private loadingCtrl: LoadingController,
              private actionSheetCtrl: ActionSheetController) {

    this.plotID = <number> navParams.get("plotID");
    this.stageID = <number> navParams.get("stageID");
    this.newProgressDate = navParams.get("progressDate");
  }

  ionViewDidLoad() {   
     this.getAppItems();
  }

   getAppItems(){
    this.database.getAppMeasureItems(this.plotID, this.stageID).then((result) => 
                             {this.appItems = <AppMeasureItem[]> result; 
                               console.log(this.appItems); 
                                //  this.addSampleItemForTest();                   
                                }, 
                              (error) => {
                                console.log(error.message);
                            });    
   }

  addSampleItemForTest(){
                  if (! this.appItems || this.appItems.length <1)
                      {
                          this.appItems = new Array <AppMeasureItem> ();
                            this.appItems.push(new AppMeasureItem((this.plotID + this.stageID),this.plotID, this.stageID, "Concrete Mixes",
                            "m3", 100, 50,null, 20, null, null));
                            this.database.insertAppmeasureItem((this.plotID + this.stageID), this.plotID, this.stageID, "Concrete Mixes",
                            "m3", 100, 50, 20).then(()=>{
                                  console.log("one Item Added");
                            }, 
                            (error) => {
                              console.log(error);
                            });                           
                      } 
  }

dismiss() {
    this.viewCtrl.dismiss();
}

deleteAppNotesForAllItems(){
 let loader = this.loadingCtrl.create({
                                          content: "Please wait...deleting appmeasure notes.",
                                          showBackdrop: false,
                                          dismissOnPageChange : true
                                      });
    loader.present();
    this.database.deleteAppMeasureNotesForPlotAndStage(this.plotID, this.stageID).then((data) =>
         {
            loader.dismiss();
          }, 
       (error) =>{
                  loader.dismiss();
                 }); 
}

resetNewValues(){
   let loader = this.loadingCtrl.create({
                                          content: "Please wait...resetting appmeasure items.",
                                          spinner : "bubbles",
                                          showBackdrop: false,
                                          dismissOnPageChange : true
                                      });
    loader.present();
    this.database.resetAppmeasureItemValuesForPlotAndStage(this.plotID, this.stageID).then((data) =>
         { 
           this.getAppItems();
            loader.dismiss();
          }, 
       (error) =>{
                  loader.dismiss();
                 }); 
}

changeMOSQty(appItem: AppMeasureItem, newValue: number){
  appItem.NewMOSQty = newValue;
  appItem.NewProgressDate = this.newProgressDate;
  this.updateAppmeasureItem(appItem);
  
}

changeProgressQty(appItem: AppMeasureItem, newValue: number){
  appItem.NewProgressQty = newValue;
  appItem.NewProgressDate = this.newProgressDate;
  this.updateAppmeasureItem(appItem);
}

updateAppmeasureItem(item: AppMeasureItem){
   this.database.updateAppmeasureItemValues(item.RecordID, item.NewMOSQty, item.NewProgressQty, item.NewProgressDate); 
  }

takeNotes(AppItemID: number){  
  let modal =  this.modalControl.create(AppnotesPage, {AppItemID: AppItemID});
  modal.present();
}

presentActionSheet() {
   let actionSheet = this.actionSheetCtrl.create({
     title: 'AppMeasure Items',
     buttons: [
       {
         text: 'Remove Notes',
         icon: "trash", 
         role: 'destructive',
         handler: () => {
           this.deleteAppNotesForAllItems();
         }
       },
       {
         text: 'Reset New Values',
         icon: "undo",
         handler: () => {
           this.resetNewValues();           
         }
       },
       {
         text: 'Cancel',
         role: 'cancel',
         icon : 'close',
         handler: () => {
           console.log('Cancel clicked');
         }
       }
     ]
   });

   actionSheet.present();
 }



}


