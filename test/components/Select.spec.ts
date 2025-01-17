import { describe, it, expect, test } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Select, { type SelectProps, type SelectSlots } from '../../src/runtime/components/Select.vue'
import ComponentRender from '../component-render'
import theme from '#build/ui/input'
import { renderForm } from '../utils/form'
import type { FormInputEvents } from '~/src/module'

describe('Select', () => {
  const sizes = Object.keys(theme.variants.size) as any
  const variants = Object.keys(theme.variants.variant) as any

  const items = [{
    label: 'Backlog',
    value: 'backlog',
    icon: 'i-heroicons-question-mark-circle'
  }, {
    label: 'Todo',
    value: 'todo',
    icon: 'i-heroicons-plus-circle'
  }, {
    label: 'In Progress',
    value: 'in_progress',
    icon: 'i-heroicons-arrow-up-circle'
  }, {
    label: 'Done',
    value: 'done',
    icon: 'i-heroicons-check-circle'
  }, {
    label: 'Canceled',
    value: 'canceled',
    icon: 'i-heroicons-x-circle'
  }]

  const props = { open: true, portal: false, items }

  it.each([
    // Props
    ['with items', { props }],
    ['with modelValue', { props: { ...props, modelValue: items[0] } }],
    ['with defaultValue', { props: { ...props, defaultValue: items[0] } }],
    ['with id', { props: { ...props, id: 'id' } }],
    ['with name', { props: { ...props, name: 'name' } }],
    ['with placeholder', { props: { ...props, placeholder: 'Search...' } }],
    ['with disabled', { props: { ...props, disabled: true } }],
    ['with required', { props: { ...props, required: true } }],
    ['with icon', { props: { ...props, icon: 'i-heroicons-magnifying-glass' } }],
    ['with leading and icon', { props: { ...props, leading: true, icon: 'i-heroicons-magnifying-glass' } }],
    ['with leadingIcon', { props: { ...props, leadingIcon: 'i-heroicons-magnifying-glass' } }],
    ['with trailing and icon', { props: { ...props, trailing: true, icon: 'i-heroicons-magnifying-glass' } }],
    ['with trailingIcon', { props: { ...props, trailingIcon: 'i-heroicons-magnifying-glass' } }],
    ['with loading', { props: { ...props, loading: true } }],
    ['with loadingIcon', { props: { ...props, loading: true, loadingIcon: 'i-heroicons-sparkles' } }],
    ['with arrow', { props: { ...props, arrow: true } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { ...props, size } }]),
    ...variants.map((variant: string) => [`with primary variant ${variant}`, { props: { ...props, variant } }]),
    ...variants.map((variant: string) => [`with gray variant ${variant}`, { props: { ...props, variant, color: 'gray' } }]),
    ['with class', { props: { ...props, class: 'rounded-full' } }],
    ['with ui', { props: { ...props, ui: { group: 'p-2' } } }],
    // Slots
    ['with leading slot', { props, slots: { leading: () => 'Leading slot' } }],
    ['with trailing slot', { props, slots: { trailing: () => 'Trailing slot' } }],
    ['with item slot', { props, slots: { item: () => 'Item slot' } }],
    ['with item-leading slot', { props, slots: { 'item-leading': () => 'Item leading slot' } }],
    ['with item-label slot', { props, slots: { 'item-label': () => 'Item label slot' } }],
    ['with item-trailing slot', { props, slots: { 'item-trailing': () => 'Item trailing slot' } }]
  ])('renders %s correctly', async (nameOrHtml: string, options: { props?: SelectProps<typeof items[number]>, slots?: Partial<SelectSlots<typeof items[number]>> }) => {
    const html = await ComponentRender(nameOrHtml, options, Select)
    expect(html).toMatchSnapshot()
  })

  describe('emits', () => {
    test('update:modelValue event', async () => {
      const wrapper = mount(Select, { props: { items: ['Option 1', 'Option 2'] } })
      const input = wrapper.findComponent({ name: 'SelectRoot' })
      await input.setValue('Option 1')
      expect(wrapper.emitted()).toMatchObject({ 'update:modelValue': [['Option 1']] })
    })

    test('change event', async () => {
      const wrapper = mount(Select, { props: { items: ['Option 1', 'Option 2'] } })
      const input = wrapper.findComponent({ name: 'SelectRoot' })
      await input.setValue('Option 1')
      expect(wrapper.emitted()).toMatchObject({ change: [[{ type: 'change' }]] })
    })

    test('blur event', async () => {
      const wrapper = mount(Select, { props: { items: ['Option 1', 'Option 2'] } })
      const input = wrapper.findComponent({ name: 'SelectRoot' })
      await input.vm.$emit('update:open', false)
      expect(wrapper.emitted()).toMatchObject({ blur: [[{ type: 'blur' }]] })
    })
  })

  describe('form integration', async () => {
    async function createForm(validateOn?: FormInputEvents[]) {
      const wrapper = await renderForm({
        props: {
          validateOn,
          validateOnInputDelay: 0,
          async validate(state: any) {
            if (state.value !== 'Option 2')
              return [{ name: 'value', message: 'Error message' }]
            return []
          }
        },
        slotVars: {
          items: ['Option 1', 'Option 2']
        },
        slotTemplate: `
        <UFormField name="value">
          <USelect id="input" v-model="state.value" :items="items" />
        </UFormField>
        `
      })
      const input = wrapper.findComponent({ name: 'SelectRoot' })
      return {
        wrapper,
        input
      }
    }

    test('validate on blur works', async () => {
      const { input, wrapper } = await createForm(['blur'])
      await input.vm.$emit('update:open', false)
      await flushPromises()
      expect(wrapper.text()).toContain('Error message')

      await input.setValue('Option 2')
      await input.vm.$emit('update:open', false)
      await flushPromises()

      expect(wrapper.text()).not.toContain('Error message')
    })

    test('validate on change works', async () => {
      const { input, wrapper } = await createForm(['change'])

      input.setValue('Option 1')
      await flushPromises()
      expect(wrapper.text()).toContain('Error message')

      input.setValue('Option 2')
      await flushPromises()
      expect(wrapper.text()).not.toContain('Error message')
    })

    test('validate on input works', async () => {
      const { input, wrapper } = await createForm(['input'])

      input.setValue('Option 1')
      await flushPromises()
      expect(wrapper.text()).toContain('Error message')

      input.setValue('Option 2')
      await flushPromises()
      expect(wrapper.text()).not.toContain('Error message')
    })
  })
})
