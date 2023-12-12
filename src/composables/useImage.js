import { computed, ref } from "vue"
import { uid } from "uid"
import { getDownloadURL, ref as storageRef, uploadBytesResumable } from "firebase/storage"
import { useFirebaseStorage } from "vuefire"

export default function useImage() {
  const url = ref(null)
  const storage = useFirebaseStorage()

  const onFileChange = e => {
    const file = e.target.files[0]
    const fileName = uid() + '.jpg'
    const sRef = storageRef(storage, `/products/${fileName}`)

    // Sube el archivo
    const uploadTask = uploadBytesResumable(sRef, file)

    uploadTask.on('state_changed',
      () => {},
      (error) => console.log(error),
      () => {
        // Ya se subió
        getDownloadURL(uploadTask.snapshot.ref)
          .then(downloadURL => {
            url.value = downloadURL
          })
      }
    )
  }

  const isImageUploaded = computed(() => {
    return url.value ? url.value : null
  })

  return {
    url,
    onFileChange,
    isImageUploaded
  }
}