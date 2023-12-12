import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useCollection, useFirebaseStorage, useFirestore } from 'vuefire'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  query,
  updateDoc
} from 'firebase/firestore'
import { deleteObject, ref as storageRef } from 'firebase/storage'

export const useProductsStore = defineStore('products', () => {
  const db = useFirestore()
  const storage = useFirebaseStorage()

  const selectedCategory = ref(1)
  const categories = [
    { id: 1, name: 'Sudaderas' },
    { id: 2, name: 'Tenis' },
    { id: 3, name: 'Lentes' }
  ]
  const q = query(
    collection(db, 'products')
    /* where('category', '==', 1), */
    /* where('price', '>', 50), */
    /* where('availability', '>=', 5), */
    /* limit(10), */
    /* orderBy('name', 'desc'), */
  )
  const productsCollection = useCollection(q)

  const categoryOptions = computed(() => {
    const options = [
      { label: '--- Seleccione ---', value: '', attrs: { disabled: true } },
      ...categories.map((category) => ({
        label: category.name,
        value: category.id
      }))
    ]

    return options
  })

  async function createProduct(product) {
    await addDoc(collection(db, 'products'), product)
  }

  async function updateProduct(docRef, product) {
    // eslint-disable-next-line no-unused-vars
    const { image, url, ...values } = product

    if (image.length) {
      await updateDoc(docRef, { ...values, image: url.value })
    } else {
      await updateDoc(docRef, values)
    }
  }

  async function deleteProduct(id) {
    if (confirm('¿Eliminar producto?')) {
      const docRef = doc(db, 'products', id)
      const docSnap = await getDoc(docRef)
      const { image } = docSnap.data()
      const imageRef = storageRef(storage, image)

      await Promise.all([deleteDoc(docRef), deleteObject(imageRef)])
    }
  }

  const noResults = computed(() => productsCollection.value.length === 0)

  const filteredProducts = computed(() => {
    return productsCollection.value
      .filter((product) => product.category === selectedCategory.value)
      .filter((product) => product.availability > 0)
  })

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    categories,
    selectedCategory,
    categoryOptions,
    productsCollection,
    noResults,
    filteredProducts
  }
})
