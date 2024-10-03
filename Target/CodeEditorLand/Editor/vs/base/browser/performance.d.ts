export declare namespace inputLatency {
    function onKeyDown(): void;
    function onBeforeInput(): void;
    function onInput(): void;
    function onKeyUp(): void;
    function onSelectionChange(): void;
    function onRenderStart(): void;
    interface IInputLatencyMeasurements {
        keydown: IInputLatencySingleMeasurement;
        input: IInputLatencySingleMeasurement;
        render: IInputLatencySingleMeasurement;
        total: IInputLatencySingleMeasurement;
        sampleCount: number;
    }
    interface IInputLatencySingleMeasurement {
        average: number;
        min: number;
        max: number;
    }
    function getAndClearMeasurements(): IInputLatencyMeasurements | undefined;
}
