import React from 'react';
import { BarChart2, TrendingUp, Users } from 'lucide-react';

const AdminAnalytics = () => {
    // Placeholder data for visualization
    const growthData = [
        { month: 'Jan', members: 12 },
        { month: 'Feb', members: 19 },
        { month: 'Mar', members: 3 },
        { month: 'Apr', members: 25 },
        { month: 'May', members: 32 },
        { month: 'Jun', members: 45 },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">System Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Growth Trends</h3>
                        <TrendingUp className="text-green-500" />
                    </div>
                    <div className="flex items-end space-x-2 h-48">
                        {growthData.map((data, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div
                                    className="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 transition-all"
                                    style={{ height: `${(data.members / 50) * 100}%` }}
                                ></div>
                                <span className="text-xs text-gray-500 mt-2">{data.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Demographics</h3>
                        <Users className="text-blue-500" />
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Active Members</span>
                                <span className="font-medium">85%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Premium Users</span>
                                <span className="font-medium">45%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>New Signups (This Week)</span>
                                <span className="font-medium">12%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: '12%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-indigo-900 text-white rounded-lg p-8 text-center">
                <BarChart2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">Advanced Analytics Coming Soon</h3>
                <p className="text-indigo-200">Processing real-time data for deeper insights...</p>
            </div>
        </div>
    );
};

export default AdminAnalytics;
