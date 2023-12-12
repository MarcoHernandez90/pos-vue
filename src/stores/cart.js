import { defineStore } from "pinia"
import { computed, ref, watchEffect } from "vue"
import { useCouponStore } from "./coupons"
import { useFirestore } from "vuefire"
import { addDoc, collection, doc, runTransaction } from "firebase/firestore"
import { getCurrentDate } from "../helpers"

export const useCartStore = defineStore('cart', () => {
  const coupon = useCouponStore()
  const db = useFirestore()

  const items = ref([])
  const subtotal = ref(0)
  const taxes = ref(0)
  const total = ref(0)

  const MAX_PRODUCTS = 10
  const TAX_RATE = 0.16

  /* WatchEffect escucha los cambios de todas las variables dentro de la
    función igual que un computed, pero está hecho para realizar cambios al
    state en lugar de sólo realizar calculos de consulta */
  watchEffect(() => {
    subtotal.value = items.value.reduce((total, item) => total + (item.quantity * item.price), 0)
    taxes.value = Number((subtotal.value * TAX_RATE).toFixed(2))
    total.value = Number(((subtotal.value + taxes.value) - coupon.discount).toFixed(2))
  })

  function addItem(item) {
    const index = isItemInCart(item.id)
    if (index >= 0) {
      if ( !isProductAvailable(item, index) ) return
      items.value[index].quantity++
    } else {
      items.value.push({ ...item, quantity: 1, id: item.id })
    }
  }

  function updateQuantity(id, quantity) {
    const item = items.value.find(item => item.id === id)
    item.quantity = quantity
  }

  function removeItem(id) {
    items.value = items.value.filter(item => item.id !== id)
  }

  async function checkout() {
    try {
      await addDoc(collection(db, 'sales'), {
        items: items.value.map(item => {
          // eslint-disable-next-line no-unused-vars
          const { availability, category, ...data } = item
          return data
        }),
        subtotal: subtotal.value,
        taxes: taxes.value,
        discount: coupon.discount,
        total: total.value,
        date: getCurrentDate()
      })

      // Sustraer la cantidad de productos de lo disponible
      items.value.forEach(async item => {
        const productRef = doc(db, 'products', item.id)
        await runTransaction(db, async (transaction) => {
          // Obtenemos el producto utilizando la transacción que se está realizando
          const currentProduct = await transaction.get(productRef)
          /* Obtenemos lo disponible de ese producto y sacamos la diferencia
            entre lo disponible y lo comprado */
          const availability = currentProduct.data().availability - item.quantity
          /* Le indicamos a la transacción que debe actualizar el producto con
            los valores a actualizar */
          transaction.update(productRef, { availability })
        })
      })

      // Reiniciar state
      $reset()
      coupon.$reset()
    } catch (error) {
      console.log("🚀 ~ file: cart.js:59 ~ checkout ~ error:", error)
    }
  }

  function $reset() {
    items.value = []
    subtotal.value = 0
    taxes.value = 0
    total.value = 0
  }

  const isItemInCart = id => items.value.findIndex((item) => item.id === id)

  const isProductAvailable = (item, index) => {
    return items.value[index].quantity < item.availability && items.value[index].quantity < MAX_PRODUCTS
  }

  const isEmpty = computed(() => items.value.length === 0)

  const checkProductAvailability = computed(() => {
    return product => product.availability < MAX_PRODUCTS ? product.availability : MAX_PRODUCTS
  })

  return {
    items,
    subtotal,
    taxes,
    total,
    addItem,
    updateQuantity,
    removeItem,
    checkout,
    isEmpty,
    checkProductAvailability
  }
})