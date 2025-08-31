import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAccountDetails, updateProfile } from "../api/profileService";
import Button from "../components/common/Button";

// 🔹 Delete Account Modal
const DeleteAccountModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Delete Account
          </h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete your account?{" "}
            <span className="text-red-500 font-medium">
            This action cannot be undone.
          </span>
          </p>
          <div className="flex justify-end gap-3">
            <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </div>
  );
};

// 🔹 Change Password Modal
const ChangePasswordModal = ({
                               isOpen,
                               onClose,
                               currentPwd,
                               newPwd,
                               confirmPwd,
                               setCurrentPwd,
                               setNewPwd,
                               setConfirmPwd,
                               onSave,
                             }) => {
  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Change Password
          </h2>
          <div className="space-y-3">
            <input
                type="password"
                placeholder="Current Password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
            />
            <input
                type="password"
                placeholder="New Password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
            />
            <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
            />
            <Button
                onClick={onSave}
                className="w-full mt-3 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-blue-950 transition"
            >
              Save Password
            </Button>
          </div>
        </motion.div>
      </div>
  );
};

const ProfilePage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [memberSince, setMemberSince] = useState("");
  const [plan] = useState("Lifetime Plan");
  const [planStatus] = useState("Active");
  const [avatar, setAvatar] = useState("https://via.placeholder.com/100");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal states
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

  // Password fields
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  // Mobile number error state
  const [mobileError, setMobileError] = useState("");

  // Display name state
  const [displayName, setDisplayName] = useState("");

  // Fetch profile
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getAccountDetails()
        .then((res) => {
          if (!isMounted) return;
          const user = res?.data?.data?.user;
          setFullName(user?.username || "");
          setDisplayName(user?.username || "");
          setEmail(user?.email || "");
          setMemberSince(
              user?.createdDate
                  ? new Date(user.createdDate).toLocaleDateString()
                  : ""
          );
        })
        .catch(() => {
          alert("Failed to fetch profile details");
        })
        .finally(() => setLoading(false));

    return () => {
      isMounted = false;
    };
  }, []);

  // Save profile
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ username: fullName });
      setDisplayName(fullName); // Update display name after save
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // Save password
  const handleChangePassword = () => {
    if (newPwd !== confirmPwd) {
      alert("Passwords do not match!");
      return;
    }
    // 🔹 API call for change password
    alert("Password changed successfully!");
    setPasswordModalOpen(false);
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
  };

  // Delete account
  const handleDeleteAccount = () => {
    // 🔹 API call for delete
    alert("Account deleted!");
    setDeleteModalOpen(false);
  };

  // Avatar upload
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  if (loading) {
    return (
        <div className="p-4 md:p-6">
          <div className="p-6 text-center">Loading profile...</div>
        </div>
    );
  }

  return (
      <div className="p-4 md:p-6 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <img
                src={avatar}
                alt="User Avatar"
                className="w-24 h-24 rounded-full border border-gray-300 shadow-sm object-cover"
            />
            <label className="mt-3 cursor-pointer text-sm text-gray-600 hover:underline">
              <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
              />
              Change Photo
            </label>
            <h2 className="mt-4 text-xl font-semibold">{displayName}</h2>
            <p className="text-gray-500 text-sm">{email}</p>
          </div>

          {/* Profile Info */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-medium mb-4">Profile Information</h3>
              <div className="mb-4">
                <label className="block text-sm text-gray-600">Full Name</label>
                <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring focus:ring-gray-200"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-600">
                  Email Address
                </label>
                <input
                    type="email"
                    value={email}
                    readOnly
                    className="mt-1 w-full border border-gray-300 bg-gray-100 rounded-lg p-2 text-sm cursor-not-allowed"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-600">Mobile Number</label>
                <input
                    type="tel"
                    value={mobileNumber}
                    onChange={e => {
                      const value = e.target.value;
                      if (/[^0-9]/.test(value)) {
                        setMobileError("Only numbers are allowed");
                      } else {
                        setMobileError("");
                      }
                      setMobileNumber(value.replace(/[^0-9]/g, ""));
                    }}
                    placeholder="Enter mobile number"
                    className="mt-1 w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring focus:ring-gray-200"
                />
                {mobileError && (
                    <p className="text-red-500 text-xs mt-1">{mobileError}</p>
                )}
              </div>
              <div className="mt-8">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2 rounded-lg bg-gray-800 text-white text-sm hover:bg-blue-950"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>

            {/* Right */}
            <div className="space-y-6">
              {/* Subscription */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-medium mb-2">Subscription</h3>
                <p className="text-sm text-gray-600">Current Plan</p>
                <p className="font-semibold text-gray-800">{plan}</p>
                <span className="mt-2 inline-block text-xs px-3 py-1 rounded-full bg-green-100 text-green-600">
                  {planStatus}
                </span>
                <Button
                    className="mt-4 block px-4 py-2 rounded-lg bg-gray-800 text-white text-sm hover:bg-blue-950 transition">
                  Manage Subscription
                </Button>
              </div>

              {/* Account */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-medium mb-2">Account</h3>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-semibold text-gray-800 mb-4">
                  {memberSince}
                </p>
                <div className="space-y-3">
                  <Button
                      onClick={() => setPasswordModalOpen(true)}
                      className="w-full py-2 border border-gray-800 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Change Password
                  </Button>
                  <Button
                      onClick={() => setDeleteModalOpen(true)}
                      className="w-full py-2 border border-red-300 rounded-lg text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <ChangePasswordModal
            isOpen={isPasswordModalOpen}
            onClose={() => setPasswordModalOpen(false)}
            currentPwd={currentPwd}
            newPwd={newPwd}
            confirmPwd={confirmPwd}
            setCurrentPwd={setCurrentPwd}
            setNewPwd={setNewPwd}
            setConfirmPwd={setConfirmPwd}
            onSave={handleChangePassword}
        />

        <DeleteAccountModal
            isOpen={isDeleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleDeleteAccount}
        />
      </div>
  );
};

export default ProfilePage;
