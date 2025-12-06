const Badge = ({ 
    children, 
    variant = 'default',
    size = 'medium'
}) => {
    const variants = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        danger: 'bg-red-100 text-red-800',
        warning: 'bg-yellow-100 text-yellow-800',
        info: 'bg-blue-100 text-blue-800',
        purple: 'bg-purple-100 text-purple-800',
        orange: 'bg-orange-100 text-orange-800'
    };

    const sizes = {
        small: 'px-2 py-0.5 text-xs',
        medium: 'px-3 py-1 text-xs',
        large: 'px-4 py-1.5 text-sm'
    };

    return (
        <span className={`inline-flex leading-5 font-semibold rounded-full ${variants[variant]} ${sizes[size]}`}>
            {children}
        </span>
    );
};

export default Badge;
