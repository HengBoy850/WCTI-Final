import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/Layout';

export default function Reports() {
  const { token } = useAuth();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSalesSummary(token).then(setReport).catch((err) => setError(err.message));
  }, [token]);

  return (
    <>
      <PageHeader title="Sales Reports" subtitle="Revenue and performance overview" />
      <div className="page-body">
        {error && <div className="form-error">{error}</div>}
        {!report ? <p>Loading report...</p> : (
          <>
            <div className="stat-grid">
              <div className="stat-tile">
                <div className="icon-badge badge-green"><DollarSign /></div>
                <div className="num">${report.totalRevenue.toFixed(2)}</div>
                <div className="label">Completed Revenue</div>
              </div>
              <div className="stat-tile">
                <div className="icon-badge badge-violet"><ShoppingCart /></div>
                <div className="num">{report.totalOrders}</div>
                <div className="label">Total Orders</div>
              </div>
              <div className="stat-tile">
                <div className="icon-badge badge-blue"><Users /></div>
                <div className="num">{report.totalCustomers}</div>
                <div className="label">Registered Customers</div>
              </div>
              <div className="stat-tile">
                <div className="icon-badge badge-amber"><TrendingUp /></div>
                <div className="num">{report.topItems.length}</div>
                <div className="label">Best Sellers Tracked</div>
              </div>
            </div>

            <div className="grid-2-even">
              <div className="card">
                <h3 style={{ marginBottom: 14, fontSize: 15.5 }}>Orders by Status</h3>
                {report.ordersByStatus.map((s) => (
                  <div key={s.status} className="pos-cart-line">
                    <span className={`status-pill status-${s.status}`}>{s.status}</span>
                    <span>{s.count}</span>
                  </div>
                ))}
              </div>
              <div className="card">
                <h3 style={{ marginBottom: 14, fontSize: 15.5 }}>Top Selling Items</h3>
                {report.topItems.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>No completed orders yet.</p>}
                {report.topItems.map((it) => (
                  <div key={it.name} className="pos-cart-line">
                    <span>{it.name} ({it.total_qty} sold)</span>
                    <span>${it.total_sales.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
