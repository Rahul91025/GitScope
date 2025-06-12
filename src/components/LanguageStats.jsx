import React from "react";

const LanguageStats = ({ languages }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
    <h3 className="text-xl font-bold mb-4 text-purple-400">Languages</h3>
    <div className="flex flex-wrap gap-2">
      {languages.map((lang, index) => (
        <span
          key={lang}
          className="px-3 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white rounded-lg text-sm border border-cyan-500/30 hover:border-cyan-400 transition-colors"
        >
          {lang}
        </span>
      ))}
    </div>
  </div>
);

export default LanguageStats;
