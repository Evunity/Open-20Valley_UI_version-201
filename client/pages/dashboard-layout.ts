export const DASHBOARD_LAYOUT = {
  sectionGapClass: "space-y-5", // 20px
  sectionHeaderGapClass: "space-y-1", // 4px
  sectionContentGapClass: "space-y-3", // 12px
  gridGapClass: "gap-3", // 12px
  cardPaddingClass: "p-3", // 12px
  controlGapClass: "gap-2", // 8px
  controlHeightClass: "h-[34px]",
  chartHeaderHeightClass: "h-9", // 36px
  kpiCardHeightClass: "h-[84px]",
  analyticsTileHeightClass: "h-[76px]",
  chartPanelHeightClass: "h-[190px]",
  chartAreaHeight: 150,
  chartPanelHeight: 190,
  sidebarBaseWidth: 232,
  sidebarDashboardIntensityClass: "bg-sidebar/95",
} as const;

export const DASHBOARD_TYPOGRAPHY = {
  pageTitleClass: "text-[26px] leading-tight font-semibold text-foreground",
  sectionTitleClass: "text-[18px] leading-tight font-semibold text-foreground",
  cardTitleClass: "text-[14px] leading-tight font-semibold text-foreground",
  bodyClass: "text-[13px] leading-5 text-foreground",
  metaClass: "text-[12px] leading-4 text-muted-foreground",
  labelClass: "text-[11px] leading-4 font-semibold text-muted-foreground uppercase tracking-wide",
  valueClass: "text-[20px] leading-none font-semibold",
  chartLabelClass: "text-[11px]",
} as const;
