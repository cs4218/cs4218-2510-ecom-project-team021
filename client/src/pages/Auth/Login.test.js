import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';
import Login from './Login';

// Mocking axios.post
jest.mock('axios');
jest.mock('react-hot-toast');

jest.mock("../../hooks/useCategory", () => jest.fn(() => [])); // Mock useCategory hook entirely

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
  }));

  jest.mock('../../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
  }));
    
jest.mock('../../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
  }));  

Object.defineProperty(window, 'localStorage', {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {}
    };
  };  

describe('Login Component', () => {
  const { useAuth } = jest.requireMock('../../context/auth');
  const setAuth = jest.fn();  
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderedFormWithRouter = () => {
    return render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('renders login form', () => {
    const { getByText, getByPlaceholderText } = renderedFormWithRouter();
  
    expect(getByText('LOGIN FORM')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter Your Email')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter Your Password')).toBeInTheDocument();
  });

  it('inputs should be initially empty', () => {
    const { getByPlaceholderText } = renderedFormWithRouter();  
  
    expect(getByPlaceholderText('Enter Your Email').value).toBe('');
    expect(getByPlaceholderText('Enter Your Password').value).toBe('');
  });
    
  it('should allow typing email and password', () => {
    const { getByPlaceholderText } = renderedFormWithRouter();

    fireEvent.change(getByPlaceholderText('Enter Your Email'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(getByPlaceholderText('Enter Your Password'), { 
      target: { value: 'password123' } 
    });
    expect(getByPlaceholderText('Enter Your Email').value).toBe('test@example.com');
    expect(getByPlaceholderText('Enter Your Password').value).toBe('password123');
  });
      
  it('should login the user successfully', async () => {
    axios.post.mockResolvedValueOnce({
        data: {
            success: true,
            user: { id: 1, name: 'John Doe', email: 'test@example.com' },
            token: 'mockToken'
        }
    });

    const { getByPlaceholderText, getByText } = renderedFormWithRouter();

    fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });
    fireEvent.click(getByText('LOGIN'));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith(undefined, {
        duration: 5000,
        icon: '🙏',
        style: {
            background: 'green',
            color: 'white'
        }
    });
  });

  it('should display error message on failed login', async () => {
      axios.post.mockRejectedValueOnce({ message: 'Invalid credentials' });

      const { getByPlaceholderText, getByText } = renderedFormWithRouter();

      fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } });
      fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });
      fireEvent.click(getByText('LOGIN'));

      await waitFor(() => expect(axios.post).toHaveBeenCalled());
      expect(toast.error).toHaveBeenCalledWith('Something went wrong');
  });

  it('should display error toast if login fails with success=false', async () => {
    axios.post.mockResolvedValueOnce({
        data: {
            success: false,
            message: 'Invalid Credentials'
        }
    });

    const { getByPlaceholderText, getByText } = renderedFormWithRouter();

    fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'wrongpassword' } });
    fireEvent.click(getByText('LOGIN'));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Invalid Credentials'));
  });
  
  it('navigates to forgot password page when the forgot password button is clicked', async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<div>Forgot Password Page</div>} />
          </Routes>
        </MemoryRouter>
      );

    fireEvent.click(getByText('Forgot Password'));

    await waitFor(() => {
      expect(getByText('Forgot Password Page')).toBeInTheDocument();
    });
  });
});
