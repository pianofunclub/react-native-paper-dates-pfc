import { StyleSheet, TextStyle, View } from 'react-native'
import { Button, IconButton, Text, useTheme } from 'react-native-paper'
import type { ModeType } from './Calendar'
import type { LocalState } from './DatePickerModalContent'
import { useTextColor } from '../shared/utils'
import Color from 'color'
import { getTranslation } from '../translations/utils'
import { useMemo } from 'react'

export interface HeaderPickProps {
  moreLabel?: string
  label?: string
  emptyLabel?: string
  withDateFormatInLabel?: boolean
  placeholder?: string
  saveLabel?: string
  uppercase?: boolean
  headerSeparator?: string
  startLabel?: string
  endLabel?: string
  editIcon?: string
  calendarIcon?: string
  closeIcon?: string
  allowEditing?: boolean
}

export interface HeaderContentProps extends HeaderPickProps {
  state: LocalState
  isLoading?: boolean
  mode: ModeType
  collapsed: boolean
  onToggle?: () => any
  locale: string | undefined
  showSaveButton?: boolean
  saveLabel?: string
  saveLabelDisabled?: boolean
  onSave?: () => void
  labelTextStyle?: TextStyle
  saveButtonLabelStyle?: TextStyle
  accentColor?: string
}

function getLabel(
  locale: string | undefined,
  mode: ModeType,
  configuredLabel?: string
) {
  if (configuredLabel) {
    return configuredLabel
  }
  if (mode === 'range') {
    return getTranslation(locale, 'selectRange')
  }
  if (mode === 'multiple') {
    return getTranslation(locale, 'selectMultiple')
  }
  if (mode === 'single') {
    return getTranslation(locale, 'selectSingle')
  }
  return '...?'
}

export default function DatePickerModalContentHeader(
  props: HeaderContentProps
) {
  const {
    onToggle,
    collapsed,
    mode,
    moreLabel,
    editIcon = 'pencil',
    calendarIcon = 'calendar',
    labelTextStyle,
    saveButtonLabelStyle,
    accentColor,
  } = props

  const saveLabel = props.saveLabel || getTranslation(props.locale, 'save')

  const label = getLabel(props.locale, props.mode, props.label)

  const color = useTextColor(accentColor)
  const allowEditing = mode !== 'multiple'
  return (
    <View style={[styles.header]}>
      <View>
        <Text style={[styles.label, { color }, labelTextStyle]}>{label}</Text>
        <View style={styles.headerContentContainer}>
          {mode === 'range' ? (
            <HeaderContentRange {...props} color={color} />
          ) : null}
          {mode === 'single' ? (
            <HeaderContentSingle {...props} color={color} />
          ) : null}
          {mode === 'multiple' ? (
            <HeaderContentMulti
              {...props}
              color={color}
              moreLabel={moreLabel}
            />
          ) : null}
        </View>
      </View>
      <View style={styles.fill} />
      {allowEditing && onToggle ? (
        <IconButton
          size={32}
          icon={collapsed ? editIcon : calendarIcon}
          accessibilityLabel={
            collapsed
              ? getTranslation(props.locale, 'typeInDate')
              : getTranslation(props.locale, 'pickDateFromCalendar')
          }
          iconColor={color}
          onPress={onToggle}
        />
      ) : null}
      {props.showSaveButton ? (
        <View>
          <Button
            textColor={color}
            onPress={props.onSave}
            disabled={props.saveLabelDisabled || false}
            uppercase={false}
            labelStyle={saveButtonLabelStyle}
            testID="react-native-paper-dates-save"
            loading={props.isLoading}
          >
            {saveLabel}
          </Button>
        </View>
      ) : null}
    </View>
  )
}

export function HeaderContentSingle({
  state,
  emptyLabel = ' ',
  color,
  locale,
  labelTextStyle,
}: HeaderContentProps & { color: string }) {
  const lighterColor = Color(color).fade(0.5).rgb().toString()
  const dateColor = state.date ? color : lighterColor

  const formatter = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    })
  }, [locale])

  return (
    <Text style={[styles.headerText, { color: dateColor }, labelTextStyle]}>
      {state.date ? formatter.format(state.date) : emptyLabel}
    </Text>
  )
}

export function HeaderContentMulti({
  state,
  emptyLabel = ' ',
  moreLabel = 'more',
  color,
  locale,
  labelTextStyle,
}: HeaderContentProps & { color: string; moreLabel: string | undefined }) {
  const theme = useTheme()

  const dateCount = state.dates?.length || 0
  const lighterColor = Color(color).fade(0.5).rgb().toString()
  const dateColor = dateCount
    ? theme.isV3
      ? theme.colors.onSurface
      : color
    : lighterColor

  const formatter = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    })
  }, [locale])

  let label = emptyLabel
  if (dateCount) {
    if (dateCount <= 2) {
      label = state.dates!.map((date) => formatter.format(date)).join(', ')
    } else {
      label =
        formatter.format(state.dates![0]) + ` (+ ${dateCount - 1} ${moreLabel})`
    }
  }

  return (
    <Text
      maxFontSizeMultiplier={1.5}
      style={[styles.headerText, { color: dateColor }, labelTextStyle]}
    >
      {label}
    </Text>
  )
}

export function HeaderContentRange({
  locale,
  state,
  headerSeparator = '-',
  startLabel = 'Start',
  endLabel = 'End',
  color,
  labelTextStyle,
}: HeaderContentProps & { color: string }) {
  const theme = useTheme()

  const lighterColor = Color(color).fade(0.5).rgb().toString()
  const startColorFilled = theme.isV3 ? theme.colors.onSurface : color
  const endColorFilled = theme.isV3 ? theme.colors.onSurface : color
  const startColor = state.startDate ? startColorFilled : lighterColor
  const endColor = state.endDate ? endColorFilled : lighterColor

  const formatter = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    })
  }, [locale])

  return (
    <>
      <Text
        maxFontSizeMultiplier={1.5}
        style={[styles.headerText, { color: startColor }, labelTextStyle]}
      >
        {state.startDate ? formatter.format(state.startDate) : startLabel}
      </Text>
      <Text
        maxFontSizeMultiplier={1.5}
        style={[styles.headerSeparator, { color }, labelTextStyle]}
      >
        {headerSeparator}
      </Text>
      <Text
        maxFontSizeMultiplier={1.5}
        style={[styles.headerText, { color: endColor }, labelTextStyle]}
      >
        {state.endDate ? formatter.format(state.endDate) : endLabel}
      </Text>
    </>
  )
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  header: {
    height: 75,
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 24,
    paddingRight: 12,
  },
  headerContentContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  headerSeparator: {
    color: 'rgba(255,255,255,1)',
    fontSize: 25,
    paddingLeft: 6,
    paddingRight: 6,
  },
  label: {
    color: '#fff',
    fontSize: 13,
    letterSpacing: 1,
  },
  headerText: { color: '#fff', fontSize: 25 },
})
