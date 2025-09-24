import { IComponentIdentity } from "./idententity.interface";
import { OutputMode } from "./loging.enums";


export function getStackElements(err:Error): { fn: string; file: string; line: number; col: number }[] {
  const lines = (err.stack || "").split("\n").slice(1);
  return lines.map(line => {
    const match = line.trim().match(/at (.+?) \((.+):(\d+):(\d+)\)/)
              || line.trim().match(/at (.+):(\d+):(\d+)/);

    if (!match) return { fn: "unknown", file: "unknown", line: 0, col: 0 };

    if (match.length === 5) {
      return { fn: match[1], file: match[2], line: +match[3], col: +match[4] };
    } else {
      return { fn: "anonymous", file: match[1], line: +match[2], col: +match[3] };
    }
  })
}

export function notify(output:any, receiver?:IComponentIdentity){
    if(receiver != undefined){
        if(receiver.outputMode != OutputMode.Silent){
            if(typeof output === "string"){
                console.log(`${output} in ${receiver.componentName}`)
            }else{
                console.log(`In ${receiver.componentName}`)
                 console.log(output)
            }
        }
    }else{
         console.log(output)
    }
}