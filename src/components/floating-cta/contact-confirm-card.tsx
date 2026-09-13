'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User, Mail, Phone, Pencil, Check, X, ArrowRight } from 'lucide-react';

export interface ContactConfirmCardProps {
  isVisible: boolean;
  isDiscreteMode?: boolean;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  mobile?: string | null;
  onConfirm?: () => void;
  onCorrect?: () => void;
  onFieldCorrect?: (field: 'firstName' | 'lastName' | 'email' | 'mobile', newValue: string) => void;
}

type EditableField = 'firstName' | 'lastName' | 'email' | 'mobile';

export function ContactConfirmCard({
  isVisible,
  isDiscreteMode = false,
  firstName,
  lastName,
  email,
  mobile,
  onConfirm,
  onCorrect,
  onFieldCorrect,
}: ContactConfirmCardProps) {
  // Local state initialized from props
  const [localValues, setLocalValues] = useState({
    firstName: firstName || '',
    lastName: lastName || '',
    email: email || '',
    mobile: mobile || '',
  });

  const [activeEditingField, setActiveEditingField] = useState<EditableField | null>(null);
  const [editInputValue, setEditInputValue] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [recentSavedField, setRecentSavedField] = useState<EditableField | null>(null);
  const [hasEverEdited, setHasEverEdited] = useState(false);

  // Sync props to local values if not currently editing that specific field
  useEffect(() => {
    if (activeEditingField !== 'firstName' && firstName !== undefined) {
      setLocalValues((prev) => ({ ...prev, firstName: firstName || '' }));
    }
  }, [firstName, activeEditingField]);

  useEffect(() => {
    if (activeEditingField !== 'lastName' && lastName !== undefined) {
      setLocalValues((prev) => ({ ...prev, lastName: lastName || '' }));
    }
  }, [lastName, activeEditingField]);

  useEffect(() => {
    if (activeEditingField !== 'email' && email !== undefined) {
      setLocalValues((prev) => ({ ...prev, email: email || '' }));
    }
  }, [email, activeEditingField]);

  useEffect(() => {
    if (activeEditingField !== 'mobile' && mobile !== undefined) {
      setLocalValues((prev) => ({ ...prev, mobile: mobile || '' }));
    }
  }, [mobile, activeEditingField]);

  const handleStartEdit = (field: EditableField) => {
    setActiveEditingField(field);
    setEditInputValue(localValues[field] || '');
    setFieldError(null);
  };

  const handleCancelEdit = () => {
    setActiveEditingField(null);
    setEditInputValue('');
    setFieldError(null);
  };

  const handleSaveEdit = (field: EditableField) => {
    const trimmed = editInputValue.trim();

    // Validation
    if (field === 'firstName') {
      if (!trimmed) {
        setFieldError('Please enter your first name.');
        return;
      }
    } else if (field === 'lastName') {
      if (!trimmed) {
        setFieldError('Please enter your last name.');
        return;
      }
    } else if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        setFieldError('Please enter a valid email address.');
        return;
      }
    } else if (field === 'mobile') {
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length < 10) {
        setFieldError('Please enter a valid phone number (at least 10 digits).');
        return;
      }
    }

    // Apply change locally
    setLocalValues((prev) => ({ ...prev, [field]: trimmed }));
    setActiveEditingField(null);
    setFieldError(null);
    setHasEverEdited(true);

    // Trigger visual saved state
    setRecentSavedField(field);
    setTimeout(() => {
      setRecentSavedField((curr) => (curr === field ? null : curr));
    }, 2000);

    // Notify backend
    onFieldCorrect?.(field, trimmed);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="contact-confirm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[260] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            key="contact-confirm-card"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#0b0f19]/95 border border-[#00b4d8]/40 rounded-2xl p-6 shadow-[0_0_60px_rgba(0,180,216,0.2)] text-white backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-[#00b4d8]/10 border border-[#00b4d8]/30 flex items-center justify-center mb-3">
                <ShieldCheck className="w-7 h-7 text-[#00b4d8]" />
              </div>
              <h3 className="text-lg font-bold tracking-wide text-white">
                Confirm Your Details
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                Please review your information before we send your verification code.
              </p>
            </div>

            {/* Info rows: First Name, Last Name, Email, Phone */}
            <div className="space-y-2.5 mb-2">
              <EditableInfoRow
                icon={<User className="w-4 h-4 text-[#00b4d8]" />}
                label="First Name"
                fieldKey="firstName"
                value={localValues.firstName || '—'}
                isEditing={activeEditingField === 'firstName'}
                editValue={editInputValue}
                fieldError={activeEditingField === 'firstName' ? fieldError : null}
                hasSavedRecently={recentSavedField === 'firstName'}
                onStartEdit={() => handleStartEdit('firstName')}
                onCancelEdit={handleCancelEdit}
                onChangeEditValue={setEditInputValue}
                onSave={() => handleSaveEdit('firstName')}
              />

              <EditableInfoRow
                icon={<User className="w-4 h-4 text-[#00b4d8]" />}
                label="Last Name"
                fieldKey="lastName"
                value={localValues.lastName || '—'}
                isEditing={activeEditingField === 'lastName'}
                editValue={editInputValue}
                fieldError={activeEditingField === 'lastName' ? fieldError : null}
                hasSavedRecently={recentSavedField === 'lastName'}
                onStartEdit={() => handleStartEdit('lastName')}
                onCancelEdit={handleCancelEdit}
                onChangeEditValue={setEditInputValue}
                onSave={() => handleSaveEdit('lastName')}
              />

              <EditableInfoRow
                icon={<Mail className="w-4 h-4 text-[#00b4d8]" />}
                label="Email"
                fieldKey="email"
                value={localValues.email || '—'}
                isEditing={activeEditingField === 'email'}
                editValue={editInputValue}
                fieldError={activeEditingField === 'email' ? fieldError : null}
                hasSavedRecently={recentSavedField === 'email'}
                onStartEdit={() => handleStartEdit('email')}
                onCancelEdit={handleCancelEdit}
                onChangeEditValue={setEditInputValue}
                onSave={() => handleSaveEdit('email')}
              />

              <EditableInfoRow
                icon={<Phone className="w-4 h-4 text-[#00b4d8]" />}
                label="Phone"
                fieldKey="mobile"
                value={localValues.mobile || '—'}
                isEditing={activeEditingField === 'mobile'}
                editValue={editInputValue}
                fieldError={activeEditingField === 'mobile' ? fieldError : null}
                hasSavedRecently={recentSavedField === 'mobile'}
                onStartEdit={() => handleStartEdit('mobile')}
                onCancelEdit={handleCancelEdit}
                onChangeEditValue={setEditInputValue}
                onSave={() => handleSaveEdit('mobile')}
              />
            </div>

            {/* Bottom Section: Discrete mode button or Voice hint */}
            {isDiscreteMode || hasEverEdited ? (
              <div className="mt-5 space-y-2">
                <button
                  id="contact-confirm-submit-btn"
                  type="button"
                  onClick={onConfirm}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#0077b6] hover:from-[#0096c7] hover:to-[#023e8a] text-white font-semibold text-sm shadow-[0_0_20px_rgba(0,180,216,0.3)] transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.99]"
                >
                  <span>This looks correct</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                {!isDiscreteMode && (
                  <p
                    id="contact-confirm-hint"
                    onClick={onCorrect}
                    className="text-center text-xs text-gray-500 cursor-pointer hover:text-gray-400 transition-colors pt-1"
                  >
                    Something doesn&apos;t look right? Just say so and I&apos;ll fix it.
                  </p>
                )}
              </div>
            ) : (
              <p
                id="contact-confirm-hint"
                onClick={onCorrect}
                className="text-center text-xs text-gray-500 mt-4 cursor-pointer hover:text-gray-400 transition-colors"
              >
                Something doesn&apos;t look right? Just say so and I&apos;ll fix it.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface EditableInfoRowProps {
  icon: React.ReactNode;
  label: string;
  fieldKey: EditableField;
  value: string;
  isEditing: boolean;
  editValue: string;
  fieldError: string | null;
  hasSavedRecently: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onChangeEditValue: (val: string) => void;
  onSave: () => void;
}

function EditableInfoRow({
  icon,
  label,
  value,
  isEditing,
  editValue,
  fieldError,
  hasSavedRecently,
  onStartEdit,
  onCancelEdit,
  onChangeEditValue,
  onSave,
}: EditableInfoRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancelEdit();
    }
  };

  return (
    <div className={`px-4 py-2.5 rounded-xl bg-[#111827]/80 border transition-all ${
      isEditing
        ? 'border-[#00b4d8] shadow-[0_0_15px_rgba(0,180,216,0.15)] bg-[#111c30]/90'
        : hasSavedRecently
        ? 'border-emerald-500/60 bg-emerald-950/20'
        : 'border-gray-800/90 hover:border-gray-700/80'
    }`}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{icon}</div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest leading-none mb-1">
            {label}
          </p>

          {isEditing ? (
            <div className="flex items-center gap-2 mt-0.5">
              <input
                ref={inputRef}
                type={label === 'Email' ? 'email' : label === 'Phone' ? 'tel' : 'text'}
                value={editValue}
                onChange={(e) => onChangeEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-[#162035] text-white text-sm font-medium px-2.5 py-1 rounded-lg border border-[#00b4d8]/60 focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
                placeholder={`Enter ${label.toLowerCase()}`}
              />
              <button
                type="button"
                onClick={onSave}
                title="Save changes"
                aria-label={`Save ${label}`}
                className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors flex-shrink-0 cursor-pointer"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                title="Cancel"
                aria-label={`Cancel editing ${label}`}
                className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors flex-shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white truncate">{value}</p>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {hasSavedRecently ? (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={onStartEdit}
                    title={`Edit ${label}`}
                    aria-label={`Edit ${label}`}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#00b4d8] hover:bg-[#00b4d8]/10 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {fieldError && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] text-rose-400 mt-1.5 pl-7"
        >
          {fieldError}
        </motion.p>
      )}
    </div>
  );
}
