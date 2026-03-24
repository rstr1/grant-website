import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@/tailwind.config';

const fullConfig = resolveConfig(tailwindConfig);

export const dithered_background = fullConfig.theme.colors.dithered_background;
export const gradient_background = fullConfig.theme.colors.gradient_background;

export const project_hero_classname = `h-[70vh] min-h-[40vh] flex flex-col justify-center items-center text-center px-[10%] pb-16 pt-36`
export const project_breadcrumb_classname = `font-jost text-xs tracking-[0.3em] uppercase text-eggshell/30 hover:text-cadmium_orange transition-colors duration-300 mb-8 inline-block`

export const body_text_classname = `font-jost text-eggshell/50 leading-relaxed mb-6`