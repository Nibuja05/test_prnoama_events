interface CustomNetTableDeclarations {
    constants: {
        [key: string]: {
            value: number;
        };
    };
    game_status: {
        time: {
            time: number;
        };
        dev: {
            cheats_enabled: boolean;
        };
    };
}
