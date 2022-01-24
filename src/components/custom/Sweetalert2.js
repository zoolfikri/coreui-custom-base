import Swal from 'sweetalert2'

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-primary mx-1',
    cancelButton: 'btn btn-outline-primary mx-1',
    denyButton: 'btn btn-outline-primary mx-1',
    htmlContainer: 'text-title fw-bold',
  },
  buttonsStyling: false,
})

export default swalWithBootstrapButtons
