// components/LocationSearch.js
import React, { useState } from 'react';

export const LocationSearch = () => {
  const [creators, setCreators] = useState([]);

  const findNearbyCreators = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const res = await fetch('/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude, radius: 10000 })
      });
      const data = await res.json();
      setCreators(data);
    });
  };

  return (
    <div>
      <button onClick={findNearbyCreators}>Find Creators Near Me</button>
      <ul>
        {creators.map((creator) => (
          <li key={creator.id}>{creator.name}</li>
        ))}
      </ul>
    </div>
  );
};

// This component allows users to find nearby content creators based on their current location.
// It uses the Geolocation API to get the user's coordinates and then fetches creators within a specified radius from the server.
// The results are displayed in a list format, showing the names of the creators found nearby.