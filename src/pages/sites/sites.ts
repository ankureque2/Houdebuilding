import { Component } from '@angular/core';
//import { NavController, NavParams } from 'ionic-angular';
//import {SitesService} from './sites.service';
import {AllSites} from './all/all';
import {SelectedSites} from './selected/selected';
import {DownloadedSite} from './site';
import{Network} from 'ionic-native';
import {Platform, NavParams} from 'ionic-angular';

@Component({
  templateUrl: 'sites.html'
})

export class Sites {
   allPage: any;
   selectedPage: any;
   public tabIndex: number = 0;
   token: string;
   tabParams: any
  // constructor(private navCtrl: NavController, navParams: NavParams, private siteservice : SitesService) {
  //   // If we navigated to this page, we will have an item available as a nav param
  //     this.allPage = AllSites;
  //     this.selectedPage = SelectedSites;

  // }
  constructor(private platform: Platform, private params: NavParams) {
    // If we navigated to this page, we will have an item available as a nav param
      this.allPage = AllSites;
      this.selectedPage = SelectedSites;
      let tabIndex = this.params.get('tabIndex');
      this.token = this.params.get('token');
      if(tabIndex){
        this.tabIndex = tabIndex;
      }
     
    this.tabParams = {token: this.token, savedSites: new Array<DownloadedSite>()};     
  }
  // itemTapped(event, item) {
  //   // That's right, we're pushing to ourselves!
  //   this.navCtrl.push(Sites, {
  //     item: item
  //   });

  // }
 
  public ionViewDidLoad() {
    this.platform.ready().then(() => {     
     if(Network.type === 'none'){
            
     }
     });     
  }

}
