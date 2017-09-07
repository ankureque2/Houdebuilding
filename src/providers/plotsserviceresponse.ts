import {ISite} from '../pages/sites/site'
import {SubLocation} from '../pages/br.classes/sublocation'
import {ConstructionStage, ConstructionStageHeader} from '../pages/br.classes/constructionstage'

export class GetPlotsResponseMessage{
    MessageCode: number;
    Locations: any;
    DispatchCode: number;
}

export class SubLocationsList{
   returnCode: number;
   returnMessage: string;
   returnData: any[];
   returnCount: number; 
   siteID: number;
}

export class GetStagesResponseMessage{
    MessageCode: number;
    Stages: any;
    DispatchCode: number;
}

export class StagesList
{
    returnCode: number;
    returnMessage: string ;
    stageHeaderData : any[];
    stageData : ConstructionStage[];
    stageCount: number;
    stageHeaderCount: number;
    siteID: number
 }

export class GetPlotProgressResponseMessage {
    MessageCode: number;
    BudgetData: any;
    DispatchCode: number;
}

export class PlotProgressData{
    returnCode: number;
    returnMessage: string ;
    appMeasureReturnCount: number;
    appMeasureReturnData: any;
    returnData: any;
    returnCount: number; 
}







