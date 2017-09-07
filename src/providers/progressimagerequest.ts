export class BudgetImage{
    siteID: number;
    recordID: number;
    plotID: number;
    constructionStageID : number;
    image: string;
    imageDate: string;
    filename: string;
    filesize: number;
    
     constructor(siteId: number, plotID: number, stageID: number,
                  image: string, imageDate: string, fileName: string){
        
        this.siteID = siteId;
        this.plotID = plotID;
        this.constructionStageID = stageID;
        this.recordID = 0;
        this.image = image;
        this.imageDate = imageDate;
        this.filename = fileName;
        this.filesize = 0;
    
     }

}