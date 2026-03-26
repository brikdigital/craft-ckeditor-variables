declare global {
    interface Window {
        availableGlobalSets: {
            handle: string;
            name: string;
            fields: {
                handle: string;
                name: string;
            }[]
        }[];
    }
}

export interface MenuChild {
    id: string;
    label: string;
}

export interface MenuDefinition {
    id: string;
    menu: string;
    children: MenuChild[];
}