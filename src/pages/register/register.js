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
var sites_1 = require('../sites/sites');
var Register = (function () {
    function Register(navCtrl, dataservice, alrtCrtl) {
        this.navCtrl = navCtrl;
        this.dataservice = dataservice;
        this.alrtCrtl = alrtCrtl;
    }
    Register.prototype.ngOnInit = function () {
        this.populateRegistrionNo();
    };
    Register.prototype.populateRegistrionNo = function () {
        var _this = this;
        this.connected = false;
        this.dataservice.getActivationInfo().then(function (result) {
            var activationData = result;
            _this.activecode = activationData.activationCode;
            _this.connected = activationData.connected;
            alert(activationData.activationCode);
        }, function (error) {
            console.log("ERROR: ", error.message);
        });
    };
    Register.prototype.registerApp = function () {
        var _this = this;
        alert(this.activecode);
        this.dataservice.saveActivationData(this.activecode, "HousebuildTestServer", true).then(function (result) {
            var alert = _this.alrtCrtl.create({
                title: 'Registration',
                subTitle: 'Registration Complete',
                buttons: ['OK'] });
            alert.present(alert);
            console.log("Activated");
        }, function (error) {
            console.log("ERROR: ", error.message);
            var alert = _this.alrtCrtl.create({
                title: 'Registration',
                subTitle: error.message,
                buttons: ['Dismiss'] });
            alert.present(alert);
        });
    };
    Register.prototype.deregister = function () {
        var _this = this;
        this.dataservice.deleteActivationRecords().then(function (result) {
            var alert = _this.alrtCrtl.create({
                title: 'Registration',
                subTitle: 'you have degistered',
                buttons: ['OK'] });
            alert.present(alert);
            console.log("DeActivated");
        }, function (error) {
            console.log("ERROR: ", error.message);
            var alert = _this.alrtCrtl.create({
                title: 'Registration',
                subTitle: error.message,
                buttons: ['Dismiss'] });
            alert.present(alert);
        });
        window.location.reload(true);
    };
    Register.prototype.gotoSitesPage = function () {
        this.navCtrl.setRoot(sites_1.Sites);
    };
    Register = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/register/register.html'
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavController, database_1.Database, ionic_angular_1.AlertController])
    ], Register);
    return Register;
}());
exports.Register = Register;
