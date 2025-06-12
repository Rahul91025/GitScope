import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, GitFork, Eye, ExternalLink, Code } from "lucide-react";

const RepoTable = ({ repos }) => {
  const navigate = useNavigate();

  const handleClick = (repo) => {
    navigate(`/summary/${repo.owner.login}/repo/${repo.name}`);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Code className="w-6 h-6 text-cyan-400" />
        Top Repositories
      </h2>
      <div className="space-y-4">
        {repos.map((repo) => (
          <div
            key={repo.id}
            onClick={() => handleClick(repo)}
            className="group cursor-pointer bg-gray-700/30 border border-gray-600/50 rounded-xl p-5 hover:bg-gray-700/50 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="text-lg font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                {repo.name}
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {repo.language && (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                  {repo.language}
                </span>
              )}
            </div>
            {repo.description && (
              <p className="text-gray-300 mb-4 line-clamp-2">{repo.description}</p>
            )}
            <div className="flex gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                {repo.stargazers_count}
              </div>
              <div className="flex items-center gap-1">
                <GitFork className="w-4 h-4 text-green-400" />
                {repo.forks_count}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-blue-400" />
                {repo.watchers_count}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RepoTable;
