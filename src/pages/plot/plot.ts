import {Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {NavController,NavParams,  PopoverController, LoadingController, Content, ViewController} from 'ionic-angular';
import {ConstructionStageHeader} from '../br.classes/constructionstage';
import {SubLocation} from '../br.classes/sublocation';
import {Database} from "../../providers/database";
import {StagesPage} from "../stages/stages";
import{StageHeaderPanel} from '../stages/stageheaderpanel';
import {PlotOptionsPage} from './plotoptions';
import {PlotFilterPage} from './plotfilteroptions';
import {UserSettings} from '../br.classes/usersettings';
import { Keyboard } from 'ionic-native';

@Component({    
  selector : 'plot', 
  inputs:['stageHeaders'],
  templateUrl: 'plot.html'
})

export class PlotPage implements OnInit, AfterViewInit  {

  stageHeaderPages: StageHeaderPanel[];
  stageHeaders: ConstructionStageHeader[];
  plots: SubLocation[];
  siteID: number;
  plotID: number;
  plot: SubLocation;  
  userSettings: UserSettings;
  showFooter: boolean;
  @ViewChild(StagesPage)  childStages :StagesPage;
  @ViewChild(Content) content: Content;

  constructor(private navCtrl: NavController,
              private dataservice: Database,
              private params: NavParams,
              private popoverCtrl: PopoverController,
              private loadingCtrl: LoadingController,
              private keyboard: Keyboard,
              private viewCtrl: ViewController            
            ) {
 
      this.siteID = <number> this.params.get("siteID");
      this.plots = <SubLocation[]>this.params.get("plots");
      this.plot = <SubLocation> this.params.get("plot");   
      this.plotID = this.plot.recordID;  
      this.showFooter = true;
      this.loadUserSettings();  
  }

  ngOnInit(): void {     
    console.log(this.plotID);
    this.getConstructionstages();
  }

  public ionViewDidEnter(){    
      Keyboard.onKeyboardShow().subscribe(()=>{this.keyboardShowHandler()})
      Keyboard.onKeyboardHide().subscribe(()=>{this.keyboardHideHandler()})
  }

   dismiss() {
    this.viewCtrl.dismiss();    
  }


public ngAfterViewInit() {
  setTimeout(() => {     
   //  this.content.resize();    
   }, 100);
}

 keyboardShowHandler(){ 
    setTimeout(() => {     
      this.showFooter = false;  
       this.content.resize();    
   }, 100);    
} 

keyboardHideHandler(){    
    setTimeout(() => {     
      this.showFooter = true;  
       this.content.resize();    
   }, 100);
}

loadUserSettings(){
    this.dataservice.getUserSettings().then((result) =>
                    {                       
                       if (!result){
                               this.userSettings = new UserSettings(false, false);
                      }else{
                            this.userSettings = <UserSettings> result; 
                      }               
                    },
                    (error) =>{
                      this.userSettings = new UserSettings(false, false);
                    });
}

getConstructionstages(): void {       
        this.dataservice.getConstructionStageHeaders(this.siteID).then((result) => {     
           this.stageHeaders =  <ConstructionStageHeader[]> result;                 
                this.stageHeaderPages = new Array<StageHeaderPanel>();           
                 for (let sh of this.stageHeaders) {
                   let open:boolean = false;
                   if(this.stageHeaders[0] == sh)
                   {
                     open = false;
                   }
                    this.stageHeaderPages.push(new StageHeaderPanel(sh.name, sh.stageHeaderID , 'ios-add-circle-outline', open));               
                 }                
          }, (error) => {
                console.log("ERROR: ", error.message);
            });           
  }

  showPlotOptions(myEvent){
    let popover = this.popoverCtrl.create(PlotOptionsPage, {plot: this.plot, plots: this.plots, stageview: false});
      popover.present({
        ev: myEvent
      });

      popover.onDidDismiss((data) => {
        if (data){
         if (data.reset === true){
            console.log(data);
            this.childStages.getPlotProgress();
         }
        }       
      });
  }

  showFilter(myEvent){
     let popover = this.popoverCtrl.create(PlotFilterPage, {appOnly: this.userSettings.ShowStagesWithAppmeasureItemsOnly, 
                                              hideCompleted: this.userSettings.HideCompletedStages});
          popover.present({
          ev: myEvent
      });
      popover.onDidDismiss((data) => {
        if (data){          
          if(this.userSettings.ShowStagesWithAppmeasureItemsOnly !== data.appOnly || this.userSettings.HideCompletedStages !== data.hideCompleted){
             let loader = this.loadingCtrl.create({
                                          content: "Please wait...applying filter.",
                                          spinner : "bubbles",
                                          showBackdrop: false,
                                          dismissOnPageChange : false
                                      });
              loader.present();
                this.userSettings.ShowStagesWithAppmeasureItemsOnly = data.appOnly;
                this.userSettings.HideCompletedStages = data.hideCompleted;
                this.dataservice.saveUserSettings(this.userSettings.ShowStagesWithAppmeasureItemsOnly, this.userSettings.HideCompletedStages);
                this.childStages.userSettings = this.userSettings;
                this.childStages.applyFilter();
                loader.dismiss();

          }
        }       
      });
  } 
 
  resetPlotProgress(){
    console.log("event Fired");  
    //this.childStages.getPlotProgress();
  }

  showNextPlot(){
     let newPlot: SubLocation 
     let index = this.plots.indexOf(this.plot); 
    if (index < this.plots.length -1){
        newPlot = this.plots[index + 1];
        this.changeCurrentPlot(newPlot);   
    }        
  }

  showPrevPlot(){
    let prvPlot : SubLocation;
     let index = this.plots.indexOf(this.plot); 
      if(index > 0){
          prvPlot = this.plots[index -1]; 
           this.changeCurrentPlot(prvPlot);
      }           
  }

  changeCurrentPlot(cPlot: SubLocation){
    let loader = this.loadingCtrl.create({
                                          content: "Please wait...loading plot progress.",
                                          showBackdrop: false,
                                          spinner : "bubbles",
                                          dismissOnPageChange : true
                                      });
   loader.present();
    this.plot = cPlot;
    this.plotID = cPlot.recordID;
    this.childStages.plotID = this.plot.recordID;
    this.childStages.getPlotProgress();
    loader.dismiss();
  }
}
