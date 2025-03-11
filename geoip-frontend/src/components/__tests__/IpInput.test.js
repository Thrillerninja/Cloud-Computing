import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import IpInput from '../IpInput';
import { act } from 'react';

test('renders IP input and search button', () => {
  act(() => {
    render(<IpInput ip="" setIp={() => {}} handleSearch={() => {}} error="" isLoading={false} />);
  });
  const inputElement = screen.getByLabelText(/Enter IP Address/i);
  const buttonElement = screen.getByText(/Search/i);
  expect(inputElement).toBeInTheDocument();
  expect(buttonElement).toBeInTheDocument();
});

test('calls handleSearch on button click', () => {
  const handleSearch = jest.fn();
  act(() => {
    render(<IpInput ip="" setIp={() => {}} handleSearch={handleSearch} error="" isLoading={false} />);
  });
  const buttonElement = screen.getByText(/Search/i);
  fireEvent.click(buttonElement);
  expect(handleSearch).toHaveBeenCalledTimes(1);
});
