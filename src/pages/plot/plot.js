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
var database_1 = require("../../providers/database/database");
var stages_1 = require("../stages/stages");
var stage_1 = require('../stage/stage');
var PlotPage = (function () {
    function PlotPage(navCtrl, dataservice, params) {
        this.navCtrl = navCtrl;
        this.dataservice = dataservice;
        this.params = params;
        this.siteID = this.params.get("siteID");
        this.plot = this.params.get("plot");
        this.plotID = this.plot.RecordID;
        this.getConstructionstages();
    }
    PlotPage.prototype.ngOnInit = function () {
    };
    PlotPage.prototype.getConstructionstages = function () {
        var _this = this;
        this.dataservice.getConstructionStageHeaders(this.siteID).then(function (result) {
            _this.stageHeaders = result;
            _this.stageHeaderPages = new Array();
            for (var _i = 0, _a = _this.stageHeaders; _i < _a.length; _i++) {
                var sh = _a[_i];
                var open_1 = false;
                if (_this.stageHeaders[0] == sh) {
                    open_1 = false;
                }
                _this.stageHeaderPages.push(new stage_1.StagePage(sh.Description, sh.RecordID, 'ios-add-circle-outline', open_1));
            }
        }, function (error) {
            console.log("ERROR: ", error.message);
        });
    };
    PlotPage = __decorate([
        core_1.Component({
            directives: [stages_1.StagesPage],
            templateUrl: 'build/pages/plot/plot.html',
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavController, database_1.Database, ionic_angular_1.NavParams])
    ], PlotPage);
    return PlotPage;
}());
exports.PlotPage = PlotPage;
