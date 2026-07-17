export const FORM_MODAL_CONTENT =
  "max-h-[calc(100dvh-1.5rem)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-2xl border-(--panel-border) bg-(--panel-inset) p-0 text-(--panel-text) shadow-2xl sm:max-h-[calc(100dvh-3rem)]";

export const FORM_MODAL_HEADER =
  "shrink-0 border-b border-(--panel-border-subtle) bg-(--panel) px-5 py-4 pr-14 sm:px-6 sm:py-5";

export const FORM_MODAL_TITLE =
  "flex items-center gap-3 text-lg font-semibold leading-7 text-(--panel-text) sm:text-xl";

export const FORM_MODAL_DESCRIPTION =
  "pl-[52px] text-xs leading-5 text-(--panel-text-muted)";

export const FORM_MODAL_ICON =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300";

export const FORM_MODAL_BODY =
  "grid min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden";

export const FORM_MODAL_SCROLL_AREA =
  "min-h-0 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 [&_[data-slot=input]]:h-10 [&_[data-slot=label]]:text-sm [&_[data-slot=label]]:font-medium [&_[data-slot=select-trigger]]:h-10 [&_[data-slot=select-trigger]]:w-full sm:px-6";

export const FORM_MODAL_FOOTER =
  "z-10 flex shrink-0 flex-col-reverse gap-2 border-t border-(--panel-border) bg-(--panel-inset) px-5 py-4 sm:flex-row sm:justify-end sm:px-6";

export const MODAL_SECONDARY_BUTTON =
  "h-10 w-full rounded-xl border border-(--panel-border) bg-(--panel) text-(--panel-text-muted) hover:bg-(--panel-hover) hover:text-(--panel-text) sm:w-auto";

export const MODAL_PRIMARY_BUTTON =
  "h-10 w-full rounded-xl bg-indigo-600 px-6 text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-500 sm:w-auto";

export const DELETE_MODAL_CONTENT =
  "gap-0 overflow-hidden rounded-2xl border-(--panel-border) bg-(--panel) p-0 text-(--panel-text) shadow-2xl sm:max-w-[440px]";

export const DELETE_MODAL_HEADER =
  "flex flex-col items-center px-6 pb-5 pt-7 text-center";

export const DELETE_MODAL_FOOTER =
  "grid grid-cols-1 gap-2 border-t border-(--panel-border-subtle) bg-(--panel-inset)/60 px-5 py-4 sm:grid-cols-2 sm:px-6";

export const DELETE_MODAL_CANCEL_BUTTON =
  "h-10 w-full rounded-xl border border-(--panel-border) bg-(--panel) text-(--panel-text-muted) hover:bg-(--panel-hover) hover:text-(--panel-text)";

export const DELETE_MODAL_CONFIRM_BUTTON =
  "h-10 w-full rounded-xl bg-red-600 font-medium text-white shadow-lg shadow-red-600/15 hover:bg-red-500";
