import { Colour } from "./loging.enums";

function objectToConsole(obj: Object){
  if (Array.isArray(obj)) {
    console.log(...obj);
  } else {
    console.log(obj);
  }
}

export function log(msg: string, obj?: unknown) {
  console.log(msg)
  if(obj != undefined){
    objectToConsole(obj)
  }
}

export function info(msg: string, colour: Colour = Colour.White) {
  console.log(`${colour}${msg}${Colour.Reset}`)
}

