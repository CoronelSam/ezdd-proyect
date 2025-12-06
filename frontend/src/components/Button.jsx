const Button = ({ 
    children, 
    onClick, 
    type = 'button',
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    disabled = false,
    className = ''
}) => {
    const variants = {
        primary: 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 shadow-lg',
        secondary: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg',
        success: 'bg-green-600 text-white hover:bg-green-700 shadow-lg',
        outline: 'border border-orange-500 text-orange-500 hover:bg-orange-50'
    };

    const sizes = {
        small: 'px-3 py-1.5 text-sm',
        medium: 'px-4 py-2',
        large: 'px-6 py-3 text-lg'
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
                ${variants[variant]} 
                ${sizes[size]} 
                ${fullWidth ? 'w-full' : ''} 
                rounded-lg transition font-medium
                disabled:opacity-50 disabled:cursor-not-allowed
                ${className}
            `}
        >
            {children}
        </button>
    );
};

export default Button;
