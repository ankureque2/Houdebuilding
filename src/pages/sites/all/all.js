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
var sites_service_1 = require('../sites.service');
var site_1 = require("../site");
var database_1 = require('../../../providers/database/database');
var details_1 = require('../details/details');
var sublocations_1 = require('../../sublocations/sublocations');
var AllSites = (function () {
    function AllSites(nav, siteservice, modalController, localdataService, app) {
        this.nav = nav;
        this.siteservice = siteservice;
        this.modalController = modalController;
        this.localdataService = localdataService;
        this.app = app;
    }
    AllSites.prototype.ngOnInit = function () {
        var _this = this;
        this.localdataService.getDownloadedSites().then(function (result) {
            _this.sitesList = new Array();
            var sites = _this.siteservice.getSites();
            var downloadedSites = result;
            var _loop_1 = function(item) {
                var match = downloadedSites.find(function (i) { return i.RecordID === item.RecordID; });
                if (match == undefined) {
                    var notDownlaodSite = site_1.DownloadedSite.createNotDownloadSite(item);
                    _this.sitesList.push(notDownlaodSite);
                }
                else {
                    match.copyNewProperties(item);
                    _this.sitesList.push(match);
                }
            };
            for (var _i = 0, sites_1 = sites; _i < sites_1.length; _i++) {
                var item = sites_1[_i];
                _loop_1(item);
            }
        }, function (error) {
            console.log("ERROR: ", error.message);
        });
    };
    AllSites.prototype.getSites = function (ev) {
        this.ngOnInit();
        // set val to the value of the searchbar
        var val = ev.target.value;
        // if the value is an empty string don't filter the items
        if (val && val.trim() != '') {
            this.sitesList = this.sitesList.filter(function (item) {
                return (item.PrimaryName.toLowerCase().indexOf(val.toLowerCase()) > -1);
            });
        }
    };
    AllSites.prototype.onSelected = function (ev, recordId) {
        var isSelected = Boolean(ev.checked);
        var id = recordId;
        var site = this.sitesList.find(function (st) { return st.RecordID == id; });
        console.log(isSelected);
        this.localdataService.saveSite(site, isSelected);
    };
    AllSites.prototype.openModal = function (recordId) {
        var param = { selected: this.sitesList.find(function (s) { return s.RecordID == recordId; }) };
        var modal = this.modalController.create(details_1.DetailsPage, param);
        modal.present();
    };
    AllSites.prototype.showPlots = function (recordId) {
        this.app.getRootNav().push(sublocations_1.SublocationsPage, { siteID: recordId });
    };
    AllSites = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/sites/all/all.html',
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavController, sites_service_1.SitesService, ionic_angular_1.ModalController, database_1.Database, ionic_angular_1.App])
    ], AllSites);
    return AllSites;
}());
exports.AllSites = AllSites;
