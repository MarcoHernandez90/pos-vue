import { computed, ref } from "vue"
import { defineStore } from "pinia"
import { useCollection, useFirestore } from "vuefire"
import { collection, query, where } from "firebase/firestore"

export const useSaleStore = defineStore('sales', () => {
  const date = ref('')
  const db = useFirestore()

  const salesSource = computed(() => {
    if (date.value) {
      const q = query(
        collection(db, 'sales'),
        where('date', '==', date.value)
      )
      return q
    }
    return null
  })

  const salesCollection = useCollection(salesSource)

  const isDateSelected = computed(() => date.value)

  const noSales = computed(
    () => !salesCollection.length && date.value
  )

  const totalSalesOfDay = computed(() => {
    return salesCollection.value ? salesCollection.value.reduce((total, sale) => sale.total + total, 0) : 0
  })

  return {
    date,
    isDateSelected,
    salesCollection,
    noSales,
    totalSalesOfDay
  }
})