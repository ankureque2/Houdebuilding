export class StageHeaderPanel{
 title: string;
 stageID: number;
  icon: string;
 showDetails: boolean;
 noStages: boolean
  constructor(private StageTitle: string, private StageId: number, private Icon: string, private ShowDetails: boolean) {

      this.title = StageTitle;
      this.stageID = StageId;
      this.icon = Icon;
      this.showDetails = ShowDetails;
      this.noStages = false
  }

}