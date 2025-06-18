import { GenericObject,KeyStyles,User } from "@/types";

export interface PageProps {
    user:User,
    category?:string,
    id?:string,
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
    value?:{
        handle?:(value:string|number) => string|number,
        format?:KeyStyles
    }
}