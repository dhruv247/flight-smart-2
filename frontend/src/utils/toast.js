import { toast } from 'react-toastify';

/**
 * Shows a toast notification with the specified type and message
 * @param {string} type - The type of toast ('success', 'error', 'info', 'warning')
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
		case 'info':
			toast.info(message, options);
			break;
		case 'warning':
			toast.warning(message, options);
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

export const showInfoToast = (message) => {
	toast.info(message, {
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

export const showWarningToast = (message) => {
	toast.warning(message, {
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
