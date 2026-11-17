'use client';
import { cn } from "cn";
import { createContext, useContext, useState } from "react";

export const colorThemes =  ["default", "blue", "cyan", "green", "amber", "red", "purple"];

type ColorThemeContextType = {
    color: typeof colorThemes[number];
    setColor: (color: typeof colorThemes[number]) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType>({
    color: "default",
    setColor: () => {}
});

export const useColorTheme = () => useContext(ColorThemeContext);

export default function ColorThemeProvider({children, initialColorTheme}: {children: React.ReactNode, initialColorTheme?: typeof colorThemes[number]}){
    const [colorTheme, setColorTheme] = useState<typeof colorThemes[number]>(initialColorTheme || "default");
    return <ColorThemeContext.Provider value={{color: colorTheme, setColor: setColorTheme}}>
        <div className={cn(colorTheme)}>
            {children}
        </div>
    </ColorThemeContext.Provider>
}