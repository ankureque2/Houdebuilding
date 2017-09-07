
export interface ISite {
    recordID : number;
    primaryName : string;
    shortCode : string;
    address: string;
    postCode : string;
    telephone : string;
    email : string;
    progressDate : string;

}

export class Site implements ISite{

    constructor(public recordID : number, public primaryName : string,
                public shortCode : string, public address: string,
                public postCode : string, public telephone : string,
                public email :string, public progressDate : string) {

            }
}

export class DownloadedSite extends Site {
    SyncDownDateTime: string; 
    Modified: boolean;
    Selected: boolean;
   
    constructor( RecordID: number, PrimaryName: string,
                 ShortCode: string,  Address: string,
                 PostCode: string,  Telephone: string,
                 Email:string,  ProgressDate: string,
                 SyncDownDateTime: string, 
                 Modified: boolean, Selected: boolean){

    super(RecordID,PrimaryName,ShortCode, Address, PostCode, Telephone, Email , ProgressDate);
    this.SyncDownDateTime = SyncDownDateTime;
    this.Modified = Modified ;
    this.Selected = Selected;
  }

  static createNotDownloadSite(site:ISite){
    return new DownloadedSite(site.recordID ,site.primaryName ,site.shortCode ,site.address,
                                site.postCode ,site.telephone , site.email ,
                                site.progressDate , undefined, false,false);
                 }

    public copyNewProperties(housebuildingData: ISite): void {  
        this.primaryName  = housebuildingData.primaryName ;
        this.shortCode  = housebuildingData.shortCode ;
        this.address = housebuildingData.address;
        this.postCode  = housebuildingData.postCode ;
        this.telephone  = housebuildingData.telephone ;
        this.email  = housebuildingData.email ;
        this.progressDate  = housebuildingData.progressDate ; }
         
   public FullDesription(){
        let fulldesc : string;

        if (this.shortCode === ""){
                fulldesc = this.primaryName;
        }else{
            fulldesc = this.primaryName + " ( " + this.shortCode + " )";
        }
    return fulldesc;
 }

 
}