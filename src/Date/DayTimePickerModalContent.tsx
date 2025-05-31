import { memo, useCallback, useEffect, useState } from 'react'
import { View, StyleSheet, useWindowDimensions, TextStyle } from 'react-native'

import DatePickerModalHeader from './DatePickerModalHeader'
import DayTimePickerModalContentHeader, {
  HeaderPickProps,
} from './DayTimePickerModalContentHeader'
import DatePickerModalHeaderBackground from './DatePickerModalHeaderBackground'
import AnalogClock from '../Time/AnalogClock'
import {
  toHourInputFormat,
  toHourOutputFormat,
  circleSize,
  clockTypes,
  PossibleClockTypes,
} from '../Time/timeUtils'
import TimeInputs from '../Time/TimeInputs'
import DayOfWeek from './DayOfWeek'
import { useTextColor } from '../shared/utils'
import { DisplayModeContext } from '../contexts/DisplayModeContext'

type onChangeFunc = ({
  hours,
  minutes,
  focused,
}: {
  hours: number
  minutes: number
  focused?: undefined | PossibleClockTypes
}) => any

export interface DayTimePickerModalContentProps extends HeaderPickProps {
  inputFormat?: string
  locale: string
  onDismiss: () => any
  isLoading?: boolean
  saveLabelDisabled?: boolean
  hideDayPicker?: boolean
  hideTimePicker?: boolean
  dayIndex?: number | undefined
  hours?: number | undefined
  minutes?: number | undefined
  duration?: number | undefined | null
  onChange?: (params: {
    dayIndex: number
    hours: number
    minutes: number
  }) => void
  onConfirm: (params: {
    dayIndex: number
    hours: number
    minutes: number
  }) => void
  accentColor?: string
  textStyle?: TextStyle
}

export function DayTimePickerModalContent(
  props: DayTimePickerModalContentProps
) {
  const {
    onChange,
    onConfirm,
    onDismiss,
    locale,
    hideDayPicker,
    hideTimePicker,
    accentColor,
    textStyle,
  } = props

  const anyProps = props as any

  const dimensions = useWindowDimensions()
  const isLandscape = dimensions.width > dimensions.height

  const [focused, setFocused] = useState<PossibleClockTypes>(clockTypes.hours)
  const [localHours, setLocalHours] = useState<number>(anyProps.hours)
  const [localMinutes, setLocalMinutes] = useState<number>(
    getMinutes(anyProps.minutes)
  )
  const [localDayIndex, setLocalDayIndex] = useState<number>(
    getDayIndex(anyProps.dayIndex)
  )

  const [displayMode, setDisplayMode] = useState<'AM' | 'PM' | undefined>(
    undefined
  )

  // Initialize display Mode according the hours value
  useEffect(() => {
    if ((props.hours ?? 0) >= 12) {
      setDisplayMode('PM')
    } else {
      setDisplayMode('AM')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // update local state if changed from outside or if modal is opened
  useEffect(() => {
    setLocalDayIndex(getDayIndex(anyProps.dayIndex))
    setLocalHours(getHours(anyProps.hours))
    setLocalMinutes(getMinutes(anyProps.minutes))
  }, [anyProps.hours, anyProps.minutes, anyProps.dayIndex])

  const onInnerChangeDay = useCallback(
    (dayIndex: number) => {
      onChange &&
        onChange({
          dayIndex: dayIndex,
          hours: localHours,
          minutes: localMinutes,
        })
      setLocalDayIndex(dayIndex)
    },
    [localHours, localMinutes, onChange]
  )

  const onFocusInput = useCallback(
    (type: PossibleClockTypes) => setFocused(type),
    []
  )
  const onChangeClock = useCallback(
    (params: {
      focused?: PossibleClockTypes | undefined
      hours: number
      minutes: number
    }) => {
      if (params.focused) {
        setFocused(params.focused)
      }

      setLocalHours(params.hours)
      setLocalMinutes(params.minutes)
    },
    [setFocused, setLocalHours, setLocalMinutes]
  )

  const onInnerChangeClock = useCallback<onChangeFunc>(
    (params: any) => {
      params.hours = toHourOutputFormat(params.hours, localHours, true)
      onChangeClock(params)
    },
    [localHours, onChangeClock]
  )

  const onInnerConfirm = useCallback(() => {
    onConfirm({
      dayIndex: localDayIndex,
      hours: localHours,
      minutes: localMinutes,
    })
  }, [onConfirm, localDayIndex, localHours, localMinutes])

  const textColorOnPrimary = useTextColor(accentColor) ?? '#fff'

  return (
    <View style={styles.container}>
      <DatePickerModalHeaderBackground color={accentColor}>
        <DatePickerModalHeader
          locale={locale}
          onSave={onInnerConfirm}
          isLoading={props.isLoading}
          onDismiss={onDismiss}
          saveLabel={props.saveLabel}
          saveLabelDisabled={props.saveLabelDisabled || false}
          uppercase={props.uppercase || true}
          closeIcon={props.closeIcon}
          hideSaveButton
        />
        <DayTimePickerModalContentHeader
          dayIndex={localDayIndex}
          hours={localHours}
          minutes={localMinutes}
          duration={anyProps.duration}
          mode="single"
          collapsed={true}
          headerSeparator={props.headerSeparator}
          emptyLabel={props.emptyLabel}
          label={props.label}
          moreLabel={props.moreLabel}
          startLabel={props.startLabel}
          endLabel={props.endLabel}
          uppercase={props.uppercase || true}
          locale={locale}
          showSaveButton
          saveLabel={props.saveLabel}
          saveLabelDisabled={props.saveLabelDisabled || false}
          isLoading={props.isLoading}
          onSave={onInnerConfirm}
          accentColor={accentColor}
          labelTextStyle={textStyle}
          saveButtonLabelStyle={StyleSheet.flatten([
            styles.saveButtonLabel,
            textStyle,
          ])}
        />
      </DatePickerModalHeaderBackground>
      {!hideDayPicker ? (
        <View style={styles.dayPickerContainer}>
          {Array.from(Array(7)).map((_, index) => {
            // required for Monday to show first
            const adjustedIndex = index < 6 ? index + 1 : 0
            return (
              <DayOfWeek
                dayIndex={adjustedIndex}
                selected={localDayIndex === adjustedIndex}
                onPressDay={onInnerChangeDay}
                accentColor={accentColor}
                textStyle={textStyle}
                disabled={false}
                textColorOnPrimary={textColorOnPrimary}
              />
            )
          })}
        </View>
      ) : null}
      {!hideTimePicker ? (
        <DisplayModeContext.Provider
          value={{ mode: displayMode, setMode: setDisplayMode }}
        >
          <View
            style={isLandscape ? styles.rootLandscape : styles.rootPortrait}
          >
            <TimeInputs
              inputType={'keyboard'}
              hours={localHours}
              minutes={localMinutes}
              is24Hour
              onChange={onChangeClock}
              onFocusInput={onFocusInput}
              focused={focused}
              accentColor={accentColor}
              textStyle={textStyle}
            />
            <View style={styles.clockContainer}>
              <AnalogClock
                hours={toHourInputFormat(localHours, true)}
                minutes={localMinutes}
                focused={focused}
                is24Hour
                onChange={onInnerChangeClock}
                accentColor={accentColor}
                textStyle={textStyle}
              />
            </View>
          </View>
        </DisplayModeContext.Provider>
      ) : null}
    </View>
  )
}

function getMinutes(minutes: number | undefined | null): number {
  return minutes === undefined || minutes === null
    ? new Date().getMinutes()
    : minutes
}
function getHours(hours: number | undefined | null): number {
  return hours === undefined || hours === null ? new Date().getHours() : hours
}
function getDayIndex(dayIndex: number | undefined | null): number {
  return dayIndex === undefined ||
    dayIndex === null ||
    dayIndex < 0 ||
    dayIndex > 6
    ? 0
    : dayIndex
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  rootLandscape: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24 * 3 + 96 * 2 + circleSize,
  },
  rootPortrait: {},
  dayPickerContainer: { flexDirection: 'row', marginTop: 32 },
  clockContainer: { padding: 12 },
  saveButtonLabel: {
    fontSize: 25,
  },
})

export default memo(DayTimePickerModalContent)
