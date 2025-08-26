import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IEditorItem } from '../../classes/editor-item.interface';

@Component({
  selector: 'fc-editor-item',
  imports: [
    CommonModule
  ],
  templateUrl: "./editor-item.component.html" ,
  styleUrl: './editor-item.component.css'
})
export class EditorItemComponent { 

  source = input.required<IEditorItem>()

  updated = output<IEditorItem>()
  removed = output<IEditorItem>()

  editing = computed<boolean>(
    ()=>{
      return this.source().editing
    }
  )

  maxWidth = input<string>("200px")

  edit() {
    console.log("edit call")
    const source = this.source()
    source.editing = !source.editing
  }

  save(newValue: string){
     console.log("save call")
     const item = this.source();
     item.text = newValue;
     item.editing = false;
     this.updated.emit(item);
  }


  delete() {
    console.log("delete call")
    this.removed.emit(this.source());
  }

}
