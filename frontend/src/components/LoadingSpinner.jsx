const LoadingSpinner = ({ fullScreen = true, size = 'large' }) => {
    const sizeClasses = {
        small: 'h-8 w-8 border-b-2',
        medium: 'h-12 w-12 border-b-3',
        large: 'h-16 w-16 border-b-4'
    };

    const spinner = (
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-orange-500`}></div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;
