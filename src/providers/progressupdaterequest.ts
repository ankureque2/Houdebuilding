import {AppMeasureItemNote} from '../pages/br.classes/appmeasureitem';

export class AppMeasureProgress{
   
    plotID: number;
    constructionStageID : number;
    currentWorkProgress : number;
    recordID: number;
    MOSQuantity : number;   
   
    constructor(appID: number, plotID: number, stageID: number, 
                progressQty: number, MOSQty: number){                
               
                this.plotID = plotID;
                this.constructionStageID = stageID;
                 this.recordID = appID;
                 if(progressQty === null){
                        this.currentWorkProgress = -1;
                 }
                 else{
                        this.currentWorkProgress = progressQty;
                 }

                    if(MOSQty === null){
                        this.MOSQuantity = -1;
                 }
                 else{
                        this.MOSQuantity = MOSQty;
                 }             
    }
}

export class BudgetProgress{
    plotID: number;
    constructionStageID : number;
    currentWorkProgress : number ; 

    constructor(plotID: number, stageID: number, progress: number){
        this.plotID = plotID;
        this.constructionStageID  = stageID;
        this.currentWorkProgress  = progress;
    }
}

export class BudgetProgressNotes{
    plotID: number;
    constructionStageID : number;
    message: string;
    messageDate: string;

 constructor(plotID: number, stageID: number, message: string, messageDate: string){
    this.plotID = plotID;
    this.constructionStageID = stageID;
    this.message = message;
    this.messageDate = messageDate;
 } 
}

export class AppmeasureProgressNotes{
    plotID: number;
    constructionStageID : number;
    recordID: number;
    message: string;
    messageDate: string;
   
    constructor(plotID: number, stageID: number, appID: number, message: string, messageDate: string){

        this.plotID = plotID;
        this.constructionStageID = stageID;
        this.recordID = appID;
        this.message = message;
        this.messageDate = messageDate;
    }
 }

export class SiteProgressRequest{
            public  siteID : number;
            public  transactionID : string;
            public  deviceID : string;
            public  progressDate: string
            public  progressData : BudgetProgress[];
            public  appMeasureProgressData: AppMeasureProgress[];

    constructor(){
    
  }
}

  export class SiteMessageRequest {
            public  siteID : number;
            public  transactionID : string;
            public  deviceID : string;         
            public  messageData : BudgetProgressNotes[];
            public  appMeasureMessageData : AppmeasureProgressNotes[];

    constructor(){
    
  }

}