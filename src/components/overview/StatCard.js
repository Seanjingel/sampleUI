import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

// Generic stat card with optional icon, subtitle, value colorization and click handler
const StatCard = ({ icon: Icon, label, value, subtitle, valueClassName = '', onClick, bg='white', loading=false }) => {
  const cardId = React.useId();
  return (
    <motion.div
      whileHover={!loading ? { y: -2 } : undefined}
      role="group"
      aria-labelledby={`${cardId}-label`}
      aria-busy={loading}
      className={`relative overflow-hidden rounded shadow group focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-${onClick&&!loading?'pointer':'default'}`}
      style={{backgroundColor: bg}}
      onClick={loading ? undefined : onClick}
      tabIndex={onClick&&!loading?0:-1}
    >
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p id={`${cardId}-label`} className="text-[11px] sm:text-xs uppercase tracking-wide text-gray-500 font-medium truncate">{label}</p>
            {loading ? (
              <div className="mt-2 h-6 w-20 rounded bg-gray-200 animate-pulse" aria-hidden="true" />
            ) : (
              <p className={`mt-1 text-lg sm:text-2xl font-bold leading-snug break-words ${valueClassName}`} aria-label={`${label} value ${value}`}>{value}</p>
            )}
            {subtitle && !loading && <p className="mt-1 text-[11px] sm:text-xs text-gray-500 line-clamp-2" aria-label={`${label} subtitle ${subtitle}`}>{subtitle}</p>}
            {subtitle && loading && <div className="mt-2 h-3 w-28 rounded bg-gray-100 animate-pulse" aria-hidden="true" />}
          </div>
          {Icon && (
            <div className="p-2 rounded-md bg-white/40 backdrop-blur-sm text-gray-700 group-hover:scale-110 transition-transform shrink-0" aria-hidden="true">
              <Icon className="w-5 h-5" />
            </div>) }
        </div>
      </div>
      {!loading && <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
      {loading && <div className="absolute inset-0 bg-white/40 pointer-events-none" aria-hidden="true" />}
    </motion.div>
  );
};

StatCard.propTypes = {
  icon: PropTypes.elementType,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // value may be omitted during loading
  subtitle: PropTypes.string,
  valueClassName: PropTypes.string,
  onClick: PropTypes.func,
  bg: PropTypes.string,
  loading: PropTypes.bool
};

export default StatCard;
