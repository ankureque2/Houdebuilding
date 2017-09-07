export  class AppMeasureItem {
      RecordID: number;
      PlotID: number;
      ConStageID: number;
      Description: string;
      Unit : string;
      RequiredQty: number;
      CurrentMOSQty : number;
      NewMOSQty: number
      CurrentProgressQty: number;
      NewProgressQty: number;
      NewProgressDate: string;   
    
      constructor( RecordID: number, PlotID: number, ConStageID: number, Desc: string, 
                   Unit: string, ReqQTY: number, CurrentMOSQty: number, NewMOSQty: number,
                   CurrentProgQty: number, NewProgQty: number, NewProgDate: string){
            this.RecordID = RecordID;
            this.PlotID = PlotID;
            this.ConStageID = ConStageID;
            this.Description = Desc;
            this.Unit = Unit;
            this.RequiredQty = ReqQTY;
            this.CurrentMOSQty = CurrentMOSQty;
            this.NewMOSQty = NewMOSQty;
            this.CurrentProgressQty = CurrentProgQty;
            this.NewProgressQty = NewProgQty;
            this.NewProgressDate = NewProgDate;
           }                     
          }

export class AppMeasureItemNote{
       RecordID: number;
       AppMeasureItemID: number
       Notes : string;
       NotesDateTime: string;
       constructor( RecordID: number, AppMeasureItemID: number,
        Notes : string,  NotesDateTime: string){
            this.RecordID = RecordID;
            this.AppMeasureItemID = AppMeasureItemID;
            this.Notes = Notes;
            this.NotesDateTime = NotesDateTime;
           }                             
  }

export class StageAppMeasureCount{
    StageID: number;
    AppItemCount:number;
    constructor(stageID: number, itemCount: number){
        this.StageID = stageID;
        this.AppItemCount = itemCount;
    }
}