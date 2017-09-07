export class UserSettings{
    ShowStagesWithAppmeasureItemsOnly: Boolean;
    HideCompletedStages: Boolean;
    constructor(appitemsOnly: Boolean, nocompletedstages: Boolean)
    {
        this.ShowStagesWithAppmeasureItemsOnly = appitemsOnly;
        this.HideCompletedStages = nocompletedstages;
    }   
}

 export class AppSettings{
     ImageQuality: number;
     DebugModeOn: Boolean;
     constructor(quality: number, debugmode: Boolean){
        this.ImageQuality = quality;
        this.DebugModeOn = debugmode;
     }
 }