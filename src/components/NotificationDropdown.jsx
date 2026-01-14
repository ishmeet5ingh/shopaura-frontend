// src/components/NotificationDropdown.jsx
import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  FiX,
  FiPackage,
  FiShoppingBag,
  FiTruck,
  FiBell
} from 'react-icons/fi';
import { useNotifications } from '../hooks';
import { formatDistanceToNow, isValid } from 'date-fns';
import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

const NotificationDropdown = ({ onClose }) => {
  const dropdownRef = useRef(null);
  const { notifications, loading, markAsRead, markAllAsRead } =
    useNotifications();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const getIcon = (type) => {
    switch (type) {
      case 'order':
        return <FiPackage className="text-indigo-500" size={16} />;
      case 'product':
        return <FiShoppingBag className="text-emerald-500" size={16} />;
      case 'delivery':
        return <FiTruck className="text-purple-500" size={16} />;
      default:
        return <FiBell className="text-slate-400" size={16} />;
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead && notification._id) {
      markAsRead(notification._id);
    }
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 max-h-[520px] overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <span className="h-7 w-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
            <FiBell size={16} />
          </span>
          <span>Notifications</span>
        </h3>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-medium text-purple-600 hover:text-purple-800"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="py-8">
            <LoadingSpinner size="md" message="Loading notifications..." />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-6 px-4">
            <EmptyState
              icon="bell"
              title="No notifications"
              description="You're all caught up! New notifications will appear here."
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.slice(0, 8).map((notification) => {
              const id = notification._id || notification.id;
              const ts = notification.timestamp || notification.createdAt;
              const d = ts ? new Date(ts) : null;
              const timeText = !d || !isValid(d)
                ? 'Just now'
                : formatDistanceToNow(d, { addSuffix: true });

              return (
                <button
                  key={id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                    !notification.isRead ? 'bg-purple-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                        {getIcon(notification.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm ${
                            !notification.isRead
                              ? 'font-semibold text-slate-900'
                              : 'font-medium text-slate-800'
                          } line-clamp-1`}
                        >
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="mt-1 h-2 w-2 rounded-full bg-purple-600 flex-shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>

                      <p className="text-[11px] text-slate-400 mt-1">
                        {timeText}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && !loading && (
        <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/60">
          <Link
            to="/notifications"
            onClick={onClose}
            className="block text-center text-xs font-semibold text-purple-600 hover:text-purple-800"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

NotificationDropdown.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default NotificationDropdown;
