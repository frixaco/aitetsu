export const isTauri = '__TAURI__' in window;

export const getPlatformName = async () => {
  if (!isTauri) {
    return {
      isWindows: false,
    };
  }

  const { platform } = await import('@tauri-apps/plugin-os');
  const name = platform();
  return {
    isWindows: name === 'windows',
  };
};
