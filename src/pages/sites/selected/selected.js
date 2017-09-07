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
var database_1 = require('../../../providers/database/database');
var details_1 = require('../details/details');
var sublocations_1 = require('../../sublocations/sublocations');
/*
  Generated class for the SelectedPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
var SelectedSites = (function () {
    function SelectedSites(nav, modalController, localdataService, app) {
        this.nav = nav;
        this.modalController = modalController;
        this.localdataService = localdataService;
        this.app = app;
    }
    SelectedSites.prototype.ngOnInit = function () {
        var _this = this;
        this.localdataService.getSelectedSites().then(function (result) {
            _this.items = result;
        }, function (error) {
            console.log("ERROR: ", error.message);
        });
    };
    SelectedSites.prototype.onSelectedChanged = function (ev, recordId) {
        var selectedsite = this.items.find(function (ds) { return ds.RecordID == recordId; });
        this.localdataService.changeSiteStatus(recordId, false);
        var index = this.items.indexOf(selectedsite);
        if (index > -1) {
            this.items.splice(index, 1);
        }
    };
    SelectedSites.prototype.openModal = function (recordId) {
        var param = { selected: this.items.find(function (s) { return s.RecordID == recordId; }) };
        var modal = this.modalController.create(details_1.DetailsPage, param);
        modal.present();
    };
    SelectedSites.prototype.showPlots = function (recordId) {
        this.app.getRootNav().push(sublocations_1.SublocationsPage, { siteID: recordId });
    };
    SelectedSites = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/sites/selected/selected.html',
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavController, ionic_angular_1.ModalController, database_1.Database, ionic_angular_1.App])
    ], SelectedSites);
    return SelectedSites;
}());
exports.SelectedSites = SelectedSites;
