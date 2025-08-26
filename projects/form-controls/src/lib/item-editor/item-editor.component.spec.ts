import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemEditorComponent } from './item-editor.component';
import { EditorItemComponent } from './components/editor-item/editor-item.component';

// describe('ItemEditorComponent', () => {



//   let component: ItemEditorComponent<any, EditorItem>;
//   let fixture: ComponentFixture<ItemEditorComponent<any, EditorItem>>;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       // only standalone Angular components go here
//       imports: [ItemEditorComponent, EditorItemComponent]
//     }).compileComponents();

//     //fixture = TestBed.createComponent(ItemEditorComponent);
//     ///component = fixture.componentInstance;

//     // 👇 mock items() so template has a valid EditorItem
//     spyOn(component, 'items').and.returnValue([
//       new EditorItem("test_item_1")
//     ]);

//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });