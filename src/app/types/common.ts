import {ViewStyle,TextStyle} from 'react-native';

export interface GenericObject {
    [key: string]: any;
  }
  
export interface KeyStyles {
  StyleContainer?:TextStyle & ViewStyle,
  StyleRow?:ViewStyle,
  StyleLabel?:TextStyle,
  StyleInput?:TextStyle & ViewStyle
}

export type GenericFunction = () => void;
export type GenericParaFunc = (item:any) => void;


export interface GenericOption {
  internalid:string,
  name:string
}

export interface MenuOption extends GenericOption {
  navigate?: string,
  details?: MenuOption[];
  icon?:string
}

export interface DatePickerProps {
    Mode:'single'|'range',
    Dates?:GenericObject,
    scheme:'light'|'dark'|undefined
    Change?:(item:any) => void
}