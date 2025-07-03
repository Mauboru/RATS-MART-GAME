import { useState, useEffect } from 'react';

export function useAssets(assetPaths) {
  const [assets, setAssets] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const keys = Object.keys(assetPaths);
    const loadedAssets = {};
    let loadedCount = 0;
    let errorFound = false;

    if (keys.length === 0) {
      setLoaded(true);
      setAssets({});
      setError(false);
      return;
    }

    keys.forEach(key => {
      const path = assetPaths[key];
      const extension = path.split('.').pop().toLowerCase();

      if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) {
        const img = new Image();
        img.onload = () => {
          loadedAssets[key] = img;
          loadedCount++;
          checkCompletion();
        };
        img.onerror = (e) => {
          console.error(`Erro ao carregar imagem "${key}" (${path})`, e);
          errorFound = true;
          loadedCount++;
          checkCompletion();
        };
        img.src = path;
      } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
        const audio = new Audio();
        audio.onloadeddata = () => {
          loadedAssets[key] = audio;
          loadedCount++;
          checkCompletion();
        };
        audio.onerror = (e) => {
          console.error(`Erro ao carregar áudio "${key}" (${path})`, e);
          errorFound = true;
          loadedCount++;
          checkCompletion();
        };
        audio.src = path;
        audio.load(); // Garante pré-carregamento
      } else {
        console.warn(`Tipo de arquivo não suportado: ${path}`);
        loadedCount++;
        checkCompletion();
      }
    });

    function checkCompletion() {
      if (loadedCount === keys.length) {
        setError(errorFound);
        if (!errorFound) {
          setAssets(loadedAssets);
          setLoaded(true);
        } else {
          setLoaded(false);
        }
      }
    }
  }, [assetPaths]);

  return { assets, loaded, error };
}
