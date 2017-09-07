"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var ionic_angular_1 = require('ionic-angular');
var plots_service_1 = require('../../providers/plots-service/plots-service');
var database_1 = require('../../providers/database/database');
var plot_1 = require('../plot/plot');
/*
  Generated class for the DetailsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
var SublocationsPage = (function () {
    function SublocationsPage(nav, params, plotservice, dataservice, alrtCrtl) {
        this.nav = nav;
        this.params = params;
        this.plotservice = plotservice;
        this.dataservice = dataservice;
        this.alrtCrtl = alrtCrtl;
        this.siteID = this.params.get("siteID");
    }
    SublocationsPage.prototype.ngOnInit = function () {
        this.populatePlots();
    };
    SublocationsPage.prototype.populatePlots = function () {
        var _this = this;
        this.plots = this.plotservice.getPlots(this.siteID);
        this.dataservice.getPlots(this.siteID).then(function (result) {
            _this.downloadedPlots = result;
            _this.download = (_this.downloadedPlots.length < 1);
            console.log(_this.siteID, _this.downloadedPlots.length, _this.download);
        }, function (error) {
            console.log("ERROR: ", error.message);
        });
    };
    SublocationsPage.prototype.downloadSite = function () {
        var StageHeaders = new Array();
        StageHeaders = this.plotservice.getConstructionStageHeaders(this.siteID);
        for (var _i = 0, StageHeaders_1 = StageHeaders; _i < StageHeaders_1.length; _i++) {
            var h = StageHeaders_1[_i];
            this.dataservice.saveConstructionStageHeader(h.RecordID, h.SiteID, h.Description, h.BuildOrder);
        }
        var stages = new Array();
        stages = this.plotservice.getConstructionStages(this.siteID);
        for (var _a = 0, stages_1 = stages; _a < stages_1.length; _a++) {
            var s = stages_1[_a];
            this.dataservice.saveConstructionStage(s.RecordID, s.ConStageHeaderID, s.Description, s.BuildOrder);
        }
        for (var _b = 0, _c = this.plots; _b < _c.length; _b++) {
            var p = _c[_b];
            this.dataservice.savePlot(p.RecordID, p.SiteID, p.PrimaryName, p.ShortCode, p.HouseTypeName, p.HouseTypeAltName);
        }
        this.downloadedPlots = this.plots;
        this.download = (this.downloadedPlots.length < 1);
        var alert = this.alrtCrtl.create({
            title: 'Site',
            subTitle: 'Site Saved',
            buttons: ['OK'] });
        alert.present(alert);
    };
    SublocationsPage.prototype.openPlot = function (plotID, siteID) {
        var plot = this.plots.find(function (p) { return p.RecordID == plotID; });
        this.nav.push(plot_1.PlotPage, { siteID: siteID, plot: plot });
    };
    SublocationsPage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/sublocations/sublocations.html'
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavController, ionic_angular_1.NavParams, plots_service_1.PlotsService, database_1.Database, ionic_angular_1.AlertController])
    ], SublocationsPage);
    return SublocationsPage;
}());
exports.SublocationsPage = SublocationsPage;
