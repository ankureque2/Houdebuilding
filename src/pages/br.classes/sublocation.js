"use strict";
var SubLocation = (function () {
    function SubLocation(RecordID, SiteID, PrimaryName, ShortCode, HouseTypeName, HouseTypeAltName) {
        this.RecordID = RecordID;
        this.SiteID = SiteID;
        this.PrimaryName = PrimaryName;
        this.ShortCode = ShortCode;
        this.HouseTypeName = HouseTypeName;
        this.HouseTypeAltName = HouseTypeAltName;
    }
    return SubLocation;
}());
exports.SubLocation = SubLocation;
var PlotConstructionStage = (function () {
    function PlotConstructionStage(RecordID, SubLocationID, ConStageID, CurrentWorkProgress, NewWorkProgress) {
        this.RecordID = RecordID;
        this.SubLocationID = SubLocationID;
        this.ConStageID = ConStageID;
        this.CurrentWorkProgress = CurrentWorkProgress;
        this.NewWorkProgress = NewWorkProgress;
    }
    return PlotConstructionStage;
}());
exports.PlotConstructionStage = PlotConstructionStage;
var PlotStage = (function () {
    function PlotStage(PlotID, ConStageID, conStageHeaderID, StageName, SubLocationConStageID, CurrentWorkProgress, NewWorkProgress) {
        this.PlotID = PlotID;
        this.ConStageID = ConStageID;
        this.ConStageHeaderID = conStageHeaderID;
        this.StageName = StageName;
        this.CurrentWorkProgress = CurrentWorkProgress;
        this.NewWorkProgress = NewWorkProgress;
    }
    PlotStage.Create = function (stage, plotID, stageProgress) {
        if (stageProgress == undefined) {
            return new PlotStage(plotID, stage.RecordID, stage.ConStageHeaderID, stage.Description, undefined, 0, 0);
        }
        else {
            return new PlotStage(plotID, stage.RecordID, stage.ConStageHeaderID, stage.Description, stageProgress.RecordID, stageProgress.CurrentWorkProgress, stageProgress.NewWorkProgress);
        }
    };
    PlotStage.CreatePlotStages = function (stages, plotID, stagesProgress) {
        var plotStages = new Array();
        var _loop_1 = function(stage) {
            var progress = void 0;
            if (stagesProgress != undefined) {
                progress = stagesProgress.find(function (p) { return p.ConStageID == stage.RecordID; });
            }
            if (progress != undefined) {
                plotStages.push(new PlotStage(plotID, stage.RecordID, stage.ConStageHeaderID, stage.Description, progress.RecordID, progress.CurrentWorkProgress, progress.NewWorkProgress));
            }
            else {
                plotStages.push(new PlotStage(plotID, stage.RecordID, stage.ConStageHeaderID, stage.Description, undefined, 0, 0));
            }
        };
        for (var _i = 0, stages_1 = stages; _i < stages_1.length; _i++) {
            var stage = stages_1[_i];
            _loop_1(stage);
        }
        return plotStages;
    };
    return PlotStage;
}());
exports.PlotStage = PlotStage;
