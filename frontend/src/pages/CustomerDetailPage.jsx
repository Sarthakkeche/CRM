import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const CustomerDetailPage = () => {
    const { id } = useParams();
    const [customer, setCustomer] = useState(null);
    const [leads, setLeads] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');

    // State for the lead modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLead, setCurrentLead] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', status: 'New', value: '' });

    useEffect(() => {
        fetchCustomerDetails();
    }, [id]);

    const fetchCustomerDetails = async () => {
        try {
            const res = await api.get(`/customers/${id}`);
            setCustomer(res.data.customer);
            setLeads(res.data.leads);
        } catch (err) {
            console.error(err);
        }
    };
    
    const handleOpenModal = (lead = null) => {
        setCurrentLead(lead);
        setFormData(lead ? { title: lead.title, description: lead.description, status: lead.status, value: lead.value } : { title: '', description: '', status: 'New', value: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentLead(null);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentLead) {
                // Update existing lead
                await api.put(`/customers/${id}/leads/${currentLead._id}`, formData);
            } else {
                // Add new lead
                await api.post(`/customers/${id}/leads`, formData);
            }
            fetchCustomerDetails(); // Refresh leads
            handleCloseModal();
        } catch (err) {
            console.error("Failed to save lead:", err);
        }
    };

    const handleDeleteLead = async (leadId) => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
            try {
                await api.delete(`/customers/${id}/leads/${leadId}`);
                fetchCustomerDetails(); // Refresh leads
            } catch (err) {
                console.error("Failed to delete lead:", err);
            }
        }
    };

    const filteredLeads = leads.filter(lead => 
        statusFilter ? lead.status === statusFilter : true
    );

    if (!customer) return <div>Loading...</div>;

    return (
        <div className="container">
            <Link to="/dashboard">&larr; Back to Dashboard</Link>
            <h2>{customer.name}</h2>
            {/* ... customer details ... */}
            <hr />
            <h3>Leads</h3>
           <div className="toolbar">
    <select onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
        <option value="">All Statuses</option>
        <option value="New">New</option>
        <option value="Contacted">Contacted</option>
        <option value="Converted">Converted</option>
        <option value="Lost">Lost</option>
    </select>
    <button onClick={() => handleOpenModal()}>Add Lead</button>
</div>
            
            <ul className="lead-list">
                {filteredLeads.map(lead => (
                    <li key={lead._id}>
                        <div>
                            <strong>{lead.title}</strong> (${lead.value || 0}) - <em>{lead.status}</em>
                            <p>{lead.description}</p>
                        </div>
                        <div>
                            <button onClick={() => handleOpenModal(lead)}>Edit</button>
                            <button onClick={() => handleDeleteLead(lead._id)}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Add/Edit Lead Modal */}
            {isModalOpen && (
                 <div className="modal-backdrop">
                    <div className="modal">
                        <h2>{currentLead ? 'Edit Lead' : 'Add Lead'}</h2>
                        <form onSubmit={handleFormSubmit}>
                            <input type="text" name="title" value={formData.title} onChange={handleFormChange} placeholder="Title" required />
                            <textarea name="description" value={formData.description} onChange={handleFormChange} placeholder="Description"></textarea>
                            <input type="number" name="value" value={formData.value} onChange={handleFormChange} placeholder="Value" />
                            <select name="status" value={formData.status} onChange={handleFormChange}>
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Converted">Converted</option>
                                <option value="Lost">Lost</option>
                            </select>
                            <div className="modal-actions">
                                <button type="submit">Save</button>
                                <button type="button" onClick={handleCloseModal}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDetailPage;