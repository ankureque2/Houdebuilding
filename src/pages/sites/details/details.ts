import { Component } from '@angular/core';
import { ModalController, Platform, NavParams, ViewController } from 'ionic-angular';
import {DownloadedSite} from "../site";
/*
  Generated class for the DetailsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'details.html',
})
export class DetailsPage {
selectedSite : DownloadedSite;

  constructor( public platform: Platform,
               public params: NavParams,
               public viewCtrl: ViewController) {
    
    this.selectedSite = <DownloadedSite> this.params.get("selected");
    console.log(this.selectedSite.recordID);
    }

dismiss() {
    this.viewCtrl.dismiss();
  }
}
