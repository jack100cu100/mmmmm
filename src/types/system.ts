export interface SystemConfig {
    password_load_limit: number;
    password_load_duration: number;
    code_load_limit: number;
    code_load_duration: number;
}

export const getSystemConfig = (): SystemConfig | null => {
    const config = localStorage.getItem('systemConfig');
    if (config) {
        return JSON.parse(config);
    }
    return null;
};

export const setSystemConfig = (config: SystemConfig): void => {
    localStorage.setItem('systemConfig', JSON.stringify(config));
};
