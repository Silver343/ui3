<script lang="ts">
import { tv } from 'tailwind-variants'
import type { AppConfig } from '@nuxt/schema'
import type { CoreOptions } from '@tanstack/vue-table'
import _appConfig from '#build/app.config'
import theme from '#build/ui/table'
// import type { PartialString } from '../types/utils'
import type { PaginationProps } from '../types'

const appConfig = _appConfig as AppConfig & { ui: { table: Partial<typeof theme> } }

const table = tv({ extend: tv(theme), ...(appConfig.ui?.table || {}) })

export interface TableProps extends Partial<Pick<CoreOptions, 'columns' | 'data'>> {
    class?: any
    pagination?: PaginationProps
    selectable?: boolean
    // ui?: PartialString<typeof table.slots>
}

export interface ColumnProps {
    header?: string | any
    footer?: string | any
    accessKey?: string | number
    accessFn?: any
    cell?: any
    enableSorting: { default: false, type: boolean}
}
</script>

<script setup lang="ts">
import { ref, h } from 'vue'
import { UCheckbox } from '#components'
import type {SortingState, PaginationState, RowSelectionState} from '@tanstack/vue-table'
import { useVueTable, FlexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel } from '@tanstack/vue-table'

const props = defineProps<TableProps>()

const sortingState = ref<SortingState>([])

const rowSelection = ref<RowSelectionState>({
  1: true,
  2: true,
})

const paginationState = ref<PaginationState | null>( props.pagination ?
  {
      pageIndex: props.pagination.page - 1,
      pageSize: props.pagination.itemsPerPage
  } :
  null
)

function setSortingState(column) {
  if("columns" in column){
    column["columns"].map((column) => setSortingState(column))
  }else
  column['enableSorting'] = column['enableSorting'] ?? false
  return column
}


const columns = props.columns.map((column) => setSortingState(column))

if(props.selectable) {
  columns.splice(0,0,
    {
      id: 'select',
      header: (info: any) => h(UCheckbox, { 'model-value': info.table.getIsAllRowsSelected() ? info.table.getIsAllRowsSelected() : undefined, indeterminate: info.table.getIsSomeRowsSelected(), onChange: info.table.getToggleAllRowsSelectedHandler() }),
      cell: (info: any) => h(UCheckbox, { 'model-value': info.row.getIsSelected(), onChange: info.row.getToggleSelectedHandler()} )
    },
  )
}

const table = useVueTable({
  data: props.data,
  columns: columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  enableRowSelection: props.selectable,
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
    }
  },
  onRowSelectionChange: updateOrValue => {
    rowSelection.value =
      typeof updateOrValue === 'function'
        ? updateOrValue(rowSelection.value)
        : updateOrValue
  },
  onSortingChange: updaterOrValue => {
    sortingState.value =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(sortingState.value)
        : updaterOrValue
  }
})
</script>

<template>
  {{ rowSelection }}
  <div class="relative overflow-x-auto">
    <table class="min-w-full dividie-y divide-gray-300 dark:divide-gray-700">
      <thead class="relatve">
        <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <th @click="header.column.getToggleSortingHandler()?.($event)" class="text-left rtl:text-right px-4 py-3.5 text-gray-900 dark:text-white font-semibold text-sm" v-for="header in headerGroup.headers" :key="header.id" :colSpan="header.colSpan">
            <template class="align-baseline" v-if="!header.isPlaceholder">
              <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
              <template v-if="header.column.getCanSort()">
                <UIcon v-if="header.column.getIsSorted() === false" :name="appConfig.ui.icons.sortable" />
                <UIcon v-if="header.column.getIsSorted() === 'asc'" :name="appConfig.ui.icons.sortAsc" />
                <UIcon v-if="header.column.getIsSorted() === 'desc'" :name="appConfig.ui.icons.sortDesc" />
              </template>
            </template>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
        <tr v-for="row in table.getRowModel().rows" :key="row.id">
          <td class="whitespace-nowrap px-4 py-4 text-gray-500 dark:text-gray-400 text-sm border-r border-gray-300" v-for="cell in row.getVisibleCells()" :key="cell.id">
            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
          </td>
        </tr>
      </tbody>
    </table>
    <div>
      <UPagination v-if="pagination" :itemsPerPage="pagination.itemsPerPage" v-model:page="pagination.page" :total="data.length" :sibling-count="pagination.siblingCount" :show-edges="pagination.showEdges" >
        <template #first>
          <UButton @click="table.setPageIndex(0)" :disabled="!table.getCanPreviousPage()" color="gray" variant="outline" :icon="appConfig.ui.icons.chevronDoubleLeft" />
        </template>
        <template #prev>
          <UButton @click="table.previousPage()" :disabled="!table.getCanPreviousPage()" color="gray" variant="outline" :icon="appConfig.ui.icons.chevronLeft" />
        </template>
        <template #item="{ item, index, page}">
            <UButton
              @click="table.setPageIndex(item.value - 1 )"
              :color="page === item.value ? 'gray' : 'black'"
              :variant="page === item.value ? 'solid' : 'outline'"
              :label="String(item.value)"
              square
            >
            </UButton>
            <!-- things to do:
            selecting
            searching - filter?
            loading state
            empty state -->

        </template>
        <template #next>
          <UButton @click="table.nextPage()" :disabled="!table.getCanNextPage()" color="gray" variant="outline" :icon="appConfig.ui.icons.chevronRight" />
        </template>
        <template #last>
          <UButton @click="table.setPageIndex(table.getPageCount()-1)" :disabled="!table.getCanNextPage()" color="gray" variant="outline" :icon="appConfig.ui.icons.chevronDoubleRight" />
        </template>
      </UPagination>
    </div>
  </div>
  </template>
