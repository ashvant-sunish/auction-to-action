import React from 'react';
import SpinningCardWheel from './spinthewheel/SpinningCardWheel';

function Round1() {
  return (
    <div>
      <SpinningCardWheel
        cardCount={75}
        cylinderRadius={280}
        animationDuration={6000}
        onCardSelected={(cardNumber) => {
          console.log(`Card ${cardNumber} was selected!`);
        }}
      />
    </div>
  )
}

export default Round1;