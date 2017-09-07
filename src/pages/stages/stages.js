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
var notes_1 = require('../notes/notes');
var database_1 = require("../../providers/database/database");
var sublocation_1 = require('../../br.classes/sublocation');
var stage_pipe_1 = require('./stage.pipe');
var ionic_native_1 = require('ionic-native');
/*
  Generated class for the StagesPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
var StagesPage = (function () {
    function StagesPage(dataservice, modalController, navCtrl) {
        this.dataservice = dataservice;
        this.modalController = modalController;
        this.navCtrl = navCtrl;
        this.imageLocation = "";
    }
    StagesPage.prototype.ngOnInit = function () {
        var _this = this;
        this.dataservice.getSiteConstructionStages(this.siteID).then(function (result) {
            var conStages = result;
            _this.stages = sublocation_1.PlotStage.CreatePlotStages(conStages, _this.plotID, undefined);
        }, function (error) {
            console.log("ERROR: ", error.message);
        });
    };
    StagesPage.prototype.StageCompletionUpdated = function () {
    };
    StagesPage.prototype.toggleDetails = function (accord) {
        if (accord.showDetails) {
            accord.showDetails = false;
            accord.icon = 'ios-add-circle-outline';
        }
        else {
            accord.showDetails = true;
            accord.icon = 'ios-remove-circle-outline';
        }
    };
    StagesPage.prototype.takePicture = function (stageID, plotID) {
        var _this = this;
        var options = {
            quality: 75,
            destinationType: ionic_native_1.Camera.DestinationType.FILE_URI,
            sourceType: ionic_native_1.Camera.PictureSourceType.CAMERA,
            allowEdit: false,
            encodingType: ionic_native_1.Camera.EncodingType.JPEG,
            targetWidth: 300,
            targetHeight: 300,
            correctOrientation: true,
            saveToPhotoAlbum: true
        };
        ionic_native_1.Camera.getPicture(options).then(function (imagePath) {
            _this.imageLocation = imagePath;
            //this.dataservice.
        }, function (error) {
            console.log("ERROR -> " + JSON.stringify(error));
        });
    };
    StagesPage.prototype.takeNotes = function (stageID, plotID) {
        var param = { PlotStageID: stageID };
        var modal = this.modalController.create(notes_1.NotesPage, param);
        modal.present();
    };
    StagesPage.prototype.openGallery = function () {
        var _this = this;
        var cameraOptions = {
            sourceType: ionic_native_1.Camera.PictureSourceType.PHOTOLIBRARY,
            destinationType: ionic_native_1.Camera.DestinationType.FILE_URI,
            quality: 100,
            targetWidth: 1000,
            targetHeight: 1000,
            encodingType: ionic_native_1.Camera.EncodingType.JPEG,
            correctOrientation: true
        };
        ionic_native_1.Camera.getPicture(cameraOptions)
            .then(function (file_uri) { return _this.imageSrc = file_uri; }, function (err) { return console.log(err); });
    };
    StagesPage = __decorate([
        core_1.Component({
            selector: 'stageheaders',
            inputs: ['headers', 'plotID', 'siteID'],
            templateUrl: 'build/pages/stages/stages.html',
            pipes: [stage_pipe_1.StageFilterPipe]
        }), 
        __metadata('design:paramtypes', [database_1.Database, ionic_angular_1.ModalController, ionic_angular_1.NavController])
    ], StagesPage);
    return StagesPage;
}());
exports.StagesPage = StagesPage;
