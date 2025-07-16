import { GenericObject } from "./common";

export interface UserContextType {
    user: User | null;
    login: (userData: User) => Promise<void>;
    logout: () => Promise<void>;
    BaseObj:GenericObject;
    ColorScheme:'light'|'dark'
}

export interface User {
    id: string,
    name: string,
    email: string,
    subsidiary:string,
    shift:string,
    group: {
        id: string;
        name: string;
    },
    department: {
        id: string;
        name: string;
    },
    role: string
}
