import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/core/config/utils";
import { buttonVariants } from "@/shared/ui/primitives/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-semibold text-white uppercase tracking-wider",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-white/5 border-white/10 text-zinc-400 p-0 hover:opacity-100 hover:bg-yellow-500/20 hover:text-yellow-400 hover:border-yellow-500/30 transition-all rounded-full"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-auto border-collapse space-y-1",
        head_row: "", // Native table row for perfect alignment
        head_cell:
          "text-zinc-500 rounded-md text-[0.8rem] font-normal text-center select-none cursor-default py-2",
        row: "", // Native table row for perfect alignment
        cell: "text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-transparent [&:has([aria-selected])]:bg-transparent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal text-zinc-300 aria-selected:opacity-100 hover:bg-white/10 hover:text-white rounded-full transition-all mx-auto"
        ),
        day_range_start: "day-range-start !bg-yellow-500 !text-black font-bold rounded-full hover:!bg-yellow-400 hover:!text-black",
        day_range_end: "day-range-end !bg-yellow-500 !text-black font-bold rounded-full hover:!bg-yellow-400 hover:!text-black",
        day_selected:
          "bg-transparent text-yellow-400 hover:bg-transparent hover:text-yellow-400 focus:bg-transparent focus:text-yellow-400 font-medium",
        day_today: "bg-white/10 text-white font-bold border border-white/20 rounded-full",
        day_outside:
          "day-outside text-zinc-700 opacity-30 aria-selected:bg-transparent aria-selected:text-zinc-700 aria-selected:opacity-30",
        day_disabled: "text-zinc-700 opacity-30 cursor-not-allowed",
        day_range_middle:
          "aria-selected:!bg-yellow-500/10 aria-selected:!text-yellow-500 !bg-yellow-500/10 !text-yellow-500 !rounded-full !shadow-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
