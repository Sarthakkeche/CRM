import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useData } from '../context/DataContext';

const DashboardPage = () => {
    // --- 1. Global Stats ---
    const { summaryStats, fetchDashboardStats, loading: statsLoading } = useData();

    // --- 2. Local State ---
    const [activeTab, setActiveTab] = useState('customers'); // <--- THIS CONTROL IS NEW
    const [dataList, setDataList] = useState([]); 
    const [search, setSearch] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null); 
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', status: 'Lead' });

    // --- 3. Fetch Data based on Active Tab ---
    useEffect(() => {
        fetchData();
        fetchDashboardStats(); // Refresh stats whenever we switch tabs or load
    }, [activeTab, search, fetchDashboardStats]); 

    const fetchData = async () => {
        try {
            // DYNAMIC ENDPOINT: Uses '/leads' or '/customers' depending on the tab
            const endpoint = activeTab === 'customers' ? '/customers' : '/leads';
            const res = await api.get(`${endpoint}?search=${search}`);
            
            // Safety check: ensure we read the correct part of the response
            if(activeTab === 'customers') setDataList(res.data.customers || []);
            else setDataList(res.data.leads || []); 
            
        } catch (err) {
            console.error(`Failed to fetch ${activeTab}:`, err);
        }
    };

    // --- 4. Form Handlers ---
    const handleOpenModal = (item = null) => {
        setCurrentItem(item);
        if (item) {
            // Edit Mode
            setFormData({ 
                name: item.name, 
                email: item.email, 
                phone: item.phone, 
                company: item.company, 
                status: item.status || 'Lead' 
            });
        } else {
            // Add Mode
            setFormData({ name: '', email: '', phone: '', company: '', status: 'Lead' });
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = activeTab === 'customers' ? '/customers' : '/leads';
            
            if (currentItem) {
                await api.put(`${endpoint}/${currentItem._id}`, formData);
            } else {
                await api.post(endpoint, formData);
            }
            
            setIsModalOpen(false);
            fetchData();           
            fetchDashboardStats(); // Update the big numbers at the top
        } catch (err) {
            console.error("Failed to save:", err);
            alert("Error saving. Check console for details.");
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to delete this?')){
            try {
                const endpoint = activeTab === 'customers' ? '/customers' : '/leads';
                await api.delete(`${endpoint}/${id}`);
                fetchData();
                fetchDashboardStats();
            } catch (err) {
                console.error("Failed to delete:", err);
            }
        }
    };

    // --- 5. Render ---
    return (
        <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* STATS SECTION */}
            <h1>Business Dashboard</h1>
            <div style={styles.statsGrid}>
                <div style={styles.card}>
                    <h3>Total Leads</h3>
                    <p style={styles.statNumber}>{summaryStats.totalLeads}</p>
                </div>
                <div style={styles.card}>
                    <h3>Opportunities</h3>
                    <p style={styles.statNumber}>{summaryStats.opportunities}</p>
                </div>
                <div style={styles.card}>
                    <h3>Active Customers</h3>
                    <p style={styles.statNumber}>{summaryStats.totalCustomers}</p>
                </div>
            </div>

            <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eee' }} />

            {/* TABS & ACTIONS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                
                {/* --- THIS IS WHERE YOU SWITCH TABS --- */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        style={activeTab === 'customers' ? styles.activeTab : styles.tab} 
                        onClick={() => setActiveTab('customers')}>
                        Customers
                    </button>
                    <button 
                        style={activeTab === 'leads' ? styles.activeTab : styles.tab} 
                        onClick={() => setActiveTab('leads')}>
                        Leads (Pipeline)
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={styles.input}
                    />
                    {/* The button text changes automatically! */}
                    <button onClick={() => handleOpenModal()} style={styles.primaryBtn}>
                        + Add {activeTab === 'customers' ? 'Customer' : 'Lead'}
                    </button>
                </div>
            </div>
            
            {/* DATA TABLE */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Company</th>
                            {/* Status only shows for Leads */}
                            {activeTab === 'leads' && <th style={styles.th}>Status</th>} 
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataList.length > 0 ? (
                            dataList.map(item => (
                                <tr key={item._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={styles.td}>{item.name}</td>
                                    <td style={styles.td}>{item.email}</td>
                                    <td style={styles.td}>{item.company}</td>
                                    
                                    {activeTab === 'leads' && (
                                        <td style={styles.td}>
                                            <span style={item.status === 'Opportunity' ? styles.badgeOpp : styles.badgeLead}>
                                                {item.status || 'Lead'}
                                            </span>
                                        </td>
                                    )}

                                    <td style={styles.td}>
                                        <button onClick={() => handleOpenModal(item)} style={styles.actionBtn}>Edit</button>
                                        <button onClick={() => handleDelete(item._id)} style={{...styles.actionBtn, color: 'red'}}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No {activeTab} found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div style={styles.backdrop}>
                    <div style={styles.modal}>
                        <h2>{currentItem ? `Edit ${activeTab === 'customers' ? 'Customer' : 'Lead'}` : `Add ${activeTab === 'customers' ? 'Customer' : 'Lead'}`}</h2>
                        
                        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Name" required style={styles.formInput} />
                            <input type="email" name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Email" required style={styles.formInput} />
                            <input type="text" name="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="Phone" style={styles.formInput} />
                            <input type="text" name="company" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="Company" style={styles.formInput} />

                            {/* --- CONVERSION LOGIC IS HERE --- */}
                            {/* This dropdown ONLY appears if you are on the 'Leads' tab */}
                            {activeTab === 'leads' && (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold' }}>Pipeline Status:</label>
                                    <select 
                                        name="status" 
                                        value={formData.status} 
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        style={styles.formInput}
                                    >
                                        <option value="Lead">Lead (Potential)</option>
                                        <option value="Opportunity">Opportunity (Interested)</option>
                                        <option value="Customer">Closed Customer</option>
                                    </select>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" style={styles.primaryBtn}>Save</button>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.cancelBtn}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Styles (You can tweak these colors)
const styles = {
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
    card: { background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' },
    statNumber: { fontSize: '2.5rem', fontWeight: 'bold', color: '#007bff', margin: '5px 0' },
    tab: { padding: '10px 20px', cursor: 'pointer', background: 'transparent', border: '1px solid #ccc', borderRadius: '5px' },
    activeTab: { padding: '10px 20px', cursor: 'pointer', background: '#007bff', color: '#fff', border: '1px solid #007bff', borderRadius: '5px' },
    tableContainer: { overflowX: 'auto', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '15px', borderBottom: '2px solid #eee' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    input: { padding: '8px 12px', borderRadius: '5px', border: '1px solid #ddd' },
    primaryBtn: { padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    cancelBtn: { padding: '10px 20px', background: '#ccc', color: '#333', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    actionBtn: { padding: '5px 10px', marginRight: '5px', cursor: 'pointer', background: 'transparent', border: '1px solid #ddd', borderRadius: '4px' },
    formInput: { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '1rem' },
    backdrop: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: 'white', padding: '30px', borderRadius: '10px', width: '90%', maxWidth: '400px' },
    badgeLead: { background: '#e2e8f0', color: '#475569', padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem' },
    badgeOpp: { background: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem' }
};

export default DashboardPage;