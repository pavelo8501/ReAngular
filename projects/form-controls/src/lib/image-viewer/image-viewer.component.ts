import { Component, effect, input } from '@angular/core';
import { IImageData } from './classes/image-data.model';

@Component({
  selector: 'fc-image-viewer',
  imports: [],
  templateUrl: "./image-viewer.component.html",
  styleUrl: './image-viewer.component.css'
})
export class ImageViewerComponent {

  imageSrc: string | null = null;
  imageFilename: string | null = null;

  imageData = input<IImageData|undefined>(undefined)

  constructor(){

    effect(
      ()=>{
        const imageData = this.imageData()
        if(imageData != undefined){

          console.log("imageData supplied")
          console.log(imageData)

          this.showImage(imageData)
        }
      }
    )
  }


  showImage(imageData: IImageData) {

    fetch(imageData.href)
      .then(res => res.blob())
      .then(blob => {
        this.imageSrc = URL.createObjectURL(blob)
        this.imageFilename = imageData.filename
    });
  }
}
