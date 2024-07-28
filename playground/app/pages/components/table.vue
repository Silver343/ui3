<script setup lang="ts">
import type { User } from '~/types'
import { ref, h} from 'vue'
import UAvatar  from '../../../../src/runtime/components/Avatar.vue';
import UCheckbox from '../../../../src/runtime/components/Checkbox.vue'

const { data: users } = await useFetch('https://jsonplaceholder.typicode.com/users', {
  transform: (data: User[]) => {
    return data?.map(user => ({ name: user.name, id: user.id, email: user.email, phone: user.phone, avatar: { src: `https://i.pravatar.cc/120?img=${user.id}` } })) || []
  },
  lazy: true
})

const items = ref(users)


const pagination = {
  page: 1,
  itemsPerPage: 2,
  siblingCount: 1,
  showEdges: true
}

const columns = [
  {
    id: 'select',
    header: (info: any) => h(UCheckbox, { 'model-value': info.table.getIsAllRowsSelected() ? info.table.getIsAllRowsSelected() : undefined, indeterminate: info.table.getIsSomeRowsSelected(), onChange: info.table.getToggleAllRowsSelectedHandler() }),
    cell: (info: any) => h(UCheckbox, { 'model-value': info.row.getIsSelected(), onChange: info.row.getToggleSelectedHandler()} )
  },
  {
    accessorKey: 'avatar.src',
    header: () => null,
    cell: (info: any) => h(UAvatar, { src:info.getValue(), size:'lg' })
  },
  {
    accessorKey: 'name',
    header: 'Name',
    enableSorting: true
  },
  {
    header: 'Contact Details',
    columns: [
      {
        accessorKey: 'email',
        header: 'Email',
        enableSorting: true
      },
      {
        accessorKey: 'phone',
        header: 'Phone Number',
      },
    ]
  }
]
</script>

<template>
  <UTable :data="items" :columns="columns"/>
</template>
