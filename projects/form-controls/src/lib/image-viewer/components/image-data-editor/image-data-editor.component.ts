import { Component, forwardRef, input, model } from '@angular/core';
import { ImageMetaData, SimpleInputComponent } from '@pavelo8501/form-controls';
import { ImageEditorSettings } from '../../classes/image-editor-settings.model';
import { ANIMATABLE_ITEM, IHandledComponent, AnimatableBase, IAnimationHandler } from '@pavelo8501/data-helpers';

@Component({
  selector: 'fc-image-data-editor',
  imports: [
    SimpleInputComponent
  ],
  templateUrl: "./image-data-editor.component.html",
  styleUrls: ['./image-data-editor.component.css', "./../../../../../styles/buttons.css", "./../../../../../styles/inputs.css"],
  providers: [{ provide: ANIMATABLE_ITEM, useExisting: forwardRef(() => ImageDataEditorComponent) }]
})
export class ImageDataEditorComponent extends AnimatableBase{

  componentName: string = "ImageDataEditorComponent"

  editorSettings = input.required<ImageEditorSettings>()

  imageData = model<ImageMetaData>()


  override provideAnimationHandler(handler: IAnimationHandler): void {
    this.animationHandler = handler
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      console.log("Selected:", file.name);

      // example: preview
      const reader = new FileReader();
      reader.onload = () => {
        console.log("Image preview:", reader.result);
        // you can bind this to an <img [src]="previewUrl">
        // this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

 }
