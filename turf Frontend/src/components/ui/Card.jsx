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
    glass: 'glass-card',
    solid: 'bg-white border border-surface-200',
    dark: 'glass-dark',
    gradient: 'bg-gradient-to-br from-primary-500 to-accent-500 text-white',
  }[variant];

  const hoverClasses = hover ? 'hover-lift hover:shadow-glow-emerald transition-all duration-300' : '';
  const paddingClass = padding ? 'p-6' : '';

  return (
    <div
      {...props}
      className={`rounded-2xl ${variantClasses} ${hoverClasses} ${paddingClass} ${className}`}
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

