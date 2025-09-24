import { Component, inject, input, model, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IEditorItem } from '../../classes/editor-item.interface';
import { ListItem } from '../../classes/list.item-model';
import { ListEditorComponent } from './../../list-editor.component';
import { ContainerState } from '@pavelo8501/data-helpers';

@Component({
  selector: 'fc-list-item',
  imports: [
    CommonModule
  ],
  templateUrl: "./list-item.component.html" ,
  styleUrl: './list-item.component.css',
})
export class ListItemComponent<T extends object>{ 

  editor = inject(ListEditorComponent);
  listItem = input.required<ListItem<T>>()

  content = model.required<string>()

  updated = output<IEditorItem>()
  editing = signal<boolean>(false)

  onEdit = output<IEditorItem>()
  onSave = output<ListItemComponent<T>>()

  maxWidth = input<string>("200px")

  edit() {
    console.log(`Edit call `)
    const source = this.listItem()
    if(this.editor.editorState == ContainerState.IDLE){
      this.editing.set(true)
      this.editor.edit(source)
      this.onEdit.emit(source)
    }
  }

  save(newValue: string){
     console.log(`Save call. value: ${newValue}`)
     this.content.set(newValue)
     this.listItem()?.setText(newValue)
     this.editing.set(false)
     this.onSave.emit(this)
  }

  updateModel(){

    this.listItem()?.saveText()

  }

  // save(newValue: string){
  //    console.log(`Save call. value: ${newValue}`)
  //    const listItem = this.listItem();
  //    listItem.save(newValue)
  //    this.editing.set(false)
  //    this.editor.saved(listItem)
  // }

  delete() {
    console.log("delete call")
    this.editor.deleted(this)
  }

}
