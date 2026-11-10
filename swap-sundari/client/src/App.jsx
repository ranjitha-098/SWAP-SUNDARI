import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './api.jsx';
import { Home, ProductPage, Login, Orders, NewProduct, MyListings, Admin, AboutPage, HowItWorksPage, CATEGORIES } from './pages.jsx';

export default function App() {
  const { user, logout } = useAuth();
  return (
    <>
      <nav className="site-nav">
        <Link to="/" className="brand" aria-label="Swap Sundari home">
          <span className="brand-mark">S</span>
          <span>swap sundari<small>PRE-LOVED, RE-ADMIRED</small></span>
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-shop">Discover</Link>
          <Link to="/how-it-works">How it works</Link>
          {user && user.role !== 'buyer' && <Link to="/sell">Sell / Lend</Link>}
          {user && user.role !== 'buyer' && <Link to="/my-listings">My listings</Link>}
          {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
          {user && <Link to="/orders">Orders</Link>}
          {user ? <a href="/" onClick={(event) => { event.preventDefault(); logout(); }}>Logout</a> : <Link to="/login" className="nav-login">Log in <span aria-hidden="true">↗</span></Link>}
        </div>
      </nav>
      <nav className="category-nav" aria-label="Shop categories">
        <span>THE EDITS</span>
        {CATEGORIES.map((category) => <Link key={category.slug} to={`/category/${category.slug}`}>{category.label}</Link>)}
      </nav>
      <main className="page-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:category" element={<Home />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/orders" element={user ? <Orders /> : <Navigate to="/login" />} />
          <Route path="/sell" element={user ? <NewProduct /> : <Navigate to="/login" />} />
          <Route path="/my-listings" element={user && user.role !== 'buyer' ? <MyListings /> : <Navigate to="/" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}
