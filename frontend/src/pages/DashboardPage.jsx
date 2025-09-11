import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const DashboardPage = () => {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // State for the modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(null); // For editing
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '' });

    useEffect(() => {
        fetchCustomers();
    }, [page, search]); // Refetch when page or search term changes

    const fetchCustomers = async () => {
        try {
            const res = await api.get(`/customers?page=${page}&search=${search}`);
            setCustomers(res.data.customers);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error("Failed to fetch customers:", err);
        }
    };

    const handleOpenModal = (customer = null) => {
        setCurrentCustomer(customer);
        setFormData(customer ? { name: customer.name, email: customer.email, phone: customer.phone, company: customer.company } : { name: '', email: '', phone: '', company: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentCustomer(null);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentCustomer) {
                // Update existing customer
                await api.put(`/customers/${currentCustomer._id}`, formData);
            } else {
                // Add new customer
                await api.post('/customers', formData);
            }
            fetchCustomers(); // Refresh the list
            handleCloseModal();
        } catch (err) {
            console.error("Failed to save customer:", err);
        }
    };
    
    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to delete this customer and all their leads?')){
            try {
                await api.delete(`/customers/${id}`);
                fetchCustomers(); // Refresh the list
            } catch (err) {
                console.error("Failed to delete customer:", err);
            }
        }
    };

    return (
        <div className="container">
            <h1>Customer Dashboard</h1>
            <div className="toolbar">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
                <button onClick={() => handleOpenModal()}>Add Customer</button>
            </div>
            
            <table>
                {/* ... table headers ... */}
                <tbody>
                    {customers.map(customer => (
                        <tr key={customer._id}>
                            <td>{customer.name}</td>
                            <td>{customer.email}</td>
                            <td>{customer.phone}</td>
                            <td>
                                <Link to={`/customers/${customer._id}`}>View</Link>
                                <button onClick={() => handleOpenModal(customer)}>Edit</button>
                                <button onClick={() => handleDelete(customer._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Controls */}
            {/* ... */}

            {/* Add/Edit Customer Modal */}
            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h2>{currentCustomer ? 'Edit Customer' : 'Add Customer'}</h2>
                        <form onSubmit={handleFormSubmit}>
                            <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Name" required />
                            <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="Email" required />
                            <input type="text" name="phone" value={formData.phone} onChange={handleFormChange} placeholder="Phone" />
                            <input type="text" name="company" value={formData.company} onChange={handleFormChange} placeholder="Company" />
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

export default DashboardPage;