import { Animated, StyleSheet } from 'react-native'
import { useHeaderBackgroundColor } from '../shared/utils'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function DatePickerModalHeaderBackground({
  children,
  color,
}: {
  children: any
  color?: string
}) {
  const backgroundColor = useHeaderBackgroundColor(color)
  const insets = useSafeAreaInsets()

  return (
    <Animated.View
      style={[
        styles.animated,
        {
          backgroundColor,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      {children}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  animated: {
    elevation: 4,
    width: '100%',
  },
})
