import React from 'react';
import Card from './Card';

/**
 * CardGrid component renders a responsive grid of cards using the premium Card UI.
 * It expects an array of `items` and a `renderCard` function that returns the inner
 * JSX for each item. Each card receives glass‑morphism styling, hover lift and a
 * staggered fade‑up animation for a dynamic, premium feel.
 */
export default function CardGrid({ items, renderCard }) {
  const delayClasses = ['delay-75', 'delay-100', 'delay-150', 'delay-200', 'delay-300'];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {items.map((item, index) => (
        <Card
          key={item.id ?? index}
          variant="glass"
          hover
          className={`fade-up ${delayClasses[index % delayClasses.length]}`}
        >
          {renderCard(item)}
        </Card>
      ))}
    </div>
  );
}
