import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@/tailwind.config';

const fullConfig = resolveConfig(tailwindConfig);

export const dithered_background = fullConfig.theme.colors.forest;
export const gradient_background = fullConfig.theme.colors.forest_deep;

export const project_hero_classname = `h-[70vh] min-h-[40vh] flex flex-col justify-center items-center text-center px-[10%] pb-16 pt-36`
export const project_breadcrumb_classname = `font-mono text-xs tracking-[0.3em] uppercase text-sage/60 hover:text-light_green transition-colors duration-300 mb-8 inline-block`

export const body_text_classname = `font-geist text-lg text-sage leading-relaxed mb-6 max-w-[68ch]`