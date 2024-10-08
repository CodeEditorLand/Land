export declare namespace inputLatency {
    /**
     * Record the start of the keydown event.
     */
    function onKeyDown(): void;
    /**
     * Record the start of the beforeinput event.
     */
    function onBeforeInput(): void;
    /**
     * Record the start of the input event.
     */
    function onInput(): void;
    /**
     * Record the start of the keyup event.
     */
    function onKeyUp(): void;
    /**
     * Record the start of the selectionchange event.
     */
    function onSelectionChange(): void;
    /**
     * Record the start of the animation frame performing the rendering.
     */
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
    /**
     * Gets all input latency samples and clears the internal buffers to start recording a new set
     * of samples.
     */
    function getAndClearMeasurements(): IInputLatencyMeasurements | undefined;
}
