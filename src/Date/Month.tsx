import { StyleSheet, TextStyle, View } from 'react-native'
import {
  Icon,
  MD2Theme,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper'
import Day, { EmptyDay } from './Day'

import {
  addMonths,
  areDatesOnSameDay,
  beginOffset,
  calendarDaySize,
  DisableWeekDaysType,
  estimatedMonthHeight,
  getDaysInMonth,
  getFirstDayOfMonth,
  getGridCount,
  getRealIndex,
  gridCounts,
  isDateBetween,
  showWeekDay,
  startAtIndex,
  useRangeChecker,
} from './dateUtils'
import { getCalendarHeaderHeight } from './CalendarHeader'
import type {
  CalendarDate,
  CalendarDates,
  ModeType,
  ValidRangeType,
} from './Calendar'
import { dayNamesHeight } from './DayNames'
import { useTextColor } from '../shared/utils'
import { memo, useMemo } from 'react'
import { sharedStyles } from '../shared/styles'

interface BaseMonthProps {
  locale: undefined | string
  scrollMode: 'horizontal' | 'vertical'
  disableWeekDays?: DisableWeekDaysType
  mode: ModeType
  index: number
  onPressYear: (year: number) => any
  selectingYear: boolean
  onPressDate: (date: Date) => any
  accentColor: string
  selectColor: string
  roundness: number
  validRange?: ValidRangeType
  startWeekOnMonday: boolean
  // some of these should be required in final implementation
  startDate?: CalendarDate
  endDate?: CalendarDate
  date?: CalendarDate
  dates?: CalendarDates
  textStyle?: TextStyle
}

interface MonthRangeProps extends BaseMonthProps {
  mode: 'range'
  startDate: CalendarDate
  endDate: CalendarDate
}

interface MonthSingleProps extends BaseMonthProps {
  mode: 'single'
  date: CalendarDate
}

interface MonthMultiProps extends BaseMonthProps {
  mode: 'multiple'
  dates: CalendarDates
}

function Month(props: MonthSingleProps | MonthRangeProps | MonthMultiProps) {
  const {
    index,
    mode,
    date,
    dates,
    startDate,
    endDate,
    onPressYear,
    selectingYear,
    onPressDate,
    scrollMode,
    accentColor,
    selectColor,
    roundness,
    disableWeekDays,
    locale,
    validRange,
    startWeekOnMonday,
    textStyle,
  } = props
  const isHorizontal = scrollMode === 'horizontal'

  const theme = useTheme()
  const textColor = useTextColor(accentColor)
  const realIndex = getRealIndex(index)
  const { isDisabled, isWithinValidRange } = useRangeChecker(validRange)

  const { monthName, month, year } = useMemo(() => {
    const md = addMonths(new Date(), realIndex)
    const y = md.getFullYear()
    const m = md.getMonth()
    const formatter = new Intl.DateTimeFormat(locale, {
      month: 'long',
    })
    return { monthName: formatter.format(md), month: m, year: y }
  }, [realIndex, locale])

  const grid = useMemo(() => {
    const today = new Date()

    const daysInMonth = getDaysInMonth({ year, month })
    const dayOfWeek = getFirstDayOfMonth({ year, month, startWeekOnMonday })
    const emptyDays = dayOfWeek

    return monthGrid(index, startWeekOnMonday).map(({ days, weekGrid }) => {
      return {
        weekIndex: weekGrid,
        generatedDays: days.map((_, dayIndex) => {
          const isFirstWeek = weekGrid === 0
          const realDayIndex = emptyDays - dayIndex
          const beforeWeekDay = isFirstWeek && realDayIndex > 0
          const dayOfMonth = weekGrid * 7 + dayIndex - emptyDays + 1
          const afterWeekDay = dayOfMonth > daysInMonth

          const day = new Date(year, month, dayOfMonth)
          const isToday = areDatesOnSameDay(day, today)

          let inRange = false
          let disabled = isDisabled(day)
          let selected = false

          let leftCrop = dayOfMonth === 1
          let rightCrop = dayOfMonth === daysInMonth

          const isFirstDayOfMonth = dayOfMonth === 1
          const isLastDayOfMonth = dayOfMonth === daysInMonth

          if (mode === 'range') {
            const selectedStartDay = areDatesOnSameDay(day, startDate)
            const selectedEndDay = areDatesOnSameDay(day, endDate)
            selected = selectedStartDay || selectedEndDay
            inRange = isDateBetween(day, {
              startDate,
              endDate,
            })
            if (selectedStartDay) {
              leftCrop = true
            }
            if (selectedEndDay) {
              rightCrop = true
            }
            if (dayIndex === 0 && !selectedStartDay) {
              leftCrop = false
            }

            if (dayIndex === 6 && !selectedEndDay) {
              rightCrop = false
            }

            if (
              (isFirstDayOfMonth && selectedEndDay) ||
              (isLastDayOfMonth && selectedStartDay)
            ) {
              inRange = false
            }
          } else if (mode === 'multiple') {
            const safeDates = dates || []
            selected = safeDates.some((d) => areDatesOnSameDay(day, d))

            const yesterday = new Date(year, month, dayOfMonth - 1)
            const tomorrow = new Date(year, month, dayOfMonth + 1)

            const yesterdaySelected = safeDates.some((d) =>
              areDatesOnSameDay(d, yesterday)
            )
            const tomorrowSelected = safeDates.some((d) =>
              areDatesOnSameDay(d, tomorrow)
            )

            if (selected) {
              if (tomorrowSelected && yesterdaySelected) {
                inRange = true
              }
              if (tomorrowSelected && !yesterdaySelected) {
                inRange = true
                leftCrop = true
              }

              if (yesterdaySelected && !tomorrowSelected) {
                inRange = true
                rightCrop = true
              }

              if (isFirstDayOfMonth && !tomorrowSelected) {
                inRange = false
              }

              if (isLastDayOfMonth && !yesterdaySelected) {
                inRange = false
              }

              if (inRange && !leftCrop && !rightCrop) {
                selected = false
              }
            }
          } else if (mode === 'single') {
            selected = areDatesOnSameDay(day, date)
          }

          const isWithinOptionalValidRange = isWithinValidRange(day)

          if (inRange && !disabled) {
            disabled = false
          }

          if (!isWithinOptionalValidRange) {
            disabled = true
          }

          return {
            beforeWeekDay,
            afterWeekDay,
            year,
            month,
            dayOfMonth,
            dayIndex,
            mode,
            selected,
            inRange,
            leftCrop,
            rightCrop,
            isToday,
            disabled,
          }
        }),
      }
    })
  }, [
    year,
    month,
    index,
    isDisabled,
    mode,
    isWithinValidRange,
    startDate,
    endDate,
    dates,
    date,
    startWeekOnMonday,
  ])

  let textFont = theme?.isV3
    ? theme.fonts.titleSmall
    : (theme as any as MD2Theme).fonts.medium

  const iconColor = theme.isV3
    ? theme.colors.onSurfaceVariant
    : theme.colors.onSurface

  const iconSourceV3 = selectingYear ? 'menu-up' : 'menu-down'
  const iconSourceV2 = selectingYear ? 'chevron-up' : 'chevron-down'
  const iconSource = theme.isV3 ? iconSourceV3 : iconSourceV2

  return (
    <View
      style={{ height: getMonthHeight(scrollMode, index, startWeekOnMonday) }}
    >
      <View
        style={[
          styles.monthHeader,
          isHorizontal
            ? {
                marginTop: monthHeaderSingleMarginTop,
                marginBottom: monthHeaderSingleMarginBottom,
              }
            : null,
        ]}
      >
        <TouchableRipple
          disabled={!isHorizontal}
          onPress={isHorizontal ? () => onPressYear(year) : undefined}
          accessibilityRole="button"
          accessibilityLabel={`${monthName} ${year}`}
          style={[
            styles.yearButton,
            {
              borderRadius: roundness,
            },
          ]}
        >
          <View
            style={[
              styles.yearButtonInner,
              {
                borderRadius: roundness,
              },
            ]}
          >
            <Text
              maxFontSizeMultiplier={1.5}
              style={[
                styles.monthLabel,
                {
                  ...textFont,
                  color: theme.isV3
                    ? theme.colors.onSurfaceVariant
                    : theme.colors.onSurface,
                },
                textStyle,
              ]}
              selectable={false}
            >
              {monthName} {year}
            </Text>
            <View
              style={[
                styles.iconWrapper,
                isHorizontal ? sharedStyles.opacity1 : sharedStyles.opacity0,
              ]}
            >
              <Icon size={24} color={iconColor} source={iconSource} />
            </View>
          </View>
        </TouchableRipple>
      </View>
      {grid.map(({ weekIndex, generatedDays }) => (
        <View style={styles.week} key={weekIndex}>
          {generatedDays
            .filter((gd) => showWeekDay(gd.dayIndex, disableWeekDays))
            .map((gd) =>
              gd.beforeWeekDay || gd.afterWeekDay ? (
                <EmptyDay key={gd.dayIndex} />
              ) : (
                <Day
                  key={gd.dayIndex}
                  theme={theme}
                  day={gd.dayOfMonth}
                  month={gd.month}
                  year={gd.year}
                  selected={gd.selected}
                  inRange={gd.inRange}
                  leftCrop={gd.leftCrop}
                  rightCrop={gd.rightCrop}
                  onPressDate={onPressDate}
                  isToday={gd.isToday}
                  selectColor={selectColor}
                  accentColor={accentColor}
                  disabled={gd.disabled}
                  textColorOnPrimary={textColor}
                  textStyle={textStyle}
                />
              )
            )}
        </View>
      ))}
    </View>
  )
}

export const weekMargin = 6
export const weekSize = calendarDaySize + weekMargin
export const montHeaderHeight = 56
export const monthHeaderSingleMarginTop = 4
export const monthHeaderSingleMarginBottom = 8 + 44 + 12
export const monthHeaderSingleHeight =
  monthHeaderSingleMarginTop + monthHeaderSingleMarginBottom

const styles = StyleSheet.create({
  iconWrapper: {
    padding: 8,
  },
  monthHeader: {
    height: montHeaderHeight,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  monthLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  week: {
    flexDirection: 'row',
    marginBottom: weekMargin,
    height: calendarDaySize,
  },
  yearButton: {
    alignSelf: 'flex-start',
    marginLeft: 6,
  },
  yearButtonInner: {
    paddingLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
})

const monthGrid = (index: number, startWeekOnMonday: boolean) => {
  return Array(getGridCount(index, startWeekOnMonday))
    .fill(null)
    .map((_, weekGrid) => {
      const days = Array(7).fill(null)
      return { weekGrid, days }
    })
}

function getIndexCount(index: number): number {
  if (index > startAtIndex) {
    return index - startAtIndex
  }

  return -(startAtIndex - index)
}

function weeksOffset(index: number, startWeekOnMonday: boolean): number {
  if (index === startAtIndex) {
    return 0
  }
  let off = 0
  if (index > startAtIndex) {
    for (let i = 0; i < index - startAtIndex; i++) {
      const cIndex = startAtIndex + i
      off += gridCounts[cIndex] || getGridCount(cIndex, startWeekOnMonday)
    }
  } else {
    for (let i = 0; i < startAtIndex - index; i++) {
      const cIndex = startAtIndex - i - 1
      off -= gridCounts[cIndex] || getGridCount(cIndex, startWeekOnMonday)
    }
  }
  return off
}

export function getIndexFromHorizontalOffset(
  offset: number,
  width: number
): number {
  return startAtIndex + Math.floor(offset / width)
}

export function getIndexFromVerticalOffset(
  offset: number,
  startWeekOnMonday: boolean
): number {
  let estimatedIndex = startAtIndex + Math.ceil(offset / estimatedMonthHeight)

  const realOffset = getVerticalMonthsOffset(estimatedIndex, startWeekOnMonday)
  const difference = (realOffset - beginOffset - offset) / estimatedMonthHeight
  if (difference >= 1 || difference <= -1) {
    estimatedIndex -= Math.floor(difference)
  }
  return estimatedIndex
}

export function getHorizontalMonthOffset(index: number, width: number) {
  if (index < 0) {
    return 0
  }
  return width * index
}

export function getVerticalMonthsOffset(
  index: number,
  startWeekOnMonday: boolean
) {
  const count = getIndexCount(index)
  const ob = weeksOffset(index, startWeekOnMonday)
  const monthsHeight = weekSize * ob
  const c = monthsHeight + count * (dayNamesHeight + montHeaderHeight)

  return (c || 0) + beginOffset
}

export function getMonthHeight(
  scrollMode: 'horizontal' | 'vertical',
  index: number,
  startWeekOnMonday: boolean
): number {
  const calendarHeight = getCalendarHeaderHeight(scrollMode)
  const gc = getGridCount(index, startWeekOnMonday)

  const currentMonthHeight = weekSize * gc
  const extraHeight =
    scrollMode === 'horizontal' ? monthHeaderSingleHeight : montHeaderHeight
  const c = calendarHeight + currentMonthHeight + extraHeight
  return c || 0
}

export default memo(Month)
