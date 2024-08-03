<script setup lang="ts">
import type { User } from '~/types'
import { ref, h } from 'vue'
import UAvatar from '../../../../src/runtime/components/Avatar.vue'

const { status, data: users } = await useFetch('https://jsonplaceholder.typicode.com/users', {
  transform: (data: User[]) => {
    return data?.map(user => ({ name: user.name, id: user.id, email: user.email, phone: user.phone, avatar: { src: `https://i.pravatar.cc/120?img=${user.id}` } })) || []
  },
  lazy: true
})

const pagination = {
  page: 1,
  itemsPerPage: 3,
  siblingCount: 1,
  showEdges: true
}

const columns = [
  {
    accessorKey: 'avatar.src',
    header: () => null,
    cell: (info: any) => h(UAvatar, { src: info.getValue(), size: 'lg' })
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
        header: 'Phone Number'
      }
    ]
  }
]

const selected = {
  1: true,
  3: true
}

const search = ref('')
</script>

<template>
  <UInput v-model="search" autofocus placeholder="Search..." />
  <UTable
    :data="users"
    :columns="columns"
    :search="search"
    :selected="selected"
    :pagination="pagination"
    :loading="status === 'pending'"
  >
    <template #empty-state>
      empty
    </template>
  </UTable>
</template>
