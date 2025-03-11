import React from 'react';
import { render, screen } from '@testing-library/react';
import LocationInfo from '../LocationInfo';
import { act } from 'react'; // Add this import

test('renders location information', () => {
  const location = {
    network: '192.168.0.1',
    city_name: 'Berlin',
    subdivision_1_name: 'Berlin',
    country_name: 'Germany',
    latitude: 52.52,
    longitude: 13.405,
  };
  act(() => { // Wrap render in act
    render(<LocationInfo location={location} error="" />);
  });
  const cityElement = screen.getByText(/City: Berlin/i);
  const countryElement = screen.getByText(/Country: Germany/i);
  expect(cityElement).toBeInTheDocument();
  expect(countryElement).toBeInTheDocument();
});
