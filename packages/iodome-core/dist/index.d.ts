interface IodomeConfig {
    applicationName: string;
}

declare function loadConfig(): Promise<IodomeConfig>;

export { type IodomeConfig, loadConfig };
