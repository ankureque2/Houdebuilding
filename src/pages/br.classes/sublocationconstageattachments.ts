export class SubLocationConStageImage
{
    RecordID: number;
    SublocationID: number;
    ConStageID: number
    PhotoData: string;
    PhotoBase64: string;
    PhotoDateTime: string;
    constructor(recordID: number, subLocID: number, StageID: number,               
                PhotoData: string, photoDateTime: string){
                this.RecordID = recordID;
                this.SublocationID =subLocID;
                this.ConStageID  = StageID;
                this.PhotoData = PhotoData;
                this.PhotoDateTime = photoDateTime;
                this.PhotoBase64 = "data:image/jpeg;base64," +PhotoData;
                }
}

export class SubLocationConStageNote{
    RecordID: number;
    SublocationConStageID: number;
    Notes : string;
    NotesDateTime: string;

    constructor(RecordID: number, 
                SublocationConStageID: number,
                Notes : string,
                NotesDateTime: string){

      this.RecordID = RecordID;
      this.SublocationConStageID = SublocationConStageID;
      this.Notes = Notes;
      this.NotesDateTime = NotesDateTime;
    }
}