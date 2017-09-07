import { Component } from '@angular/core';
import { NavController, NavParams , ViewController, LoadingController} from 'ionic-angular';
import {Database} from "../../providers/database";
import {SubLocationConStageImage} from '../br.classes/sublocationconstageattachments'; 
/*
  Generated class for the Gallery page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-gallery',
  templateUrl: 'gallery.html'
})
export class GalleryPage {

private images: Array<string>;
grid: Array<Array<string>>;
private plotID: number;
stageID: number;
private stageImages: SubLocationConStageImage[];
selectedImages: Array<string>;

  constructor(public navCtrl: NavController, public database: Database, 
              public viewCtrl: ViewController, private _navParams: NavParams,
              private loadingCtrl: LoadingController) {

  this.plotID = <number> this._navParams.get('plotID');
  this.stageID = <number> this._navParams.get('stageID');
  this.images = new Array<string>();
  this.selectedImages = new Array<string>();
    
  }

ionViewDidLoad() {

}

  ionViewWillEnter(){
        console.log("populating iamges");
        this.populateImages();
  }

populateImages(){
   let storedImages : any;
    let loader = this.loadingCtrl.create({
            content: "Please wait...Populating selected image(s).",
            spinner: "bubbles",
            showBackdrop: false,
            dismissOnPageChange: false
     });
      loader.present();

    this.database.getSublocationConStageAttachments(this.plotID, this.stageID).then((data) =>
        {
          this.stageImages = <SubLocationConStageImage[]> data;                  
        for (let stageimage of this.stageImages)
        {
          this.images.push(stageimage.PhotoBase64);
        }        
          let rowNum = 0;
        	this.grid = Array(Math.ceil(this.images.length/2));
        for (let i = 0; i < this.images.length; i+=2) {
          
          this.grid[rowNum] = Array(2);
          
          if (this.images[i]) {
            this.grid[rowNum][0] = this.images[i]
          }
          
          if (this.images[i+1]) {
            this.grid[rowNum][1] = this.images[i+1]
          }  		
          rowNum++;
        }	
        loader.dismiss();
        }, (error) => 
        {
          console.log(error);
           loader.dismiss();
        }); 
}

selectImage(imageURL :string){

this.selectedImages.push(imageURL);
}

deleteSelectedImages(){
console.log("deleted");

}

dismiss() {
    this.viewCtrl.dismiss();
  }

}
