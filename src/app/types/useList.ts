import { GenericObject,KeyStyles,GenericFunction,GenericParaFunc } from "@/types"

export interface UseListOptions {
    LoadModal?:boolean,
    LoadObj?:GenericObject|null,
    Defined?:GenericObject[],
    Enabled?:boolean
}

export interface UseListFilterOptions extends UseListOptions {
    SearchFunction?: ((items: GenericObject[], keyword: string) => GenericObject[]) | null,
    SearchObj?:GenericObject|null,
}

export interface UseListPostOptions extends UseListFilterOptions {
    PostObj?:GenericObject|null
}

export interface DropdownMenuProps extends Omit<UseListFilterOptions,'Enabled'> {
    label?: string,
    def?: GenericObject,
    searchable?:boolean,
    disabled?: boolean,
    onChange?: (item: GenericObject) => void,
    AddStyle?: KeyStyles
}

export interface SelectOptions {
    item:GenericObject,
    onSelect:GenericFunction
}