import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  MapPin,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/auth.api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional().or(z.literal('')),
});

const addressModalSchema = z.object({
  street: z.string().min(3, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().default('United States'),
  isDefault: z.boolean().default(false),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type AddressModalFormData = z.infer<typeof addressModalSchema>;

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Address Query
  const { data: addresses = [], refetch: refetchAddresses } = useQuery({
    queryKey: ['user-addresses'],
    queryFn: () => authApi.getAddresses(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
    },
  });

  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    reset: resetAddressForm,
    formState: { errors: addressErrors },
  } = useForm<AddressModalFormData>({
    resolver: zodResolver(addressModalSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      setIsUpdatingProfile(true);
      const payload: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      };
      if (data.newPassword && data.newPassword.trim()) {
        payload.newPassword = data.newPassword;
        payload.currentPassword = data.currentPassword;
      }
      await authApi.updateProfile(payload);
      await refreshUser();
      success('Profile updated successfully!');
    } catch (err: any) {
      toastError(err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onAddAddress = async (data: AddressModalFormData) => {
    try {
      await authApi.addAddress(data);
      success('Shipping address added!');
      setIsAddressModalOpen(false);
      resetAddressForm();
      refetchAddresses();
    } catch (err: any) {
      toastError(err.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await authApi.deleteAddress(id);
      success('Address removed');
      refetchAddresses();
    } catch (err: any) {
      toastError(err.message || 'Failed to remove address');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal information, security credentials, and saved delivery locations.
        </p>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              defaultValue={user?.firstName}
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label="Last Name"
              defaultValue={user?.lastName}
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              disabled
              value={user?.email || ''}
              helperText="Account email cannot be modified"
            />
            <Input
              label="Phone Number"
              defaultValue={user?.phoneNumber || ''}
              placeholder="+1 (555) 000-0000"
              error={errors.phoneNumber?.message}
              {...register('phoneNumber')}
            />
          </div>

          {/* Change Password Sub-section */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Change Security Password (Optional)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="Required if setting new password"
                error={errors.currentPassword?.message}
                {...register('currentPassword')}
              />
              <Input
                label="New Password"
                type="password"
                placeholder="Minimum 6 characters"
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="md" isLoading={isUpdatingProfile}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Address Book */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Saved Delivery Addresses</h3>
              <p className="text-xs text-slate-500">Fast 1-click checkout addresses</p>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsAddressModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4 text-indigo-600" />}
          >
            Add Address
          </Button>
        </div>

        {addresses.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No saved shipping addresses found. Click "+ Add Address" above to save one.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {addr.city}, {addr.state}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">{addr.street}</p>
                  <p className="text-xs text-slate-500">
                    {addr.postalCode}, {addr.country}
                  </p>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-slate-400 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Add Shipping Address"
        maxWidth="md"
      >
        <form onSubmit={handleAddressSubmit(onAddAddress)} className="space-y-4">
          <Input
            label="Street Address"
            placeholder="742 Evergreen Terrace"
            error={addressErrors.street?.message}
            {...registerAddress('street')}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              placeholder="Springfield"
              error={addressErrors.city?.message}
              {...registerAddress('city')}
            />
            <Input
              label="State / Province"
              placeholder="OR"
              error={addressErrors.state?.message}
              {...registerAddress('state')}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Postal Code"
              placeholder="97477"
              error={addressErrors.postalCode?.message}
              {...registerAddress('postalCode')}
            />
            <Input
              label="Country"
              defaultValue="United States"
              error={addressErrors.country?.message}
              {...registerAddress('country')}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              {...registerAddress('isDefault')}
            />
            <span className="text-xs font-semibold text-slate-700">
              Set as primary default address
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddressModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
