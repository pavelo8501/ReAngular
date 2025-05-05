import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-editor-tools',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './editor-tools.component.html',
  styleUrl: './editor-tools.component.css',

})
export class EditorToolsComponent {


}
