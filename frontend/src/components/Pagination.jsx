import React from 'react';

/**
 * Pagination componenet
 */
const Pagination = ({ searchParams, handlePageChange, totalPages }) => {
	
	const currentPage = searchParams.page;
	
	const pageNumbers = [];

	if (totalPages <= 3) {
		for (let i = 0; i < totalPages; i++) {
			pageNumbers.push(i);
		}
	} else {
		if (currentPage < 3) {
			// Show first 3 pages
			for (let i = 0; i < 3; i++) {
				pageNumbers.push(i);
			}
			pageNumbers.push('ellipsis');
			pageNumbers.push(totalPages - 1);
		} else if (currentPage >= totalPages - 3) {
			// Show last 3 pages
			pageNumbers.push(0);
			pageNumbers.push('ellipsis');
			for (let i = totalPages - 3; i < totalPages; i++) {
				pageNumbers.push(i);
			}
		} else {
			// Show current, 1 before and 1 after
			pageNumbers.push(0);
			pageNumbers.push('ellipsis');
			for (let i = currentPage - 1; i <= currentPage + 1; i++) {
				pageNumbers.push(i);
			}
			pageNumbers.push('ellipsis');
			pageNumbers.push(totalPages - 1);
		}
	}

  return (
		<nav aria-label="Page navigation" className="mt-4 container">
			<ul className="pagination justify-content-center">
				<li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
					<button
						className="page-link"
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 0}
					>
						Previous
					</button>
				</li>

				{pageNumbers.map((num, idx) => {
					if (num === 'ellipsis') {
						return (
							<li key={`ellipsis-${idx}`} className="page-item disabled">
								<span className="page-link">...</span>
							</li>
						);
					}
					return (
						<li
							key={num}
							className={`page-item ${currentPage === num ? 'active' : ''}`}
						>
							<button
								className="page-link"
								onClick={() => handlePageChange(num)}
							>
								{num + 1}
							</button>
						</li>
					);
				})}

				<li
					className={`page-item ${
						currentPage === totalPages - 1 ? 'disabled' : ''
					}`}
				>
					<button
						className="page-link"
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages - 1}
					>
						Next
					</button>
				</li>
			</ul>
		</nav>
	);
};

export default Pagination;