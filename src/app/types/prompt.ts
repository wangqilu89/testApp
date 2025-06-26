import { GenericObject } from "./common"

export interface PromptContextType {
    ShowPrompt: ({msg,icon,input,ok,cancel}: PromptConfig) => Promise<GenericObject>,
    HidePrompt: (item:GenericObject) => void,
    ShowLoading: ({msg,icon,input,ok,cancel}: PromptConfig) => Promise<GenericObject>,
    HideLoading: (item:GenericObject) => void,
    visibility:boolean
}

interface PromptBase {
    msg: string | React.ReactNode,
    icon?:GenericObject,
    input?:GenericObject,
    ok?:GenericObject,
    cancel?:GenericObject
}

export interface PromptConfig extends PromptBase {
    container?:GenericObject
}

export interface PromptProps extends Required<PromptConfig> {
    visible:boolean,
    onClose:(item: GenericObject) => void
}

