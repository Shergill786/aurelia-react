import { HashRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import About from './pages/About';
import { Login, Signup } from './pages/Auth';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import Home from './pages/Home';
import Loading from './pages/Loading';
import NotFound from './pages/NotFound';
import Orders from './pages/Orders';
import ProductDetail from './pages/ProductDetail';
import Shop from './pages/Shop';
import Wishlist from './pages/Wishlist';

/**
 * App — the root component.
 *
 * Providers (outermost first) make shared state available everywhere:
 *   Theme → Toast → Auth → Shop (Shop uses Toast, so it must sit inside it).
 *
 * Flow like the original site: "/" is the Loading screen → Login → the store
 * at /home. Signed-in visitors skip straight from Loading to /home.
 *
 * HashRouter keeps URLs like  /#/product/12  so the built site works on any
 * static host (GitHub Pages) without server-side redirect rules.
 */
export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ShopProvider>
            <HashRouter>
              <Routes>
                {/* Entry point: splash screen that preloads images, then Login */}
                <Route index element={<Loading />} />

                {/* Pages that share the navbar + footer */}
                <Route element={<Layout />}>
                  <Route path="home" element={<Home />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="product/:id" element={<ProductDetail />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="wishlist" element={<Wishlist />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
                {/* Full-screen auth pages (no navbar) */}
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<Signup />} />
              </Routes>
            </HashRouter>
          </ShopProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
