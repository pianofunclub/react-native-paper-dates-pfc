import { Text, TouchableRipple } from 'react-native-paper'
import { StyleSheet, TextStyle, View } from 'react-native'
import { daySize } from './dateUtils'
import { memo, useCallback } from 'react'

function EmptyDayPure() {
  return <View style={styles.empty} />
}
export const EmptyDay = memo(EmptyDayPure)

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function DayOfWeek(props: {
  dayIndex: number
  selected: boolean
  onPressDay: (dayIndex: number) => any
  accentColor?: string
  disabled: boolean
  textColorOnPrimary: string
  textStyle?: TextStyle
}) {
  const {
    dayIndex,
    selected,
    onPressDay,
    accentColor = '#0B6327',
    disabled,
    textColorOnPrimary,
    textStyle,
  } = props

  const onPress = useCallback(() => {
    onPressDay(dayIndex)
  }, [onPressDay, dayIndex])

  const textColor = selected ? textColorOnPrimary : undefined

  return (
    <View style={[styles.root, disabled && styles.disabled]}>
      <TouchableRipple
        testID={`react-native-paper-dates-day-${dayIndex}`}
        disabled={disabled}
        borderless={true}
        onPress={disabled ? undefined : onPress}
        style={[styles.button]}
        accessibilityRole="button"
      >
        <View
          style={[
            styles.day,
            selected ? { backgroundColor: accentColor } : null,
          ]}
        >
          <Text
            style={[
              textColor && {
                color: textColor,
              },
              textStyle,
            ]}
            selectable={false}
          >
            {daysOfWeek[dayIndex]}
          </Text>
        </View>
      </TouchableRipple>
    </View>
  )
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    flexBasis: 0,
  },
  disabled: {
    opacity: 0.3,
  },
  root: {
    flexBasis: 0,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginHorizontal: 6,
  },
  button: {
    width: daySize,
    height: daySize,
    overflow: 'hidden',
    borderRadius: daySize / 2,
  },
  day: {
    flexBasis: 0,
    flex: 1,
    borderRadius: daySize / 2,
    width: daySize,
    height: daySize,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  flex1: {
    flex: 1,
  },
})

export default memo(DayOfWeek)
