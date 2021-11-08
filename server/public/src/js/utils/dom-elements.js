`use strict`
export function GET_DOM_ELEMENTS() {

   const buttons = document.getElementsByTagName("button");

   const appSidebar = document.getElementById(`v_pills_tab`);
   const sidebarExpandBtn = document.getElementById(`app_sidebar_expand_button`);
   const settingsSidebarToggleBtn = document.getElementById(`avg_settings_sidebar_toggle_btn`);

   const appActivityIndWrapper = document.querySelector(`.app-activity-indicator-wrapper`);
   const appActivityInd = document.querySelector(`.app-activity-indicator`);

   // PANE ELEMENTS
   const paneResizeBtns = document.querySelectorAll(`.pane-resize-btn`);
   const clusterInsightsTabBtn = document.getElementById(`geo_cluster_insights_tab_btn`);
   const clusterInsightsTabPane = document.getElementById(`geo_cluster_insights_tab_pane`);
   const clusterDetailsTabBtn = document.getElementById(`geo_cluster_details_tab_btn`);
   const clusterDetailsTabPane = document.getElementById(`geo_cluster_details_tab_pane`);

   // CLUSTER RESULTS
   const resultsCountDiv = document.getElementById('results_count');
   const resultsStatus = document.getElementById('results_status');

   const clusterFilterCheckboxes = document.querySelectorAll(`.results-filter-checkbox[type=checkbox]`);
   const clusterFilterCheckboxMasters = document.querySelectorAll(`.results-filter-checkbox.master-checkbox[type=checkbox]`)

   // SETTINGS INPUTS
   // const settingsToggleInputs = document.querySelectorAll(`.settings-sidebar-body input[type=checkbox]`);
   // const settingsRadioInputs = document.querySelectorAll(`.settings-sidebar-body input[type=radio]`);
   const baseMapRadios = document.querySelectorAll(`.base-map-tile-radio`);
   const plotsMapStyleRadios = document.querySelectorAll(`.cluster-plots-map-style-radio`);
   const distanceUnitsRadios = document.querySelectorAll(`.map-distance-units-radio`);
   const areaUnitsRadios = document.querySelectorAll(`.map-area-units-radio`);
   const clusterMapZoomRange = document.getElementById("cluster_map_zoom");
   
   const geoClustersDatasetEl = document.getElementById(`geo_clusters_dataset`);

   const clusterResultsBody = document.querySelector(`.cluster-results-body`);
   const resultModalDiv = document.getElementById(`result_item_modal`);
   const resultModalCloseBtn = document.getElementById(`result_item_modal_close_btn`);
   const resultsFilterBtn = document.getElementById(`results_filter_button`);
   const resultsScrollTopBtn = document.getElementById(`results_scroll_top_button`);
   const resultsListWrapper = document.getElementById(`results_list_wrapper`);
   const resultItemDivs = document.querySelectorAll(`.result-item`);
   const clusterTitleDivs = document.querySelectorAll(`.result-item-title`);
   const masterResultCheckbox = document.getElementById(`select_all_results_chk`);
   const resultItemCheckboxes = document.querySelectorAll(`.result-item-checkbox[type=checkbox]`);

   const clusterFeatsNumEl = document.getElementById(`cluster_feats_num`);
   const clusterAreaEl = document.getElementById(`cluster_area`);
   const clusterUsedAreaEl = document.getElementById(`cluster_used_area`);
   const clusterUnusedAreaEl = document.getElementById(`cluster_unused_area`);
   const featsListingDiv = document.getElementById(`cluster_feats_listing_body`);

   const bufferFeatsChkBx = document.getElementById(`buffer_cluster_feats_chk`)
   const renderMultiFeatsChkBx = document.getElementById(`render_multiple_feats_chk`);


   return {
      buttons,

      appSidebar,
      sidebarExpandBtn,
      // settingsSidebarToggleBtn,
      appActivityIndWrapper,
      appActivityInd,
      plotsMapStyleRadios,
      baseMapRadios,
      distanceUnitsRadios,
      areaUnitsRadios,
      clusterMapZoomRange,

      paneResizeBtns,
      clusterInsightsTabBtn,
      clusterInsightsTabPane,
      clusterDetailsTabBtn,
      clusterDetailsTabPane,


      resultsCountDiv,
      resultsStatus,

      geoClustersDatasetEl,
      
      clusterResultsBody,
      resultModalDiv,
      resultModalCloseBtn,
      resultsFilterBtn,
      resultsScrollTopBtn,
      resultsListWrapper,
      resultItemDivs,
      clusterTitleDivs,
      masterResultCheckbox,
      resultItemCheckboxes,

      clusterFilterCheckboxes,
      clusterFilterCheckboxMasters,

      clusterFeatsNumEl,
      clusterAreaEl,
      clusterUsedAreaEl,
      clusterUnusedAreaEl,
      featsListingDiv,
      bufferFeatsChkBx,
      renderMultiFeatsChkBx,
   };
};