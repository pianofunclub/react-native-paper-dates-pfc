import { useMemo } from 'react'
import { View, StyleSheet, TextStyle } from 'react-native'
import { Button, IconButton, Text } from 'react-native-paper'
import type { ModeType } from './Calendar'
import { useTextColor } from '../shared/utils'
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
  dayIndex: number
  hours: number
  minutes: number
  duration?: number | undefined | null
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

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function DayTimePickerModalContentHeader(
  props: HeaderContentProps
) {
  const {
    onToggle,
    collapsed,
    mode,
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
          <HeaderContentSingle {...props} color={color} />
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
      ) : null}
    </View>
  )
}

export function HeaderContentSingle({
  dayIndex,
  hours,
  minutes,
  duration,
  color,
  locale,
  labelTextStyle,
}: HeaderContentProps & { color: string }) {
  const formatter = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23',
    })
  }, [locale])

  const time = new Date()
  time.setHours(hours)
  time.setMinutes(minutes)

  return (
    <Text style={[styles.singleHeaderText, { color: color }, labelTextStyle]}>
      {`${DAYS_OF_WEEK[dayIndex]} ${formatter.format(time)}${
        duration
          ? ' - ' +
            formatter.format(new Date(time.getTime() + duration * 60000))
          : ''
      }`}
    </Text>
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
