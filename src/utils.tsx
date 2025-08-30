import { platform } from '@tauri-apps/plugin-os';

export const platformName = platform();
export const isWindows = platformName === 'windows';
