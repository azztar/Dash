import {
    WiDaySunny,
    WiNightClear,
    WiDayCloudy,
    WiNightAltCloudy,
    WiCloud,
    WiCloudy,
    WiDayRain,
    WiNightRain,
    WiDayShowers,
    WiNightShowers,
    WiDayThunderstorm,
    WiNightThunderstorm,
    WiDaySnow,
    WiNightSnow,
    WiDayFog,
    WiNightFog,
} from "react-icons/wi";

const weatherIcons = {
    "01d": WiDaySunny, // Día despejado
    "01n": WiNightClear, // Noche despejada
    "02d": WiDayCloudy, // Pocas nubes (día)
    "02n": WiNightAltCloudy, // Pocas nubes (noche)
    "03d": WiCloud, // Nubes dispersas (día)
    "03n": WiCloud, // Nubes dispersas (noche)
    "04d": WiCloudy, // Nublado (día)
    "04n": WiCloudy, // Nublado (noche)
    "09d": WiDayShowers, // Lluvia ligera (día)
    "09n": WiNightShowers, // Lluvia ligera (noche)
    "10d": WiDayRain, // Lluvia (día)
    "10n": WiNightRain, // Lluvia (noche)
    "11d": WiDayThunderstorm, // Tormenta (día)
    "11n": WiNightThunderstorm, // Tormenta (noche)
    "13d": WiDaySnow, // Nieve (día)
    "13n": WiNightSnow, // Nieve (noche)
    "50d": WiDayFog, // Neblina (día)
    "50n": WiNightFog, // Neblina (noche)
};

export default weatherIcons;
