import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import {RegistrationInfo} from '../register/registrationdata';
import {Database} from "../../providers/database";

/*
  Generated class for the Info page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-info',
  templateUrl: 'info.html'
})
export class InfoPage {
 regData: RegistrationInfo;
 quality: number;
 debugModeOn: Boolean;
 appActivated: Boolean;
 connectionURL: string;
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public viewCtrl: ViewController,
              public database: Database) {
        
        this.regData = <RegistrationInfo> navParams.get("regData");
              if (this.regData && this.regData.accesstoken && this.regData.accesstoken !== ''){
                this.appActivated = true;
              }
              else{
                this.appActivated = false;
              }
        }

  ionViewDidLoad() {    
    
    this.database.getAppSettings().then((setting: any )=>{    
      this.quality = setting.ImageQuality;
      this.debugModeOn = setting.DebugModeOn;
      if (this.debugModeOn){
           this.connectionURL = "https://relaytest.eque2.com";   
      }else
      {
           this.connectionURL = "https://relay.eque2.com";
      }
    }, (error) =>{

    });
  }

 dismiss() {
    this.viewCtrl.dismiss();    
  }

  onQualityValueEntered(newValue: number){
   let formattedValue: number;

   formattedValue = Math.round(newValue);
   if (formattedValue < 1 || formattedValue > 100){
     formattedValue = 100;
   }
    this.database.saveImageQualitySettings(formattedValue).then(()=>{
          this.quality = formattedValue;
    },(error) =>{

    });
  }

  changeDebugMode(ev: any){
   let debugOn: Boolean = Boolean(ev.checked);
   this.database.saveDebugModeSettings(debugOn).then(()=>{
          this.debugModeOn = debugOn;
    },(error) =>{

    });  
  }
}
