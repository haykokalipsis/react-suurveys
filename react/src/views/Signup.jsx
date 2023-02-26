import {LockClosedIcon} from '@heroicons/react/20/solid'
import {Link} from "react-router-dom";
import {useState} from "react";
import axiosClient from "../axios.js";
import {useStateContext} from "../contexts/ContextProvider.jsx";

export default function Signup() {
    // Context
    const {setCurrentUser, setUserToken} = useStateContext()

    // State==================================================================
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [topErrors, setTopErrors] = useState({__html: ''});
    const [errors, setErrors] = useState({});

    // Methods ==================================================================
    const onSubmit = (e) => {
        e.preventDefault();
        setErrors({__html: ''});

        axiosClient.post('/signup', {
            name: fullName,
            email,
            password,
            password_confirmation: passwordConfirmation
        })
            .then( response => {
                setCurrentUser(response.data.user);
                setUserToken(response.data.token);
            })
            .catch( (error) => {
                if (error.response) {
                    // Create one dimensional array from errors object
                    const finalErrors = Object.values(error.response.data.errors).reduce( (accum, next) => [ ...accum, ...next], [])
                    console.log(finalErrors);
                    setTopErrors({__html: finalErrors.join('<br>')}); // set errors on top of form
                    setErrors(error.response.data.errors);
                }

                console.error(error);
            });
    };

    return (
        <>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                Sign up for free
            </h2>

            <p className="mt-2 text-center text-sm text-gray-600">
                Or{' '}
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Login with your account
                </Link>
            </p>

            { (topErrors.__html) && (
                <div dangerouslySetInnerHTML={topErrors} className='bg-red-500 rounded py-2 px-3 text-white'></div>
            )}

            <form onSubmit={onSubmit} className="mt-8 space-y-6" action="#" method="POST">
                <div className="-space-y-px rounded-md shadow-sm">
                    <div>
                        <label htmlFor="full-name" className="sr-only">
                            Full Name
                        </label>
                        <input
                            id="full-name"
                            name="name"
                            type="text"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            required
                            className={`relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ${errors.full_name ? "border-red-500" : ""}`}
                            placeholder="Full Name"
                        />

                        { (errors.full_name) && (
                            <small className={'text-red-500'}>{errors.full_name[0]}</small>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email-address" className="sr-only">
                            Email address
                        </label>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                            className={`relative block w-full appearance-none rounded-none border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ${errors.email ? "border-red-500" : ""}`}
                            placeholder="Email address"
                        />

                        { (errors.email) && (
                            <small className={'text-red-500'}>{errors.email[0]}</small>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="sr-only">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className={`relative block w-full appearance-none rounded-none border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ${errors.password ? "border-red-500" : ""}`}
                            placeholder="Password"
                        />

                        { (errors.password) && (
                            <small className={'text-red-500'}>{errors.password[0]}</small>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password-confirmation" className="sr-only">
                            Password Confirmation
                        </label>
                        <input
                            id="password-confirmation"
                            name="password_confirmation"
                            type="password"
                            value={passwordConfirmation}
                            onChange={e => setPasswordConfirmation(e.target.value)}
                            required
                            className={`relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ${errors.password_confirmation ? "border-red-500" : ""}`}
                            placeholder="Password Confirmation"
                        />

                        { (errors.password_confirmation) && (
                            <small className={'text-red-500'}>{errors.password_confirmation[0]}</small>
                        )}
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockClosedIcon className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true"/>
                </span>
                        SignUp
                    </button>
                </div>
            </form>
        </>
    )
}
