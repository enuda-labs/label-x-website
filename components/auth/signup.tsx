'use client';
import {useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {useMutation} from '@tanstack/react-query';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {toast} from 'sonner';
import {register} from '@/services/apis/auth';
import {AxiosError} from 'axios';

export const Signup = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [company, setCompany] = useState('');
	const [error, setError] = useState('');

	const router = useRouter();
	const searchParams = useSearchParams();
	const plan = searchParams.get('plan') || 'basic';
	const returnTo = searchParams.get('returnTo') || '/dashboard';

	const signupMutation = useMutation({
		mutationFn: async (userData: {
			email: string;
			password: string;
			name: string;
			company: string;
		}) => {
			const response = await register({
				username: userData.name,
				email: userData.email,
				password: userData.password,
			});
			return response;
		},
		onSuccess: data => {
			if (data.status === 'success') {
				router.push(returnTo);
				toast('Account created successfully', {
					description: 'Welcome to Label X',
				});
			} else {
				toast('Signup failed', {
					description: 'Please try again later',
				});
			}
		},
		onError: (err: unknown) => {
			if (err instanceof AxiosError) {
				setError(err.response?.data?.error || err.message);
			} else {
				setError('An unexpected error occurred');
			}
			toast('Signup failed', {
				description: 'Please try again later',
			});
		},
	});

	const handleSignup = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		signupMutation.mutate({email, password, name, company});
	};

	return (
		<form onSubmit={handleSignup} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="name">Username</Label>
				<Input
					id="name"
					type="text"
					placeholder="John Doe"
					value={name}
					onChange={e => setName(e.target.value)}
					required
					className="bg-white/5 border-white/10 text-white"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="company">Company Name</Label>
				<Input
					id="company"
					type="text"
					placeholder="Acme Inc."
					value={company}
					onChange={e => setCompany(e.target.value)}
					className="bg-white/5 border-white/10 text-white"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="signupEmail">Email</Label>
				<Input
					id="signupEmail"
					type="email"
					placeholder="your@email.com"
					value={email}
					onChange={e => setEmail(e.target.value)}
					required
					className="bg-white/5 border-white/10 text-white"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="signupPassword">Password</Label>
				<Input
					id="signupPassword"
					type="password"
					placeholder="••••••••"
					value={password}
					onChange={e => setPassword(e.target.value)}
					required
					className="bg-white/5 border-white/10 text-white"
				/>
			</div>

			<div className="text-sm text-white/60 mt-2">
				Selected plan:{' '}
				<span className="font-medium text-primary">
					{plan.charAt(0).toUpperCase() + plan.slice(1)}
				</span>
			</div>

			<span className="text-red-500 text-sm mb-2 inline-block">{error}</span>
			<Button
				type="submit"
				className="w-full bg-primary hover:bg-primary/90"
				disabled={signupMutation.isPending}
			>
				{signupMutation.isPending ? 'Creating account...' : 'Create Account'}
			</Button>
		</form>
	);
};

export default Signup;
