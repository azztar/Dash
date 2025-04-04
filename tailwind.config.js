/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class", // or 'media' or 'class'
    theme: {
        extend: {
            fontFamily: {
                sans: ["Space Grotesk", "system-ui", "sans-serif"],
            },
        },
    },
    plugins: [],
};
