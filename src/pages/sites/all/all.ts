import { Component, Input } from '@angular/core';
import { NavController, ModalController, App ,ToastController, NavParams, LoadingController} from 'ionic-angular';
import {ISite} from '../site';
import {SitesService} from '../sites.service';
import {OnInit} from '@angular/core';
import {DownloadedSite} from "../site";
import {Database} from '../../../providers/database';
import {DetailsPage} from '../details/details';
import {SublocationsPage} from '../../sublocations/sublocations'
import {SiteService} from '../../../providers/site-service';
import {SiteServiceResponseMessage, SiteData} from '../../../providers/siteserviceresponse';
import{RegistrationInfo} from '../../register/registrationdata';
import{Network} from 'ionic-native';
import{RegistrationService} from "../../../providers/registration-service";

@Component({
  templateUrl: 'all.html',
})

export class AllSites implements OnInit{

  sitesList : DownloadedSite[];
  savedSites: DownloadedSite[]; 
  filteredList: DownloadedSite[];
  ResponseData : any;
  token:string;
  relay: string;
  noSites: boolean;
  searchQuery : string;
  debugModeOn: Boolean;

  constructor(private nav: NavController, private siteservice : SitesService
               , private regService: RegistrationService, 
              private modalController : ModalController, private navParams: NavParams, 
              private localdataService: Database, private app: App,
              private siteserv: SiteService, private loadingCtrl: LoadingController,
              private toastCtrl: ToastController) {
      this.ResponseData = null;
      this.token = navParams.get("token");
      this.noSites = false;
    }
  
  ngOnInit(): void {  
    // this.getAccessInfo();   
    // this.getAppSettings();
      this.checkNetWorkAvailable();  
     // this.validateToken();     
   }

  checkNetWorkAvailable(){
     if (Network.type === 'none'){
        let toast = this.toastCtrl.create({
            message: 'No Internet Connection.',
            showCloseButton: true,
            closeButtonText: 'OK',
            position: 'top',
            duration: 5000
            });
          toast.present();            
      }
    }
    validateToken(){
      if (this.token && this.token !== ''){
              this.regService.ValidateToken(this.token, this.debugModeOn).then((data: any) =>{
                  this.relay = data.RelayChannel.toString();                    
          });
       }
    }

  populateSiteData(){      
    this.localdataService.getDownloadedSites().then((result) => {
      this.savedSites = <DownloadedSite[]> result; 
      this.getsiteServiceData();
    }, (error) => {
                console.log("ERROR: ", error.message);
        });
  }

  showSavedSiteParam(){
     console.log(this.navParams.get("savedSites"));
  }

ionViewDidEnter(){ 
   this.getAppSettings();
        this.getAccessInfo().then((data)=>{
           this.validateToken();
            this.populateSiteData();  
        }, (error) => { });  
}
  getSites(ev: any) {
       // set val to the value of the searchbar
    let val = ev.target.value;
    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {    
      this.filteredList = this.sitesList.filter((item) => {
        return (item.primaryName.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    }
    else{
      this.filteredList = this.sitesList;
    }
  }

 doRefresh(refresher) {
   this.searchQuery = '';
     this.populateSiteData();
    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  }

getSiteByID(id: number){
  console.log(id);
 let match = this.sitesList.find(i=>i.recordID == id);
  alert (match.primaryName);
}

 getsiteServiceData(): void {
   this.sitesList = new Array<DownloadedSite>();
   let loader = this.loadingCtrl.create({
        content: "Please wait...Getting list of available Sites.",
        spinner : "bubbles",
        showBackdrop: false,
        dismissOnPageChange : true,      
     });
      loader.present();

      this.siteserv.getSites(this.token, this.relay, this.debugModeOn)
                     .subscribe(data => {this.ResponseData = data;                  
                  let returnMessage  =  this.ResponseData;
                  console.log(returnMessage.MessageCode);
                  let sitedata =  returnMessage.Sites;
                 this.searchQuery = '';
                  for(let item of sitedata.returnData){   
                      let match = this.savedSites.find(i=>i.recordID === item.recordID)
                      if(match == undefined){
                          let notDownlaodSite = DownloadedSite.createNotDownloadSite(item)
                          this.sitesList.push(notDownlaodSite);
                        }
                      else{
                            match.copyNewProperties(item);
                            this.sitesList.push(match);               
                        }            
                      }
                      this.filteredList = this.sitesList;
                      if (this.sitesList.length ===0){
                        this.noSites = true;
                      }
                      loader.dismiss();                       
            }, (error: any) =>{
              console.log(error);
              loader.dismiss();
              // if (error.status === 421){
               
              //   this.getsiteServiceData();
              // }
               
              let message: string = 'Error occurred while getting list of Sites: ' + error.statusText;
              this.showDeleteErrorOccuredMessage(message);
            });        
 }

 showDeleteErrorOccuredMessage(message: string){
     let toast = this.toastCtrl.create({
          message: message ,
          duration: 7000,
          showCloseButton: true,         
           closeButtonText: "Close",
          position: 'bottom'
      });
      toast.present();
   }

 onSelected(ev: any, recordId : number){
    let isSelected: boolean = Boolean(ev.checked);
    let id = recordId;
    let site: ISite = this.sitesList.find(st=> st.recordID == id);
    console.log(isSelected);      
    this.localdataService.saveSite(site, isSelected);
   } 

   openModal(recordId : number){
      var param = {selected: this.sitesList.find(s=>s.recordID == recordId)}
      let modal = this.modalController.create(DetailsPage,param);
      modal.present();
   }

     showPlots(recordId : number){
       let site: DownloadedSite = this.sitesList.find(st=> st.recordID == recordId);
      if (this.token){
         this.app.getRootNav().push(SublocationsPage,{site: site, token: this.token}); 
      }
      else{
          this.getAccessInfo().then((data)=>{
                     this.app.getRootNav().push(SublocationsPage,{site: site, token: this.token});  
                  }, (error) => { });
      }              
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
