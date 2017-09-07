import { Component } from '@angular/core';
import { ViewController, NavParams} from 'ionic-angular';
import {Database} from '../../providers/database';


@Component({
  template: `
  <ion-item>
  <h2>Filter</h2>
  <button ion-button item-right clear (click)="applyFilter()">
    Done
  </button>
  </ion-item> 
  <ion-list>             
    <ion-item text-wrap>
    <ion-label>Show Stages with Appmeasure items only </ion-label>
    <ion-checkbox [(ngModel)]="appMeasureItemsOnly"></ion-checkbox>
  </ion-item>
  <ion-item text-wrap>
    <ion-label>Hide Completed Stages</ion-label>
    <ion-checkbox [(ngModel)]="hideCompletedStages"></ion-checkbox>
  </ion-item>     
 </ion-list>   
    <ion-item no-padding no-margin>
        <button no-padding no-margin ion-button color="dark" outline full (click) = "close()">
            Close
        </button>
    </ion-item>
  `
})
export class PlotFilterPage {
    appMeasureItemsOnly: boolean;
    hideCompletedStages: boolean;

    constructor(private viewCtrl: ViewController,
                private params: NavParams){
      
      this.appMeasureItemsOnly = <boolean> params.get("appOnly");
      this.hideCompletedStages = <boolean> params.get("hideCompleted");   
     
 }

 ionViewDidLoad() {   
     
 }

 private applyFilter(){
    this.viewCtrl.dismiss({appOnly: this.appMeasureItemsOnly, hideCompleted: this.hideCompletedStages});
   
 }

 private close(){
     this.viewCtrl.dismiss();
 }
}