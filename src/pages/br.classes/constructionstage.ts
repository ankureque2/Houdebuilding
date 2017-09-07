export class StageHeader{
  
    stageHeaderID: number;
    name: string; 
    buildOrder: number;

    constructor(StageHeaderID: number,  Description: string, BuildOrder: number){   
    this.stageHeaderID = StageHeaderID;
    this.name = Description;
    this.buildOrder = BuildOrder;
  }
}

export class ConstructionStageHeader extends StageHeader {    
    siteID: number;
    recordID: number;  
    constructor( RecordID: number, SiteID: number, StageHeaderID: number,
                Description: string, BuildOrder: number){
  
    super(StageHeaderID, Description, BuildOrder);
    this.siteID = SiteID ; 
    this.recordID = RecordID;
  }

  static CreateFromStageHeader(stageheader: StageHeader, siteID : number, recordID: number){
    return new ConstructionStageHeader(recordID, siteID, stageheader.stageHeaderID, stageheader.name, stageheader.buildOrder);
  }
}

export class ConstructionStage {
    recordID: number;
    constructionStageID : number;
    constructionHeaderID : number;
    siteID: number;
    description: string; 
    buildOrder: number;
       
    constructor(RecordID: number, StageID: number,  ConStageHeaderID: number,
                SiteID: number, Description: string, BuildOrder: number){
    this.recordID = RecordID;
    this.constructionStageID  = StageID;
    this.constructionHeaderID  = ConStageHeaderID ;
    this.siteID = SiteID;
    this.description = Description;
    this.buildOrder = BuildOrder;
  }
}