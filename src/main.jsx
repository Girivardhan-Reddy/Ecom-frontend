import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom";
import './index.css'
import { seedSharedCatalog } from './services/sharedCatalog'

seedSharedCatalog()
import router from './router.jsx';

import { AppProvider } from './context/AppContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </StrictMode>,
)
