import { useMemo } from 'react'
import { View, StyleSheet, TextStyle } from 'react-native'
import { Button, IconButton, Text } from 'react-native-paper'
import type { ModeType } from './Calendar'
import type { LocalState } from './DatePickerModalContent'
import { useTextColor } from '../shared/utils'
import Color from 'color'
import { getTranslation } from '../translations/utils'

export interface HeaderPickProps {
  moreLabel?: string
  label?: string
  emptyLabel?: string
  saveLabel?: string
  uppercase?: boolean
  headerSeparator?: string
  startLabel?: string
  endLabel?: string
  editIcon?: string
  calendarIcon?: string
  closeIcon?: string
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

export default function DateTimePickerModalContentHeader(
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
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23',
    })
  }, [locale])

  const hourFormatter = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23',
    })
  }, [locale])

  const date = state.date
  const endDate = state.endDate

  return (
    <Text
      style={[styles.singleHeaderText, { color: dateColor }, labelTextStyle]}
    >
      {date
        ? `${formatter.format(date)}${
            endDate ? ' - ' + hourFormatter.format(endDate) : ''
          }`
        : emptyLabel}
    </Text>
  )
}

export function HeaderContentMulti({
  state,
  emptyLabel = ' ',
  moreLabel = 'more',
  color,
  locale,
}: HeaderContentProps & { color: string; moreLabel: string | undefined }) {
  const dateCount = state.dates?.length || 0
  const lighterColor = Color(color).fade(0.5).rgb().toString()
  const dateColor = dateCount ? color : lighterColor

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
    <Text style={[styles.singleHeaderText, { color: dateColor }]}>{label}</Text>
  )
}

export function HeaderContentRange({
  locale,
  state,
  headerSeparator = '-',
  startLabel = 'Start',
  endLabel = 'End',
  color,
}: HeaderContentProps & { color: string }) {
  const formatter = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
    })
  }, [locale])

  const lighterColor = Color(color).fade(0.5).rgb().toString()
  const startColor = state.startDate ? color : lighterColor
  const endColor = state.endDate ? color : lighterColor

  return (
    <>
      <Text style={[styles.rangeHeaderText, { color: startColor }]}>
        {state.startDate ? formatter.format(state.startDate) : startLabel}
      </Text>
      <Text style={[styles.headerSeparator, { color }]}>{headerSeparator}</Text>
      <Text style={[styles.rangeHeaderText, { color: endColor }]}>
        {state.endDate ? formatter.format(state.endDate) : endLabel}
      </Text>
    </>
  )
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  animated: {
    paddingBottom: 0,
    elevation: 4,
  },
  safeContent: {
    paddingBottom: 0,
  },
  header: {
    height: 75,
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 24,
    paddingRight: 12,
  },
  headerContentContainer: { marginTop: 5, flexDirection: 'row' },
  label: { color: '#fff', letterSpacing: 1, fontSize: 13 },
  singleHeaderText: { color: '#fff', fontSize: 25 },
  rangeHeaderText: { color: '#fff', fontSize: 25 },
  excludeInRangeHeaderText: { fontSize: 25 },
  excludeInRangeHeaderTextSmall: {
    fontSize: 14,
    marginTop: -3,
    marginLeft: 3,
  },

  headerSeparator: {
    color: 'rgba(255,255,255,1)',
    fontSize: 25,
    paddingLeft: 6,
    paddingRight: 6,
  },
  appbarHeader: {
    elevation: 0,
  },
  column: { flexDirection: 'column' },
  row: { flexDirection: 'row' },
})
