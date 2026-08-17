// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { api } from '../api';
// import { getImageUrl } from '../api'; // adjust path if needed based on file location

// const ACCENTS = ['accent-1', 'accent-2', 'accent-3', 'accent-4', 'accent-5'];
// const ACCENT_COLORS = ['#6fcf3f', '#f0398b', '#f5711b', '#2f9cf0', '#a55ee8'];

// const highlights = [
//   {
//     title: 'Order Online',
//     text: 'Browse our full menu and place an order in a few taps — no phone call needed.',
//   },
//   {
//     title: 'Track In Real Time',
//     text: 'Follow your order from pending to preparing to ready, right from your account.',
//   },
//   {
//     title: 'Fresh, Daily',
//     text: 'Every dish is prepared to order using ingredients sourced the same morning.',
//   },
// ];

// export default function Home() {
//   const [items, setItems] = useState([]);

//   useEffect(() => {
//     api.getMenu().then((res) => setItems(res.items.filter((i) => i.available))).catch(() => {});
//   }, []);

//   const featured = items.find((i) => i.image_url) || items[0];
//   const strip = items.slice(0, 6);

//   return (
//     <>
//       <section className="hero">
//         <div className="container">
//           <div>
//             <div className="eyebrow">Est. in the heart of the city</div>
//             <h1>Order your <span>favourite</span> Foods</h1>
//             <p>
//               Savory Spoon brings together comfort classics and seasonal favorites.
//               Order online for pickup, dine-in, or track your food from kitchen to table.
//             </p>
//             <div className="hero-actions">
//               <Link to="/menu" className="pill">Order Now</Link>
//               <Link to="/menu" className="pill-outline">View Menu</Link>
//             </div>

//             {strip.length > 0 && (
//               <div className="mini-carousel">
//                 {strip.map((item, idx) => (
//                   <Link
//                     to="/menu"
//                     className={`mini-card ${ACCENTS[idx % ACCENTS.length]}`}
//                     style={{ background: ACCENT_COLORS[idx % ACCENT_COLORS.length] }}
//                     key={item.id}
//                   >
//                     <div className="mini-thumb">
//                       {item.image_url ? <img src={getImageUrl(item.image_url)} alt={item.name} /> : <span>🍽</span>}
//                     </div>
//                     <div className="mini-name">{item.name}</div>
//                     <div className="mini-price">${item.price.toFixed(2)}</div>
//                   </Link>
//                 ))}
//               </div>
//             )}
//           </div>

//           <div className="hero-art">
//             <div className="hero-plate">
//               {featured?.image_url ? (
//                 <img src={getImageUrl(featured.image_url)} alt={featured.name} />
//               ) : (
//                 <div style={{
//                   width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
//                   fontSize: 60, background: 'var(--orange-soft)',
//                 }}>🍲</div>
//               )}
//             </div>
//             {featured && (
//               <div className="hero-badge">
//                 <div className="name">
//                   {featured.name}
//                   <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2Z" /></svg>
//                 </div>
//                 <div className="time">
//                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
//                   10-18 mins
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </section>

//       <section>
//         <div className="container">
//           <h2 className="section-title">Why order with us</h2>
//           <p className="section-sub">A simple, honest ordering experience from start to finish.</p>
//           <div className="grid-3">
//             {highlights.map((h) => (
//               <div className="card" key={h.title}>
//                 <h3 style={{ marginBottom: 10 }}>{h.title}</h3>
//                 <p style={{ color: 'var(--muted)', fontSize: 14.5 }}>{h.text}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     </>
//   );
// }
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getImageUrl } from '../api';

const ACCENTS = ['accent-1', 'accent-2', 'accent-3', 'accent-4', 'accent-5'];
const ACCENT_COLORS = ['#6fcf3f', '#f0398b', '#f5711b', '#2f9cf0', '#a55ee8'];

const highlights = [
  {
    title: 'Order Online',
    text: 'Browse our full menu and place an order in a few taps — no phone call needed.',
  },
  {
    title: 'Track In Real Time',
    text: 'Follow your order from pending to preparing to ready, right from your account.',
  },
  {
    title: 'Fresh, Daily',
    text: 'Every dish is prepared to order using ingredients sourced the same morning.',
  },
];

// How often to silently re-check for menu changes (new items, new photos,
// availability toggles) made from the POS dashboard. Kept short enough to
// feel live, long enough to not hammer the API.
const POLL_INTERVAL_MS = 20000;

export default function Home() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;

    function loadMenu() {
      api.getMenu()
        .then((res) => {
          if (!cancelled) setItems(res.items.filter((i) => i.available));
        })
        .catch(() => {});
    }

    loadMenu(); // initial load
    const interval = setInterval(loadMenu, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const featured = items.find((i) => i.image_url) || items[0];
  const strip = items.slice(0, 6);

  return (
    <>
      <section className="hero">
        <div className="container">
          <div>
            <div className="eyebrow">Est. in the heart of the city</div>
            <h1>Order your <span>favourite</span> Foods</h1>
            <p>
              Savory Spoon brings together comfort classics and seasonal favorites.
              Order online for pickup, dine-in, or track your food from kitchen to table.
            </p>
            <div className="hero-actions">
              <Link to="/menu" className="pill">Order Now</Link>
              <Link to="/menu" className="pill-outline">View Menu</Link>
            </div>

            {strip.length > 0 && (
              <div className="mini-carousel">
                {strip.map((item, idx) => (
                  <Link
                    to="/menu"
                    className={`mini-card ${ACCENTS[idx % ACCENTS.length]}`}
                    style={{ background: ACCENT_COLORS[idx % ACCENT_COLORS.length] }}
                    key={item.id}
                  >
                    <div className="mini-thumb">
                      {item.image_url ? <img src={getImageUrl(item.image_url)} alt={item.name} /> : <span>🍽</span>}
                    </div>
                    <div className="mini-name">{item.name}</div>
                    <div className="mini-price">${item.price.toFixed(2)}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="hero-art">
            <div className="hero-plate">
              {featured?.image_url ? (
                <img src={getImageUrl(featured.image_url)} alt={featured.name} />
              ) : (
                <div style={{
                  width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 60, background: 'var(--orange-soft)',
                }}>🍲</div>
              )}
            </div>
            {featured && (
              <div className="hero-badge">
                <div className="name">
                  {featured.name}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2Z" /></svg>
                </div>
                <div className="time">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                  10-18 mins
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <h2 className="section-title">Why order with us</h2>
          <p className="section-sub">A simple, honest ordering experience from start to finish.</p>
          <div className="grid-3">
            {highlights.map((h) => (
              <div className="card" key={h.title}>
                <h3 style={{ marginBottom: 10 }}>{h.title}</h3>
                <p style={{ color: 'var(--muted)', fontSize: 14.5 }}>{h.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
