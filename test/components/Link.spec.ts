import { describe, it, expect } from 'vitest'
import Link, { type LinkProps, type LinkSlots } from '../../src/runtime/components/Link.vue'
import ComponentRender from '../component-render'

describe('Link', () => {
  it.each([
    // Props
    ['with as', { props: { as: 'div' } }],
    ['with to', { props: { to: '/' } }],
    ['with type', { props: { type: 'submit' as const } }],
    ['with disabled', { props: { disabled: true } }],
    ['with raw', { props: { raw: true } }],
    ['with class', { props: { class: 'font-medium' } }],
    ['with activeClass', { props: { active: true, activeClass: 'text-gray-900 dark:text-white' } }],
    ['with inactiveClass', { props: { active: false, inactiveClass: 'hover:text-primary-500 dark:hover:text-primary-400' } }],
    // Slots
    ['with default slot', { slots: { default: () => 'Default slot' } }]
  ])('renders %s correctly', async (nameOrHtml: string, options: { props?: LinkProps, slots?: Partial<LinkSlots> }) => {
    const html = await ComponentRender(nameOrHtml, options, Link)
    expect(html).toMatchSnapshot()
  })
})
