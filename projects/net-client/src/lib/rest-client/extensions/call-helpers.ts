

export function partsToUrl(pathParts: string[]): string {
    return pathParts
      .map(part => part.trim().replace(/^\/+|\/+$/g, '')) // trim and remove slashes
      .filter(part => part.length > 0)
      .join('/');
  }