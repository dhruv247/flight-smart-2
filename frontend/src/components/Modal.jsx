import React from 'react';

/**
 * custom Modal component
 */
const Modal = ({ isOpen, onClose, title, children, footer }) => {
	if (!isOpen) return null;

	return (
		<div
			className="modal show d-block"
			tabIndex="-1"
			style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
		>
			<div className="modal-dialog modal-dialog-centered">
				<div className="modal-content">
					<div className="modal-header border-bottom">
						<h5 className="modal-title">{title}</h5>
						<button
							type="button"
							className="btn-close"
							onClick={onClose}
						></button>
					</div>
					<div className="modal-body p-4">{children}</div>
					{footer && <div className="modal-footer border-top">{footer}</div>}
				</div>
			</div>
		</div>
	);
};

export default Modal;
