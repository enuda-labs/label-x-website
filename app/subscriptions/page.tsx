'use client';

import {Button} from '@/components/ui/button';
import Navbar from '@/components/shared/navbar';
import {GridBackground} from '@/components/shared/grid-line';
import {useRouter} from 'next/navigation';
import {motion} from 'framer-motion';
import {useQuery} from '@tanstack/react-query';
import {getSubscriptionPlans} from '@/services/apis/subscription';
import {getUserDetails} from '@/services/apis/user';
import {planFeats} from '@/utils';

const Subscriptions = () => {
	const router = useRouter();
	const {data} = useQuery({
		queryKey: ['plan'],
		queryFn: getSubscriptionPlans,
	});

	const {data: user} = useQuery({
		queryKey: ['user'],
		queryFn: getUserDetails,
	});

	return (
		<div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
			<Navbar />

			<section className="relative pt-32 pb-20 px-4 overflow-hidden">
				<GridBackground />
				<motion.div
					className="absolute bottom-0 left-0 w-80 h-80 bg-background rounded-full blur-3xl"
					animate={{
						scale: [1, 1.3, 1],
						opacity: [0.1, 0.15, 0.1],
					}}
					transition={{
						duration: 6,
						repeat: Infinity,
						ease: 'easeInOut',
						delay: 1,
					}}
				/>
				<div className="container mx-auto">
					<div className="max-w-4xl mx-auto text-center mb-20">
						<h1 className="text-4xl md:text-5xl font-heading font-bold mb-8 bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
							Choose Your Plan
						</h1>
						<p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
							Get started with AI data processing and human intelligence review
							services
						</p>

						<div className="grid md:grid-cols-3 gap-8 mt-12">
							{data?.detail &&
								data.detail.map(plan => (
									<div
										className={`bg-white/5 backdrop-blur-sm border ${
											plan.name === 'pro'
												? 'border-primary/30'
												: 'border-white/10'
										} rounded-xl p-8 hover:bg-white/10 transition-colors relative`}
										key={plan.id}
									>
										{plan.name === 'pro' && (
											<div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary px-4 py-1 rounded-full text-xs font-medium">
												POPULAR
											</div>
										)}
										<h3 className="text-xl font-heading font-semibold mb-4 capitalize">
											{plan.name}
										</h3>
										<div className="text-4xl font-bold mb-4">
											${plan.monthly_fee}
											<span className="text-lg text-white/60">/mo</span>
										</div>
										<ul className="space-y-3 mb-8 text-white/70 text-left">
											{planFeats(plan.name).map(feat => (
												<li key={feat}>• {feat}</li>
											))}
										</ul>
										<Button
											className="w-full bg-primary hover:bg-primary/90 cursor-pointer"
											onClick={() =>
												user
													? router.push('dashboard')
													: router.push(
															`/auth?plan=${plan.name}&returnTo=%2Fdashboard`
													  )
											}
										>
											Get Started
										</Button>
									</div>
								))}
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Subscriptions;
