import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { NavController, AlertController, Platform, ToastController, ModalController} from 'ionic-angular';
import {Database} from "../../providers/database";
import {RegistrationInfo} from './registrationdata';
import {Sites} from '../sites/sites';
import {InfoPage} from '../info/info';
import {DownloadedSite} from '../sites/site';
import{RegistrationService} from "../../providers/registration-service";
import{SiteService} from "../../providers/site-service";
import { Device, AppVersion } from 'ionic-native';
import{RegistrationResponse} from '../../providers/registrationrequest';

@Component({
   selector: 'register-page',
  templateUrl: 'register.html'
 
})

export class Register implements OnInit{
 activecode: string;
 connected: boolean;
 token: string;
 errorMessage: any;
 responseData : any;
 masks: any;
 regData: RegistrationInfo;
 private disableSubmit: boolean = false;
 appVer: string;
 mode = 'Observable';
  constructor(private navCtrl: NavController,private regService: RegistrationService,
              private dataservice : Database, public alrtCrtl: AlertController,
              private platform: Platform, private toastCtrl: ToastController,
              private siteService: SiteService, private modalController: ModalController) {

    this.errorMessage = null;
    this.responseData = null;
    this.masks = {activecode: [/[a-zA-z0-9]/, /[a-zA-z0-9]/, /[a-zA-z0-9]/,'-', /[a-zA-z0-9]/,/[a-zA-z0-9]/, /[a-zA-z0-9]/,'-',/[a-zA-z0-9]/,/[a-zA-z0-9]/, /[a-zA-z0-9]/]}
  }

  public ngOnInit() {    
   } 

   public ionViewDidLoad() {
    this.platform.ready().then(() => {     
       this.populateRegistrionNo();
      // this.creteTablesIfNotExists();
     });   
    }
    
    ionViewWillEnter (){
  
    }
   populateRegistrionNo(){       
    this.connected = false;   
    AppVersion.getVersionNumber().then((data)=>{
       this.appVer = data;
    }, (error)=>{}); 

    this.dataservice.openOrCreateDatabase().then((result) => {
      this.dataservice.createRegistrationTable().then((result) => {
       this.dataservice.getActivationInfo().then((result) => {
            if (result){              
                    let activationData = <RegistrationInfo> result;
                    this.activecode = activationData.activationCode;
                    this.connected = activationData.connected;
                    this.token = activationData.accesstoken;
                    this.regData = activationData;    
                    if (this.token && this.token !== ''){
                      this.dataservice.getAppSettings().then((settings: any)=>{
                         this.regService.ValidateToken(this.token, settings.DebugModeOn).then((data: any) =>{                         
                          this.regData.customerno = data.CustomerNo;
                          this.regData.customername = data.CustomerName;
                          this.regData.instancedescription = data.InstanceDescription;
                          this.dataservice.saveActivationData(this.activecode, this.token, activationData.connected,
                                                                data.CustomerNo, data.CustomerName, data.InstanceDescription,
                                                                data.RelayChannel, data.UserId)
                      },(error)=>{

                      });
                      });               
                    }                 
            }
            else{
                    this.activecode = "";
                    this.connected = false;
                    this.token = "";
            }                                                             
        }, (error) => {
                  console.log("ERROR: ", error.message);
              });

            this.dataservice.createTables();
            this.dataservice.alterSublocationTableIfColsNotExist();
           this.dataservice.dropAttachmentsTableIfOldColumnsExist();       
       });
    });
  }

  registerApp() {   
      this.disableSubmit = true; 
      this.platform.ready().then(() => {            
      var devicename =  Device.manufacturer + Device.model;   
      this.activecode = this.activecode.replace(/-/g ,"").trim();
      this.dataservice.getAppSettings().then((settings: any)=>{
        console.log(settings);
      this.regService.Activate(this.activecode, devicename, settings.DebugModeOn)
                     .then((data)  =>
                     {
                        console.log(data);  
                       this.responseData = data;
                       let response = new RegistrationResponse()
                       response.StatusCode = this.responseData.StatusCode;
                       response.AccessToken = this.responseData.Token;                                        

                          if (this.responseData.StatusCode === 0 && this.responseData.Token !== undefined){
                                          this.dataservice.saveActivationData(this.activecode,this.responseData.Token, true,
                                                                              this.responseData.CustomerNo , this.responseData.CustomerName, 
                                                                              this.responseData.InstanceDescription,
                                                                              this.responseData.RelayChannel, this.responseData.UserId)
                                                      .then((result) => {                                                        
                                                          let toast = this.toastCtrl.create({
                                                            message: 'You have successfully activated your application.',
                                                            showCloseButton: true,
                                                            closeButtonText: 'OK',
                                                            position: 'bottom',
                                                            cssClass: "toastStyle"
                                                          });
                                                          toast.present();                                                                             
                                                      console.log("Activated");
                                                      this.connected = true; 
                                                      this.token = this.responseData.Token;   
                                                       this.regData = new RegistrationInfo(this.activecode, true, this.responseData.Token, this.responseData.CustomerNo , 
                                                                                           this.responseData.CustomerName, this.responseData.InstanceDescription,
                                                                                           this.responseData.RelayChannel, this.responseData.UserId);

                                                      console.log(this.token);                                         
                                                      this.gotoSitesPage();
                                          }, (error) => {
                                            this.showError(error);                                             
                                      }); 
                          }
                          else{
                                let reason : string ;
                                switch(response.StatusCode){
                                  case 1:
                                       reason = 'The request is invalid.';
                                        break;
                                  case 2:
                                       reason = 'The activation code is invalid.';
                                       break;
                                  case 3:
                                       reason = 'An access token could not be generated.';
                                       break;                                 
                                  default:
                                  reason = 'Error occured';
                                }                              
                            let toast = this.toastCtrl.create({
                                         message: 'Activation unsuccessful:- ' + reason,
                                         showCloseButton: true,
                                         closeButtonText: 'OK',
                                         position: 'top',
                                         cssClass: "toastStyle"
                                      });
                                 toast.present();       
                              this.disableSubmit = false;
                          } 
                     },
                         (error) => {this.showError(error); 
                   }) ;
      });

    }); 
  }

// private deleteProgressTable(){
// this.dataservice.dropProgressTable().then((data) => 
//                 {console.log("progress removed")}, 
                
//                 (error) => {
//                              this.showError(error);                                             
//                             }); 
// }

// private dropAppItems(){
// this.dataservice.dropAppItems().then((data) => 
//                 {console.log("app items removed")}, 
                
//                 (error) => {
//                              this.showError(error);                                             
//                             }); 
// }

// private createProgress(){
// this.dataservice.createSubLocationConstructionStageTable().then((data) => 
//                 {console.log("progress added")}, 
                
//                 (error) => {
//                              console.log(error);                                             
//                             }); 

// }

// getAllPlots(){
//     this.dataservice.getAllPlots().then((data) => 
//                 {console.log(data)},                 
//                 (error) => {
//                              console.log(error);                                             
//                            }); 
// }

// deleteAllPlots(){
// this.dataservice.deleteAllPlots().then((data) => 
//                 {console.log("all plots deleted")},                 
//                 (error) => {
//                              console.log(error);                                             
//                            }); 
// }

// private DeleteStageTables(){
//      this.dataservice.dropConstructionStageTable().then((data) => {
//                           console.log("Stage table deleted");
//                 this.dataservice.dropConstructionStageHeaderTable().then((data) => 
//                 {console.log("both tables removed")}, 
                
//                 (error) => {
//                              this.showError(error);                                             
//                             }); 
//                                  },
//                               (error) => {
//                                 console.log(error)
//                                                   });
// }

showError(error: any){
        console.log("ERROR: ", error.message);
      let toast = this.toastCtrl.create({
                                   message: "Error occured. Activation unsuccessful! <br /><br />" + error.messge,
                                   showCloseButton: true,
                                   closeButtonText: 'Close',
                                   position: 'bottom',
                                   cssClass: "toastStyle"
                                  });
              toast.present();
              this.disableSubmit = false;  
}

 showDeregisterQuestion(){
    let alert = this.alrtCrtl.create({
        title: 'Confirm Deactivate',
        message: 'Do you wish to deactivate your application? This will remove your existing site data.',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Deactivate',
            handler: () => {
            this.deregister();
            }
          }
        ]
      });
  alert.present();
}

deregister(){
  this.dataservice.getAppSettings().then((settings: any) =>{
   this.dataservice.getDownloadedSites().then((data) =>{
      let sites = <DownloadedSite[]> data;
      this.dataservice.removeAllData().then((refreshed)=>{
         //  try{}
              this.connected = false;
              this.activecode = undefined;
             
              for (let site of sites)
              {                 
                  this.siteService.siteRemoved(this.token, this.regData.relaychannel.toString(), site.recordID, settings.DebugModeOn);
              }
              this.token = "";
              this.regData = null;
                  let toast = this.toastCtrl.create({
                                   message: "You have successsfully Deactivated your application.",
                                   showCloseButton: true,
                                   closeButtonText: 'Close',
                                   position: 'bottom',
                                   cssClass: "toastStyle"
                                  });
              toast.present();
          console.log("Deactivated");         
            }, (error) =>{
              console.log(error);
            }); 
      });
  });

}

gotoSitesPage(){
  console.log("site page display");
        this.navCtrl.setRoot(Sites,{token: this.token});               
  }

  deleteResponsedata(){
    this.dataservice.DeleteResponseTableAllEntries();
    console.log("completed");
  }

  showOptions(){
    // if (this.regData && this.token && this.token !== ""){
     var param = {regData: this.regData};
     let modal = this.modalController.create(InfoPage,param);
      modal.present();
  //  }  
  }
}
