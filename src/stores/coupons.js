import { defineStore } from "pinia"
import { computed, ref, watch } from "vue"
import { useCartStore } from '../stores/cart'

export const useCouponStore = defineStore('coupons', () => {
  const cart = useCartStore()
  const couponInput = ref('')
  const couponValidationMessage = ref('')
  const discountPercentage = ref(0)
  const discount = ref(0)

  const VALID_COUPONS = [
    { name: '10DESCUENTO', discount: 0.10},
    { name: '20DESCUENTO', discount: 0.20},
  ]

  watch(discountPercentage, () => {
    discount.value = (cart.total * discountPercentage.value).toFixed(2)
  })

  function applyCoupon() {
    if ( VALID_COUPONS.some(coupon => coupon.name === couponInput.value) ) {
      couponValidationMessage.value = 'Verificando...'

      setTimeout(() => {
        discountPercentage.value = VALID_COUPONS.find(coupon => coupon.name === couponInput.value).discount
        couponValidationMessage.value = 'Cupón aplicado'
      }, 1500)
    } else{
      couponValidationMessage.value = 'Cupón no válido'
    }
    setTimeout(() => {
      couponValidationMessage.value = ''
    }, 5000)
  }

  function $reset() {
    couponInput.value = ''
    couponValidationMessage.value = ''
    discountPercentage.value = 0
    discount.value = 0
  }

  const isValidCoupon = computed(() => discountPercentage.value > 0)

  return {
    couponInput,
    discount,
    applyCoupon,
    $reset,
    couponValidationMessage,
    isValidCoupon,
  }
})