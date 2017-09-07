"use strict";
var ConstructionStageHeader = (function () {
    function ConstructionStageHeader(RecordID, SiteID, Description, BuildOrder) {
        this.RecordID = RecordID;
        this.SiteID = SiteID;
        this.Description = Description;
        this.BuildOrder = BuildOrder;
    }
    return ConstructionStageHeader;
}());
exports.ConstructionStageHeader = ConstructionStageHeader;
var ConstructionStage = (function () {
    function ConstructionStage(RecordID, ConStageHeaderID, Description, BuildOrder) {
        this.RecordID = RecordID;
        this.ConStageHeaderID = ConStageHeaderID;
        this.Description = Description;
        this.BuildOrder = BuildOrder;
    }
    return ConstructionStage;
}());
exports.ConstructionStage = ConstructionStage;
