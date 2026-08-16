import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Activity, CalendarDays } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/Layout';

const ROLE_LABELS = { customer: 'Customers', staff: 'Kitchen Staff', cashier: 'Cashiers', admin: 'Admins' };

export default function Accounts() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAccountAnalytics(token).then(setData).catch((err) => setError(err.message));
  }, [token]);

  const maxTrend = data ? Math.max(1, ...data.signupTrend.map((d) => d.count)) : 1;

  return (
    <>
      <PageHeader title="Accounts" subtitle="Who's using Savory Spoon" />
      <div className="page-body">
        {error && <div className="form-error">{error}</div>}
        {!data ? <p>Loading...</p> : (
          <>
            <div className="stat-grid">
              <div className="stat-tile">
                <div className="icon-badge badge-violet"><Users /></div>
                <div className="num">{data.totalUsers}</div>
                <div className="label">Total Accounts</div>
              </div>
              <div className="stat-tile">
                <div className="icon-badge badge-green"><UserPlus /></div>
                <div className="num">{data.newToday}</div>
                <div className="label">New Today</div>
              </div>
              <div className="stat-tile">
                <div className="icon-badge badge-blue"><CalendarDays /></div>
                <div className="num">{data.newThisWeek}</div>
                <div className="label">New This Week</div>
              </div>
              <div className="stat-tile">
                <div className="icon-badge badge-amber"><Activity /></div>
                <div className="num">{data.activeToday}</div>
                <div className="label">Logged In Today</div>
              </div>
            </div>

            <div className="grid-2-even">
              <div className="card">
                <h3 style={{ marginBottom: 16, fontSize: 15.5 }}>Accounts by Role</h3>
                {data.byRole.map((r) => (
                  <div key={r.role} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 6 }}>
                      <span>{ROLE_LABELS[r.role] || r.role}</span>
                      <span style={{ fontWeight: 700 }}>{r.count}</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--bg)', borderRadius: 999 }}>
                      <div style={{
                        height: 8, borderRadius: 999, background: 'var(--accent)',
                        width: `${(r.count / data.totalUsers) * 100}%`,
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="card">
                <h3 style={{ marginBottom: 16, fontSize: 15.5 }}>Signups — Last 14 Days</h3>
                {data.signupTrend.length === 0 ? (
                  <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>No signups in this window yet.</p>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
                    {data.signupTrend.map((d) => (
                      <div key={d.day} style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{
                          height: `${(d.count / maxTrend) * 90 + 6}px`,
                          background: 'var(--accent)', borderRadius: 4, marginBottom: 6,
                        }} title={`${d.count} signups`} />
                        <div style={{ fontSize: 9.5, color: 'var(--muted)' }}>
                          {new Date(d.day).toLocaleDateString(undefined, { day: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
