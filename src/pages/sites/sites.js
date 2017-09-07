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
var sites_service_1 = require('./sites.service');
var all_1 = require('./all/all');
var selected_1 = require('./selected/selected');
var Sites = (function () {
    function Sites(navCtrl, navParams, siteservice) {
        this.navCtrl = navCtrl;
        this.siteservice = siteservice;
        // If we navigated to this page, we will have an item available as a nav param
        this.allPage = all_1.AllSites;
        this.selectedPage = selected_1.SelectedSites;
    }
    Sites.prototype.itemTapped = function (event, item) {
        // That's right, we're pushing to ourselves!
        this.navCtrl.push(Sites, {
            item: item
        });
    };
    Sites = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/sites/sites.html'
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavController, ionic_angular_1.NavParams, sites_service_1.SitesService])
    ], Sites);
    return Sites;
}());
exports.Sites = Sites;
