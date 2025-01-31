"use client"

import { cn } from "@/lib/utils"
import { getLocalTimeZone, today } from "@internationalized/date"
import { ComponentProps } from "react"
import {
  Button,
  CalendarCell as CalendarCellRac,
  CalendarGridBody as CalendarGridBodyRac,
  CalendarGridHeader as CalendarGridHeaderRac,
  CalendarGrid as CalendarGridRac,
  CalendarHeaderCell as CalendarHeaderCellRac,
  Calendar as CalendarRac,
  Heading as HeadingRac,
  RangeCalendar as RangeCalendarRac,
  composeRenderProps,
} from "react-aria-components"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"

interface BaseCalendarProps {
  className?: string
}

type CalendarProps = ComponentProps<typeof CalendarRac> & BaseCalendarProps
type RangeCalendarProps = ComponentProps<typeof RangeCalendarRac> &
  BaseCalendarProps

const CalendarHeader = () => (
  <header className="flex w-full items-center gap-1 pb-1">
    <Button
      slot="previous"
      className="flex h-7 w-7 items-center justify-center rounded-lg text-[#4A4F41]/60 outline-offset-2 transition-colors hover:bg-[#4A4F41]/10 hover:text-[#4A4F41] focus:outline-none"
    >
      <ChevronLeftIcon className="h-4 w-4" />
    </Button>
    <HeadingRac className="grow text-center text-sm font-medium text-[#4A4F41]" />
    <Button
      slot="next"
      className="flex h-7 w-7 items-center justify-center rounded-lg text-[#4A4F41]/60 outline-offset-2 transition-colors hover:bg-[#4A4F41]/10 hover:text-[#4A4F41] focus:outline-none"
    >
      <ChevronRightIcon className="h-4 w-4" />
    </Button>
  </header>
)

const CalendarGridComponent = ({ isRange = false }: { isRange?: boolean }) => {
  const now = today(getLocalTimeZone())

  return (
    <CalendarGridRac>
      <CalendarGridHeaderRac>
        {(day) => (
          <CalendarHeaderCellRac className="h-8 w-8 rounded-lg p-0 text-xs font-normal text-[#4A4F41]/60">
            {day}
          </CalendarHeaderCellRac>
        )}
      </CalendarGridHeaderRac>
      <CalendarGridBodyRac className="mt-2 [&_td]:px-0">
        {(date) => (
          <CalendarCellRac
            date={date}
            className={cn(
              "relative flex h-8 w-8 items-center justify-center whitespace-nowrap rounded-lg border border-transparent p-0 text-sm font-normal text-[#4A4F41] outline-offset-2 duration-150 [transition-property:color,background-color,border-radius,box-shadow] focus:outline-none data-[disabled]:pointer-events-none data-[unavailable]:pointer-events-none data-[focus-visible]:z-10 data-[hovered]:bg-[#4A4F41]/5 data-[selected]:bg-[#4A4F41] data-[hovered]:text-[#4A4F41] data-[selected]:text-[#E8E3DD] data-[unavailable]:line-through data-[disabled]:opacity-30 data-[unavailable]:opacity-30",
              // Today indicator styles
              date.compare(now) === 0 &&
                "bg-[#4A4F41]/5 data-[selected]:bg-[#4A4F41]"
            )}
          />
        )}
      </CalendarGridBodyRac>
    </CalendarGridRac>
  )
}

const Calendar = ({ className, ...props }: CalendarProps) => {
  return (
    <CalendarRac
      {...props}
      className={composeRenderProps(className, (className) =>
        cn("w-fit", className),
      )}
    >
      <CalendarHeader />
      <CalendarGridComponent />
    </CalendarRac>
  )
}

const RangeCalendar = ({ className, ...props }: RangeCalendarProps) => {
  return (
    <RangeCalendarRac
      {...props}
      className={composeRenderProps(className, (className) =>
        cn("w-fit", className),
      )}
    >
      <CalendarHeader />
      <CalendarGridComponent isRange />
    </RangeCalendarRac>
  )
}

export { Calendar, RangeCalendar } 