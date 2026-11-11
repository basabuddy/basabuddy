import ReactDOM from 'react-dom/client';
import '@fontsource/nunito/latin-400.css';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';
import '@fontsource/baloo-2/latin-700.css';
import './styles.css';
import App from './App';
ReactDOM.createRoot(document.getElementById('root')!).render(<App/>);

// Production only: development remains uncached for reliable editing.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
 window.addEventListener('load', () => {
  navigator.serviceWorker.register('/sw.js', {updateViaCache:'none'}).catch(error => {
   console.warn('Offline setup unavailable; loaded lessons still work.', error);
  });
 });
}

// A production preview may previously have occupied the development origin.
// Unregister only our worker and remove only our static caches, keeping learner data.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
 void (async()=>{
  const registrations=await navigator.serviceWorker.getRegistrations();
  const own=registrations.filter(registration=>[registration.active,registration.waiting,registration.installing].some(worker=>worker?.scriptURL===new URL('/sw.js',location.origin).href));
  const controlledByOwn=navigator.serviceWorker.controller?.scriptURL===new URL('/sw.js',location.origin).href;
  await Promise.all(own.map(registration=>registration.unregister()));
  for(const key of await caches.keys())if(key.startsWith('basabuddy-static-'))await caches.delete(key);
  if(own.length&&controlledByOwn)location.reload();
 })().catch(error=>console.warn('Development cache cleanup unavailable.',error));
}
