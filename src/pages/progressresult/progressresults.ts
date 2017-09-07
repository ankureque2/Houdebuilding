import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import {SiteProgressResults, BudgetProgressResult, AppMeasureProgressResult} from '../br.classes/siteprogressresult'
import {Database} from '../../providers/database';

@Component({
  selector: 'page-progressresults',
  templateUrl: 'progressresults.html'
})
export class ProgressresultsPage {
  siteProgressResult: SiteProgressResults;
  showprogressDiv: boolean;
  hasProgress: boolean;
  siteID: number; 
  progressDate: Date;
  constructor(public navCtrl: NavController, public navParams: NavParams,
               private database : Database, private viewCtrl: ViewController) {
              this.siteID = <number> this.navParams.get("siteID");
              this.hasProgress = false;
              this.showprogressDiv = false;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProgressresultsPage');

    this.getPreviousSiteResponseData();
  }

  getPreviousSiteResponseData(){
      this.database.getSiteProgressResponseResults(this.siteID).then((data) => 
              {
                this.siteProgressResult = <SiteProgressResults> data;
                if (this.siteProgressResult && this.siteProgressResult.SiteID && this.siteProgressResult.SiteID !== 0)
                {
                    this.hasProgress = true;  
                    this.progressDate = new Date(this.siteProgressResult.ResultDateTime);
                }
                if (this.siteProgressResult.BudgetResult && this.siteProgressResult.BudgetResult.length > 0){
                     this.showprogressDiv = true;
                }
                if (this.siteProgressResult.AppmeasureItemsResult && this.siteProgressResult.AppmeasureItemsResult.length > 0){
                    this.showprogressDiv = true;
                }               
              }, (error) =>{} 
    );
}

dismiss() {
    this.viewCtrl.dismiss();
    
  }


}
