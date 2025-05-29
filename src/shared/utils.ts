import { useRef } from 'react'
import {
  DefaultTheme,
  MD3DarkTheme,
  overlay,
  useTheme,
} from 'react-native-paper'
import Color from 'color'

export const supportedOrientations: (
  | 'portrait'
  | 'portrait-upside-down'
  | 'landscape'
  | 'landscape-left'
  | 'landscape-right'
)[] = [
  'portrait',
  'portrait-upside-down',
  'landscape',
  'landscape-left',
  'landscape-right',
]

export type PaperTheme = typeof MD3DarkTheme | typeof DefaultTheme

export function useLatest<T>(value: T) {
  const ref = useRef(value)
  ref.current = value
  return ref
}

export function useHeaderBackgroundColor(color: string | undefined) {
  const theme = useTheme()

  if (color) {
    return color
  }
  if (theme.isV3) {
    return theme.colors.surface
  }
  return theme.dark && theme.mode === 'adaptive'
    ? overlay(4, theme.colors.surface)
    : theme.colors.primary
}

export function useHeaderColorIsLight(backgroundColor: string | undefined) {
  const theme = useTheme()
  const background =
    backgroundColor ??
    (theme.dark && theme.mode === 'adaptive'
      ? theme.colors.surface
      : theme.colors.primary)
  return Color(background).isLight()
}

export function useTextColor(backgroundColor: string | undefined) {
  const theme = useTheme()
  const isLight = useHeaderColorIsLight(backgroundColor)
  if (theme.isV3) {
    return theme.colors.onSurfaceVariant
  }
  return !isLight ? '#CCE4D9' : '#3D3C3C'
}

export function range(start: number, end: number) {
  return Array(end - start + 1)
    .fill(null)
    .map((_, i) => start + i)
}

export function lightenBy(color: Color, ratio: number) {
  const lightness = color.lightness()
  return color.lightness(lightness + (100 - lightness) * ratio)
}

export function darkenBy(color: Color, ratio: number) {
  const lightness = color.lightness()
  return color.lightness(lightness - lightness * ratio)
}
