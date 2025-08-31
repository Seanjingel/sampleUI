import React from 'react';
const Pagination = ({ totalPages, currentPage, setCurrentPage }) => {
    return (
        <div className="flex flex-wrap gap-1 justify-start items-center">
            {[...Array(totalPages)].map((_, i) => (
                <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    aria-current={currentPage === i + 1 ? 'page' : undefined}
                    aria-label={`Go to page ${i + 1}`}
                    className={`px-3 py-1 rounded-lg border text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500
                        ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-700'}`}
                >
                    {i + 1}
                </button>
            ))}
        </div>
    );
};
export default Pagination;