import { MD2Theme, Text, TouchableRipple } from 'react-native-paper'
import { StyleSheet, TextStyle, View } from 'react-native'
import DayRange from './DayRange'
import { calendarDaySize } from './dateUtils'

import type { PaperTheme } from '../shared/utils'
import { memo, useCallback } from 'react'

function EmptyDayPure() {
  return <View style={styles.empty} />
}

export const EmptyDay = memo(EmptyDayPure)

function Day(props: {
  theme: PaperTheme
  textColorOnPrimary: string
  day: number
  month: number
  year: number
  selected: boolean
  inRange: boolean
  leftCrop: boolean
  rightCrop: boolean
  accentColor: string
  selectColor: string
  isToday: boolean
  disabled: boolean
  onPressDate: (date: Date) => any
  textStyle?: TextStyle
}) {
  const {
    day,
    month,
    year,
    selected,
    inRange,
    leftCrop,
    rightCrop,
    onPressDate,
    accentColor,
    selectColor,
    isToday,
    disabled,
    textColorOnPrimary,
    theme,
    textStyle,
  } = props
  const borderColorFallback = theme.dark ? '#fff' : '#000'
  const selectedOrInRangeDarkMode = selected || (inRange && theme.dark)
  const v2BorderColor = selectedOrInRangeDarkMode
    ? textColorOnPrimary
    : borderColorFallback
  const borderColor = theme.isV3 ? theme.colors.primary : v2BorderColor

  const onPress = useCallback(() => {
    onPressDate(new Date(year, month, day))
  }, [onPressDate, year, month, day])

  // TODO: check if this can be simplified
  // converted with Chat-GPT for now from enormous conditional to if-else
  let baseTextColor
  let finalTextColor

  if (theme.isV3) {
    // Theme V3 specific logic for base text color
    if (selected) {
      baseTextColor = theme.colors.onPrimary
    } else if (inRange && theme.dark) {
      baseTextColor = theme.colors.onPrimaryContainer
    } else {
      baseTextColor = theme.colors.onSurface
    }

    // Theme V3 specific logic for final text color
    if (isToday) {
      finalTextColor = selected ? baseTextColor : theme.colors.primary
    } else {
      finalTextColor = baseTextColor
    }
  } else {
    // Logic for themes other than V3
    if (selected || (inRange && theme.dark)) {
      baseTextColor = textColorOnPrimary
    }
    // Since there's no additional logic provided for non-V3 themes in the step 2,
    // the final text color for non-V3 themes will simply be the base text color.
    finalTextColor = baseTextColor
  }

  let textFont = theme?.isV3
    ? theme.fonts.bodySmall
    : (theme as any as MD2Theme).fonts.medium

  return (
    <View style={[styles.root, disabled && styles.disabled]}>
      <DayRange
        inRange={inRange}
        leftCrop={leftCrop}
        rightCrop={rightCrop}
        selectColor={selectColor}
      />
      <TouchableRipple
        testID={`react-native-paper-dates-day-${year}-${month}-${day}`}
        disabled={disabled}
        borderless={true}
        onPress={disabled ? undefined : onPress}
        style={[
          styles.button,
          { backgroundColor: inRange ? selectColor : undefined },
        ]}
        accessibilityRole="button"
      >
        <View
          style={[
            styles.day,
            isToday ? { borderColor: borderColor } : null,
            selected ? { backgroundColor: accentColor } : null,
          ]}
        >
          <Text
            maxFontSizeMultiplier={1.5}
            style={[
              baseTextColor
                ? {
                    color: finalTextColor,
                  }
                : undefined,
              { ...textFont },
              textStyle,
            ]}
            selectable={false}
          >
            {day}
          </Text>
        </View>
      </TouchableRipple>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    width: calendarDaySize,
    height: calendarDaySize,
    overflow: 'hidden',
    borderRadius: calendarDaySize / 2,
  },
  day: {
    flexBasis: 0,
    flex: 1,
    borderRadius: calendarDaySize / 2,
    width: calendarDaySize,
    height: calendarDaySize,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  disabled: {
    opacity: 0.3,
  },
  empty: {
    flex: 1,
    flexBasis: 0,
  },
  root: {
    flexBasis: 0,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
})

export default memo(Day)
