import { Animated, StyleSheet, TextStyle } from 'react-native'
import { Appbar, Button } from 'react-native-paper'
import { useTextColor } from '../shared/utils'
import { getTranslation } from '../translations/utils'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export interface DatePickerModalHeaderProps {
  saveLabel?: string
  saveLabelDisabled?: boolean
  uppercase?: boolean
  onDismiss: () => void
  onSave: () => void
  locale: string | undefined
  closeIcon?: string
  hideSaveButton?: boolean
  isLoading?: boolean
  saveButtonLabelStyle?: TextStyle
  accentColor?: string
}

export default function DatePickerModalHeader(
  props: DatePickerModalHeaderProps
) {
  const { locale, closeIcon = 'close' } = props
  const saveLabel = props.saveLabel || getTranslation(locale, 'save')
  const color = useTextColor(props.accentColor)
  const insets = useSafeAreaInsets()

  return (
    <>
      <Animated.View
        style={[
          styles.animated,
          {
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        <Appbar style={styles.appbarHeader}>
          <Appbar.Action
            icon={closeIcon}
            accessibilityLabel={getTranslation(locale, 'close')}
            onPress={props.onDismiss}
            color={color}
            testID="react-native-paper-dates-close"
          />
          {!props.hideSaveButton ? (
            <Button
              textColor={color}
              onPress={props.onSave}
              disabled={props.saveLabelDisabled ?? false}
              uppercase={false}
              contentStyle={styles.buttonStyle}
              mode="text"
              labelStyle={[styles.buttonLabel, props.saveButtonLabelStyle]}
              testID="react-native-paper-dates-save"
              loading={props.isLoading}
            >
              {saveLabel}
            </Button>
          ) : null}
        </Appbar>
      </Animated.View>
    </>
  )
}

const styles = StyleSheet.create({
  animated: {
    elevation: 4,
  },
  appbarHeader: {
    elevation: 0,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  buttonStyle: {
    paddingHorizontal: 8,
  },
  buttonLabel: {
    flexGrow: 1,
  },
})
