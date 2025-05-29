import { memo } from 'react'
import {
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
  Platform,
  StatusBar,
} from 'react-native'

import { useTheme } from 'react-native-paper'
import DateTimePickerModalContent, {
  DateTimePickerModalContentProps,
} from './DateTimePickerModalContent'
import {
  useHeaderBackgroundColor,
  useHeaderColorIsLight,
} from '../shared/utils'

interface DateTimePickerModalProps extends DateTimePickerModalContentProps {
  visible: boolean
  animationType?: 'slide' | 'fade' | 'none'
  disableStatusBar?: boolean
  disableStatusBarPadding?: boolean
}

export function DateTimePickerModal(props: DateTimePickerModalProps) {
  const theme = useTheme()
  const dimensions = useWindowDimensions()
  const {
    visible,
    animationType,
    disableStatusBar,
    disableStatusBarPadding,
    ...rest
  } = props
  const animationTypeCalculated =
    animationType ||
    Platform.select({
      web: 'none',
      default: 'slide',
    })

  const isLight = useHeaderColorIsLight(props.accentColor)
  const headerBackgroundColor = useHeaderBackgroundColor(props.accentColor)

  return (
    <View style={[StyleSheet.absoluteFill]} pointerEvents="box-none">
      <Modal
        animationType={animationTypeCalculated}
        transparent={true}
        visible={visible}
        onRequestClose={rest.onDismiss}
        presentationStyle="overFullScreen"
        supportedOrientations={supportedOrientations}
        //@ts-ignore
        statusBarTranslucent={true}
      >
        <>
          <TouchableWithoutFeedback onPress={rest.onDismiss}>
            <View
              style={[
                StyleSheet.absoluteFill,
                styles.modalBackground,
                { backgroundColor: theme.colors.backdrop },
              ]}
            />
          </TouchableWithoutFeedback>
          <View
            style={[StyleSheet.absoluteFill, styles.modalRoot]}
            pointerEvents="box-none"
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: theme.colors.surface },
                dimensions.width > 650 ? styles.modalContentBig : null,
              ]}
            >
              {disableStatusBar ? null : (
                <StatusBar
                  translucent={true}
                  barStyle={isLight ? 'dark-content' : 'light-content'}
                />
              )}
              {disableStatusBarPadding ? null : (
                <View
                  style={[
                    {
                      height: StatusBar.currentHeight,
                      backgroundColor: headerBackgroundColor,
                    },
                  ]}
                />
              )}
              <DateTimePickerModalContent {...rest} />
            </View>
          </View>
        </>
      </Modal>
    </View>
  )
}
const supportedOrientations: any = [
  'portrait',
  'portrait-upside-down',
  'landscape',
  'landscape-left',
  'landscape-right',
]

const styles = StyleSheet.create({
  modalRoot: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  modalBackground: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContentBig: {
    maxWidth: 750,
    maxHeight: 650,
    borderRadius: 10,
    width: '100%',
    overflow: 'hidden',
  },
})

export default memo(DateTimePickerModal)
