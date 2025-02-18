export const EmptyState = ({ title, message, suggestion }) => (
    <div className="p-8 text-center">
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
            {suggestion && <p className="mt-1 text-sm text-gray-400">{suggestion}</p>}
        </div>
    </div>
);
