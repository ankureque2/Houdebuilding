export class SiteProgressResults{
 SiteID: number;
 SiteName: string;
 Status: string;
 ResultDateTime: string;
 BudgetResult: BudgetProgressResult[];
AppmeasureItemsResult: AppMeasureProgressResult[];
  constructor(){
        
  }
}

export class BudgetProgressResult{
    PlotName: string;
    plotID: number;
    stageID: number;
    StageName: string;
    ActualProgress: number;
    Message: string;

    constructor(plotID: number, stageID: number, progress: number, message: string, plot: string, stage: string){
        this.plotID = plotID;
        this.stageID = stageID;
        this.ActualProgress = progress;
        this.Message = message;
        this.PlotName = plot;
        this.StageName = stage;
    }
}

export class AppMeasureProgressResult{   
    RecordID: number
    PlotID: number;
    StageID: number;
    Description: string;
    ActualProgressQty: number;
    Message: string;
    PlotName: string;
    StageName: string

 constructor (recordID: number, plotID: number, stageID: number, 
              desc: string, progress: number, message: string)
 {
   this.RecordID = recordID;
    this.PlotID = plotID;
    this.StageID = stageID;
    this.Description = desc;
    this.ActualProgressQty = progress;
    this.Message = message;
 }
}