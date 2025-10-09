'use client';

import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon } from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart';

export function PricingWithChart() {
	const navigate = useNavigate();

	return (
		<div className="mx-auto max-w-6xl">
			<div className="mx-auto mb-10 max-w-2xl text-center">
				<h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
					Pricing that Scales with You
				</h1>
				<p className="text-gray-400 mt-4 text-sm md:text-base">
					Choose the right plan to unlock powerful tools and insights.
					Transparent pricing built for modern teams.
				</p>
			</div>

			<div className="bg-black/40 backdrop-blur-xl grid rounded-xl border border-purple-500/20 md:grid-cols-6">
				<div className="flex flex-col justify-between border-b border-purple-500/20 p-6 md:col-span-2 md:border-r md:border-b-0">
					<div className="space-y-4">
						<div>
							<h2 className="inline rounded-[2px] p-1 text-xl font-semibold text-purple-200">
								Free
							</h2>
							<span className="my-3 block text-3xl font-bold text-purple-400">
								$0
							</span>
							<p className="text-gray-400 text-sm">
								Best for testing & understanding
							</p>
						</div>

						<Button onClick={() => navigate('/sign-in')} variant="outline" className="w-full">
							Get Started
						</Button>

						<div className="bg-purple-500/20 my-6 h-px w-full" />

						<ul className="text-gray-300 space-y-3 text-sm">
							{[
								'Basic Analytics Dashboard',
								'5GB Cloud Storage',
								'Email & Chat Support',
							].map((item, index) => (
								<li key={index} className="flex items-center gap-2">
									<CheckCircleIcon className="h-4 w-4 text-purple-400" />
									{item}
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="z-10 grid gap-8 overflow-hidden p-6 md:col-span-4 lg:grid-cols-2">
					<div className="flex flex-col justify-between space-y-6">
						<div>
							<h2 className="text-xl font-semibold text-purple-200">Pro Monthly Package</h2>
							<span className="my-3 block text-3xl font-bold text-purple-400">
								$299
							</span>
							<p className="text-gray-400 text-sm">
								Perfect for small businesses & startups
							</p>
						</div>
						<div className="bg-purple-900/10 h-fit w-full rounded-lg border border-purple-500/20 p-2">
							<InterestChart />
						</div>
					</div>
					<div className="relative w-full">
						<div className="text-sm font-medium text-purple-200">Everything in Free plus:</div>
						<ul className="text-gray-300 mt-4 space-y-3 text-sm">
							{[
								'Unlimited access to all tools',
								'Priority customer support',
								'Advanced analytics dashboard',
								'Team collaboration included',
								'Secure cloud storage',
								'Customizable workflows and automation',
								'Integration with popular third-party apps',
								'Role-based access control and permissions',
								'Offline access with automatic sync',
								'Regular updates with new features',
							].map((item, index) => (
								<li key={index} className="flex items-center gap-2">
									<CheckCircleIcon className="h-4 w-4 text-purple-400" />
									{item}
								</li>
							))}
						</ul>

						<div className="mt-10 grid w-full grid-cols-2 gap-2.5">
							<Button
								onClick={() => navigate('/sign-in')}
								className="bg-purple-600 text-white hover:bg-purple-700"
							>
								Get Started
							</Button>
							<Button onClick={() => navigate('/sign-in')} variant="outline">
								Start free trial
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function InterestChart() {
	const chartData = [
		{ month: 'January', interest: 120 },
		{ month: 'February', interest: 180 },
		{ month: 'March', interest: 150 },
		{ month: 'April', interest: 210 },
		{ month: 'May', interest: 250 },
		{ month: 'June', interest: 300 },
		{ month: 'July', interest: 280 },
		{ month: 'August', interest: 320 },
		{ month: 'September', interest: 340 },
		{ month: 'October', interest: 390 },
		{ month: 'November', interest: 420 },
		{ month: 'December', interest: 500 },
	];

	const chartConfig = {
		interest: {
			label: 'Interest',
			color: 'rgb(168, 85, 247)',
		},
	} satisfies ChartConfig;

	return (
		<Card className="bg-transparent border-none">
			<CardHeader className="space-y-0 border-b border-purple-500/20 p-3">
				<CardTitle className="text-lg text-purple-200">Plan Popularity</CardTitle>
				<CardDescription className="text-xs text-gray-400">
					Monthly trend of people considering this plan.
				</CardDescription>
			</CardHeader>
			<CardContent className="p-3">
				<ChartContainer config={chartConfig}>
					<LineChart data={chartData} margin={{ left: 12, right: 12 }}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="month"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={(value) => value.slice(0, 3)}
						/>
						<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
						<Line
							dataKey="interest"
							type="monotone"
							stroke="var(--color-interest)"
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
