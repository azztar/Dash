export const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <span className="ml-2">Cargando mediciones...</span>
    </div>
);
