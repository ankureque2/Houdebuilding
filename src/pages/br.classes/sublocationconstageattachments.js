"use strict";
var SubLocationConStageImage = (function () {
    function SubLocationConStageImage(recordID, subLocStageID, PhotoLoation) {
        this.RecordID = recordID;
        this.SublocationConStageID = subLocStageID;
        this.PhotoURL = PhotoLoation;
    }
    return SubLocationConStageImage;
}());
exports.SubLocationConStageImage = SubLocationConStageImage;
var SubLocationConStageNote = (function () {
    function SubLocationConStageNote(RecordID, SublocationConStageID, Notes, NotesDateTime) {
        this.RecordID = RecordID;
        this.SublocationConStageID = SublocationConStageID;
        this.Notes = Notes;
        this.NotesDateTime = NotesDateTime;
    }
    return SubLocationConStageNote;
}());
exports.SubLocationConStageNote = SubLocationConStageNote;
