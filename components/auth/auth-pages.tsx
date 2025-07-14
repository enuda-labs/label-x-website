'use client';
import {Card} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import Navbar from '@/components/shared/navbar';
import {GridBackground} from '@/components/shared/grid-line';
import Login from './login';
import Signup from './signup';

const AuthPages = () => {
	return (
		<div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
			<Navbar />

			<section className="relative pt-32 pb-20 px-4 overflow-hidden">
				<GridBackground />
				<div className="container mx-auto">
					<div className="max-w-md mx-auto">
						<Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
							<Tabs defaultValue="login" className="w-full">
								<TabsList className="grid w-full grid-cols-2 bg-white/5">
									<TabsTrigger value="login">Login</TabsTrigger>
									<TabsTrigger value="signup">Sign Up</TabsTrigger>
								</TabsList>

								<TabsContent value="login" className="mt-6">
									<Login />
								</TabsContent>

								<TabsContent value="signup" className="mt-6">
									<Signup />
								</TabsContent>
							</Tabs>
						</Card>
					</div>
				</div>
			</section>
		</div>
	);
};

export default AuthPages;
