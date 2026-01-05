import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Target, TrendingDown, Weight } from 'lucide-react';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Input } from '@/components/ui/input';
import { useUpdateWeightProgressMutation } from '@/redux/Features/Goals/GoalsApi';
import { formatDate } from '@/lib/formatDate';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProfileWeightCardProps {
    currentWeight: number;
    startingWeight: number;
    targetWeight: number;
    weightLog: { date: Date | string; weight: number }[];
    goalId?: string;
    className?: string;
}

const ProfileWeightCard: React.FC<ProfileWeightCardProps> = ({
    currentWeight,
    startingWeight,
    targetWeight,
    weightLog,
    goalId,
    className
}) => {
    // Local state for the inline input
    const [newWeight, setNewWeight] = useState<string>(currentWeight ? currentWeight.toString() : '');
    const [updateWeightProgress] = useUpdateWeightProgressMutation();

    const handleSave = async () => {
        const weightVal = parseFloat(newWeight);
        if (!weightVal || weightVal <= 0) return;

        try {
            await updateWeightProgress({ goalId: goalId || '1', weight: weightVal }).unwrap();
            toast.success('Weight updated successfully');
        } catch (error) {
            toast.error('Failed to update weight');
        }
    };

    const adjustWeight = (amount: number) => {
        const currentVal = parseFloat(newWeight) || currentWeight || 0;
        setNewWeight((currentVal + amount).toFixed(1));
    };

    const processedLogs = useMemo(() => {
        if (!weightLog || weightLog.length === 0) return [];
        return [...weightLog].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [weightLog]);

    const chartData = processedLogs.map((log) => ({
        date: formatDate(log.date, { short: true }),
        weight: log.weight,
    }));

    const lostSoFar = Math.abs(startingWeight - currentWeight);
    const remaining = Math.abs(currentWeight - targetWeight);
    const progress = Math.min(100, Math.max(0, ((startingWeight - currentWeight) / (startingWeight - targetWeight)) * 100));


    return (
        <Card className={cn("flex flex-col gap-6 bg-white rounded-[24px] shadow-sm h-full overflow-hidden border-[#F0F0F0]", className)}>

            {/* Header Section with Gradient/Premium feel */}
            <div className="p-6 pb-0 flex flex-col gap-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#EBF7E3] p-2.5 rounded-xl">
                            <Weight className="w-5 h-5 text-[#6AB240]" />
                        </div>
                        <div>
                            <h2 className="text-[18px] font-bold text-[#1E1E1E]">Weight Journey</h2>
                            <p className="text-xs text-gray-500 font-medium">Keep going, you're doing great!</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-extrabold text-[#1E1E1E] tracking-tight">{currentWeight} <span className="text-sm font-semibold text-gray-400">kg</span></span>
                    </div>
                </div>

                {/* Progress Bar Visual */}
                <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                        <span>Start {startingWeight}kg</span>
                        <span>Goal {targetWeight}kg</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#F2F4F7] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#6AB240] rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Quick Update Capsule */}
                <div className="bg-[#F8F9FA] p-1.5 rounded-2xl flex items-center justify-between border border-[#EAECF0]">
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => adjustWeight(-0.1)}
                            className="h-9 w-9 rounded-xl hover:bg-white hover:text-[#D92D20] text-gray-500 transition-colors"
                        >
                            <Minus size={16} strokeWidth={2.5} />
                        </Button>
                        <div className="relative">
                            <Input
                                type="number"
                                value={newWeight}
                                onChange={(e) => setNewWeight(e.target.value)}
                                className="w-20 text-center font-bold text-[#1E1E1E] text-lg bg-transparent border-none shadow-none focus-visible:ring-0 p-0"
                                placeholder="0.0"
                            />
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none">kg</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => adjustWeight(0.1)}
                            className="h-9 w-9 rounded-xl hover:bg-white hover:text-[#6AB240] text-gray-500 transition-colors"
                        >
                            <Plus size={16} strokeWidth={2.5} />
                        </Button>
                    </div>
                    <Button
                        onClick={handleSave}
                        className="bg-[#1E1E1E] hover:bg-black text-white rounded-xl px-5 h-9 font-semibold text-xs shadow-sm"
                    >
                        Update
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 px-6">
                <div className="bg-[#F8F9FA] rounded-[18px] p-3.5 flex items-center gap-3 border border-[#F0F0F0]">
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-[#F0F0F0]">
                        <TrendingDown className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Lost</span>
                        <span className="text-sm font-bold text-[#1E1E1E]">{lostSoFar.toFixed(1)} <span className="text-[10px] font-medium text-gray-400">kg</span></span>
                    </div>
                </div>
                <div className="bg-[#F8F9FA] rounded-[18px] p-3.5 flex items-center gap-3 border border-[#F0F0F0]">
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-[#F0F0F0]">
                        <Target className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Left</span>
                        <span className="text-sm font-bold text-[#1E1E1E]">{remaining.toFixed(1)} <span className="text-[10px] font-medium text-gray-400">kg</span></span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="w-full flex-1 min-h-[140px] mt-2 relative">
                <div className="absolute top-0 left-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full z-10 border border-gray-100">
                    Last 30 Days
                </div>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#98A2B3', fontSize: 10, fontWeight: 500 }}
                            dy={10}
                            billingPeriod="preserveStartEnd"
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '8px 12px' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 600, color: '#1E1E1E' }}
                            labelStyle={{ display: 'none' }}
                            formatter={(value: number) => [`${value} kg`, 'Weight']}
                        />
                        <Line
                            type="monotone"
                            dataKey="weight"
                            stroke="#6AB240"
                            strokeWidth={3}
                            dot={{ fill: '#fff', strokeWidth: 2, r: 4, stroke: '#6AB240' }}
                            activeDot={{ r: 6, fill: '#6AB240', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default ProfileWeightCard;
