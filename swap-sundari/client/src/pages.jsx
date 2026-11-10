import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api, useAuth } from './api.jsx';

export const CATEGORIES = [
  { slug: 'sarees', value: 'Sarees', label: 'Sarees', image: 'photo-1610030469983-98e550d6193c', note: 'Drape it, love it, pass it on.' },
  { slug: 'dresses', value: 'Dresses', label: 'Dresses', image: 'photo-1496747611176-843222e1e57c', note: 'A new favourite for every plan.' },
  { slug: 'bags', value: 'Bags', label: 'Bags', image: 'photo-1584917865442-de89df76afd3', note: 'Carry a little character.' },
  { slug: 'footwear', value: 'Footwear', label: 'Footwear', image: 'photo-1543163521-1bf539c55dd2', note: 'Lovely things to go places in.' },
  { slug: 'jewellery', value: 'Jewellery', label: 'Jewellery', image: 'photo-1617038220319-276d3cfab638', note: 'The finishing touch, found again.' },
  { slug: 'decor', value: 'Decor', label: 'Decor', image: 'photo-1600210492486-724fe5c67fb0', note: 'Set the scene for a brighter home.' },
  { slug: 'vintage', value: 'Vintage', label: 'Vintage', image: 'photo-1490481651871-ab68de25d43d', note: 'Timeless pieces with stories to tell.' },
  { slug: 'electronics', value: 'Electronics', label: 'Electronics', image: 'photo-1498049794561-7780e7231661', note: 'Pre-loved tech, ready for another life.' },
];

const useForm = (init) => {
  const [v, set] = useState(init);
  return [v, (k) => (e) => set({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }), set];
};

export function Home() {
  const { category: categorySlug } = useParams();
  const activeCategory = CATEGORIES.find((category) => category.slug === categorySlug);
  const [f, on, setF] = useForm({ q: '', category: activeCategory?.value || '', size: '', max: '', type: '', from: '', to: '', luxury: false });
  const [items, setItems] = useState([]);
  const load = () => {
    const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v)).toString();
    api('/products?' + qs).then(setItems).catch(() => setItems([]));
  };
  useEffect(() => {
    setF((current) => ({ ...current, category: activeCategory?.value || '' }));
    const qs = new URLSearchParams(activeCategory ? { category: activeCategory.value } : {}).toString();
    api('/products?' + qs).then(setItems).catch(() => setItems([]));
  }, [categorySlug]);
  return (
    <>
      {!activeCategory && <section className="hero">
        <Link to="/category/sarees" className="hero-banner-link" aria-label="Shop the Desi Core Baddie drop">
          <img className="hero-banner-image" src="/desi-baddie-hero.png" alt="Desi Core Baddie: sparkle, attitude, culture. Shop the drop." />
        </Link>
      </section>}

      {!activeCategory && <section className="promise-row" aria-label="Why shop Swap Sundari">
        <div><span className="promise-icon">✳</span><p><strong>One-of-a-kind finds</strong><small>Pieces with a past and a future</small></p></div>
        <div><span className="promise-icon">↻</span><p><strong>Wear it your way</strong><small>Buy, borrow, and pass it on</small></p></div>
        <div><span className="promise-icon">♡</span><p><strong>Feel-good fashion</strong><small>Make room for more mindful style</small></p></div>
      </section>}

      {!activeCategory && <section className="category-section">
        <div className="section-heading">
          <div><p className="eyebrow">A PLACE FOR EVERY KIND OF LOVELY</p><h2>Shop by <em>mood</em></h2></div>
          <p className="section-aside">Find your corner of the wardrobe.</p>
        </div>
        <div className="category-grid">
          {CATEGORIES.map((category, index) => (
            <Link to={`/category/${category.slug}`} className={`category-tile category-tile-${index + 1}`} key={category.slug}>
              <img src={`https://images.unsplash.com/${category.image}?auto=format&fit=crop&w=700&q=80`} alt="" />
              <span className="category-overlay" />
              <span className="category-copy"><small>THE {String(index + 1).padStart(2, '0')} EDIT</small><strong>{category.label}</strong><em>{category.note}</em></span>
              <span className="category-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>}

      <section className={`discover-section${activeCategory ? ' category-discover' : ''}`} id="discover">
        <div className="section-heading">
          <div><p className="eyebrow">{activeCategory ? `${activeCategory.label.toUpperCase()} · PICKED FOR YOU` : 'YOUR NEXT FAVOURITE IS HERE'}</p><h2>{activeCategory ? <>Lovely <em>{activeCategory.label.toLowerCase()}</em></> : <>The lovely <em>finds</em></>}</h2></div>
          <p className="section-aside">{activeCategory ? <Link to="/">See all categories</Link> : 'Pre-loved pieces, picked for their next chapter.'}</p>
        </div>
        <div className="filters">
          <label className="search-field"><span aria-hidden="true">⌕</span><input aria-label="Search title or brand" placeholder="Search title, brand..." value={f.q} onChange={on('q')} /></label>
          <select aria-label="Category" value={f.category} onChange={on('category')}><option value="">All categories</option>{CATEGORIES.map((category) => <option key={category.slug} value={category.value}>{category.label}</option>)}</select>
          <input aria-label="Size" placeholder="Size" value={f.size} onChange={on('size')} />
          <input aria-label="Maximum price" type="number" placeholder="Max price ₹" value={f.max} onChange={on('max')} />
          <select aria-label="Listing type" value={f.type} onChange={on('type')}><option value="">Thrift + Rent</option><option value="thrift">Thrift</option><option value="rent">Rent</option></select>
          <input aria-label="Available from" type="date" value={f.from} onChange={on('from')} /><input aria-label="Available to" type="date" value={f.to} onChange={on('to')} />
          <label className="check-filter"><input type="checkbox" checked={f.luxury} onChange={on('luxury')} /> Luxury only</label>
          <button className="button button-dark search-button" onClick={load}>Find your piece <span aria-hidden="true">↗</span></button>
        </div>
        <div className="results-heading"><span>{items.length ? `${items.length} special ${items.length === 1 ? 'find' : 'finds'}` : 'A few good things'}</span><span>MADE TO BE WORN AGAIN</span></div>
        <div className="grid">
          {items.map((p, index) => (
            <Link key={p._id} to={`/product/${p._id}`} className="card">
              <div className="card-image-wrap">
                <img src={p.images?.[0] || 'https://placehold.co/600x760/f1e9e1/675b50?text=Coming+soon'} alt={p.title} />
                <span className="card-number">{String(index + 1).padStart(2, '0')}</span>
                {p.luxury && <span className="card-tag">✦ VERIFIED LUXURY</span>}
                <span className="card-arrow" aria-hidden="true">↗</span>
              </div>
              <div className="card-info">
                <div><h3>{p.title}</h3><small>{[p.brand, p.size].filter(Boolean).join(' · ') || 'A lovely find'}</small></div>
                <div className="card-price">{p.price ? <strong>₹{p.price}</strong> : null}{p.rentPerDay ? <small>₹{p.rentPerDay}/day</small> : null}</div>
              </div>
            </Link>
          ))}
          {!items.length && <div className="empty-state"><span>✳</span><h3>No pieces just yet</h3><p>Try a different search, or check back soon for fresh finds.</p></div>}
        </div>
      </section>
      <footer className="site-footer"><Link to="/" className="footer-brand">swap sundari <span>✳</span></Link><p>Keep good things going.</p><span>PRE-LOVED, RE-ADMIRED · © 2026</span></footer>
    </>
  );
}

export function AboutPage() {
  return (
    <>
      <section className="story-hero">
        <p className="eyebrow">A WARDROBE WITH A LITTLE MORE HEART</p>
        <h1>Good clothes deserve<br /><em>good stories.</em></h1>
        <p>Swap Sundari is a place to find pre-loved pieces, share what you no longer wear, and give every lovely thing another day out.</p>
      </section>
      <section className="story-grid">
        <div className="story-image" role="img" aria-label="Thoughtfully styled pre-loved fashion" />
        <div><p className="eyebrow">WHY WE'RE HERE</p><h2>Style should<br />keep <em>circling.</em></h2><p>Some of the best pieces already have a story. We make it easier for them to find their next person—whether that means a new home or a special occasion out.</p><p>Buy what you love. Rent what you’ll only wear once. List the pieces you’re ready to pass along. It all adds up to a wardrobe that works a little harder and feels a little more you.</p><Link className="button button-dark" to="/">Explore the finds <span aria-hidden="true">↗</span></Link></div>
      </section>
      <footer className="site-footer"><Link to="/" className="footer-brand">swap sundari <span>✳</span></Link><p>Keep good things going.</p><span>PRE-LOVED, RE-ADMIRED · © 2026</span></footer>
    </>
  );
}

export function HowItWorksPage() {
  const steps = [
    { number: '01', title: 'Find your piece', copy: 'Browse the edits, explore the latest finds, and choose a piece that feels like you.' },
    { number: '02', title: 'Buy or borrow', copy: 'Buy a pre-loved favourite or choose rent and pick the dates you need it.' },
    { number: '03', title: 'Love it. Pass it on.', copy: 'Enjoy your look, then return a rental or list something from your own wardrobe.' },
  ];
  return (
    <>
      <section className="story-hero how-hero">
        <p className="eyebrow">A FEW SIMPLE STEPS</p>
        <h1>More wearing.<br /><em>Less waiting.</em></h1>
        <p>Finding your next favourite—or giving one a new home—is easy.</p>
      </section>
      <section className="steps-grid">{steps.map((step) => <article className="step-card" key={step.number}><span>{step.number}</span><div className="step-star">✳</div><h2>{step.title}</h2><p>{step.copy}</p></article>)}</section>
      <section className="how-cta"><p className="eyebrow">READY WHEN YOU ARE</p><h2>Let the good finds <em>find you.</em></h2><Link className="button button-dark" to="/">Start exploring <span aria-hidden="true">↗</span></Link></section>
      <footer className="site-footer"><Link to="/" className="footer-brand">swap sundari <span>✳</span></Link><p>Keep good things going.</p><span>PRE-LOVED, RE-ADMIRED · © 2026</span></footer>
    </>
  );
}

export function ProductPage() {
  const { id } = useParams(); const nav = useNavigate(); const { user } = useAuth();
  const [p, setP] = useState(); const [reviews, setReviews] = useState([]);
  const [d, on] = useForm({ start: '', end: '' }); const [msg, setMsg] = useState('');
  useEffect(() => { api('/products/' + id).then(setP); api('/reviews/product/' + id).then(setReviews); }, [id]);
  if (!p) return <p>Loading…</p>;
  const order = async (type) => {
    if (!user) return nav('/login');
    try { await api('/orders', { method: 'POST', body: { productId: id, type, start: d.start, end: d.end } }); nav('/orders'); }
    catch (e) { setMsg(e.message); }
  };
  return (
    <div className="detail">
      <img src={p.images?.[0] || 'https://placehold.co/400x480'} alt="" />
      <div>
        <h2>{p.title}</h2>
        <p>{p.brand} · {p.category} · Size {p.size} · {p.condition}</p>
        <p>{p.description}</p>
        <p>Seller: {p.owner?.name} (★ {p.owner?.ratingAvg?.toFixed(1) || 'new'})</p>
        {p.listingType !== 'rent' && <button onClick={() => order('buy')}>Buy ₹{p.price}</button>}
        {p.listingType !== 'thrift' && (
          <div className="box">
            <b>Rent ₹{p.rentPerDay}/day · deposit ₹{p.deposit}</b><br />
            <input type="date" value={d.start} onChange={on('start')} /> <input type="date" value={d.end} onChange={on('end')} />
            <button onClick={() => order('rent')}>Book</button>
          </div>
        )}
        {msg && <p className="err">{msg}</p>}
        <h3>Reviews</h3>
        {reviews.map((r) => <p key={r._id}>★{r.rating} — {r.comment} <small>by {r.reviewer?.name}</small></p>)}
      </div>
    </div>
  );
}

export function Login() {
  const [f, on] = useForm({ name: '', email: '', password: '', role: 'buyer' });
  const [reg, setReg] = useState(false); const [err, setErr] = useState('');
  const { login } = useAuth(); const nav = useNavigate();
  const go = async () => { try { login(await api(`/auth/${reg ? 'register' : 'login'}`, { method: 'POST', body: f })); nav('/'); } catch (e) { setErr(e.message); } };
  return (
    <div className="form">
      <h2>{reg ? 'Register' : 'Login'}</h2>
      {reg && <input placeholder="Name" value={f.name} onChange={on('name')} />}
      <input placeholder="Email" value={f.email} onChange={on('email')} />
      <input type="password" placeholder="Password" value={f.password} onChange={on('password')} />
      {reg && <select value={f.role} onChange={on('role')}><option value="buyer">Buyer</option><option value="seller">Seller</option></select>}
      <button onClick={go}>{reg ? 'Create account' : 'Login'}</button>
      <a href="#" onClick={() => setReg(!reg)}>{reg ? 'Have an account?' : 'New here? Register'}</a>
      <p className="err">{err}</p>
    </div>
  );
}

export function NewProduct() {
  const [f, on] = useForm({ title: '', description: '', category: '', brand: '', size: '', condition: 'good', images: '', listingType: 'both', price: '', rentPerDay: '', deposit: '', luxury: false });
  const [msg, setMsg] = useState('');
  const [uploadedImage, setUploadedImage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setMsg('');
    if (!file.type.startsWith('image/')) {
      setUploadedImage('');
      setUploadError('Choose an image file, such as JPG, PNG, or WebP.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setUploadedImage('');
      setUploadError('Please choose an image smaller than 3 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setUploadedImage('');
        setUploadError('The selected image could not be read. Please try another file.');
        return;
      }
      setUploadedImage(reader.result);
    };
    reader.onerror = () => {
      setUploadedImage('');
      setUploadError('The selected image could not be read. Please try another file.');
    };
    reader.readAsDataURL(file);
  };
  const save = async () => {
    if (uploadError) {
      setMsg(uploadError);
      return;
    }
    const images = [f.images.trim(), uploadedImage].filter(Boolean);
    try { await api('/products', { method: 'POST', body: { ...f, images } }); setMsg(f.luxury ? 'Submitted — awaiting authenticity review' : 'Listed!'); }
    catch (e) { setMsg(e.message); }
  };
  return (
    <div className="form">
      <h2>New listing</h2>
      {['title', 'description', 'brand', 'size'].map((k) => <input key={k} placeholder={k} value={f[k]} onChange={on(k)} />)}
      <input placeholder="Image URL (optional)" value={f.images} onChange={on('images')} />
      <label className="upload-field">
        <span className="upload-icon" aria-hidden="true">↑</span>
        <span><strong>Upload a product photo</strong><small>JPG, PNG or WebP · up to 3 MB</small></span>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </label>
      {uploadError && <p className="err upload-error" role="alert">{uploadError}</p>}
      {uploadedImage && <div className="upload-preview">
        <img src={uploadedImage} alt="Preview of uploaded product" />
        <span>Photo ready to publish</span>
        <button type="button" className="remove-upload" onClick={() => { setUploadedImage(''); setUploadError(''); }}>Remove photo</button>
      </div>}
      <select value={f.category} onChange={on('category')}><option value="">Choose category</option>{CATEGORIES.map((category) => <option key={category.slug} value={category.value}>{category.label}</option>)}</select>
      <select value={f.listingType} onChange={on('listingType')}><option value="thrift">Thrift</option><option value="rent">Rent</option><option value="both">Both</option></select>
      <input type="number" placeholder="Price" value={f.price} onChange={on('price')} />
      <input type="number" placeholder="Rent per day" value={f.rentPerDay} onChange={on('rentPerDay')} />
      <input type="number" placeholder="Deposit" value={f.deposit} onChange={on('deposit')} />
      <label><input type="checkbox" checked={f.luxury} onChange={on('luxury')} /> Luxury (needs verification)</label>
      <button onClick={save}>Publish</button><p>{msg}</p>
    </div>
  );
}

export function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadListings = () => {
    setLoading(true);
    setError('');
    api('/products/mine')
      .then(setListings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadListings(); }, []);

  const removeListing = async (product) => {
    if (!window.confirm(`Remove "${product.title}" from the shop?`)) return;
    setError('');
    try {
      await api(`/products/${product._id}`, { method: 'DELETE' });
      setListings((current) => current.filter((listing) => listing._id !== product._id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="my-listings">
      <div className="listings-heading">
        <div><p className="eyebrow">YOUR WARDROBE, YOUR CALL</p><h1>My <em>listings</em></h1></div>
        <Link className="button button-dark" to="/sell">Add a listing <span aria-hidden="true">＋</span></Link>
      </div>
      {error && <p className="err" role="alert">{error}</p>}
      {loading ? <p>Loading your listings…</p> : listings.length ? (
        <div className="seller-listings-grid">
          {listings.map((product) => (
            <article className="seller-listing-card" key={product._id}>
              <Link to={`/product/${product._id}`} className="seller-listing-image">
                <img src={product.images?.[0] || 'https://placehold.co/600x760/f1e9e1/675b50?text=Your+listing'} alt={product.title} />
              </Link>
              <div className="seller-listing-info">
                <div>
                  <h2>{product.title}</h2>
                  <p>{product.category} · <span className={`listing-status status-${product.status}`}>{product.status}</span></p>
                </div>
                <button type="button" className="remove-listing-button" disabled={product.status === 'draft'} onClick={() => removeListing(product)}>
                  {product.status === 'draft' ? 'Removed' : 'Remove listing'}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state"><span>✳</span><h2>No listings yet</h2><p>When you list a piece, you can manage or remove it here.</p><Link className="text-link" to="/sell">Create your first listing ↗</Link></div>
      )}
    </section>
  );
}

export function Orders() {
  const [o, setO] = useState([]); const { user } = useAuth();
  const load = () => api('/orders/mine').then(setO);
  useEffect(() => { load(); }, []);
  const set = (id, status) => api(`/orders/${id}/status`, { method: 'PATCH', body: { status } }).then(load);
  const review = async (order) => {
    const rating = +prompt('Rating 1-5'); if (!rating) return;
    await api('/reviews', { method: 'POST', body: { order, rating, comment: prompt('Comment') || '' } }).catch((e) => alert(e.message));
  };
  return (
    <>
      <h2>Orders</h2>
      {o.map((x) => {
        const seller = String(x.product?.owner) === user.id;
        return (
          <div key={x._id} className="box">
            <b>{x.product?.title}</b> · {x.type} · <i>{x.status}</i> · ₹{x.total}
            {x.type === 'rent' && <> · {new Date(x.rentalPeriod.start).toLocaleDateString()}–{new Date(x.rentalPeriod.end).toLocaleDateString()} · deposit ₹{x.deposit} · late fee ₹{x.lateFee}</>}
            <div>
              {seller && x.status === 'confirmed' && <button onClick={() => set(x._id, 'shipped')}>Mark shipped</button>}
              {seller && x.type === 'rent' && ['shipped', 'late'].includes(x.status) && <button onClick={() => set(x._id, 'returned')}>Mark returned</button>}
              {!seller && ['returned', 'confirmed'].includes(x.status) && <button onClick={() => review(x._id)}>Review</button>}
            </div>
          </div>
        );
      })}
    </>
  );
}

export function Admin() {
  const [l, setL] = useState([]);
  const load = () => api('/products/admin/pending').then(setL);
  useEffect(() => { load(); }, []);
  const act = (id, approve) => api(`/products/${id}/verify`, { method: 'PUT', body: { approve } }).then(load);
  return (
    <>
      <h2>Luxury verification queue</h2>
      {l.map((p) => <div key={p._id} className="box">{p.title} — {p.brand} <button onClick={() => act(p._id, true)}>Verify</button> <button onClick={() => act(p._id, false)}>Reject</button></div>)}
      {!l.length && <p>Nothing pending.</p>}
    </>
  );
}
