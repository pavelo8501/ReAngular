import { Component, computed, input, output, signal } from '@angular/core';
import { EditorItem } from '../../classes/editor-item.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-editor-item',
  imports: [
    CommonModule
  ],
  templateUrl: "./editor-item.component.html" ,
  styleUrl: './editor-item.component.css'
})
export class EditorItemComponent { 

  source = input.required<EditorItem>()

  updated = output<EditorItem>()
  removed = output<EditorItem>()

  editing = computed<boolean>(
    ()=>{
      return this.source().editing
    }
  )

  maxWidth = input<string>("200px")

  toggleEdit() {
    console.log("toggleEdit call")
    const source = this.source()
    source.editing = !source.editing
  }


  edit() {
    console.log("edit call")
    const source = this.source()
    source.editing = !source.editing

  }


  save(){
    console.log("save call")

  }

  saveEdit(newValue: string) {

    console.log("saveEdit call")

    const item = this.source();
    item.text = newValue;
    item.editing = false;
    this.toggleEdit()
    this.updated.emit(item);
  }

  delete() {
    this.removed.emit(this.source());
  }

}
