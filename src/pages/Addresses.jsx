// src/pages/Addresses.jsx
import { useState, useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';
import { addressService } from '../services';
import toast from 'react-hot-toast';
import AddressCard from '../components/AddressCard';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useNavigate } from 'react-router-dom';

const Addresses = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    pincode: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'India',
    addressType: 'home',
    isDefault: false
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressService.getAllAddresses();

      if (response.success) {
        setAddresses(response.addresses || []);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (editingAddress) {
        response = await addressService.updateAddress(
          editingAddress._id,
          formData
        );
      } else {
        response = await addressService.addAddress(formData);
      }

      if (response.success) {
        toast.success(editingAddress ? 'Address updated' : 'Address added');
        setShowModal(false);
        resetForm();
        fetchAddresses();
      }
    } catch (error) {
      console.error('Save address error:', error);
      toast.error('Failed to save address');
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      pincode: address.pincode,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      country: address.country || 'India',
      addressType: address.addressType || 'home',
      isDefault: address.isDefault || false
    });
    setShowModal(true);
  };

  const handleDelete = (addressId) => {
    setAddressToDelete(addressId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await addressService.deleteAddress(addressToDelete);

      if (response.success) {
        toast.success('Address deleted');
        fetchAddresses();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete address');
    } finally {
      setShowDeleteConfirm(false);
      setAddressToDelete(null);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const response = await addressService.setDefaultAddress(addressId);

      if (response.success) {
        toast.success('Default address updated');
        fetchAddresses();
      }
    } catch (error) {
      console.error('Set default error:', error);
      toast.error('Failed to set default address');
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      pincode: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: 'India',
      addressType: 'home',
      isDefault: false
    });
    setEditingAddress(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <LoadingSpinner
          size="lg"
          fullScreen={false}
          message="Loading addresses..."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-1">
              My addresses
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              Manage your delivery addresses
            </p>
          </div>

          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-sm hover:shadow-md"
          >
            <FiPlus size={18} />
            Add new address
          </button>
        </div>

        {/* Addresses Grid */}
        {addresses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <EmptyState
              icon="package"
              title="No addresses yet"
              description="Add your first delivery address to get started."
              actionLabel="Add address"
              onAction={handleAddNew}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {addresses.map((address) => (
              <div
                key={address._id}
                className={`group relative rounded-2xl border ${
                  address.isDefault
                    ? 'border-purple-500 bg-purple-50/60'
                    : 'border-slate-200 bg-white'
                } shadow-sm hover:shadow-md transition-all`}
              >
                {address.isDefault && (
                  <span className="absolute top-3 right-3 text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}

                <div className="p-4 md:p-5">
                  <AddressCard
                    address={address}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSetDefault={handleSetDefault}
                  />
                </div>

                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Address Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          title={editingAddress ? 'Edit address' : 'Add new address'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Full name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Phone number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Address 1 */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Address line 1 *
              </label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="House no., building name"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            {/* Address 2 */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Address line 2
              </label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder="Road name, area, colony"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* City / State / Pincode */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  pattern="[0-9]{6}"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Type + Default */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Address type
                </label>
                <select
                  name="addressType"
                  value={formData.addressType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  name="isDefault"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-2 focus:ring-purple-500"
                />
                <label
                  htmlFor="isDefault"
                  className="ml-2 text-xs md:text-sm text-slate-700"
                >
                  Set as default address
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                {editingAddress ? 'Update address' : 'Add address'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDelete}
          title="Delete address"
          message="Are you sure you want to delete this address? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </div>
  );
};

export default Addresses;
