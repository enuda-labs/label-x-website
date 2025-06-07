'use client';

import React, {useState, useEffect} from 'react';
import {Menu, X} from 'lucide-react';
import Link from 'next/link';
import {useQuery} from '@tanstack/react-query';
import {getUserDetails} from '@/services/apis/user';

function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);

	const {data: user} = useQuery({
		queryKey: ['user'],
		queryFn: getUserDetails,
	});

	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 50);
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const handleScrollToPartner = () => {
		const section = document.getElementById('partnership');
		if (section) {
			section.scrollIntoView({behavior: 'smooth'});
		}
		// setIsMenuOpen(false);
	};

	return (
		<header
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
				isScrolled
					? 'bg-gray-900/95 backdrop-blur-sm shadow-lg'
					: 'bg-transparent'
			}`}
		>
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16 md:h-20">
					<div className="flex items-center">
						<Link href="/" className="flex items-center space-x-2">
							<div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-xl">
								Lx
							</div>
							<span className="text-xl font-bold tracking-tight">Labelx</span>
						</Link>
					</div>

					{/* Desktop Nav */}
					<nav className="hidden md:flex space-x-8">
						<a href="#features" className="nav-link">
							Features
						</a>
						<a href="#pricing" className="nav-link">
							Pricing
						</a>
						<a href="#partnership" className="nav-link">
							Partnership
						</a>
						<a href="#about" className="nav-link">
							About
						</a>
						<Link href="/subscriptions" className="nav-link">
							Subscriptions
						</Link>
						<a href="#contact" className="nav-link">
							Contact
						</a>
					</nav>

					<div className="hidden md:flex items-center gap-3">
						{user?.user?.id ? (
							<Link href="/dashboard">
								<span className="block w-full  hover:text-orange-500 text-white px-3 py-3 rounded-md text-base font-medium text-center">
									Go to Dashboard
								</span>
							</Link>
						) : (
							<Link href={`/auth?returnTo=%2Fdashboard`}>
								<span className="block text-white hover:text-orange-500  px-3 py-2 rounded-md text-base font-medium text-center">
									Get Started
								</span>
							</Link>
						)}
						<button
							onClick={handleScrollToPartner}
							className="bg-orange-500 hover:bg-orange-600 cursor-pointer text-white px-6 py-2 rounded-lg font-medium transition-colors duration-300"
						>
							Book a Demo
						</button>
					</div>

					{/* Mobile menu button */}
					<div className="md:hidden">
						<button
							type="button"
							className="text-gray-300 hover:text-white"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
						>
							{isMenuOpen ? (
								<X className="h-6 w-6" />
							) : (
								<Menu className="h-6 w-6" />
							)}
						</button>
					</div>
				</div>

				{/* Mobile Nav */}
				{isMenuOpen && (
					<div className="md:hidden bg-gray-900 shadow-xl rounded-b-lg">
						<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
							<a
								href="#features"
								className="block px-3 py-3 rounded-md hover:bg-gray-800"
								onClick={() => setIsMenuOpen(false)}
							>
								Features
							</a>
							<a
								href="#pricing"
								className="block px-3 py-3 rounded-md hover:bg-gray-800"
								onClick={() => setIsMenuOpen(false)}
							>
								Pricing
							</a>
							<a
								href="#partnership"
								className="block px-3 py-3 rounded-md hover:bg-gray-800"
								onClick={() => setIsMenuOpen(false)}
							>
								Partnership
							</a>
							<a
								href="#about"
								className="block px-3 py-3 rounded-md hover:bg-gray-800"
								onClick={() => setIsMenuOpen(false)}
							>
								About
							</a>
							<a
								href="#contact"
								className="block px-3 py-3 rounded-md hover:bg-gray-800"
								onClick={() => setIsMenuOpen(false)}
							>
								Contact
							</a>
							<div className="pt-2">
								{user?.user?.id ? (
									<Link href="/dashboard">
										<span className="block w-full  hover:text-orange-500 text-white px-3 py-3 rounded-md text-base font-medium text-center">
											Go to Dashboard
										</span>
									</Link>
								) : (
									<Link href={`/auth?returnTo=%2Fdashboard`}>
										<span className="block w-full  hover:text-orange-500 text-white px-3 py-3 rounded-md text-base font-medium text-center">
											Get Started
										</span>
									</Link>
								)}
								<button
									onClick={handleScrollToPartner}
									className="block w-full bg-orange-500 hover:bg-orange-600 text-white px-3 py-3 rounded-md text-base font-medium text-center"
								>
									Book A Demo
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</header>
	);
}

export default Header;
