import { memo, useCallback, useEffect, useState } from 'react'
import { View, StyleSheet, TextStyle } from 'react-native'

import Calendar, {
  BaseCalendarProps,
  CalendarDate,
  CalendarDates,
} from './Calendar'
import DatePickerModalHeader from './DatePickerModalHeader'
import DateTimePickerModalContentHeader, {
  HeaderPickProps,
} from './DateTimePickerModalContentHeader'
import DatePickerModalHeaderBackground from './DatePickerModalHeaderBackground'
import AnalogClock from '../Time/AnalogClock'
import {
  toHourInputFormat,
  toHourOutputFormat,
  circleSize,
  clockTypes,
  PossibleClockTypes,
} from '../Time/timeUtils'
import { SwitchButton } from '../Time/AmPmSwitcher'
import TimeInputs from '../Time/TimeInputs'
import { useTheme } from 'react-native-paper'
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

export type LocalState = {
  startDate: CalendarDate
  endDate: CalendarDate
  date: CalendarDate
  dates: CalendarDates
}

export interface DateTimePickerModalContentProps
  extends HeaderPickProps,
    BaseCalendarProps {
  inputFormat?: string
  locale: string
  onDismiss: () => any
  saveLabelDisabled?: boolean
  date?: CalendarDate
  hours?: number | undefined
  minutes?: number | undefined
  duration?: number | undefined | null
  canChooseEndTime?: boolean
  isLoading?: boolean
  onConfirm: (params: { date: CalendarDate; duration?: number }) => void
  dateMode?: 'start' | 'end'
  textStyle?: TextStyle
}

export function DatePickerModalContent(props: DateTimePickerModalContentProps) {
  const {
    onConfirm,
    onDismiss,
    disableWeekDays,
    locale,
    validRange,
    dateMode,
    startYear,
    endYear,
    accentColor,
    selectColor,
    textStyle,
  } = props

  const theme = useTheme()

  const anyProps = props as any

  // use local state to add only onConfirm state changes
  const [state, setState] = useState<LocalState>({
    date: anyProps.date,
    startDate: anyProps.startDate,
    endDate: anyProps.endDate,
    dates: anyProps.dates,
  })
  const [focused, setFocused] = useState<PossibleClockTypes>(clockTypes.hours)
  const [isStart, setIsStart] = useState(true)

  // update local state if changed from outside or if modal is opened
  useEffect(() => {
    const date = anyProps.date
    date?.setHours(getHours(anyProps.hours))
    date?.setMinutes(getMinutes(anyProps.minutes))

    let endDate: Date | undefined
    if (typeof anyProps.duration === 'number' && date) {
      endDate = new Date(date.getTime() + anyProps.duration * 60000)
    }
    setState({
      date: date,
      startDate: anyProps.startDate,
      endDate: endDate ?? anyProps.endDate,
      dates: anyProps.dates,
    })
  }, [
    anyProps.date,
    anyProps.startDate,
    anyProps.endDate,
    anyProps.dates,
    anyProps.hours,
    anyProps.minutes,
    anyProps.duration,
  ])

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

  const onInnerChangeDate = useCallback(
    (params: { date: CalendarDate }) => {
      const date = params.date ? new Date(params.date?.getTime()) : new Date()
      if (state.date) {
        date?.setHours(state.date.getHours())
        date?.setMinutes(state.date.getMinutes())
      }

      let endDate: Date | undefined
      if (state.endDate) {
        endDate = params.date ? new Date(params.date?.getTime()) : new Date()
        endDate?.setHours(state.endDate.getHours())
        endDate?.setMinutes(state.endDate.getMinutes())
      }

      setState((prev) => ({
        ...prev,
        date: date,
        endDate: endDate,
      }))
    },
    [state.date, state.endDate]
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

      const date = isStart ? state.date : state.endDate
      date?.setHours(params.hours)
      date?.setMinutes(params.minutes)

      setState((prev) => ({
        ...prev,
        ...(isStart ? { date: date } : { endDate: date }),
      }))
    },
    [isStart, state.date, state.endDate]
  )

  const onInnerChangeClock = useCallback<onChangeFunc>(
    (params: any) => {
      params.hours = toHourOutputFormat(
        params.hours,
        isStart
          ? (state?.date?.getHours() ?? 0)
          : (state?.endDate?.getHours() ?? 0),
        true
      )
      onChangeClock(params)
    },
    [isStart, onChangeClock, state?.date, state?.endDate]
  )

  const onInnerConfirm = useCallback(() => {
    onConfirm({
      date: state.date,
      duration:
        state.endDate && state.date
          ? Math.round((state.endDate.getTime() - state.date.getTime()) / 60000)
          : undefined,
    })
  }, [onConfirm, state.date, state.endDate])

  return (
    <View style={styles.container}>
      <DatePickerModalHeaderBackground color={accentColor}>
        <DatePickerModalHeader
          locale={locale}
          onSave={onInnerConfirm}
          isLoading={props.isLoading}
          onDismiss={onDismiss}
          saveLabel={props.saveLabel}
          saveLabelDisabled={
            anyProps.canChooseEndTime && state.endDate && state.date
              ? state.endDate.getTime() < state.date.getTime()
              : props.saveLabelDisabled || false
          }
          uppercase={props.uppercase || true}
          closeIcon={props.closeIcon}
          hideSaveButton
        />
        <DateTimePickerModalContentHeader
          state={state}
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
          saveLabelDisabled={
            anyProps.canChooseEndTime && state.endDate && state.date
              ? state.endDate.getTime() < state.date.getTime()
              : props.saveLabelDisabled || false
          }
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
      <View style={styles.root}>
        <View style={styles.calendarContainer}>
          <Calendar
            locale={locale}
            mode="single"
            date={isStart ? state.date : state.endDate}
            onChange={onInnerChangeDate}
            disableWeekDays={disableWeekDays}
            dates={state.dates}
            validRange={validRange}
            dateMode={dateMode}
            startYear={startYear}
            endYear={endYear}
            accentColor={accentColor}
            selectColor={selectColor}
            textStyle={textStyle}
          />
        </View>
        <DisplayModeContext.Provider
          value={{ mode: displayMode, setMode: setDisplayMode }}
        >
          <View style={styles.timeContainer}>
            {anyProps.canChooseEndTime ? (
              <View
                style={[
                  styles.switchContainer,
                  {
                    borderColor: accentColor,
                    borderRadius: theme.roundness,
                  },
                ]}
              >
                <SwitchButton
                  label="Start"
                  onPress={() => {
                    setIsStart(true)
                    setFocused('hours')
                  }}
                  selected={isStart}
                  disabled={isStart}
                  accentColor={accentColor}
                  textStyle={textStyle}
                />
                <View
                  style={[
                    styles.switchSeparator,
                    { backgroundColor: accentColor },
                  ]}
                />
                <SwitchButton
                  label="End"
                  onPress={() => {
                    setIsStart(false)
                    setFocused('hours')
                  }}
                  selected={!isStart}
                  disabled={!isStart}
                  accentColor={accentColor}
                  textStyle={textStyle}
                />
              </View>
            ) : null}
            <TimeInputs
              inputType={'picker'}
              hours={
                isStart
                  ? (state.date?.getHours() ?? 0)
                  : (state.endDate?.getHours() ?? 0)
              }
              minutes={
                isStart
                  ? (state.date?.getMinutes() ?? 0)
                  : (state.endDate?.getMinutes() ?? 0)
              }
              is24Hour
              onChange={onChangeClock}
              onFocusInput={onFocusInput}
              focused={focused}
              accentColor={accentColor}
              textStyle={textStyle}
            />
            <View style={styles.clockContainer}>
              <AnalogClock
                hours={
                  isStart
                    ? toHourInputFormat(state.date?.getHours() ?? 0, true)
                    : toHourInputFormat(state.endDate?.getHours() ?? 0, true)
                }
                minutes={
                  isStart
                    ? (state.date?.getMinutes() ?? 0)
                    : (state.endDate?.getMinutes() ?? 0)
                }
                focused={focused}
                is24Hour
                onChange={onInnerChangeClock}
                accentColor={accentColor}
                textStyle={textStyle}
              />
            </View>
          </View>
        </DisplayModeContext.Provider>
      </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  root: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 400 + circleSize,
  },
  calendarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 90,
  },
  clockContainer: { paddingTop: 40 },
  switchContainer: {
    width: 120,
    height: 40,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 25,
  },
  switchSeparator: {
    height: 38,
    width: 1,
  },
  switchButton: {
    flex: 1,
  },
  saveButtonLabel: {
    fontSize: 25,
  },
})

export default memo(DatePickerModalContent)
