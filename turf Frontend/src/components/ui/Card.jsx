import PropTypes from 'prop-types';

/**
 * Premium Card component with glass‑morphism styling.
 *
 * Props:
 * - `variant`: "glass" (default), "solid", "dark", "gradient"
 * - `hover`: enables lift animation on hover
 * - `padding`: toggles internal padding
 * - `className`: additional custom classes
 */
export default function Card({
  children,
  variant = 'glass',
  hover = false,
  padding = true,
  className = '',
  ...props
}) {
  const variantClasses = {
    glass: 'bg-white rounded-2xl border-2 border-slate-200/90 shadow-sm transition-all duration-200',
    solid: 'bg-white rounded-2xl border-2 border-slate-200/90 shadow-sm transition-all duration-200',
    dark: 'bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-md',
    gradient: 'bg-gradient-to-br from-emerald-600 to-green-700 text-white rounded-2xl border border-emerald-500 shadow-md',
  }[variant] || 'bg-white rounded-2xl border-2 border-slate-200/90 shadow-sm transition-all duration-200';

  const hoverClasses = hover ? 'hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5' : '';
  const paddingClass = padding ? 'p-5 sm:p-6' : '';

  return (
    <div
      className={`${variantClasses} ${hoverClasses} ${paddingClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['glass', 'solid', 'dark', 'gradient']),
  hover: PropTypes.bool,
  padding: PropTypes.bool,
  className: PropTypes.string,
};

