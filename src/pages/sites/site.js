"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Site = (function () {
    function Site(RecordID, PrimaryName, ShortCode, Address, PostCode, Telephone, Email, ProgressDate) {
        this.RecordID = RecordID;
        this.PrimaryName = PrimaryName;
        this.ShortCode = ShortCode;
        this.Address = Address;
        this.PostCode = PostCode;
        this.Telephone = Telephone;
        this.Email = Email;
        this.ProgressDate = ProgressDate;
    }
    return Site;
}());
exports.Site = Site;
var DownloadedSite = (function (_super) {
    __extends(DownloadedSite, _super);
    function DownloadedSite(RecordID, PrimaryName, ShortCode, Address, PostCode, Telephone, Email, ProgressDate, SyncDownDateTime, Modified, Selected) {
        _super.call(this, RecordID, PrimaryName, ShortCode, Address, PostCode, Telephone, Email, ProgressDate);
        this.SyncDownDateTime = SyncDownDateTime;
        this.Modified = Modified;
        this.Selected = Selected;
    }
    DownloadedSite.createNotDownloadSite = function (site) {
        return new DownloadedSite(site.RecordID, site.PrimaryName, site.ShortCode, site.Address, site.PostCode, site.Telephone, site.Email, site.ProgressDate, undefined, false, false);
    };
    DownloadedSite.prototype.copyNewProperties = function (housebuildingData) {
        this.PrimaryName = housebuildingData.PrimaryName;
        this.ShortCode = housebuildingData.ShortCode;
        this.Address = housebuildingData.Address;
        this.PostCode = housebuildingData.PostCode;
        this.Telephone = housebuildingData.Telephone;
        this.Email = housebuildingData.Email;
        this.ProgressDate = housebuildingData.ProgressDate;
    };
    return DownloadedSite;
}(Site));
exports.DownloadedSite = DownloadedSite;
