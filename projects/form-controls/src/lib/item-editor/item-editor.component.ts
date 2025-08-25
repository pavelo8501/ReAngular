import { Component, input, signal } from '@angular/core';
import { EditorItem } from './classes/editor-item.model';
import {EditorItemComponent} from './components/editor-item/editor-item.component'

@Component({
  selector: 'lib-item-editor',
  imports: [
    EditorItemComponent
  ],
  templateUrl: './item-editor.component.html',
  styleUrl: './item-editor.component.css'
})
export class ItemEditorComponent {

  items = input<EditorItem[]>([])


  addNewClick(){


  }
  
}
