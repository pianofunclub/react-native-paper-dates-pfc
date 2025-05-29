# CHANGES.md

## Custom Fork by PianoFunClub

This document outlines the changes made in our maintained fork of [`react-native-paper-dates`](https://github.com/web-ridge/react-native-paper-dates), starting from commit `bb94f607` (`v0.22.43`). These changes reflect internal project needs.

---

### 🔧 Infrastructure

- **Upgraded Yarn to v4.9.1**  
  Migrated from Yarn Classic to Yarn 4 for modern dependency management and improved monorepo support.

---

### ✨ New Features

- **Added `DateTimePickerModal` component**  
  Combines date and time picking into a single modal component for convenience in forms and event inputs.

- **Added `DayTimePickerModal` component**  
  Variant of `DateTimePickerModal` with different UI behaviour tailored for use cases requiring day-of-week + time selection with custom logic.

---

### 🎨 Styling Improvements

- **Exposed styling props to allow bypassing of `react-native-paper-dates` theme b**  
  The following props were added to provide easy control of appearance:
  - `textStyle`
  - `accentColor`
  - `selectColor`

