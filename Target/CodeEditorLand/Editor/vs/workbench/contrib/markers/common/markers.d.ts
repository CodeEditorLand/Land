import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export declare const enum MarkersViewMode {
    Table = "table",
    Tree = "tree"
}
export declare namespace Markers {
    const MARKERS_CONTAINER_ID = "workbench.panel.markers";
    const MARKERS_VIEW_ID = "workbench.panel.markers.view";
    const MARKERS_VIEW_STORAGE_ID = "workbench.panel.markers";
    const MARKER_COPY_ACTION_ID = "problems.action.copy";
    const MARKER_COPY_MESSAGE_ACTION_ID = "problems.action.copyMessage";
    const RELATED_INFORMATION_COPY_MESSAGE_ACTION_ID = "problems.action.copyRelatedInformationMessage";
    const FOCUS_PROBLEMS_FROM_FILTER = "problems.action.focusProblemsFromFilter";
    const MARKERS_VIEW_FOCUS_FILTER = "problems.action.focusFilter";
    const MARKERS_VIEW_CLEAR_FILTER_TEXT = "problems.action.clearFilterText";
    const MARKERS_VIEW_SHOW_MULTILINE_MESSAGE = "problems.action.showMultilineMessage";
    const MARKERS_VIEW_SHOW_SINGLELINE_MESSAGE = "problems.action.showSinglelineMessage";
    const MARKER_OPEN_ACTION_ID = "problems.action.open";
    const MARKER_OPEN_SIDE_ACTION_ID = "problems.action.openToSide";
    const MARKER_SHOW_PANEL_ID = "workbench.action.showErrorsWarnings";
    const MARKER_SHOW_QUICK_FIX = "problems.action.showQuickFixes";
    const TOGGLE_MARKERS_VIEW_ACTION_ID = "workbench.actions.view.toggleProblems";
}
export declare namespace MarkersContextKeys {
    const MarkersViewModeContextKey: RawContextKey<MarkersViewMode>;
    const MarkersTreeVisibilityContextKey: RawContextKey<boolean>;
    const MarkerFocusContextKey: RawContextKey<boolean>;
    const MarkerViewFilterFocusContextKey: RawContextKey<boolean>;
    const RelatedInformationFocusContextKey: RawContextKey<boolean>;
    const ShowErrorsFilterContextKey: RawContextKey<boolean>;
    const ShowWarningsFilterContextKey: RawContextKey<boolean>;
    const ShowInfoFilterContextKey: RawContextKey<boolean>;
    const ShowActiveFileFilterContextKey: RawContextKey<boolean>;
    const ShowExcludedFilesFilterContextKey: RawContextKey<boolean>;
}
