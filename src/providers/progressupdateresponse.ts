export class AppmeasureProgressResponse{

    public  plotID :number;
    public  constructionStageID :number;
    public  recordID :number;
    public  actualWorkProgress : number;
    public  message :string
   
   constructor(plotID: number, stageID: number, recordId: number, actualProgress: number, message: string){

                this.plotID = plotID;
                this.constructionStageID = stageID;
                this.recordID = recordId;
                this.actualWorkProgress = actualProgress;
                this.message = message;
   }
  
}

 export class BudgetProgressResponse{
    public  plotID :number;
    public  constructionStageID :number;  
    public  actualWorkProgress : number;
    public  message :string;
   
   constructor(plotID: number, stageID: number, actualProgress: number, message: string){

                this.plotID = plotID;
                this.constructionStageID = stageID;            
                this.actualWorkProgress = actualProgress;
                this.message = message;
   }
 }

export class SiteProgressResponse{
            public  siteID :number;        
            public  returnCode :number;
            public  deviceID : number;
            public  transactionID : number;
            public  returnCount :number;
            public  appMeasureReturnCount :number;
            public  responseData : any
            public  appMeasureResponseData : any;      
}

