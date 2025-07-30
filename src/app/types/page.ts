import { GenericObject,KeyStyles,User } from "@/types";

export interface PageProps {
    user:User|null,
    BaseObj:GenericObject,
    category?:string,
    id?:string,
    scheme:'light'|'dark'|undefined
}

export interface PageInfoRowProps {
    item: GenericObject,
    columns: PageInfoColConfig,
    expanded?:boolean,
    selected?: boolean,
    index?:string|number
}

export type PageInfoColConfig = PageInfoColProps[] | {[key:string]:PageInfoColProps[]} | string

export interface PageInfoColProps {
    internalid:string,
    name?:string,
    format?:KeyStyles,
    other?:string,
    value?:{
        handle?:(value:string|number) => string|number,
        format?:KeyStyles
    }
}