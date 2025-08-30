import { Component, effect, forwardRef, input, model, output, signal } from '@angular/core';
import { ListItemComponent } from './components/editor-item/list-item.component'
import { ListEditorHandler, IEditorItem } from './classes/private-index';
import { ANIMATABLE_ITEM, AnimatableBase, ContainerState, deleteFromList, IAnimationHandler, identity, IHandledComponent, OutputMode, whenDefined } from '@pavelo8501/data-helpers';
import { ListItem } from './classes/list.item-model';
import { notify } from '@pavelo8501/data-helpers';

@Component({
  selector: 'fc-item-editor',
  imports: [
    ListItemComponent
  ],
  templateUrl: './list-editor.component.html',
  styleUrls: ['./list-editor.component.css', './../../../styles/buttons.css'],
  providers: [{ provide: ANIMATABLE_ITEM, useExisting: forwardRef(() => ListEditorComponent) }]
})

export class ListEditorComponent<T extends object, I extends object> extends AnimatableBase {

  override componentName: string = "ListEditorComponent"

  listEditorHandler = model<ListEditorHandler<T, I>>()

  editorState:ContainerState = ContainerState.IDLE

  items = model<ListItem<I>[]>([])
  itemBuilder = input<()=>I>()

  disabled = signal<boolean>(false)

  newButtonCaption = input<string>("New Item")

  onDeleted = output<T>()
  onSave = output<T>()

  private _contentProperty? : keyof I
  get contentProperty ():keyof I{
      if(this._contentProperty != undefined){
         return this._contentProperty
      }
      throw Error("ContentProperty not set")
  }

  constructor(){
    super()
    this.outputMode = OutputMode.Output
    effect(() => {
        whenDefined(this.listEditorHandler(), handler=>{
          handler.provideComponent(this)
          this.handleAnimation()
          this._contentProperty = handler.contentProperty
          const items = handler.listDelegate.get()
          this.loadSourceList(items, handler.contentProperty)
        })
      }
    )
  }

  private loadSourceList(source: I[], contentProperty: keyof I){
    const resultList:ListItem<I>[] = []
    source.forEach(item =>{
      const listItem = new ListItem(item, contentProperty)
      resultList.push(listItem)
    })
    this.items.set(resultList)
  }

  private removeFromItems(listItem: ListItem<I>){
    const items = this.items()
    console.log(items)
    const resultingList = deleteFromList(items, listItem, true)
    this.items.set(resultingList)
  }

  private addToItems(listItem: ListItem<I>){
    const items = this.items()
    console.log(items)
    items.push(listItem)
    this.items.set(items)
  }

  private handleAnimation(){
    whenDefined(this.animationHandler, animationHandler=>{
      animationHandler.show(this)
    }, identity(this))
  }

   private onSaveRequest = () => {
      notify("Processing save request", this)
      this.save()
      this.clear()
   }

  private onCancelRequest = () => {
    this.clear()
  }

  override provideAnimationHandler(handler: IAnimationHandler): void {
    this.animationHandler = handler
    handler.subscribeSaveRequest(this, this.onSaveRequest)
    handler.subscribeCancelRequest(this,  this.onCancelRequest)
  }

  save(){
    whenDefined(this.listEditorHandler(), handler=>{
      const list = this.items().map(x=>x.source)
      handler.provideValueToSave(list)
    })
  }

  edit(item : IEditorItem){
    this.editorState = ContainerState.EDIT
  }

  saved(item : IEditorItem){
     this.editorState = ContainerState.IDLE
  }

  deleted(itemComponent: ListItemComponent<any>) {
    whenDefined(this.listEditorHandler(), handler=>{
        const itemsList = handler.listDelegate.get()
        const itemToDelete = itemComponent.listItem().source
        try{
          const resultingList =  deleteFromList(itemsList, itemToDelete, true)
          handler.listDelegate.set(resultingList)
          this.removeFromItems(itemComponent.listItem())
        }catch(err:any){
          throw err 
        }
    })
  }

  addNew(){
    const builderFn = this.itemBuilder()
    if(builderFn != undefined){
      const newSource = builderFn()
      const newItem =  new ListItem(newSource, this.contentProperty)
      this.addToItems(newItem)
    }else{
      console.warn("builder function not provided")
    }
  }

  clear() {
     console.log("clear in component")
  }
}
