import { useState, useEffect } from 'react';

export function useAssets(assetPaths) {
  const [assets, setAssets] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const keys = Object.keys(assetPaths);
    const images = {};
    let loadedCount = 0;
    let errorFound = false;

    if (keys.length === 0) {
      setLoaded(true);
      setAssets({});
      setError(false);
      return;
    }

    keys.forEach(key => {
      const img = new Image();
      img.onload = () => {
        images[key] = img;
        loadedCount++;
        checkCompletion();
      };
      img.onerror = () => {
        errorFound = true;
        loadedCount++;
        checkCompletion();
      };
      img.src = assetPaths[key];
    });

    function checkCompletion() {
      if (loadedCount === keys.length) {
        setError(errorFound);
        if (!errorFound) {
          setAssets(images);
          setLoaded(true);
        } else {
          setLoaded(false);
        }
      }
    }
  }, [assetPaths]);
  return { assets, loaded, error };
}