import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import ProfileCard from "../../components/ProfileCard";
import RepoTable from "../../components/RepoTable";
import LanguageStats from "../../components/LanguageStats";
import ActivityFeed from "../../components/ActivityFeed";
import { ArrowLeft } from "lucide-react";

const Info = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await axios.get(`https://api.github.com/users/${username}`);
        setProfile(profileRes.data);

        const reposRes = await axios.get(`https://api.github.com/users/${username}/repos`);
        const sortedRepos = reposRes.data.sort((a, b) => b.stargazers_count - a.stargazers_count);
        setRepos(sortedRepos.slice(0, 5));

        const langSet = new Set();
        reposRes.data.forEach((repo) => {
          if (repo.language) langSet.add(repo.language);
        });
        setLanguages([...langSet]);

        const activityList = reposRes.data
          .filter((repo) => repo.description)
          .map((repo) => `🛠️ ${repo.name}: ${repo.description}`);
        setActivities(activityList.slice(0, 5));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-cyan-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin animation-delay-150"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className="min-h-screen bg-gray-900 p-6 text-white">Error loading profile</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Floating background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
        {/* Back to Home Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm bg-gray-800 border border-gray-600 hover:border-cyan-400 text-cyan-300 hover:text-white px-4 py-2 rounded-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <ProfileCard profile={profile} />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RepoTable repos={repos} />
          </div>
          <div className="space-y-8">
            <LanguageStats languages={languages} />
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
