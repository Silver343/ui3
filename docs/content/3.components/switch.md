---
description: A control that toggles between two states.
links:
  - label: Switch
    icon: i-custom-radix-vue
    to: https://www.radix-vue.com/components/switch.html
  - label: GitHub
    icon: i-simple-icons-github
    to: https://github.com/benjamincanac/ui3/tree/dev/src/runtime/components/Toggle.vue
---

## Usage

Use the `v-model` directive to control the checked state of the Switch.

::component-code
---
ignore:
  - modelValue
external:
  - modelValue
props:
  modelValue: true
---
::

Use the `default-value` prop to set the initial value when you do not need to control its state.

::component-code
---
props:
  defaultValue: true
---
::

### Label

Use the `label` prop to set the label of the Switch.

::component-code
---
props:
  label: Check me
---
::

When using the `required` prop, an asterisk is be added next to the label.

::component-code
---
ignore:
  - label
props:
  required: true
  label: Check me
---
::

### Description

Use the `description` prop to set the description of the Switch.

::component-code
---
ignore:
  - label
props:
  label: Check me
  description: 'This is a checkbox.'
---
::

### Icon

Use the `checked-icon` and `unchecked-icon` props to set the icons of the Switch when checked and unchecked.

::component-code
---
prettier: true
ignore:
  - label
  - defaultValue
props:
  uncheckedIcon: 'i-heroicons-x-mark'
  checkedIcon: 'i-heroicons-check'
  defaultValue: true
  label: Check me
---
::

### Loading

Use the `loading` prop to show a loading icon on the Switch.

Use the `loading-icon` prop to customize this icon. Defaults to `i-heroicons-arrow-path-20-solid`.

::component-code
---
ignore:
  - label
  - defaultValue
props:
  loading: true
  loadingIcon: ''
  defaultValue: true
  label: Check me
---
::

::tip
You can customize this icon globally in your `app.config.ts` under `ui.icons.loading` key.
::

### Color

Use the `color` prop to change the color of the Switch.

::component-code
---
ignore:
  - label
  - defaultValue
props:
  color: gray
  defaultValue: true
  label: Check me
---
::

### Size

Use the `size` prop to change the size of the Switch.

::component-code
---
ignore:
  - label
  - defaultValue
props:
  size: xl
  defaultValue: true
  label: Check me
---
::

### Disabled

Use the `disabled` prop to disable the Switch.

::component-code
---
ignore:
  - label
props:
  disabled: true
  label: Check me
---
::

## API

### Props

:component-props

### Slots

:component-slots

### Emits

:component-emits

## Theme

:component-theme
