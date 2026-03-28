export const DASHBOARD_LAYOUT = {
  sectionGapClass: "space-y-6", // 24px
  sectionHeaderGapClass: "space-y-1", // 4px
  sectionContentGapClass: "space-y-3", // 12px
  gridGapClass: "gap-3", // 12px
  cardPaddingClass: "p-3", // 12px
  controlHeightClass: "h-9", // 36px
  kpiCardHeightClass: "h-24", // 96px
  analyticsTileHeightClass: "h-[88px]",
  chartHeight: 200,
  sidebarBaseWidth: 240,
  sidebarDashboardIntensityClass: "bg-sidebar/95",
} as const;

export const DASHBOARD_TYPOGRAPHY = {
  pageTitleClass: "text-[28px] leading-tight font-semibold text-foreground",
  sectionTitleClass: "text-[20px] leading-tight font-semibold text-foreground",
  cardTitleClass: "text-[16px] leading-snug font-semibold text-foreground",
  bodyClass: "text-[14px] leading-5 text-foreground",
  metaClass: "text-[12px] leading-4 text-muted-foreground",
  labelClass: "text-[12px] leading-4 font-semibold text-muted-foreground uppercase tracking-wide",
  valueClass: "text-[24px] leading-none font-bold",
} as const;
