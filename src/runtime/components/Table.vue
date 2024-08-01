<script lang="ts">
import { tv } from 'tailwind-variants'
import type { AppConfig } from '@nuxt/schema'
import type { Table, SortingState, PaginationState, RowSelectionState, ColumnDef } from '@tanstack/vue-table'
import _appConfig from '#build/app.config'
import theme from '#build/ui/table'
import type { PaginationProps, ProgressProps } from '../types'

const appConfig = _appConfig as AppConfig & { ui: { table: Partial<typeof theme> } }

const table = tv({ extend: tv(theme), ...(appConfig.ui?.table || {}) })

export interface TableProps<TData> {
  data: TData[]
  columns: ColumnProps<TData>[]
  pagination?: PaginationProps
  selected?: RowSelectionState
  search?: string
  emptyState?: EmptyStateProps | null
  loading?: boolean
  progress?: ProgressProps | null
  loadingState?: LoadingStateProps | null
  class?: any
}

export interface ColumnProps<TData> extends ColumnDef<TData> {
  enableSorting?: boolean
}

export interface EmptyStateProps {
  icon: string
  label: string
}

export interface LoadingStateProps {
  icon: string
  label: string
}
</script>

<script setup lang="ts" generic="TData extends any">
import { ref, h, computed } from 'vue'
import { UCheckbox } from '#components'
import {
  useVueTable,
  FlexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel
} from '@tanstack/vue-table'

const props = withDefaults(defineProps<TableProps<TData>>(), {
  emptyState: () => ({
    icon: appConfig.ui.icons.empty,
    label: 'No items.'
  }),
  loadingState: () => ({
    icon: appConfig.ui.icons.loading,
    label: 'Loading...'
  }),
  progress: () => ({
    size: '2xs'
  })
})

const sortingState = ref<SortingState>([])

const rowSelection = ref<RowSelectionState | undefined>(props.selected)

const paginationState = computed<PaginationState | undefined>(() => {
  return !!props.pagination
  ? {
      pageIndex: props.pagination.page - 1,
      pageSize: props.pagination.itemsPerPage
    }
  : undefined
})
console.log(paginationState.value)

function setSortingState(column: ColumnProps<TData>): ColumnProps<TData> {
  if ('columns' in column) {
    column['columns'].map(col => setSortingState(col))
  } else {
    column['enableSorting'] = column['enableSorting'] ?? false
  }
  return column
}

const columns = props.columns.map(column => setSortingState(column))

if (props.selected) {
  columns.splice(0, 0,
    {
      id: 'select',
      header: ({ table }) => h(UCheckbox, {
        'model-value': table.getIsAllPageRowsSelected() ? table.getIsAllPageRowsSelected() : undefined,
        'indeterminate': table.getIsSomePageRowsSelected(),
        'onUpdate:modelValue': value => table.toggleAllPageRowsSelected(value)
      }),
      cell: ({ row }) => h(UCheckbox, {
        'model-value': row.getIsSelected(),
        'onChange': row.getToggleSelectedHandler()
      })
    }
  )
}

const table = useVueTable<TData>({
  data: props.data,
  columns: columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  enableRowSelection: !!props.selected,
  initialState: {
    get pagination() {
      return paginationState.value
    }
  },
  state: {
    get sorting() {
      return sortingState.value
    },
    get rowSelection() {
      return rowSelection.value
    },
    get globalFilter() {
      return props.search
    }
  },
  onRowSelectionChange: (updateOrValue) => {
    rowSelection.value
      = typeof updateOrValue === 'function'
        ? updateOrValue(rowSelection.value)
        : updateOrValue
  },
  onSortingChange: (updaterOrValue) => {
    sortingState.value
      = typeof updaterOrValue === 'function'
        ? updaterOrValue(sortingState.value)
        : updaterOrValue
  }
})
</script>

<template>
  <div class="relative overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
      <thead class="relative">
        <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <th v-for="header in headerGroup.headers" :key="header.id" class="text-left rtl:text-right px-4 py-3.5 text-gray-900 dark:text-white font-semibold text-sm" :colSpan="header.colSpan" @click="header.column.getToggleSortingHandler()?.($event)">
            <template v-if="!header.isPlaceholder">
              <div class="align-baseline">
                <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
                <template v-if="header.column.getCanSort()">
                  <UIcon v-if="header.column.getIsSorted() === false" :name="appConfig.ui.icons.sortable" />
                  <UIcon v-if="header.column.getIsSorted() === 'asc'" :name="appConfig.ui.icons.sortAsc" />
                  <UIcon v-if="header.column.getIsSorted() === 'desc'" :name="appConfig.ui.icons.sortDesc" />
                </template>
              </div>
            </template>
          </th>
        </tr>
        <tr v-if="loading && progress">
          <td colspan="0" class="absolute inset-x-0 -bottom-[0.5px] p-0">
            <UProgress  v-bind="progress"/>
          </td>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
        <tr v-if="!data.length && loadingState !== null && loading">
          <td :colspan="columns.length">
            <div class="flex flex-col items-center justify-center flex-1 px-6 py-14 sm:px-14">
              <slot name="loading-state">
                <UIcon class="w-6 h-6 mx-auto text-gray-400 dark:text-gray-500 mb-4" :name="loadingState.icon" />
                <p class="text-sm text-center text-gray-900 dark:text-white">
                  {{ loadingState.label }}
                </p>
              </slot>
            </div>
          </td>
        </tr>
        <tr v-else-if="!data.length && emptyState !== null">
          <td :colspan="columns.length">
            <div class="flex flex-col items-center justify-center flex-1 px-6 py-14 sm:px-14">
              <slot name="empty-state">
                <UIcon class="w-6 h-6 mx-auto text-gray-400 dark:text-gray-500 mb-4" :name="emptyState.icon" />
                <p class="text-sm text-center text-gray-900 dark:text-white">
                  {{ emptyState.label }}
                </p>
              </slot>
            </div>
          </td>
        </tr>
        <template v-else>
          <tr v-for="row in table.getRowModel().rows" :key="row.id">
            <td v-for="cell in row.getVisibleCells()" :key="cell.id" class="whitespace-nowrap px-4 py-4 text-gray-500 dark:text-gray-400 text-sm border-r border-gray-300">
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <div>
      <UPagination
        v-if="pagination"
        v-model:page="pagination.page"
        class="mt-8"
        :items-per-page="pagination.itemsPerPage"
        :total="data.length"
        :sibling-count="pagination.siblingCount"
        :show-edges="pagination.showEdges"
      >
        <template #first>
          <UButton :disabled="!table.getCanPreviousPage()" color="gray" variant="outline" :icon="appConfig.ui.icons.chevronDoubleLeft" @click="table.setPageIndex(0)" />
        </template>
        <template #prev>
          <UButton :disabled="!table.getCanPreviousPage()" color="gray" variant="outline" :icon="appConfig.ui.icons.chevronLeft" @click="table.previousPage()" />
        </template>
        <template #item="{ item, page }: {item: {type: 'page'; value: number}, page: number}">
          <UButton
            color='gray'
            :variant="page === item.value ? 'solid' : 'outline'"
            :label="String(item.value)"
            square
            @click="table.setPageIndex(item.value - 1)"
          />
        </template>
        <template #next>
          <UButton :disabled="!table.getCanNextPage()" color="gray" variant="outline" :icon="appConfig.ui.icons.chevronRight" @click="table.nextPage()" />
        </template>
        <template #last>
          <UButton :disabled="!table.getCanNextPage()" color="gray" variant="outline" :icon="appConfig.ui.icons.chevronDoubleRight" @click="table.setPageIndex(table.getPageCount()-1)" />
        </template>
      </UPagination>
    </div>
  </div>
</template>
