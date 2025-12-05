import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useData } from '../context/DataContext';

// 1. CHART IMPORTS
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const DashboardPage = () => {
    const { summaryStats, fetchDashboardStats, loading: statsLoading } = useData();
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(null); 
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '' });

    useEffect(() => {
        fetchDashboardStats();
        fetchCustomers();
    }, [page, search]); 

    const fetchCustomers = async () => {
        try {
            const res = await api.get(`/customers?page=${page}&search=${search}`);
            setCustomers(res.data.customers);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error("Failed to fetch customers:", err);
        }
    };

    // --- FORM HANDLERS (Your existing logic) ---
    const handleOpenModal = (c = null) => {
        setCurrentCustomer(c);
        setFormData(c ? { name: c.name, email: c.email, phone: c.phone, company: c.company } : { name: '', email: '', phone: '', company: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => { setIsModalOpen(false); setCurrentCustomer(null); };
    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentCustomer) await api.put(`/customers/${currentCustomer._id}`, formData);
            else await api.post('/customers', formData);
            fetchCustomers(); 
            fetchDashboardStats(); 
            handleCloseModal();
        } catch (err) { console.error(err); }
    };
    
    const handleDelete = async (id) => {
        if(window.confirm('Delete this customer?')){
            try { await api.delete(`/customers/${id}`); fetchCustomers(); fetchDashboardStats(); } 
            catch (err) { console.error(err); }
        }
    };

    // --- CHART DATA CONFIGURATION ---
    
    // 1. PIE CHART: Success Rate (Converted vs Lost vs Open)
    const pieData = {
        labels: ['Converted (Won)', 'Lost', 'In Progress'],
        datasets: [
            {
                data: [
                    summaryStats.opportunities || 0, 
                    summaryStats.lost || 0, 
                    (summaryStats.totalLeads - (summaryStats.opportunities || 0) - (summaryStats.lost || 0))
                ],
                backgroundColor: ['#4ade80', '#f87171', '#60a5fa'], // Green, Red, Blue
                borderWidth: 1,
            },
        ],
    };

    // 2. BAR CHART: Revenue/Growth Indicator
    const barData = {
        labels: ['Target Revenue', 'Actual Revenue'],
        datasets: [
            {
                label: 'Revenue ($)',
                data: [50000, summaryStats.revenue || 0], // Hardcoded target for demo
                backgroundColor: ['#e5e7eb', '#3b82f6'],
            },
        ],
    };

    return (
        <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            
            <h1>Executive Dashboard</h1>
            
            {/* --- SECTION 1: KEY METRICS --- */}
            <div style={styles.statsGrid}>
                <div style={styles.card}>
                    <h3>Total Leads</h3>
                    <p style={styles.statNumber}>{summaryStats.totalLeads}</p>
                </div>
                <div style={styles.card}>
                    <h3>Opportunities (Won)</h3>
                    <p style={{...styles.statNumber, color: '#22c55e'}}>{summaryStats.opportunities}</p>
                </div>
                <div style={styles.card}>
                    <h3>Active Customers</h3>
                    <p style={styles.statNumber}>{summaryStats.totalCustomers}</p>
                </div>
                <div style={styles.card}>
                    <h3>Total Revenue</h3>
                    <p style={{...styles.statNumber, color: '#eab308'}}>${summaryStats.revenue || 0}</p>
                </div>
            </div>

            {/* --- SECTION 2: DATA ANALYTICS GRAPHS --- */}
            <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div style={styles.chartCard}>
                    <h3 style={{marginBottom: '15px', textAlign: 'center'}}>Lead Conversion Rate</h3>
                    <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
                        <Pie data={pieData} />
                    </div>
                </div>
                <div style={styles.chartCard}>
                    <h3 style={{marginBottom: '15px', textAlign: 'center'}}>Revenue Growth</h3>
                    <div style={{ height: '250px' }}>
                        <Bar options={{ maintainAspectRatio: false }} data={barData} />
                    </div>
                </div>
            </div>

            <hr style={{ margin: '50px 0' }} />

            {/* --- SECTION 3: CUSTOMER MANAGEMENT --- */}
            <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2>All Customers</h2>
                <div>
                    <input type="text" placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={styles.input} />
                    <button onClick={() => handleOpenModal()} style={styles.btn}>Add Customer</button>
                </div>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <thead>
                    <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                        <th style={{ padding: '15px' }}>Name</th>
                        <th style={{ padding: '15px' }}>Email</th>
                        <th style={{ padding: '15px' }}>Phone</th>
                        <th style={{ padding: '15px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map(c => (
                        <tr key={c._id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '15px' }}>{c.name}</td>
                            <td style={{ padding: '15px' }}>{c.email}</td>
                            <td style={{ padding: '15px' }}>{c.phone}</td>
                            <td style={{ padding: '15px' }}>
                                <Link to={`/customers/${c._id}`} style={styles.linkBtn}>View</Link>
                                <button onClick={() => handleOpenModal(c)} style={styles.actionBtn}>Edit</button>
                                <button onClick={() => handleDelete(c._id)} style={{...styles.actionBtn, color: 'red', borderColor: 'red'}}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination & Modals remain same ... */}
            {isModalOpen && (
                <div style={styles.backdrop}>
                    <div style={styles.modal}>
                        <h2>{currentCustomer ? 'Edit' : 'Add'} Customer</h2>
                        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Name" required style={styles.formInput} />
                            <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="Email" required style={styles.formInput} />
                            <input type="text" name="phone" value={formData.phone} onChange={handleFormChange} placeholder="Phone" style={styles.formInput} />
                            <input type="text" name="company" value={formData.company} onChange={handleFormChange} placeholder="Company" style={styles.formInput} />
                            <button type="submit" style={styles.btn}>Save</button>
                            <button type="button" onClick={handleCloseModal} style={{...styles.btn, background: '#ccc'}}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
    card: { background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center', border: '1px solid #eee' },
    chartCard: { background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' },
    statNumber: { fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', margin: '10px 0' },
    backdrop: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    modal: { background: 'white', padding: '30px', borderRadius: '8px', width: '400px' },
    formInput: { padding: '10px', fontSize: '1rem', border: '1px solid #ddd', borderRadius: '4px' },
    input: { padding: '8px', marginRight: '10px', border: '1px solid #ddd', borderRadius: '4px' },
    btn: { padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '5px' },
    linkBtn: { marginRight: '10px', textDecoration: 'none', color: '#007bff', fontWeight: 'bold' },
    actionBtn: { marginRight: '5px', background: 'transparent', border: '1px solid #ddd', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }
};

export default DashboardPage;