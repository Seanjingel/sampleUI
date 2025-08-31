import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastNotification = {
  success: (msg) => toast.success(msg),
  error: (msg) => toast.error(msg),
};

export { ToastContainer };
export default ToastNotification;
