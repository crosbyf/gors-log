import { useEffect, useRef } from 'react';
import * as Icons from './Icons';

// Center modal (for confirms, small forms)
export function CenterModal({ open, onClose, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

// Bottom sheet modal (for day details, lists)
export function BottomSheet({ open, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const handleTouchStart = (e) => {
    const el = ref.current;
    el.dataset.startY = e.touches[0].clientY;
    el.dataset.scrollTop = el.scrollTop;
  };
  const handleTouchMove = (e) => {
    const el = ref.current;
    const startY = parseFloat(el.dataset.startY);
    const scrollTop = parseFloat(el.dataset.scrollTop);
    const diff = e.touches[0].clientY - startY;
    if (scrollTop <= 0 && diff > 0) {
      el.style.transform = `translateY(${diff}px)`;
      el.style.transition = 'none';
    }
  };
  const handleTouchEnd = (e) => {
    const el = ref.current;
    const startY = parseFloat(el.dataset.startY);
    const scrollTop = parseFloat(el.dataset.scrollTop);
    const diff = e.changedTouches[0].clientY - startY;
    el.style.transition = 'transform 0.2s ease-out';
    if (scrollTop <= 0 && diff > 100) {
      el.style.transform = 'translateY(100%)';
      setTimeout(onClose, 200);
    } else {
      el.style.transform = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end" onClick={onClose}>
      <div
        ref={ref}
        className="rounded-t-2xl w-full max-h-[85vh] overflow-y-auto pb-8 animate-slide-up"
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

// Drag handle for bottom sheets
export function DragHandle({ dark }) {
  return (
    <div className={`flex justify-center pt-3 pb-2 sticky top-0 ${dark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`w-10 h-1 ${dark ? 'bg-gray-600' : 'bg-gray-300'} rounded-full`}></div>
    </div>
  );
}

// Confirm dialog
export function ConfirmDialog({ open, onConfirm, onCancel, title, message, confirmText = 'Confirm', confirmColor = 'bg-red-600 hover:bg-red-700', dark = true }) {
  if (!open) return null;
  return (
    <CenterModal open={open} onClose={onCancel}>
      <div className={`${dark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-md`}>
        <h3 className={`text-xl font-bold mb-4 ${confirmColor.includes('red') ? 'text-red-400' : confirmColor.includes('yellow') ? 'text-yellow-400' : 'text-blue-400'}`}>{title}</h3>
        <p className="mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className={`flex-1 ${confirmColor} py-3 rounded-lg font-semibold text-white`}>{confirmText}</button>
          <button onClick={onCancel} className={`flex-1 ${dark ? 'bg-gray-700' : 'bg-gray-200'} py-3 rounded-lg font-semibold`}>Cancel</button>
        </div>
      </div>
    </CenterModal>
  );
}

// Toast notification
export function Toast({ show, message }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
      {message}
    </div>
  );
}
