import React, { useRef, useState, useEffect } from 'react';

const TradeActionMenu = ({ trade, onEdit, onDelete, onExit, forceUp }) => {
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const [showMenu, setShowMenu] = useState(false);

    // Toggle menu
    const handleMenuToggle = () => {
        setShowMenu(!showMenu);
    };

    // Handle clicks outside to close the menu
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                showMenu && 
                menuRef.current && 
                !menuRef.current.contains(event.target) &&
                buttonRef.current && 
                !buttonRef.current.contains(event.target)
            ) {
                setShowMenu(false);
            }
        }

        // Add event listener
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            // Remove event listener on cleanup
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    return (
        <div className="relative inline-block text-left">
            <button 
                ref={buttonRef}
                type="button" 
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 focus:outline-none" 
                onClick={handleMenuToggle}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <circle cx="4" cy="10" r="2" />
                    <circle cx="10" cy="10" r="2" />
                    <circle cx="16" cy="10" r="2" />
                </svg>
            </button>

            {showMenu && (
                <div 
                    ref={menuRef}
                    style={{
                        position: 'fixed',
                        zIndex: 9999,
                        width: '120px',
                        top: `${buttonRef.current ? buttonRef.current.getBoundingClientRect().top - 100 : 0}px`,
                        left: `${buttonRef.current ? buttonRef.current.getBoundingClientRect().left - 80 : 0}px`,
                    }}
                    className="bg-white border border-gray-200 shadow-lg rounded-md py-1"
                >
                    <div className="py-1">
                        <button 
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => { 
                                onEdit(trade); 
                                setShowMenu(false); 
                            }}
                        >
                            ✏️ Edit
                        </button>
                        
                        {trade.openQuantity > 0 && trade.status !== 'CLOSED' && (
                            <button 
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => { 
                                    onExit(trade); 
                                    setShowMenu(false); 
                                }}
                            >
                                🚪 Exit Trade
                            </button>
                        )}
                        
                        <button 
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            onClick={() => { 
                                if(window.confirm('Are you sure you want to delete this trade?')) {
                                    onDelete(trade.id);
                                }
                                setShowMenu(false); 
                            }}
                        >
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TradeActionMenu;
