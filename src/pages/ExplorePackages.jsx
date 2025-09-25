import React, { useState, useEffect } from 'react';
import PackageCard from '../components/PackageCard';
import '../styles/ExplorePackages.css';

const ExplorePackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch data from an API here
    const fetchPackages = async () => {
      // Mock data for demonstration, updated to reflect the full description
      const mockPackages = [
        {
          package_id: 1,
          name: 'The Himalayan Trek',
          tour_type: 'Adventure',
          duration_days: 10,
          max_capacity: 15,
          itinerary_summary: 'A thrilling trek through the majestic Himalayas...',
          full_description: 'Experience the breathtaking beauty of the Himalayan mountains with our 10-day trekking adventure. This package includes guided tours, accommodation, and all meals. The itinerary is designed to allow for gradual acclimatization, ensuring a safe and enjoyable journey.',
          image_url: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=800&auto=format&fit=crop',
          itinerary_items: [
            { item_id: 1, day_number: 1, duration: 'Full Day', title: 'Arrival in Kathmandu, Nepal', description: 'Arrive at Tribhuvan International Airport (TIA) and transfer to your hotel. Meet your trek leader and get briefed about the trip.', street_name: 'Thamel', city: 'Kathmandu', state: 'Bagmati Province', pin: '44600' },
            { item_id: 2, day_number: 2, duration: 'Full Day', title: 'Trek to Phakding', description: 'Begin your trek with a short scenic flight to Lukla and then a gentle walk to Phakding along the Dudh Koshi River.', street_name: 'Dudh Koshi River Trail', city: 'Phakding', state: 'Koshi Province', pin: '56000' },
            { item_id: 3, day_number: 3, duration: 'Full Day', title: 'Trek to Namche Bazaar', description: 'A challenging climb to the famous Namche Bazaar, the gateway to Mount Everest. Enjoy stunning views of the mountain on the way.', street_name: 'Solukhumbu', city: 'Namche Bazaar', state: 'Koshi Province', pin: '56000' },
          ],
          status: 'available',
          avg_rating: 4.8,
          reviews: [
            { id: 1, author: 'Alex Smith', rating: 5, comment: 'An incredible journey, the guides were excellent!' },
            { id: 2, author: 'Priya Sharma', rating: 4, comment: 'Challenging but rewarding. The views were unbelievable.' }
          ]
        },
        {
          package_id: 2,
          name: 'Tropical Bali Escape',
          tour_type: 'Relaxation',
          duration_days: 7,
          max_capacity: 20,
          itinerary_summary: 'A luxurious retreat to the serene beaches of Bali...',
          full_description: 'Unwind in paradise with our 7-day Bali package. Enjoy pristine beaches, cultural tours, and world-class spa treatments. This package is perfect for those seeking relaxation and rejuvenation.',
          image_url: 'https://images.unsplash.com/photo-1536675003310-7469b2d3989c?w=800&auto=format&fit=crop',
          itinerary_items: [
            { item_id: 4, day_number: 1, duration: 'Full Day', title: 'Arrival in Denpasar, Bali', description: 'Arrive at Ngurah Rai International Airport and transfer to your villa. Relax and prepare for your week in paradise.', street_name: 'Jalan Raya Kuta', city: 'Kuta', state: 'Bali', pin: '80361' },
            { item_id: 5, day_number: 2, duration: 'Full Day', title: 'Beach day at Seminyak', description: 'Spend the day enjoying the famous Seminyak beach. Relax on the sand, swim in the ocean, and enjoy the local cafes.', street_name: 'Jalan Petitenget', city: 'Seminyak', state: 'Bali', pin: '80361' },
          ],
          status: 'finished',
          avg_rating: 4.5,
          reviews: [
            { id: 3, author: 'John Doe', rating: 5, comment: 'Absolutely amazing! I felt so refreshed after this trip.' },
            { id: 4, author: 'Jane Wilson', rating: 4, comment: 'Beautiful location, but the booking process could have been smoother.' }
          ]
        },
      ];
      setPackages(mockPackages);
      setLoading(false);
    };

    fetchPackages();
  }, []);

  if (loading) {
    return <div className="loading">Loading packages...</div>;
  }

  return (
    <div className="explore-packages-container">
      <h1>Explore Our Packages</h1>
      <div className="packages-list">
        {packages.map(pkg => (
          <PackageCard key={pkg.package_id} packageData={pkg} />
        ))}
      </div>
    </div>
  );
};

export default ExplorePackages;
