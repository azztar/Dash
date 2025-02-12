import { useEffect } from "react";

export const useClickOutside = (refs, handler) => {
    useEffect(() => {
        const listener = (event) => {
            if (!Array.isArray(refs)) return;

            // Si el click fue dentro de alguno de los refs, no hacemos nada
            if (refs.some((ref) => ref.current?.contains(event.target))) {
                return;
            }

            handler();
        };

        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [refs, handler]);
};
