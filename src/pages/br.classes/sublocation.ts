import {ConstructionStage} from './constructionstage';
import {StageAppMeasureCount} from './appmeasureitem';

export class SubLocation  {
    recordID: number;
    siteID: number;
    primaryName: string; 
    shortCode: string;
    houseTypeName: string;
    houseTypeAltName: string;
    locationOrder: number; 
    constructor( RecordID: number, SiteID: number,
                PrimaryName: string, ShortCode: string,
                HouseTypeName: string, HouseTypeAltName: string,
                locORder: number){
   
    this.recordID = RecordID;
    this.siteID = SiteID ;
    this.primaryName = PrimaryName;
    this.shortCode = ShortCode;
    this.houseTypeName = HouseTypeName;
    this.houseTypeAltName = HouseTypeAltName;
    this.locationOrder = locORder;
  }
}

export class PlotStageProgress {
    RecordID: number;
    SubLocationID: number;
    ConStageID: number;
    CurrentWorkProgress: number;
    NewWorkProgress: number;
    progressDate: string;
    constructor(RecordID: number, SubLocationID: number,
                ConStageID: number, CurrentWorkProgress: number,
                NewWorkProgress: number, ProgressDate: string){

              this.RecordID = RecordID;
              this.SubLocationID = SubLocationID;
              this.ConStageID = ConStageID;           
              this.CurrentWorkProgress = CurrentWorkProgress;
              this.NewWorkProgress = NewWorkProgress;
              this.progressDate = ProgressDate;
    }
}

   export  class PlotStageDetails {
      PlotID: number;
      ConStageID: number;
      ConStageHeaderID: number;
      StageName: string;
      progressID: number;
      currentProgress: number;
      newProgress: number;
      newProgressDate: string;    
      HasProgress: boolean;
      AppMeasureCount: number;
      constructor( PlotID: number, ConStageID: number, conStageHeaderID: number,
                   StageName: string, progress: PlotStageProgress, AppMeasureItemCount: number ){

            this.PlotID = PlotID;
            this.ConStageID = ConStageID;
            this.ConStageHeaderID = conStageHeaderID
            this.StageName = StageName;
            this.AppMeasureCount = AppMeasureItemCount;
           if(progress === undefined){
             this.currentProgress = null;
             this.HasProgress = false;
             this.newProgress = null;
             this.newProgressDate = '';
             this.progressID = -1;
           }
           else{
              this.currentProgress = progress.CurrentWorkProgress;
             this.HasProgress = true;
             this.newProgress = progress.NewWorkProgress;
             this.newProgressDate = progress.progressDate;
             this.progressID = progress.RecordID;
           }                     
          }

          // static Create(stage: ConstructionStage, plotID: number, stageProgress: PlotStageProgress) : PlotStageDetails{
          //     if (stageProgress === undefined){
          //          return new PlotStageDetails(plotID, stage.constructionStageID , stage.constructionHeaderID ,stage.description, undefined, count);
          //     }
          //     else{
          //           return new PlotStageDetails(plotID, stage.constructionStageID , stage.constructionHeaderID ,stage.description, stageProgress);
          //     }      
          // }

          static CreatePlotStagesDetails(stages: ConstructionStage[], plotID: number,stagesProgress: PlotStageProgress[], 
                                          stageAppCount: StageAppMeasureCount[]) : PlotStageDetails[]{

            let plotStages = new Array<PlotStageDetails>();

              for(let stage of stages){
                let  progress : PlotStageProgress = undefined;
                let appCount = stageAppCount.find(a=> a.StageID == stage.constructionStageID);
                let count : number = 0;
                if (appCount){
                 count = appCount.AppItemCount;
                }

                 if (stagesProgress !== undefined && stagesProgress.length > 0){
                   progress = stagesProgress.find(p=>p.ConStageID == stage.constructionStageID );
                 }

                 if (progress !== undefined){
                    plotStages.push(new PlotStageDetails(plotID, stage.constructionStageID , stage.constructionHeaderID ,stage.description, 
                                    progress, count));
                    } 
                //  else {
                //         plotStages.push(new PlotStageDetails(plotID, stage.constructionStageID , stage.constructionHeaderID , stage.description, undefined, count));
                //       }

                   }
                  console.log(plotStages.length);
            return plotStages;
          }
    }
