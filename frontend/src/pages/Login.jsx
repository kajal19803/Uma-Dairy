import React, { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const API_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const Login = () => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState ({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [fpStep, setFpStep] = useState(1);
  const [fpData, setFpData] = useState({ email: '', otp: '', newPassword: '' });

  const handleChange = ({ target: { name, value } }) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFpChange = ({ target: { name, value } }) => {
    setFpData(prev => ({ ...prev, [name]: value }));
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
    setOtp('');
    setOtpSent(false);
    setIsOtpVerified(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = {};

    if (!formData.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email';

    if (!formData.password) errs.password = 'Password is required';

    if (!isLogin) {
      if (!formData.name.trim()) errs.name = 'Name is required';
      if (formData.password.length < 6) errs.password = 'Password must be 6+ chars';
      if (formData.confirmPassword !== formData.password) errs.confirmPassword = 'Passwords do not match';
      if (!isOtpVerified) {
         if (!otpSent) {
            errs.otp = 'Please send and verify OTP first';
         } else if (!otp || otp.length !== 6) {
            errs.otp = 'Please enter a valid 6-digit OTP';
         }
      }
      if (!formData.termsAccepted) {
         setErrors({ ...errs, termsAccepted: 'You must accept the terms' });
      return;
    }}

    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      setLoading(true);
      if (!isLogin) {
        const chk = await axios.post(`${API_URL}/api/auth/check-user`, { email: formData.email });
        if (chk.data.exists) {
          toast.error('User already exists, please login.');
          setLoading(false);
          return;
        }
      }

      const endpoint = isLogin ? '/login' : '/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const res = await axios.post(`${API_URL}/api/auth${endpoint}`, payload);

      if (res.data.token) {
        const user = res.data.user || {};
        localStorage.setItem ('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(user));

        toast.success(isLogin ? 'Login successful!' : 'Registration successful!');

        const isAdmin = user.email === ADMIN_EMAIL;
        localStorage.setItem('userRole', isAdmin ? 'admin' : 'user');
        window.dispatchEvent(new Event("userUpdated"));

        navigate(isAdmin ? '/admindashboard' : '/dashboard', { replace: true });
      } else {
        toast.error(res.data.message || 'Authentication failed!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
  if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
    setErrors(prev => ({ ...prev, email: 'Enter a valid email before sending OTP' }));
    return;
  }

  try {
    await axios.post(`${API_URL}/api/email-otp/send`, { email: formData.email });
    toast.success('OTP sent successfully!');
    setOtpSent(true);
  } catch (error) {
    toast.error('Failed to send OTP');
  }
};


  const verifyOtp = async () => {
    try {
      await axios.post(`${API_URL}/api/email-otp/verify`, { email: formData.email, otp });
      toast.success('OTP verified!');
      setIsOtpVerified(true);
    } catch {
      toast.error('OTP verification failed');
    }
  };

  const handleFp = async () => {
    try {
      if (fpStep === 1) {
        if (!fpData.email) {
          toast.error('Please enter your email');
          return;
        }
        await axios.post(`${API_URL}/api/email-otp/send`, { email: fpData.email });
        toast.success('OTP sent to your email');
        setFpStep(2);
      } else if (fpStep === 2) {
        if (!fpData.otp) {
          toast.error('Please enter OTP');
          return;
        }
        await axios.post(`${API_URL}/api/email-otp/verify`, { email: fpData.email, otp: fpData.otp });
        toast.success('OTP verified');
        setFpStep(3);
      } else if (fpStep === 3) {
        if (!fpData.newPassword || fpData.newPassword.length < 6) {
          toast.error('New password must be at least 6 characters');
          return;
        }
        await axios.post(`${API_URL}/api/auth/reset-password`, { email: fpData.email, newPassword: fpData.newPassword });
        toast.success('Password reset successful!');
        setShowForgot(false);
        setFpStep(1);
        setFpData({ email: '', otp: '', newPassword: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error in password reset flow');
    }
  };

  const handleGoogleLoginSuccess = response => {
    axios
      .post(`${API_URL}/api/auth/google`, { token: response.credential })
      .then(res => {
        if (res.data.token) {
          const user = res.data.user;
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(user));

          const isAdmin = user.email === ADMIN_EMAIL;
          localStorage.setItem('userRole', isAdmin ? 'admin' : 'user');
          window.dispatchEvent(new Event("userUpdated"));
          toast.success('Google login successful!');
          navigate(isAdmin ? '/admindashboard' : '/dashboard', { replace: true });
        } else {
          toast.error(res.data.message || 'Google login failed!');
        }
      })
      .catch(() => toast.error('Google login error!'));
  };

  const handleGoogleLoginError = () => {
    toast.error('Google login failed!');
  };

  return (
<div className="min-h-screen w-screen bg-[#FFF8F1] flex items-center justify-center px-5 py-24">

<ToastContainer/>

<div className="w-full max-w-6xl bg-white rounded-[40px] shadow-2xl overflow-hidden grid lg:grid-cols-2">

{/* LEFT SIDE */}

<div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-[#FFF3E8] to-[#FFE4C7] p-14">

<div className="inline-flex w-fit bg-orange-100 text-[#F97354] px-5 py-2 rounded-full font-semibold mb-8">
🌿 Welcome to Uma Dairy
</div>

<h1 className="text-6xl font-extrabold text-[#3B2418] leading-tight">
Fresh Dairy,
<br/>
Fresh Life.
</h1>

<p className="mt-8 text-lg text-gray-600 leading-8">
Experience farm fresh milk, pure desi ghee,
paneer and homemade dairy products
delivered directly to your doorstep.
</p>

<img
src="/hero.png"
alt="Uma Dairy"
className="mt-12 rounded-3xl shadow-xl object-cover"
/>

</div>

{/* RIGHT SIDE */}

<div className="p-8 lg:p-12">

<div className="text-center mb-8">

<h2 className="text-4xl font-bold text-[#3B2418]">
{isLogin ? "Welcome Back 👋" : "Create Account"}
</h2>

<p className="mt-3 text-gray-500">
{isLogin
? "Login to continue shopping."
: "Register to start shopping."}
</p>

</div>

<form onSubmit={handleSubmit} noValidate>

{!isLogin && (

<div className="mb-5">

<label className="block mb-2 font-medium text-[#3B2418]">
Full Name
</label>

<input
name="name"
value={formData.name}
onChange={handleChange}
placeholder="Enter your full name"
className="w-full rounded-xl border border-orange-200 bg-[#FFF8F1] px-4 py-3 text-[#3B2418] outline-none focus:border-[#F97354]"
/>

{errors.name && (
<p className="text-red-500 text-sm mt-1">
{errors.name}
</p>
)}

</div>

)}

<div className="mb-5">

<label className="block mb-2 font-medium text-[#3B2418]">
Email
</label>

<input
name="email"
type="email"
value={formData.email}
onChange={handleChange}
placeholder="Enter your email"
className="w-full rounded-xl border border-orange-200 bg-[#FFF8F1] px-4 py-3 text-[#3B2418] outline-none focus:border-[#F97354]"
/>

{errors.email && (
<p className="text-red-500 text-sm mt-1">
{errors.email}
</p>
)}

{!isLogin && (

<button
type="button"
onClick={sendOtp}
disabled={otpSent}
className="mt-0 text-[#F97354] bg-transparent hover:underline border-none outline-none focus:outline-none focus:ring-0 active:outline-none active:ring-0 shadow-none">

{otpSent ? "OTP Sent" : "Send OTP"}

</button>

)}

</div>

{otpSent && !isOtpVerified && !isLogin && (

<div className="mb-5">

<label className="block mb-2 font-medium text-[#3B2418]">
OTP
</label>

<input
value={otp}
onChange={(e)=>setOtp(e.target.value)}
placeholder="Enter OTP"
className="w-full rounded-xl border border-orange-200 bg-[#FFF8F1] px-4 py-3"
/>

<button
type="button"
onClick={verifyOtp}
className="mt-2 text-[#F97354] border-none outline-none focus:outline-none focus:ring-0 active:outline-none active:ring-0 shadow-none bg-transparent hover:underline">

Verify OTP

</button>

{errors.otp && (
<p className="text-red-500 text-sm mt-1">
{errors.otp}
</p>
)}

</div>

)}

<div className="mb-5 relative">

<label className="block mb-2 font-medium text-[#3B2418]">
Password
</label>

<input
name="password"
type={showPass?"text":"password"}
value={formData.password}
onChange={handleChange}
placeholder="Enter password"
className="w-full rounded-xl border border-orange-200 bg-[#FFF8F1] px-4 py-3 pr-12 text-[#3B2418]"
/>

<button
type="button"
onClick={()=>setShowPass(!showPass)}
className="absolute right-0 top-[15px] h-full px-6 flex items-center justify-center bg-transparent border-none outline-none focus:outline-none focus:ring-0 active:outline-none active:ring-0 shadow-none text-[#F97354] hover:text-[#ea6847]">

{showPass?<EyeSlashIcon className="h-5 w-5"/>:<EyeIcon className="h-5 w-5"/>}

</button>

{errors.password && (
<p className="text-red-500 text-sm mt-1">
{errors.password}
</p>
)}

</div>
{!isLogin&&(

<div className="mb-5 relative">

<label className="block mb-2 font-medium text-[#3B2418]">
Confirm Password
</label>

<input
name="confirmPassword"
type={showConfirmPass?"text":"password"}
value={formData.confirmPassword}
onChange={handleChange}
placeholder="Confirm password"
className="w-full rounded-xl border border-orange-200 bg-[#FFF8F1] px-4 py-3 pr-12 text-[#3B2418]"
/>

<button
type="button"
onClick={()=>setShowConfirmPass(!showConfirmPass)}
className="absolute right-0 top-[15px] h-full px-6 flex items-center justify-center bg-transparent border-none outline-none focus:outline-none focus:ring-0 active:outline-none active:ring-0 shadow-none text-[#F97354] hover:text-[#ea6847]">

{showConfirmPass?<EyeSlashIcon className="h-5 hover:border-none w-5"/>:<EyeIcon className="h-5 bg-transparent w-5"/>}

</button>

{errors.confirmPassword&&(
<p className="text-red-500 text-sm mt-1">
{errors.confirmPassword}
</p>
)}

</div>

)}

{!isLogin&&(

<div className="mb-5">

<label className="flex items-start gap-3 text-sm text-[#3B2418]">

<input
type="checkbox"
checked={formData.termsAccepted}
onChange={(e)=>setFormData({...formData,termsAccepted:e.target.checked})}
className="mt-1 accent-[#F97354]"
/>

<span>
I agree to the{" "}
<Link
to="/policy"
className="text-[#F97354] underline">
Terms & Conditions
</Link>
</span>

</label>

{errors.termsAccepted&&(
<p className="text-red-500 text-sm mt-1">
{errors.termsAccepted}
</p>
)}

</div>

)}

<button
type="submit"
disabled={loading}
className="w-full py-4 rounded-xl bg-[#F97354] hover:bg-[#ea6847] text-white font-bold text-lg transition disabled:opacity-50">

{loading?"Please wait...":isLogin?"Login":"Register"}

</button>

</form>

{isLogin&&(

<div className="text-right mt-4">

<button
onClick={()=>setShowForgot(true)}
className="text-[#F97354] bg-transparent hover:underline">

Forgot Password?

</button>

</div>

)}

<div className="mt-8 flex items-center">

<div className="flex-1 border-t border-orange-200"/>

<span className="mx-4 text-gray-400">
OR
</span>

<div className="flex-1 border-t border-orange-200"/>

</div>

<div className="mt-6 flex justify-center">
<GoogleLogin
onSuccess={handleGoogleLoginSuccess}
onError={handleGoogleLoginError}
/>
</div>

<p className="mt-8 text-center text-gray-600">

{isLogin?"Don't have an account?":"Already have an account?"}

<button
onClick={toggleForm}
className="ml-2 text-[#F97354] font-semibold bg-transparent hover:underline border-none outline-none focus:outline-none focus:ring-0 active:outline-none active:ring-0 shadow-none">

{isLogin?"Register":"Login"}

</button>

</p>

</div>

</div>

{showForgot&&(

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<div className="bg-white rounded-3xl shadow-2xl p-8 w-[420px]">

<h3 className="text-2xl font-bold text-[#3B2418] mb-6">
Reset Password
</h3>

{fpStep===1&&(
<input
type="email"
name="email"
placeholder="Enter email"
value={fpData.email}
onChange={handleFpChange}
className="w-full rounded-xl border border-orange-200 bg-[#FFF8F1] px-4 py-3 mb-5"
/>
)}

{fpStep===2&&(
<input
name="otp"
placeholder="Enter OTP"
value={fpData.otp}
onChange={handleFpChange}
className="w-full rounded-xl border border-orange-200 bg-[#FFF8F1] px-4 py-3 mb-5"
/>
)}

{fpStep===3&&(
<input
name="newPassword"
type="password"
placeholder="New Password"
value={fpData.newPassword}
onChange={handleFpChange}
className="w-full rounded-xl border border-orange-200 bg-[#FFF8F1] px-4 py-3 mb-5"
/>
)}

<div className="flex justify-between">

<button
onClick={()=>{
setShowForgot(false);
setFpStep(1);
setFpData({email:"",otp:"",newPassword:""});
}}
className="px-5 py-2 rounded-xl border border-orange-200">

Cancel

</button>

<button
onClick={handleFp}
className="px-6 py-2 rounded-xl bg-[#F97354] text-white">

{fpStep===1?"Send OTP":fpStep===2?"Verify OTP":"Reset"}

</button>

</div>

</div>

</div>

)}

</div>

);
};

export default Login;