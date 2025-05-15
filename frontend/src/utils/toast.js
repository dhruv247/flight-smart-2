import { toast } from 'react-toastify';

/**
 * Show a toast notification with the specified type and message
 * @param {string} type - The type of toast ('success', 'error')
 * @param {string} message - The message to display in the toast
 */
export const showToast = (type, message) => {
	const options = {
		position: 'top-right',
		autoClose: 5000,
		hideProgressBar: false,
		closeOnClick: true,
		pauseOnHover: true,
		draggable: true,
		progress: undefined,
	};

	switch (type) {
		case 'success':
			toast.success(message, options);
			break;
		case 'error':
			toast.error(message, options);
			break;
		default:
			toast(message, options);
	}
};

export const showSuccessToast = (message) => {
	toast.success(message, {
		position: 'top-right',
		autoClose: 2000,
		hideProgressBar: false,
		closeOnClick: true,
		pauseOnHover: true,
		draggable: true,
		progress: undefined,
		theme: 'light',
	});
};

export const showErrorToast = (message) => {
	toast.error(message, {
		position: 'top-right',
		autoClose: 2000,
		hideProgressBar: false,
		closeOnClick: true,
		pauseOnHover: true,
		draggable: true,
		progress: undefined,
		theme: 'light',
	});
};