import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, App, Tabs, ToastController, LoadingController, NavParams} from 'ionic-angular';
import {Database} from '../../../providers/database';
import {SiteService} from '../../../providers/site-service';
import {DownloadedSite} from '../site';
import {DetailsPage} from '../details/details';
import {SublocationsPage} from '../../sublocations/sublocations';
import{RegistrationInfo} from '../../register/registrationdata';
/*
  Generated class for the SelectedPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'selected.html',
})
export class SelectedSites implements OnInit {
 items : DownloadedSite[];
 tab:Tabs;
 token: string;
 relay: string;
 debugModeOn: Boolean;
  constructor(private nav: NavController,
              private modalController : ModalController,
              private localdataService: Database,
              private siteService: SiteService,
              private toastCtrl: ToastController,
              private loadingCtrl: LoadingController,
              private params: NavParams,
              private app: App) {

      this.tab = nav.parent;
      this.token = params.get("token");
      this.items = params.get("savedSites");
  }

  ngOnInit(): void {        
    
   }
   

  public ionViewDidLoad() {
    this.getAccessInfo();  
    this.getAppSettings();  
   // this.localdataService.createTables();
  }

ionViewDidEnter(){
  this.getDownloadSites();
}

  getDownloadSites(){
    this.localdataService.getDownloadedSites().then((result) => {        
         this.items =  <DownloadedSite[]> result;   
         this.params.data = {token: this.token, selectedSites: this.items};
          if (this.items == undefined || this.items.length < 1)
          {
            this.params.data = {token: this.token, selectedSites: this.items};
            this.tab.select(1);
            }            
          }, (error) => {
                console.log("ERROR: ", error.message);
            });     
  }

   openModal(recordId : number){
      var param = {selected: this.items.find(s=>s.recordID == recordId)}
      let modal = this.modalController.create(DetailsPage,param);
      modal.present();
   }

  showPlots(recordId : number){
  this.getAccessInfo();
    let selectedsite: DownloadedSite = this.items.find(ds=>ds.recordID == recordId);
     this.app.getRootNav().push(SublocationsPage,{site: selectedsite, token: this.token});        
   }  

removeSite(siteID: number){  
      this.deleteSite(siteID); 
   }

deleteSite(siteID: number){
  let loader = this.loadingCtrl.create({
          content: "Please wait...Removing Site Data",
          spinner : "bubbles",
            showBackdrop: false,
            dismissOnPageChange : true,      
      });
      loader.present();  
      this.localdataService.removeSiteData(siteID, true, true).then((data) =>
        {
          let selectedSite: DownloadedSite = this.items.find(ds=>ds.recordID === siteID);
          let index = this.items.indexOf(selectedSite);
          this.items.splice(index, 1);           
          this.siteService.siteRemoved(this.token, this.relay, siteID, this.debugModeOn).subscribe(data => {
            loader.dismiss();
             this.showSiteDeletedMessage(); 
              }, error => {
                loader.dismiss();
                this.showDeleteErrorOccuredMessage();
           });      
         },(error) => {
           loader.dismiss();
           this.showDeleteErrorOccuredMessage();
         });
}

   showSiteDeletedMessage(){
       let toast = this.toastCtrl.create({
          message: 'Site removed successfully',
          duration: 3000,
          position: 'top'
      });
      toast.present();
   }

   showDeleteErrorOccuredMessage(){
     let toast = this.toastCtrl.create({
          message: 'Error occured while removing the Site',
          duration: 3000,
          position: 'top'
      });
      toast.present();
   }

   getAccessInfo(){
      return new Promise((resolve, reject) => {
            this.localdataService.getActivationInfo().then((result) => {
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
     this.localdataService.getAppSettings().then((settings: any)=>{
       this.debugModeOn = settings.DebugModeOn;
     });
   } 
}
