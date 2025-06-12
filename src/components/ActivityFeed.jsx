import React from "react";

const ActivityFeed = ({ activities }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
    <h3 className="text-xl font-bold mb-4 text-green-400">Recent Activity</h3>
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div
          key={index}
          className="p-3 bg-gray-700/30 rounded-lg border-l-2 border-green-400/50 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors"
        >
          {activity}
        </div>
      ))}
    </div>
  </div>
);

export default ActivityFeed;
