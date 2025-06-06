import Calendar, {
  BaseCalendarProps,
  CalendarDate,
  CalendarDates,
  MultiChange,
  MultiConfirm,
  RangeChange,
  SingleChange,
} from './Calendar'

import AnimatedCrossView from './AnimatedCrossView'
import DatePickerModalHeader from './DatePickerModalHeader'
import DatePickerModalContentHeader, {
  HeaderPickProps,
} from './DatePickerModalContentHeader'
import CalendarEdit from './CalendarEdit'
import DatePickerModalHeaderBackground from './DatePickerModalHeaderBackground'
import { useTheme } from 'react-native-paper'
import DatePickerModalStatusBar from './DatePickerModalStatusBar'
import { memo, useCallback, useEffect, useState } from 'react'
import { View, StyleSheet, TextStyle } from 'react-native'

export type LocalState = {
  startDate: CalendarDate
  endDate: CalendarDate
  date: CalendarDate
  dates: CalendarDates
}

interface DatePickerModalContentBaseProps {
  inputFormat?: string
  locale: string
  onDismiss: () => any
  saveLabelDisabled?: boolean
  uppercase?: boolean
  inputEnabled?: boolean
  disableSafeTop?: boolean
  disableStatusBar?: boolean
  statusBarOnTopOfBackdrop?: boolean
  accentColor?: string
  selectColor?: string
  textStyle?: TextStyle
  inputTextStyle?: TextStyle
}

export interface DatePickerModalContentRangeProps
  extends HeaderPickProps,
    BaseCalendarProps,
    DatePickerModalContentBaseProps {
  mode: 'range'
  startDate: CalendarDate
  endDate: CalendarDate
  onChange?: RangeChange
  onConfirm: RangeChange
}

export interface DatePickerModalContentSingleProps
  extends HeaderPickProps,
    BaseCalendarProps,
    DatePickerModalContentBaseProps {
  mode: 'single'
  date?: CalendarDate
  onChange?: SingleChange
  onConfirm: SingleChange
  dateMode?: 'start' | 'end'
}

export interface DatePickerModalContentMultiProps
  extends HeaderPickProps,
    BaseCalendarProps,
    DatePickerModalContentBaseProps {
  mode: 'multiple'
  dates?: CalendarDates
  onChange?: MultiChange
  onConfirm: MultiConfirm
}

export function DatePickerModalContent(
  props:
    | DatePickerModalContentRangeProps
    | DatePickerModalContentSingleProps
    | DatePickerModalContentMultiProps
) {
  const {
    mode,
    onChange,
    onConfirm,
    onDismiss,
    disableSafeTop,
    disableStatusBar,
    disableWeekDays,
    locale,
    validRange,
    dateMode,
    startYear,
    endYear,
    statusBarOnTopOfBackdrop,
    startWeekOnMonday,
    accentColor,
    selectColor,
    textStyle,
    inputTextStyle,
  } = props
  const theme = useTheme()
  const anyProps = props as any
  const defaultUppercase = !theme.isV3

  // use local state to add only onConfirm state changes
  const [state, setState] = useState<LocalState>({
    date: anyProps.date,
    startDate: anyProps.startDate,
    endDate: anyProps.endDate,
    dates: anyProps.dates,
  })
  const [collapsed, setCollapsed] = useState(true)

  // update local state if changed from outside or if modal is opened
  useEffect(() => {
    setState({
      date: anyProps.date,
      startDate: anyProps.startDate,
      endDate: anyProps.endDate,
      dates: anyProps.dates,
    })
  }, [anyProps.date, anyProps.startDate, anyProps.endDate, anyProps.dates])

  const onInnerChange = useCallback(
    (params: any) => {
      onChange && onChange(params)
      setState((prev) => ({ ...prev, ...params }))
    },
    [onChange, setState]
  )

  const onInnerConfirm = useCallback(() => {
    if (mode === 'single') {
      ;(onConfirm as DatePickerModalContentSingleProps['onConfirm'])({
        date: state.date,
      })
    } else if (mode === 'range') {
      ;(onConfirm as DatePickerModalContentRangeProps['onConfirm'])({
        startDate: state.startDate,
        endDate: state.endDate,
      })
    } else if (mode === 'multiple') {
      ;(onConfirm as DatePickerModalContentMultiProps['onConfirm'])({
        dates: state.dates || [],
      })
    }
  }, [state, mode, onConfirm])

  const onToggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev)
  }, [setCollapsed])

  return (
    <>
      <DatePickerModalHeaderBackground color={accentColor}>
        <DatePickerModalStatusBar
          disableSafeTop={!!disableSafeTop}
          disableStatusBar={!!disableStatusBar}
          statusBarOnTopOfBackdrop={!!statusBarOnTopOfBackdrop}
          color={accentColor}
        />
        <DatePickerModalHeader
          locale={locale}
          onSave={onInnerConfirm}
          onDismiss={onDismiss}
          saveLabel={props.saveLabel}
          saveLabelDisabled={props.saveLabelDisabled ?? false}
          uppercase={props.uppercase ?? defaultUppercase}
          closeIcon={props.closeIcon}
          accentColor={accentColor}
          saveButtonLabelStyle={StyleSheet.flatten([
            styles.saveButtonLabel,
            textStyle,
          ])}
        />
        <DatePickerModalContentHeader
          state={state}
          mode={mode}
          collapsed={collapsed}
          onToggle={onToggleCollapse}
          headerSeparator={props.headerSeparator}
          emptyLabel={props.emptyLabel}
          label={props.label}
          moreLabel={props.moreLabel}
          startLabel={props.startLabel}
          endLabel={props.endLabel}
          uppercase={props.uppercase ?? defaultUppercase}
          locale={locale}
          editIcon={props?.editIcon}
          calendarIcon={props.calendarIcon}
          allowEditing={props.allowEditing ?? true}
          accentColor={accentColor}
          textStyle={textStyle}
        />
      </DatePickerModalHeaderBackground>
      <AnimatedCrossView
        collapsed={collapsed}
        calendar={
          <View style={styles.calendarContainer}>
            <Calendar
              locale={locale}
              mode={mode}
              startDate={state.startDate}
              endDate={state.endDate}
              date={state.date}
              onChange={onInnerChange}
              disableWeekDays={disableWeekDays}
              dates={state.dates}
              validRange={validRange}
              dateMode={dateMode}
              startYear={startYear}
              endYear={endYear}
              startWeekOnMonday={startWeekOnMonday}
              accentColor={accentColor}
              selectColor={selectColor}
              textStyle={textStyle}
            />
          </View>
        }
        calendarEdit={
          <CalendarEdit
            mode={mode}
            state={state}
            label={props.label}
            startLabel={props.startLabel}
            endLabel={props.endLabel}
            collapsed={collapsed}
            onChange={onInnerChange}
            validRange={validRange}
            locale={locale}
            inputEnabled={props.inputEnabled}
            withDateFormatInLabel={props.withDateFormatInLabel}
            placeholder={props.placeholder}
            accentColor={accentColor}
            selectColor={selectColor}
            helperTextStyle={textStyle}
            inputTextStyle={inputTextStyle}
          />
        }
      />
    </>
  )
}

const styles = StyleSheet.create({
  calendarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonLabel: {
    fontSize: 25,
  },
})

export default memo(DatePickerModalContent)
