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

export function toQueryString(url:string, params? : Record<string, string | number | boolean | undefined | null>): string {
  
  let query = ""
  if(params){
    const queryParts = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
     query = queryParts.length ? `?${queryParts.join('&')}` : ''
     url = url + query
  }
  return url
}
