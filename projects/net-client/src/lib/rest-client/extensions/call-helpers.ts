import { HttpParams } from "@angular/common/http";


export function partsToUrl(pathParts: string[]): string {
    return pathParts
      .map(part => part.trim().replace(/^\/+|\/+$/g, '')) // trim and remove slashes
      .filter(part => part.length > 0)
      .join('/');
}

export function toHttpParams(params: Record<string, string | number>): HttpParams {
  let httpParams = new HttpParams();
  Object.entries(params).forEach(([key, value]) => {
    httpParams = httpParams.set(key, value.toString());
  });
  return httpParams;
}