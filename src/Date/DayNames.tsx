import { StyleSheet, TextStyle, View } from 'react-native'
import DayName from './DayName'
import { useTheme } from 'react-native-paper'
import { DisableWeekDaysType, showWeekDay } from './dateUtils'
import { memo, useMemo } from 'react'

export const dayNamesHeight = 44

function DayNames({
  disableWeekDays,
  locale,
  startWeekOnMonday,
  textStyle,
}: {
  locale: undefined | string
  disableWeekDays?: DisableWeekDaysType
  startWeekOnMonday: boolean
  textStyle?: TextStyle
}) {
  const theme = useTheme()

  const shortDayNames = useMemo<string[]>(() => {
    // TODO: wait for a better Intl api ;-)
    const weekdays = [
      new Date(2020, 7, 2),
      new Date(2020, 7, 3),
      new Date(2020, 7, 4),
      new Date(2020, 7, 5),
      new Date(2020, 7, 6),
      new Date(2020, 7, 7),
      new Date(2020, 7, 8),
    ]
    if (startWeekOnMonday) {
      weekdays.push(weekdays.shift() as Date)
    }
    const formatter = new Intl.DateTimeFormat(locale, {
      weekday: 'narrow',
    })
    return weekdays.map((date) => formatter.format(date))
  }, [locale, startWeekOnMonday])

  return (
    <View
      style={[styles.dayNames, { backgroundColor: theme.colors.surface }]}
      pointerEvents="none"
    >
      {shortDayNames
        .filter((_, dayIndex) => showWeekDay(dayIndex, disableWeekDays))
        .map((dayName, i) => (
          <DayName
            key={`${dayName}_${i}`}
            label={dayName}
            textStyle={textStyle}
          />
        ))}
    </View>
  )
}
const styles = StyleSheet.create({
  dayNames: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flexDirection: 'row',
    height: dayNamesHeight,
  },
})
export default memo(DayNames)
