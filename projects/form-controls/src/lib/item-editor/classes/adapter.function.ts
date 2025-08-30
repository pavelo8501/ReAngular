import { IEditorItem } from "./editor-item.interface";
import { ListEditorHandler } from "./list-editor.handler";



export function asEditorItem<T extends object>(model: T, key: keyof T): IEditorItem {

  return new Proxy(model as any, {


    get(target, prop) {
      if (prop === "text") return target[key];
      if (prop === "editing") return target.editing ?? false;
      return target[prop];
    },

    set(target, prop, value) {
      if (prop === "text") target[key] = value;
      else if (prop === "editing") target.editing = value;
      else target[prop] = value;
      return true;
    }
  });
}



// export function asEditorPayload<P, T extends object>(
//   source: P,
//   models: T[],
//   key: keyof T
// ): EditorPayload<P, T> {

//   const proxies: IEditorItem[] = models.map(model => {
//     return new Proxy(model as any, {
//       get(target, prop) {
//         if (prop === "text") return target[key];
//         if (prop === "editing") return target.editing ?? false;
//         return target[prop];
//       },
//       set(target, prop, value) {
//         if (prop === "text") target[key] = value;
//         else if (prop === "editing") target.editing = value;
//         else target[prop] = value;
//         return true;
//       }
//     })
//     }
//   )

//   return new EditorPayload(source, proxies as T[])

// }


// export function asEditorPayload2<P, T extends object>(
//   source: P,
//   models: T[],
//   key: keyof T
// ): EditorPayload<P, T> {

//   const editingMap = new WeakMap<T, boolean>();

//   const proxies = models.map(model => new Proxy(model as any, {
//     get(target, prop) {
//       if (prop === "text") return target[key];
//       if (prop === "editing") return editingMap.get(target) ?? false;
//       return target[prop];
//     },
//     set(target, prop, value) {
//       if (prop === "text") target[key] = value;
//       else if (prop === "editing") editingMap.set(target, value);
//       else target[prop] = value;
//       return true;
//     }
//   }));

//   return new EditorPayload(source, proxies);
// }