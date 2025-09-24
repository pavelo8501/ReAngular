export enum HtmlTag{
    BODY = "BODY",
    SECTION = "SECTION",
    HEADER_2 = "H2",
    HEADER_3 = "H3",
    HEADER_4 = "H4",
    HEADER_5 = "H5",
    HEADER_6 = "H6",
    PARAGRAPH = "P",
    IMAGE = "IMG"
}

export const HtmlTagByName = (tagName: string): HtmlTag | undefined => {
    return Object.values(HtmlTag).find(tag => tag.toLowerCase() === tagName.toLowerCase());
};


export function htmlTagByName(tagName: string):HtmlTag{
    const found = Object.values(HtmlTag).find(tag => tag.toLowerCase() === tagName.toLowerCase());
    if(!found){
        throw Error(`HtmlTage for name: ${tagName} not found`)
    }
    return found
}