<script setup lang="ts">
import json5 from 'json5'
import { camelCase } from 'scule'
import * as theme from '#build/ui'

const route = useRoute()

const name = camelCase(route.params.slug[route.params.slug.length - 1])

const strippedCompoundVariants = ref(false)

function stripCompoundVariants(component) {
  if (component.compoundVariants) {
    component.compoundVariants = component.compoundVariants.filter((compoundVariant: any) => {
      if (compoundVariant.color) {
        if (!['primary', 'gray'].includes(compoundVariant.color)) {
          strippedCompoundVariants.value = true

          return false
        }
      }

      return true
    })
  }

  return component
}

const component = computed(() => {
  const component = { ...theme[name] }

  return stripCompoundVariants(component)
})

const { data: ast } = await useAsyncData(`component-theme-${name}`, () => parseMarkdown(`
\`\`\`yml
${json5.stringify(component.value, null, 2).replace(/,([ |\t\n]+[}|\])])/g, '$1')}
\`\`\`\

${strippedCompoundVariants.value
? `
::callout{icon="i-simple-icons-github" to="https://github.com/benjamincanac/ui3/blob/dev/src/theme/${name}.ts"}
Some colors in \`compoundVariants\` are omitted for readability. Check out the source code on GitHub.
::`
: ''}

::tip
You can customize this component in your \`app.config.ts\` under \`ui.${name}\` key.
::
`))
</script>

<template>
  <MDCRenderer v-if="ast" :body="ast.body" :data="ast.data" />
</template>
