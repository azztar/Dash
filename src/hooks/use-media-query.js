import { useEffect, useState } from "react";

export const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        setMatches(media.matches);

        const listener = (event) => {
            setMatches(event.matches);
        };

        media.addEventListener("change", listener);

        return () => {
            media.removeEventListener("change", listener);
        };
    }, [query]);

    return matches;
};
