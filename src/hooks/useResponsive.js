import { useState, useEffect } from "react";

export function useResponsive() {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return {
        isMobile: windowSize.width < 640,
        isTablet: windowSize.width >= 640 && windowSize.width < 1024,
        isDesktop: windowSize.width >= 1024,
    };
}
